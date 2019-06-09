const {ipcRenderer} = require('electron')
document.querySelector('#act_btn').addEventListener('click', function () {
    action();
});

document.querySelector('#stp_btn').addEventListener('click', function () {
    ipcRenderer.send('process-close', {});

    document.getElementById('progress_bar').max = 0;
    document.getElementById('progress_bar').value = 0;
    document.getElementById('log').value = '';
    document.getElementById('progress_box').style.display = "none";

    document.getElementById('stop').style.display = "none";

    document.getElementById('action').style.display = "block";
});

function action() {

    document.getElementById('progress_bar').max = 0;
    document.getElementById('progress_bar').value = 0;
    document.getElementById('log').value = '';

    let _form = getForm();
    console.log(_form);

    if (_form.ok === false) {
        return false;
    }

    ipcRenderer.on('process-ready', (event, arg) => {
        console.log(arg);
        document.getElementById('progress_bar').max = arg.total + 1;
        document.getElementById('progress_bar').value = 1;
        document.getElementById('progress_box').style.display = "block";

        document.getElementById('stop').style.display = "block";

        document.getElementById('action').style.display = "none";


    });

    ipcRenderer.on('process-reply', (event, arg) => {
        console.log(arg)
        document.getElementById('progress_bar').value = parseInt(document.getElementById('progress_bar').value) + 1;

        document.getElementById('log').value = document.getElementById('log').value + "\n" + arg.name + "\t" + arg.index + " / " + arg.total;

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

    let _modeEle = document.getElementsByName("mode");

    let _mode = "noise_scale";
    for (let _i = 0; _i < _modeEle.length; _i++) {
        if (_modeEle[_i].checked === true) {
            _mode = _modeEle[_i].value;
            break;
        }
    }
    let _block_size = document.getElementById("block_size").value;
    let _scale_ratio = document.getElementById("scale_ratio").value;
    let _threads = document.getElementById("threads").value;

    let _noise_level = "2";
    let _noise_level_ele = document.getElementsByName("noise_level");

    for (let _i = 0; _i < _noise_level_ele.length; _i++) {
        if (_noise_level_ele[_i].checked === true) {
            _noise_level = _noise_level_ele[_i].value;
            break;
        }
    }

    return {
        "ok":true,
        "input": _input,
        "output": _output,
        "mode": _mode,
        "blockSize": parseInt(_block_size),
        "scaleRatio": parseInt(_scale_ratio),
        "threads": parseInt(_threads),
        "noiseLevel": parseInt(_noise_level)
    };
}