import { signal } from "@preact/signals";

export enum MediaStatus {
    OPENING,
    NOT_AVAIL,
    ENUMERATED,
    READY,
}

export const mediaStatus = signal(MediaStatus.OPENING);

export async function initScan() {
    if (navigator.mediaDevices) {
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        console.log(supportedConstraints);
        updateDevEnum();
        // getVideoSrc();

        mediaStatus.value = MediaStatus.ENUMERATED;
    } else {
        mediaStatus.value = MediaStatus.NOT_AVAIL;
    }
}

export enum VideoStatus {
    OFF,
    STARTING,
    READY,
}

export const videoStatus = signal(VideoStatus.OFF);

async function getVideoSrc(id?: string) {
    if (id) {
        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: id,
            }
        });
        console.log(media);
        updateMediaSrc(media);
    } else {
        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: localStorage.getItem("preferred-cam") || undefined,
                facingMode: {
                    ideal: "back"
                }
            }
        });
        console.log(media);
        updateMediaSrc(media);
    }
}

export const devEnum = signal<MediaDeviceInfo[]>([]);

async function updateDevEnum() {
    devEnum.value = (await navigator.mediaDevices.enumerateDevices()).filter($ => $.kind === "videoinput");
}

function updateMediaSrc(stream: MediaStream) {
    console.log(stream);
    // playMedia(stream);
}

export function setMediaSrc(id: string) {
    localStorage.setItem("preferred-cam", id);
    getVideoSrc(id);
}
