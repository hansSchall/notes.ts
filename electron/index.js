"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var createWindow = function () {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            height: 32,
            color: "#884dff",
            symbolColor: "#222"
        }
    });
    win.loadURL("https://localhost/");
};
electron_1.app.whenReady().then(function () {
    createWindow();
});
