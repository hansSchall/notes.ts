import { PageLayerModel, PageLayerType, PageModel, PagePatternLayerModel, journal } from "../controller/document";
import { Assign, AssignON, S, ToggleON } from "../lib/signal";
import { options, pagesSidebar, selectedLayer, selectedPage } from "./uiState";
import { PaperFormat } from "./Paper";
import { useSignal } from "@preact/signals";
import { active } from "../lib/activeClass";
import { useMemo } from "preact/hooks";
import { gridFormat } from "../render/grid";
import { gridFormatEquals, gridFormatLabel, gridFormats } from "../render/grids";

function getSelectedPage() {
    return S(journal.pages).find($ => $.uid === S(selectedPage));
}

function useSelectedPage() {
    return useMemo(getSelectedPage, [S(selectedPage)]);
}

function layerIcon(type: PageLayerType) {
    switch (type) {
        case PageLayerType.IMG:
            return "bi-image";
        case PageLayerType.PATTERN:
            return "bi-grid-3x3";
        case PageLayerType.DRAW:
            return "bi-vector-pen";
        case PageLayerType.OBJECT:
            return "bi-circle-square";
        case PageLayerType.TEXT:
            return "bi-body-text";
        default:
            return "bi-question";
    }
}

export function PageList() {
    const insertLayer = useSignal(false);

    function AddLayerButton(p: {
        type: PageLayerType;
    }) {
        return <div class={`tk-b-button`} title={`Layer einfügen`} onClick={() => {
            const page = getSelectedPage();
            if (page) {
                const layer = page.addLayer(S(selectedLayer), p.type);
                Assign(selectedLayer, layer);
            }
            Assign(insertLayer, false);

        }}><i class={layerIcon(p.type)} /></div>;
    }

    return <div id={`page-list`} class={`tk-sidebar -left`}>
        <div class={`tk-header`}>
            <div class={`-label`}>Seiten & Layer</div>
            <div class={`-button`} onClick={AssignON(pagesSidebar, false)}><i class={`bi-x-lg`} /></div>
        </div>
        <div class={`tk-content`}>
            <div class={`pl-pages`}>
                {journal.pages.value.map((page, index) => <PageItem page={page} num={index + 1} />)}
            </div>
            <div class={`pl-actions`}>
                {S(insertLayer) ? <div class={`tk-b-box`}>
                    <AddLayerButton type={PageLayerType.IMG} />
                    <AddLayerButton type={PageLayerType.PATTERN} />
                    <AddLayerButton type={PageLayerType.DRAW} />
                    <AddLayerButton type={PageLayerType.OBJECT} />
                    <AddLayerButton type={PageLayerType.TEXT} />
                </div> : null}
                <div class={`tk-b-box`}>
                    <div
                        class={`tk-b-button`}
                        title={`Seite einfügen`}
                        onClick={() => {
                            Assign(selectedPage, journal.addPage(S(selectedPage)));
                        }}
                    ><i class={`bi-file-earmark-plus-fill`} /></div>
                    <div
                        class={`tk-b-button ${active(S(insertLayer))}`}
                        onClick={ToggleON(insertLayer)}
                        title={`Layer einfügen`}
                    ><i class={`bi-node-plus-fill`} /></div>
                    <div
                        class={`tk-b-button`}
                        onClick={() => {
                            if (S(selectedLayer)) {
                                const page = getSelectedPage();
                                if (page) {
                                    page.moveLayerForward(S(selectedLayer));
                                }
                            } else {
                                journal.movePageForward(S(selectedPage));
                            }
                        }}
                    ><i class={`bi-layer-forward`} /></div>
                    <div
                        class={`tk-b-button`}
                        onClick={() => {
                            if (S(selectedLayer)) {
                                const page = getSelectedPage();
                                if (page) {
                                    page.moveLayerBack(S(selectedLayer));
                                }
                            } else {
                                journal.movePageBack(S(selectedPage));
                            }
                        }}
                    ><i class={`bi-layer-backward`} /></div>
                    <div
                        class={`tk-b-button`}
                        onClick={() => {
                            journal.removePage(S(selectedPage));
                            Assign(selectedPage, "");
                        }}
                    ><i class={`bi-trash-fill`} /></div>
                </div>
            </div>
        </div>
    </div>;
}


function PageItem(p: {
    page: PageModel;
    num: number,
}) {
    return <div class={`pl-page ${p.page.uid === S(selectedPage) ? "-active" : "-inactive"}`} onClick={() => {
        selectedPage.value = p.page.uid;
    }}>
        <div class={`pl-page-header`} onClick={() => {
            selectedLayer.value = "";
        }}>
            <div class={`-label`}>{p.page.label.value || `Seite ${p.num}`} ({p.page.uid})</div>
            <div class={`-button`} title={`Seiteneinstellungen`} onClick={AssignON(options, true)}><i class={`bi-gear`} /></div>
        </div>
        <div class={`pl-page-layers`}>
            {S(p.page.layers).map((layer, index) => <PageLayer layer={layer} num={index + 1} />)}

        </div>
    </div>;
}

function PageLayer(p: {
    layer: PageLayerModel;
    num: number,
}) {
    const icon = useMemo(() => {
        switch (p.layer.type) {
            case PageLayerType.IMG:
                return "bi-image";
            case PageLayerType.PATTERN:
                return "bi-grid-3x3";
            case PageLayerType.DRAW:
                return "bi-vector-pen";
            case PageLayerType.OBJECT:
                return "bi-circle-square";
            default:
                return "bi-question";
        }
    }, [p.layer.type]);
    return <div class={`pl-page-layer ${active(S(selectedLayer) === p.layer.uid)}`} onClick={AssignON(selectedLayer, p.layer.uid)}>
        <div class={`-label`}><i class={icon} /> Layer {p.num}</div>
        <div class={`-button`} title={`Layer-Einstellungen`} onClick={AssignON(options, true)}><i class={`bi-gear`} /></div>
    </div>;
}

export function PageSidebars() {
    if (S(pagesSidebar)) {
        return <>
            <PageList />
            {S(options) ? <Options /> : null}
        </>;
    } else {
        return null;
    }
}

function Options() {
    if (S(selectedPage)) {
        if (S(selectedLayer)) {
            return <LayerOptions />;
        } else {
            return <PageOptions />;
        }
    } else {
        return null;
    }
}

function PageOptions() {
    const pageId = S(selectedPage);
    const page = useMemo(() => S(journal.pages).find($ => $.uid === pageId), [pageId]);

    if (!page)
        return null;

    else
        return <PageOptionsContent page={page} />;
}

function PageOptionsContent({ page }: {
    page: PageModel;
}) {

    // const [label, setLabel] = useState<string | null>(null);
    // useEffect(() => {
    //     setLabel(S(page.label));
    //     console.log(`update label from model`);
    // }, [S(page.label)]);

    // useEffect(() => {
    //     const to = setTimeout(() => {
    //         if (label !== null)
    //             page.setLabel(label);

    //         console.log(`writeback after timeout`);
    //     }, 1000);
    //     return () => {
    //         clearTimeout(to);
    //     };
    // }, [label]);

    // useEffect(() => () => {
    //     setLabel(label => {
    //         if (label !== null)
    //             page.setLabel(label);

    //         console.log(`write on unmount`);
    //         return label;
    //     });
    // }, [page.uid]);

    return <div class={`tk-sidebar -left`}>
        <div class={`tk-header`}>
            <div class={`-label`}>Seiteneinstellungen</div>
            <div class={`-button`} onClick={AssignON(options, false)}><i class={`bi-x-lg`} /></div>
        </div>
        <div class={`tk-content`}>
            <div class={`di-option`}>
                <div class={`-label`}>Label</div>
                <div class={`tk-b-box`}>
                    <input
                        type={`text`}
                        value={page.label}
                        onInput={ev => page.setLabel((ev.target as HTMLInputElement).value)} />
                </div>
            </div>
            <PaperFormat size={page.size} update={size => page.setPageSize(size)} />
        </div>
    </div>;
}

function LayerOptions() {
    const pageId = S(selectedPage);
    const layerId = S(selectedLayer);
    const page = useMemo(() => S(journal.pages).find($ => $.uid === pageId), [pageId]);
    const layer = useMemo(() => page && S(page.layers).find($ => $.uid === layerId), [page, layerId]);

    if (!page || !layer)
        return null;

    else
        return <LayerOptionsContent page={page} layer={layer} />;
}

function LayerOptionsContent({ page, layer }: {
    page: PageModel;
    layer: PageLayerModel,
}) {
    return <div class={`tk-sidebar -left`}>
        <div class={`tk-header`}>
            <div class={`-label`}>Layer-Einstellungen</div>
            <div class={`-button`} onClick={AssignON(options, false)}><i class={`bi-x-lg`} /></div>
        </div>
        <div class={`tk-content`}>
            {layer instanceof PagePatternLayerModel ? <PatternLayerOptions page={page} layer={layer} /> : null}
        </div>
    </div>;
}

function PatternLayerOptions({ layer }: {
    page: PageModel;
    layer: PagePatternLayerModel,
}) {
    return <div class={`di-option`}>
        <div class={`-label`}>Format</div>
        <div class={`tk-b-list`}>
            {
                [...gridFormats.entries()]
                    .map(
                        ([id, format]) =>
                            <div class={`tk-b-button ${gridFormatEquals(S(layer.pattern), format()) ? "-active" : "-inactive"}`} onClick={() => {
                                layer.pattern.value = format();
                            }} key={id}>{gridFormatLabel.get(id)}</div>)}
        </div>
    </div>;

}
