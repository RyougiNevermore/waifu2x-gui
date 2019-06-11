`use strict`

const path = require('path');
const exec = require('child_process').execFile;
const fs = require('fs');

let processes = new Map();
let run = false;

const bin = path.join(__dirname, 'waifu2x.exe');

module.exports = function () {

    this.convertFile = async function (_arg, readyFn, processFn) {
        readyFn(1);
        run = true;
        let _rs = await _convert(_arg);
        run = false;
        processFn(_rs);
        return 1;
    };

    this.convertDir = async function (_arg, readyFn, processFn) {

        let _srcDir = _arg.srcDir;
        let _distDir = _arg.distDir;

        let _files = fs.readdirSync(_srcDir);

        readyFn(_files.length);
        run = true;

        for (let _index = 0; _index < _files.length; _index++) {

            if (!run) {
                processFn({
                    "message": "stop!!!"
                });
                break
            }
            let _file = _files[_index];

            let _srcFile = _srcDir + "/" + _file;

            let _name = _srcFile.substring(_srcFile.lastIndexOf("/") + 1, _srcFile.lastIndexOf("."));

            let _distFile = _distDir + "/" + _name + ".png";

            let _fileArg = _arg;
            _fileArg.src = _srcFile;
            _fileArg.dist = _distFile;
            _fileArg.index = _index + 1;
            _fileArg.total = _files.length;
            let _rs = await _convert(_fileArg);
            console.log(_rs);
            processFn(_rs);
        }
        return _files.length;
    }

    this.stop = function () {
        run = false;
        console.log(processes.keys())
        for (let _pid of processes.keys()) {
            let _p = processes.get(_pid);
            _p.kill('SIGTERM');
            console.log(_p.killed);
        }
        processes.clear();
    };

};

function _convert(_arg) {

    let _src = _arg.src;
    let _dist = _arg.dist;
    let _current = _arg.index;
    if (_current === null || _current === undefined) {
        _current = 1;
    }
    let _total = _arg.total;
    if (_total === null || _total === undefined) {
        _total = 1;
    }
    let _noise = _arg.noise;
    let _scale = _arg.scale;
    let _tile = _arg.tile;

    _dist = _dist.substring(0, _dist.lastIndexOf(".")) + "-wa.png";

    return new Promise(function (resolve, reject) {
        let _p = exec(bin,
            [
                _src,
                _dist,
                _noise,
                _scale,
                _tile
            ],
            {
                "cwd": path.join(__dirname)
            },
            function (err, stdout, sdterr) {
                processes.delete(_p.pid);
                let _result = {
                    "index": _current,
                    "total": _total,
                }
                if (err !== null && err !== undefined) {
                    console.log(err)
                    _result.ok = false;
                    _result.message =
                        "***********************************************" + "\n" +
                        "[" + _current + " / " + _total + "][FAILED]" + "\n" +
                        "- src: " + _src + "\n" +
                        "- out: " + _dist + "\n" +
                        "[MESSAGE]" + "\n" +
                        "" + err.toString() + "\n" +
                        "" + sdterr.toString();
                } else {
                    _result.ok = true;
                    _result.message =
                        "***********************************************" + "\n" +
                        "[" + _current + " / " + _total + "][SUCCESS]" + "\n" +
                        "- src: " + _src + "\n" +
                        "- out: " + _dist + "\n" +
                        "[MESSAGE]" + "\n" +
                        "" + sdterr.toString();
                }
                resolve(_result);
            }
        );
        processes.set(_p.pid, _p);
    });
    return 1;
}

