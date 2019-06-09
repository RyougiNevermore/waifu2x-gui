`use strict`

const path = require('path');
const exec = require('child_process').execFile;

module.exports = function (_o, _m, _b, _s, _j, _n) {

    this.output = _o;
    this.mode = _m;
    this.blockSize = _b;
    this.scaleRatio = _s;
    this.threads = _j;
    this.noiseLevel = _n;


    this.bin = path.join(__dirname, 'waifu2x-converter-glsl.exe');

    console.log(path.join(__dirname));

    this.processes = new Array();


    this.do = function (_s, fn) {

        var _name = _s.substring(_s.lastIndexOf("/") + 1, _s.lastIndexOf("."));
        var _o = this.output + "/" + _name + ".png";

        var _p = exec(this.bin,
            [
                '-i', _s,
                '-o', _o,
                '-b', this.blockSize,
                '-m', this.mode,
                '-j', this.threads,
                '--scale_ratio', this.scaleRatio,
                '--noise_level', this.noiseLevel
            ],
            {
                "cwd": path.join(__dirname)
            },
            function (err, data) {
                fn(_name);
            }
        );
        this.processes.push(_p);
    };

    this.stop = function () {
        this.processes.forEach(function (_p, _i) {
            _p.kill('SIGTERM');
            console.log(_p.killed);
        })
    };

};