import { app, BrowserWindow } from 'electron';

const createWindow = () => {
    const win = new BrowserWindow({
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

app.whenReady().then(() => {
    createWindow();
});
