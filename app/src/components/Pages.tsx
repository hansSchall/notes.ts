import { PageModel, journal } from "../controller/document";
import { pxPerMm } from "../lib/paper";
import { S } from "../lib/signal";

export function Pages() {
    return <>
        {S(journal.pages).map(page => <Page page={page} />)}
    </>;
}

function Page(p: {
    page: PageModel;
}) {
    const { page } = p;
    return <div class={`page`} style={{
        width: `${S(page.size)[0] * S(pxPerMm)}em`,
        height: `${S(page.size)[1] * S(pxPerMm)}em`,
    }}></div>;
}

