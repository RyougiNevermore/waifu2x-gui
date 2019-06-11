const {ipcRenderer} = require('electron');
const process = require('process');
const exec = require('child_process').exec;


document.querySelector('#act_btn').addEventListener('click', function () {
    action();
});

document.querySelector('#stp_btn').addEventListener('click', function () {
    ipcRenderer.send('process-close', {});

    document.getElementById('progress_bar').max = 0;
    document.getElementById('progress_bar').value = 0;
    // document.getElementById('log').value = '';
    // document.getElementById('progress_box').style.display = "none";

    document.getElementById('stop').style.display = "none";

    document.getElementById('action').style.display = "block";
});

function action() {

    document.getElementById('progress_bar').max = 0;
    document.getElementById('progress_bar').value = 0;

    document.getElementById('progress_bar_total').innerText = "0";
    document.getElementById('progress_bar_current').innerText = "0";

    document.getElementById('log').value = '';

    let _form = getForm();
    console.log(_form);

    if (_form.ok === false) {
        return false;
    }

    ipcRenderer.on('process-ready', (event, arg) => {
        console.log(arg);
        document.getElementById('progress_bar').max = arg.total + 1;
        document.getElementById('progress_bar_total').innerText = arg.total;
        document.getElementById('progress_bar_current').innerText = "0";
        document.getElementById('progress_bar').value = 1;
        document.getElementById('progress_box').style.display = "block";

        document.getElementById('stop').style.display = "block";

        document.getElementById('action').style.display = "none";


    });

    ipcRenderer.on('process-reply', (event, arg) => {
        console.log(arg)
        document.getElementById('progress_bar').value = parseInt(document.getElementById('progress_bar').value) + 1;
        document.getElementById('progress_bar_current').innerText = "" + arg.index;
        document.getElementById('log').value = document.getElementById('log').value + "\n" + arg.message;

        document.getElementById('log').scrollTop  = document.getElementById('log').scrollHeight;

        if (arg.index === arg.total) {

            document.getElementById('stop').style.display = "none";

            document.getElementById('action').style.display = "block";
        }
    });
    ipcRenderer.send('process-send', _form);

}

function getForm() {
    let _input = document.getElementById("input").value;
    let _output = document.getElementById("output").value;

    if (_input === '') {
        document.getElementById('dialog-input').showModal();
        return {"ok":false};
    }


    if (_output === '') {
        document.getElementById('dialog-output').showModal();
        return {"ok":false};
    }

    let _noiseEle = document.getElementsByName("noise");
    let _noise = 2;
    for (let _i = 0; _i < _noiseEle.length; _i++) {
        if (_noiseEle[_i].checked === true) {
            _noise = parseInt(_noiseEle[_i].value);
            break;
        }
    }

    let _scale = "2";
    let _scaleEle = document.getElementsByName("scale");

    for (let _i = 0; _i < _scaleEle.length; _i++) {
        if (_scaleEle[_i].checked === true) {
            _scale = parseInt(_scaleEle[_i].value);
            break;
        }
    }

    let _tile_size = parseInt(document.getElementById("tile_size").value);

    return {
        "ok":true,
        "input": _input,
        "dist": _output,
        "noise": _noise,
        "scale": _scale,
        "tile": _tile_size
    };
}

document.querySelector('#aboutMe').addEventListener('click', function () {
    openDefaultBrowser('https://github.com/RyougiNevermore');
});

function aboutMe() {

}

const openDefaultBrowser = function (url) {
    console.log(process.platform)
    switch (process.platform) {
        case "darwin":
            exec('open ' + url);
            break;
        case "win32":
            exec('start ' + url);
            break;
        default:
            exec('xdg-open', [url]);
    }
}

