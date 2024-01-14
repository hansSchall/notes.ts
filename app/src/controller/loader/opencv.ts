import { signal } from "@preact/signals";
import lock from "simple-promise-locks";

declare var cv: any;

const opencvReady = lock(true);

export async function loadOpenCV() {
    if (openCVState.value === OpenCVState.NOT_READY) {
        openCVState.value = OpenCVState.LOADING;
        console.log("loading opencv");
        const script = document.createElement("script");
        script.addEventListener("load", () => {
            if (cv.getBuildInformation) {
                console.debug(cv.getBuildInformation());
                openCVState.value = OpenCVState.READY;
                opencvReady.unlock();
                console.log("opencv ready");
            }
            else {
                // WASM
                cv['onRuntimeInitialized'] = () => {
                    console.debug(cv.getBuildInformation());
                    openCVState.value = OpenCVState.READY;
                    opencvReady.unlock();
                    console.log("opencv ready");
                };
            }
        });
        script.src = `/opencv.js`;
        document.body.appendChild(script);
    }
    return await opencvReady();
}

export enum OpenCVState {
    NOT_READY,
    LOADING,
    READY,
}

export const openCVState = signal(OpenCVState.NOT_READY);
