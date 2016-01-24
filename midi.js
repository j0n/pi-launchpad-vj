var midi = require('midi');
var midiOut = new midi.output()
var midiIn = new midi.input()
var fs = require('fs');
var spawn = require('child_process').spawn;
var videoStreamer = require('./lib/video');

var proc;
var pressButtons = [];
var count = 0;

process.on('SIGINT', function(e) {
	// midiOut.closePort()
    midiIn.closePort()
    if (proc) proc.kill();
})
// listing ports for debug;
for (var i = 0, ii = midiIn.getPortCount(); i<ii; i++) {
      var portName = midiIn.getPortName(i);
      console.log('Port #'+i+': #'+ portName)
}
for (var i = 0, ii = midiOut.getPortCount(); i<ii; i++) {
      var portName = midiOut.getPortName(i);
      console.log('Port #'+i+': #'+ portName)
}

midiIn.on('message', function(time, message) {
    if (message[2] === 127) {
        count++;
        proc = videoStreamer({
            timeout: 0
        });
        var file = fs.createWriteStream(__dirname + '/videos/'+count+'.h264');
        var video = proc.stdout;
        video.pipe(file);
        pressButtons.push(message[1]);
    } else if (message[2] === 0) {
        if (pressButtons.indexOf(message[1]) > -1) {
            if (proc) {
                console.log('Killing proc');
                proc.kill();
            }
            pressButtons.slice(pressButtons.indexOf(message[1]), 1);
        }
    }
});

midiIn.openPort(1)
