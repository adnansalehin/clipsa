import { startVideoGeneration, processSceneVideo } from "@/lib/jobs/handlers";
import { jobs } from "@/lib/jobs/core";

process.env.APP_URL = "https://example.com";

// Mock dependencies
jest.mock("@/lib/qstash", () => ({
    qstash: {
        publishJSON: jest.fn().mockResolvedValue({ messageId: "mock-id" }),
    },
}));

jest.mock("@/lib/fal", () => ({
    fal: {
        queue: {
            submit: jest.fn().mockResolvedValue({ request_id: "mock-prediction-id" }),
        },
    },
}));

jest.mock("@/lib/mongodb", () => {
    const mockDb = {
        collection: jest.fn().mockReturnThis(),
        updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
    };
    const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
        connect: jest.fn().mockResolvedValue(true),
    };
    return {
        __esModule: true,
        default: Promise.resolve(mockClient),
    };
});

describe("Backend Job Flow (Fal.ai)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should register jobs correctly", () => {
        expect(jobs["start-video-generation"]).toBeDefined();
        expect(jobs["process-scene-video"]).toBeDefined();
    });

    it("should dispatch 'start-video-generation' and trigger scene jobs", async () => {
        const projectId = "507f1f77bcf86cd799439011";
        const scenes = [
            { id: "s1", text: "Scene 1" },
            { id: "s2", text: "Scene 2" },
        ];

        // Execute the handler directly
        await startVideoGeneration.handler({ projectId, scenes });

        // Verify QStash was called for each scene and audio
        const { qstash } = require("@/lib/qstash");
        expect(qstash.publishJSON).toHaveBeenCalledTimes(3);

        expect(qstash.publishJSON).toHaveBeenCalledWith(expect.objectContaining({
            body: expect.objectContaining({
                jobName: "process-scene-video",
                payload: expect.objectContaining({
                    projectId,
                    sceneId: "s1",
                    prompt: "Scene 1"
                })
            })
        }));
        expect(qstash.publishJSON).toHaveBeenCalledWith(expect.objectContaining({
            body: expect.objectContaining({
                jobName: "process-audio",
                payload: expect.objectContaining({
                    projectId,
                })
            })
        }));
    });

    it("should call Fal.ai when 'process-scene-video' runs", async () => {
        const payload = {
            projectId: "507f1f77bcf86cd799439011",
            sceneId: "s1",
            prompt: "A beautiful sunset",
        };

        await processSceneVideo.handler(payload);

        const { fal } = require("@/lib/fal");
        expect(fal.queue.submit).toHaveBeenCalledWith("fal-ai/veo-3.1", expect.objectContaining({
            input: expect.objectContaining({
                prompt: "A beautiful sunset"
            }),
            webhookUrl: expect.stringContaining("/api/webhooks/fal")
        }));
    });
});
