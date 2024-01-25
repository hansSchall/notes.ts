import { ComponentChildren } from "preact";
// import { rerenderContentView } from "../controller/rerender";
import { Tool, getActiveThickness, tool } from "../controller/tools";
import { Signal } from "@preact/signals";
import { S, ToggleON } from "../lib/signal";
import { importSidebar, pagesSidebar } from "./uiState";
import { redo, redoAvailable, undo, undoAvailable } from "../controller/document";
import { zoomIn, zoomLevel, zoomOut, zoomSet } from "./ContentView";

const colors = new Map<string, string>(); // color => label
colors.set("#000", "Black");
colors.set("#f00", "Rot");
colors.set("#0f0", "Grün");
colors.set("#00f", "Blue");
colors.set("#ff0", "Yellow");

function compareAndSet<T>(signal: Signal<T>, value: T) {
    return {
        active: signal.value === value,
        onClick: () => {
            signal.value = value;
        }
    };
}

export function Toolbar() {
    return <div id={`toolbar`}>
        <ToolbarGroup title="File">
            <ToolbarItem icon="bi-floppy">Save</ToolbarItem>
            <ToolbarItem icon="bi-moon-stars">Dark Mode</ToolbarItem>
            {/* <ToolbarItem icon="bi-arrow-clockwise" onClick={rerenderContentView}>contentView HMR Update</ToolbarItem> */}
        </ToolbarGroup>
        <ToolbarGroup title="Bearbeiten">
            <ToolbarItem icon="bi-arrow-counterclockwise" onClick={undo} disabled={!undoAvailable.value}>Undo</ToolbarItem>
            <ToolbarItem icon="bi-arrow-clockwise" onClick={redo} disabled={!redoAvailable.value}>Redo</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup title="Tools">
            <ToolbarItem
                icon="bi-eraser"
                {...compareAndSet(tool, Tool.ERASER)}
            >Radierer</ToolbarItem>
            <ToolbarItem
                icon="bi-pencil"
                {...compareAndSet(tool, Tool.PENCIL)}
            >Stift</ToolbarItem>
            <ToolbarItem
                icon="bi-highlighter"
                {...compareAndSet(tool, Tool.MARKER)}
            >Textmarker</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup title="Dicke">
            <ToolbarItem
                icon="bi-circle-fill -small"
                {...compareAndSet(getActiveThickness(), .3)}
            >Dünn</ToolbarItem>
            <ToolbarItem
                icon="bi-circle-fill -medium"
                {...compareAndSet(getActiveThickness(), .6)}
            >Mittel</ToolbarItem>
            <ToolbarItem
                icon="bi-circle-fill -thick"
                {...compareAndSet(getActiveThickness(), 1)}
            >Dick</ToolbarItem>
        </ToolbarGroup>
        {/* <ToolbarGroup title="Farbe"> */}
        {/* <ToolbarItem icon="bi-droplet -color -black" color={"#000"} key={"#000"} {...compareAndSet(getActiveColor(), "#000")}>Black</ToolbarItem> */}
        {/* {[...colors].map(([color, label]) => <ToolbarItem icon={`bi-droplet-fill -color ${tool.value !== Tool.ERASER ? "" : "-disabled"}`} color={color} key={color} {...compareAndSet(getActiveColor(), color)}>{label}</ToolbarItem>)} */}

        {/* </ToolbarGroup> */}
        <ToolbarGroup title="Sidebars">
            <ToolbarItem icon="bi-book" active={S(pagesSidebar)} onClick={ToggleON(pagesSidebar)}>Seiten</ToolbarItem>
            <ToolbarItem icon="bi-camera" active={S(importSidebar)} onClick={ToggleON(importSidebar)}>Scan-Import</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup title="Ansicht">
            <ToolbarItem icon="bi-zoom-in" onClick={zoomIn}>Zoom In</ToolbarItem>
            <ToolbarItem icon="bi-zoom-out" onClick={zoomOut}>Zoom Out</ToolbarItem>
            <ToolbarItem icon="bi-house" onClick={() => zoomSet(1)}>Zoom Home</ToolbarItem>
            {S(zoomLevel)}
        </ToolbarGroup>
    </div>;
}

function ToolbarGroup(p: {
    children?: ComponentChildren,
    title: string,
}) {
    return <div class={`tb-group`} title={p.title}>
        {p.children}
    </div>;
}

function ToolbarItem(p: {
    icon: string,
    onClick?: VoidFunction,
    children: string,
    color?: string,
    active?: boolean,
    disabled?: boolean,
}) {
    return <div class={`tb-item ${p.icon} ${p.active ? "-active" : "-inactive"} ${p.disabled ? "-disabled" : "-enabled"}`} onClick={p.onClick} title={p.children} style={{
        "--c": p.color,
    }}>
    </div>;
}
