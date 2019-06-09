// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const fs = require('fs');

const waifu = require('./wbin/waifu')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'main.html'))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

let _wa = null;

ipcMain.on("process-send", (event, arg) => {

    const files = fs.readdirSync(arg.input);

    event.sender.send('process-ready', {
        "total": files.length
    });

    _wa = new waifu(arg.output, arg.mode, arg.blockSize, arg.scaleRatio, arg.threads, arg.noiseLevel)

    console.log(_wa);

    files.forEach(function (file, index) {
        var _s = arg.input + "/" + file;
        console.log(_s);

        _wa.do(_s, function (_name) {
            event.sender.send('process-reply', {
                "index": index + 1,
                "total": files.length,
                "name": _name,
                "end": (index + 1 === files.length)
            });
        });

    });


});

ipcMain.on("process-close", (event, arg) => {
    _wa.stop();
});


