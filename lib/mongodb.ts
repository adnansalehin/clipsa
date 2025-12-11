import { MongoClient } from "mongodb";

const defaultUri = "mongodb://localhost:27017/clipsa";

const normalizeMongoUri = (rawUri?: string): string => {
    if (!rawUri) {
        return defaultUri;
    }

    try {
        const parsed = new URL(rawUri);
        const isMongoProtocol = parsed.protocol === "mongodb:" || parsed.protocol === "mongodb+srv:";

        if (!isMongoProtocol) {
            throw new Error(`Unsupported protocol "${parsed.protocol}"`);
        }

        if (parsed.username) {
            parsed.username = encodeURIComponent(decodeURIComponent(parsed.username));
        }

        if (parsed.password) {
            parsed.password = encodeURIComponent(decodeURIComponent(parsed.password));
        }

        return parsed.toString();
    } catch (error) {
        console.warn("[MONGODB] Unable to normalize MONGODB_URI, falling back to raw value", error);
        return rawUri;
    }
};

const buildUriFromParts = (): string | null => {
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const cluster = process.env.MONGODB_CLUSTER;
    const database = process.env.MONGODB_DB || "clipsa";

    if (!username || !password || !cluster) {
        return null;
    }

    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    const authSource = process.env.MONGODB_AUTH_SOURCE || "admin";
    const authMechanism = process.env.MONGODB_AUTH_MECH || "SCRAM-SHA-256";
    const appName = process.env.MONGODB_APP_NAME || "clipsa";

    const params = new URLSearchParams({
        authSource,
        authMechanism,
        appName,
    });

    return `mongodb+srv://${encodedUsername}:${encodedPassword}@${cluster}/${database}?${params.toString()}`;
};

const resolvedUri = process.env.MONGODB_URI
    ? normalizeMongoUri(process.env.MONGODB_URI)
    : buildUriFromParts() || defaultUri;

const logMongoTarget = (uri: string): void => {
    try {
        const parsed = new URL(uri);
        console.log(`[MONGODB] Using MongoDB host: ${parsed.host} (${parsed.protocol.replace(":", "")})`);
    } catch {
        console.log("[MONGODB] Using MongoDB URI from environment");
    }
};

logMongoTarget(resolvedUri);

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(resolvedUri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }

    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    client = new MongoClient(resolvedUri, options);
    clientPromise = client.connect();
}

export default clientPromise;
