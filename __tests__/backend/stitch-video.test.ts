import { Readable, Writable } from "stream";
import fs from "fs";
import path from "path";
import { stitchVideo } from "@/lib/jobs/handlers";

// Mock ffmpeg to avoid invoking a real binary
jest.mock("fluent-ffmpeg", () => {
  const fsModule = require("fs") as typeof import("fs");
  const factory = () => {
    const endCallbacks: Array<() => void> = [];
    const errorCallbacks: Array<(err: Error) => void> = [];
    const chain = {
      input: () => chain,
      inputOptions: () => chain,
      outputOptions: () => chain,
      on(event: string, cb: (...args: any[]) => void) {
        if (event === "end") endCallbacks.push(cb);
        if (event === "error") errorCallbacks.push(cb as any);
        return chain;
      },
      save(target: string) {
        try {
          fsModule.writeFileSync(target, "mock-video");
          endCallbacks.forEach((cb) => cb());
        } catch (err) {
          errorCallbacks.forEach((cb) => cb(err as Error));
        }
        return chain;
      },
    };
    return chain;
  };
  factory.setFfmpegPath = jest.fn();
  return factory;
});

jest.mock("ffmpeg-static", () => "/tmp/mock-ffmpeg");

type CollectionMock = {
  findOne: jest.Mock;
  updateOne: jest.Mock;
  find?: jest.Mock;
  toArray?: jest.Mock;
  insertOne?: jest.Mock;
};

const projectsCollection: CollectionMock = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

const sceneGenerationsCollection: CollectionMock = {
  find: jest.fn(),
  updateOne: jest.fn(),
};

const audioGenerationsCollection: CollectionMock = {
  findOne: jest.fn(),
};

const dbMock = {
  collection: jest.fn((name: string) => {
    switch (name) {
      case "projects":
        return projectsCollection;
      case "scene_generations":
        return sceneGenerationsCollection;
      case "audio_generations":
        return audioGenerationsCollection;
      default:
        return {
          findOne: jest.fn(),
          updateOne: jest.fn(),
          insertOne: jest.fn(),
          find: jest.fn(),
        };
    }
  }),
};

jest.mock("mongodb", () => {
  class MockObjectId {
    private value: string;
    constructor(id?: string) {
      this.value = id || "507f1f77bcf86cd799439011";
    }
    toHexString() {
      return this.value;
    }
  }

  class MockGridFSBucket {
    openUploadStream(_filename: string) {
      const chunks: Buffer[] = [];
      const writable = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          callback();
        },
      });
      (writable as any).id = new MockObjectId();
      return writable as any;
    }
  }
  return {
    GridFSBucket: MockGridFSBucket,
    ObjectId: MockObjectId,
  };
});

jest.mock("@/lib/mongodb", () => {
  return {
    __esModule: true,
    default: Promise.resolve({ db: jest.fn(() => dbMock) }),
  };
});

// Mock network fetch to supply dummy media/audio streams
global.fetch = jest.fn(async () => ({
  ok: true,
  body: Readable.from("mock-binary-data"),
})) as any;

describe("stitchVideo job", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { ObjectId } = require("mongodb") as any;
    projectsCollection.findOne.mockResolvedValue({
      _id: new ObjectId(),
      scenes: [
        { id: "s1", duration: 2 },
        { id: "s2", duration: 3 },
      ],
      status: "stitching",
    });

    sceneGenerationsCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { sceneId: "s1", status: "succeeded", output: { url: "http://example.com/s1.mp4" } },
        { sceneId: "s2", status: "succeeded", output: { url: "http://example.com/s2.mp4" } },
      ]),
    });

    audioGenerationsCollection.findOne.mockResolvedValue({
      status: "succeeded",
      output: { url: "http://example.com/audio.mp3" },
    });
  });

  it("stitches scene videos with audio and stores final asset", async () => {
    await stitchVideo.handler({ projectId: "507f1f77bcf86cd799439011" });

    // Ensure project status is updated to completed with asset info
    expect(projectsCollection.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "completed",
          assets: expect.objectContaining({
            finalVideoId: expect.any(String),
            finalVideoUrl: expect.stringContaining("/api/media/"),
          }),
        }),
      }),
    );
  });
});
