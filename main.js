// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');

const waifu2x = require('./waifu2x/waifu2x')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow({
        width: 800,
        height: 900,
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

let _wa = new waifu2x();

ipcMain.on("process-send", (event, arg) => {

    let _convertArg = {
        "noise": arg.noise,
        "scale": arg.scale,
        "tile": arg.tile
    };


    let _isNotDir = (arg.input.toLowerCase().lastIndexOf(".png") > 0)
        || (arg.input.toLowerCase().lastIndexOf(".jpg") > 0)
        || (arg.input.toLowerCase().lastIndexOf(".jpeg") > 0)
        || (arg.input.toLowerCase().lastIndexOf(".bmp") > 0)
        || (arg.input.toLowerCase().lastIndexOf(".git") > 0)

    if (_isNotDir) {
        _convertArg.src = arg.input;
        _convertArg.dist = arg.dist;
        _convertArg.index = 1;
        _convertArg.total = 1;
        _wa.convertFile(_convertArg, function (i) {
            event.sender.send('process-ready', {
                "total": i
            });
        }, function (_rs) {
            event.sender.send('process-reply', _rs);
        });

    } else {
        _convertArg.srcDir = arg.input;
        _convertArg.distDir = arg.dist;

        try {
            _wa.convertDir(_convertArg, function (i) {
                event.sender.send('process-ready', {
                    "total": i
                });
            }, function (_rs) {
                event.sender.send('process-reply', _rs);
            });
        } catch (e) {
            console.log(e)
            // event.sender.send('process-reply', {});
        }

    }

});


ipcMain.on("process-close", (event, arg) => {
    _wa.stop();
});


