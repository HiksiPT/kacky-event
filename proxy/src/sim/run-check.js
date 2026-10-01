// Replays a run's inputs through the game's physics. A run is valid only if the car
// crosses the finish, with every checkpoint, on exactly the frame it claims.

import { startSimulation } from "./simulation.js";

const INIT = 0;
const VERIFY = 1;
const VERIFY_RESULT = 8;
// 20 minutes at 1000 frames a second, well inside a Durable Object's CPU budget.
export const MAX_FRAMES = 1_200_000;

// init.bin: uint32 header length, JSON header (padded to 4 bytes), then float32 vertices
// (every track part, then the car).
export function readInit(buffer) {
    const headerLength = new DataView(buffer).getUint32(0, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, headerLength)));
    const start = 4 + headerLength;
    const floats = start % 4 === 0 ? new Float32Array(buffer, start) : new Float32Array(buffer.slice(start));
    let offset = 0;
    const trackParts = header.parts.map((p) => {
        const vertices = floats.subarray(offset, offset + p.count);
        offset += p.count;
        return { id: p.id, vertices, detector: p.detector, startOffset: p.startOffset };
    });
    return {
        messageType: INIT,
        version: "0.6.0",
        isRealtime: false,
        trackParts,
        carCollisionShapeVertices: floats.subarray(offset, offset + header.carCount),
        carMassOffset: header.carMassOffset,
    };
}

export class Simulator {
    constructor(physicsModule, mathModule, init) {
        this.result = null;
        this.nextCar = 1;
        this.sim = startSimulation(physicsModule, mathModule, (message) => {
            if (message.messageType === VERIFY_RESULT) this.result = message.result;
        });
        this.started = this.sim.ready.then(() => this.sim.send(init));
    }

    // track: { trackData, mountainVertices, mountainOffset }, as the game builds them.
    async check(track, recording, frames) {
        await this.started;
        if (!Number.isSafeInteger(frames) || frames < 1 || frames > MAX_FRAMES) return { valid: false, reason: "bad-time" };
        if (typeof recording !== "string" || !recording) return { valid: false, reason: "no-recording" };
        this.result = null;
        try {
            // The game's Verify handler runs synchronously and posts its result before returning.
            this.sim.send({
                messageType: VERIFY,
                mountainVertices: track.mountainVertices,
                mountainOffset: track.mountainOffset,
                trackData: track.trackData,
                carId: this.nextCar++,
                carRecording: recording,
                targetFrames: frames,
            });
        } catch {
            return { valid: false, reason: "unreadable" };
        }
        if (this.result === null) return { valid: false, reason: "unreadable" };
        return this.result ? { valid: true } : { valid: false, reason: "no-finish" };
    }
}
