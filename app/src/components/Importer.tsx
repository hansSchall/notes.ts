import { useMemo } from "preact/hooks";
import { QRCodeSVG } from "qrcode.react";
import { peerId, recvFiles } from "../controller/peer";
import { importSidebar } from "./uiState";
import { AssignON } from "../lib/signal";

export function Importer() {
    return <div id={`importer`} class={`tk-sidebar -right`}>
        <div class={`tk-header`}>
            <div class={`-label`}>Scan-Import</div>
            <div class={`-button`} onClick={AssignON(importSidebar, false)}><i class={`bi-x-lg`} /></div>
        </div>
        <div class={`tk-content`}>
            <ScanQR />
            <div class={`i-files`}>
                {recvFiles.value.map(file => <img src={file.objectUrl} alt={""} />)}
            </div>
        </div>
    </div>;
}

function ScanQR() {
    const url = useMemo(() => {
        const url = new URL(location.href);
        url.pathname = `/scan/${peerId.value}`;
        return url.href;
    }, [peerId.value]);

    if (peerId.value) {
        return <a class={`i-qr`} href={url} target={"_blank"}>
            <QRCodeSVG value={url} size={150} />
            <div class={`-label`}>{url}</div>
        </a>;
    } else {
        return <div class={`i-qr -loading`}></div>;
    }

}
