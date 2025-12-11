import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";
import Busboy from "busboy";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

// Convert Web API ReadableStream to Node.js Readable stream
function streamToNodeStream(stream: ReadableStream<Uint8Array>): Readable {
  const reader = stream.getReader();
  const nodeStream = new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          nodeStream.push(null);
        } else {
          nodeStream.push(Buffer.from(value));
        }
      } catch (error) {
        nodeStream.destroy(error as Error);
      }
    },
  });
  return nodeStream;
}

async function listMedia() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "clipsa");
  const metadataCol = db.collection("mediaMetadata");

  const docs = await metadataCol.find({}).sort({ uploadedAt: -1 }).limit(200).toArray();

  const items = await Promise.all(
    docs.map(async (doc) => {
      const fileId = (doc.fileId as ObjectId).toHexString();
      const fileDoc = await db.collection("media.files").findOne({ _id: new ObjectId(fileId) });
      const contentType = (fileDoc as any)?.contentType ?? (doc as any).contentType ?? "application/octet-stream";
      const isVideo = contentType.startsWith("video/");

      return {
        id: fileId,
        filename: (doc as any).filename,
        title: (doc as any).title ?? "",
        description: (doc as any).description ?? "",
        uploadedBy: (doc as any).uploadedBy ?? "",
        sizeBytes: (doc as any).sizeBytes ?? 0,
        uploadedAt: (doc as any).uploadedAt ?? new Date(),
        contentType,
        type: isVideo ? "video" : "image",
        url: `/api/media/${fileId}`,
        thumbnail: `/api/media/${fileId}`,
      };
    }),
  );

  return NextResponse.json({ items });
}

async function getMedia(id: string) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "clipsa");
  const bucket = new GridFSBucket(db, { bucketName: "media" });

  const fileDoc = await db.collection("media.files").findOne({ _id: new ObjectId(id) });
  if (!fileDoc) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const contentType = (fileDoc as any).contentType ?? "application/octet-stream";
  const downloadStream = bucket.openDownloadStream(new ObjectId(id));

  const chunks: Buffer[] = [];
  for await (const chunk of downloadStream) {
    chunks.push(chunk as Buffer);
  }
  const data = Buffer.concat(chunks);

  return new NextResponse(data, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
}

async function deleteMedia(id: string) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "clipsa");
  const bucket = new GridFSBucket(db, { bucketName: "media" });
  const objectId = new ObjectId(id);

  const existingFile = await db.collection("media.files").findOne({ _id: objectId });
  if (!existingFile) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await bucket.delete(objectId);
  await db.collection("mediaMetadata").deleteOne({ fileId: objectId });

  return NextResponse.json({ ok: true });
}

async function uploadMedia(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "clipsa");
  const bucket = new GridFSBucket(db, { bucketName: "media" });

  // Metadata fields
  let title = "";
  let description = "";
  let uploadedBy = "";

  let fileUploaded = false;
  let fileIdHex = "";
  let filename = "";
  let mimeType = "application/octet-stream";
  let totalBytes = 0;

  const body = request.body;
  if (!body) {
    return NextResponse.json({ error: "No request body" }, { status: 400 });
  }

  const nodeStream = streamToNodeStream(body);
  const busboy = Busboy({ headers: { "content-type": contentType } });

  const uploadPromises: Promise<void>[] = [];

  busboy.on("field", (fieldname: string, value: string) => {
    switch (fieldname) {
      case "title":
        title = value;
        break;
      case "description":
        description = value;
        break;
      case "uploadedBy":
        uploadedBy = value;
        break;
    }
  });

  busboy.on(
    "file",
    (
      fieldname: string,
      fileStream: NodeJS.ReadableStream,
      fileFilename: string,
      _encoding: string,
      mimeTypeParam: string,
    ) => {
      if (fieldname !== "file") {
        fileStream.resume();
        return;
      }

      fileUploaded = true;
      filename = fileFilename || "upload";
      mimeType = mimeTypeParam || "application/octet-stream";

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          contentType: mimeType,
          title,
          description,
          uploadedBy,
          originalName: filename,
        },
      });

      fileStream.on("data", (chunk: Buffer) => {
        totalBytes += chunk.length;
      });

      const uploadPromise = new Promise<void>((resolve, reject) => {
        uploadStream.on("error", (err: Error) => {
          console.error("GridFS upload error", err);
          reject(err);
        });

        uploadStream.on("finish", async () => {
          try {
            const metadataCol = db.collection("mediaMetadata");
            await metadataCol.insertOne({
              fileId: uploadStream.id,
              filename,
              contentType: mimeType,
              sizeBytes: totalBytes,
              uploadedAt: new Date(),
              uploadedBy,
              title,
              description,
            });
            fileIdHex = (uploadStream.id as ObjectId).toHexString();
            resolve();
          } catch (err) {
            console.error("Metadata save error", err);
            reject(err);
          }
        });
      });

      fileStream.pipe(uploadStream);
      uploadPromises.push(uploadPromise);
    },
  );

  const finishPromise = new Promise<void>((resolve, reject) => {
    busboy.on("finish", () => resolve());
    busboy.on("error", (err: Error) => reject(err));
  });

  nodeStream.pipe(busboy);

  await finishPromise;

  if (!fileUploaded) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  await Promise.all(uploadPromises);

  return NextResponse.json({ ok: true, fileId: fileIdHex });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (slug.length === 0) {
    return listMedia();
  }
  const id = slug[0];
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  return getMedia(id);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const id = slug[0];
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  return deleteMedia(id);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const isUpload = slug[0] === "upload" || slug.length === 0;
  if (!isUpload) {
    return NextResponse.json({ error: "Unsupported route" }, { status: 404 });
  }
  return uploadMedia(request);
}
