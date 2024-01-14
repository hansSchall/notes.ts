import { ContentView, updateContentView } from "./components/ContentView";
import { Header } from "./components/Header";
import { Importer } from "./components/Importer";
import { PageSidebars } from "./components/PageSidebar";
import { Toolbar } from "./components/Toolbar";
import { RenderStatus, renderStatus } from "./render/webgpu";
import { WebGPUError, WebGPUStarting } from "./components/WebGPUStarting";
import { DocumentImport } from "./components/document-import/Document";
import { useState } from "preact/hooks";
import { S } from "./lib/signal";
import { importSidebar } from "./components/uiState";

export function App() {
    const [docImport, setDocImport] = useState<URL | null>(null);
    return <>
        <Header />
        <Toolbar />
        <div id="app-main">
            {/* <Picker /> */}
            <PageSidebars />
            <div id={`content`}>
                {renderStatus.value === RenderStatus.STARTING ? <WebGPUStarting /> : (renderStatus.value === RenderStatus.FAILURE ? <WebGPUError /> : null)}
                <ContentView key={updateContentView.value} />
            </div>
            {S(importSidebar) ? <Importer /> : null}
        </div>
        {docImport && <DocumentImport srcImg={docImport} close={() => {
            setDocImport(null);
        }} />}
    </>;
}

