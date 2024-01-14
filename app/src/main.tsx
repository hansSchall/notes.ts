import { render } from 'preact';
import { App } from './App.tsx';
import './style/style.scss';
import { initPeer } from './controller/peer';
import { Scanner } from './components/scanner/Scanner';
import { initWebGPU } from './render/webgpu';


async function initApp() {
    const url = new URL(location.href);

    if (url.pathname.startsWith("/scan/")) {
        initScanner(url.pathname.split("/")[2]);
    } else {
        initMain();
    }

    initPeer();
}

async function initMain() {
    render(<App />, document.getElementById('app')!);
    initWebGPU();
}

async function initScanner(remote: string) {
    render(<Scanner remote={remote} />, document.getElementById('app')!);
}

document.addEventListener("DOMContentLoaded", initApp);
