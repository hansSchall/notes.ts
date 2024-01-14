import { signal } from "@preact/signals";
import Peer, { DataConnection } from "peerjs";
import { z } from "zod";

export const peerId = signal("");

const peer = new Peer();
peer.on("open", id => {
    console.log(`local peer id is ${id}`);
    peerId.value = id;
});

export const recvFiles = signal<{
    mime: string,
    blob: Blob,
    objectUrl: string,
    time: number,
}[]>([]);

const validate = z.object({
    mime: z.string(),
    data: z.instanceof(Uint8Array)
});

peer.on("connection", conn => {
    console.log("connection", conn);
    conn.on("data", data => {
        const message = validate.parse(data);
        const blob = new Blob([message.data], {
            type: message.mime,
        });
        // drop old recvs
        while (recvFiles.value.length > 30) {
            // minimum time 60s
            if (recvFiles.value[recvFiles.value.length - 1].time > performance.now() - 60000) {
                break;
            }

            URL.revokeObjectURL(recvFiles.value.pop()?.objectUrl || "");
        }
        recvFiles.value = [{
            mime: message.mime,
            blob,
            objectUrl: URL.createObjectURL(blob),
            time: performance.now(),
        }, ...recvFiles.value];
    });
});

export function initPeer() {
}

export enum PeerStatus {
    Disconnected,
    Connecting,
    Connected,
}

export const peerStatus = signal(PeerStatus.Disconnected);

let remoteConn: DataConnection | null = null;

export async function connectPeer(id: string) {
    console.log("connecting to " + id);
    peerStatus.value = PeerStatus.Connecting;
    const conn = peer.connect(id);
    conn.on("open", () => {
        console.log("open", id);
        peerStatus.value = PeerStatus.Connected;
        remoteConn = conn;
    });
    conn.on("close", () => {
        peerStatus.value = PeerStatus.Disconnected;
        remoteConn = null;
    });
}

export function sendFile(data: ArrayBuffer, mime: string) {
    return remoteConn?.send({
        data,
        mime,
    });
}
