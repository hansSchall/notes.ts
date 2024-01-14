import { useEffect, useState } from "preact/hooks";
import { PeerStatus, connectPeer, peerId, peerStatus, sendFile } from "../../controller/peer";
import { ChangeEvent } from "preact/compat";

export function Scanner(p: {
    remote: string;
}) {
    useEffect(() => {
        connectPeer(p.remote);
    }, [p.remote, peerId.value]);


    const [sending, setSending] = useState(0);

    async function handleInput(ev: ChangeEvent<HTMLInputElement>) {
        for (const file of (ev.target as HTMLInputElement)?.files || []) {
            try {
                setSending($ => $ + 1);
                const buf = await file.arrayBuffer();
                await sendFile(buf, file.type);
                console.log("sent file", buf);
            } finally {
                setSending($ => $ - 1);
            }
        }
    }

    return <div id={"scan-app"}>
        <div class={"sc-status"}>
            {peerStatus.value === PeerStatus.Connecting ?
                <div>Verbinden ...</div>
                : (peerStatus.value === PeerStatus.Connected ?
                    <>
                        {sending ? <div>sending ${sending} file(s)</div> : <div>Bereit</div>}
                    </>
                    :
                    <div>Nicht verbunden</div>
                )}

        </div>
        <div class={"buttons"}>
            <label class={`button`}>Select File <input class={`hidden`} type="file" accept="image/*" multiple onChange={handleInput}></input></label>
            <label class={`button`}>Open Camera <input class={`hidden`} type="file" accept="image/*" capture="camera" multiple onChange={handleInput}></input></label>
        </div>
    </div>;
}

