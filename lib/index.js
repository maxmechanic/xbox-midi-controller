var midi = require('midi');
var XboxController = require('xbox-controller');

var scales = require('./scales');

var OCTAVE = 12;
var buttons = ['a', 'b', 'x', 'y', 'leftshoulder', 'rightshoulder', 'leftstick', 'rightstick'];

function XboxMidiController(channelName, initialNote, steps) {
  var self = this;

  var output = new midi.output();
  var xbox = new XboxController();

  this.root = 72;
  this.scales = this.makeScale(initialNote, steps)
    .map(function(note, i, scale) {
      var modeSteps = steps.slice(i)
        .concat(steps.slice(0,i));

      return self.makeScale(note, modeSteps);
    }
  ).slice(0,7);

  this.octave = 0;
  this.mode = 0;

  channelName = channelName || 'musixbox';

  output.openVirtualPort(channelName);

  xbox.on('dleft:press', function(button) {
    self.mode = self.mode === 0 ? 6 : self.mode - 1;
  });

  xbox.on('dright:press', function(button) {
    self.mode = self.mode === 6 ? 0 : self.mode + 1;
  });

  xbox.on('dup:press', function(button) {
    self.octave += OCTAVE;
  });

  xbox.on('ddown:press', function(button) {
    self.octave -= OCTAVE;
  });

  buttons.forEach(function(button, i) {
    xbox.on(button + ':press', function() {
      output.sendMessage([144, self.getNote(i), 1]);
    });

    xbox.on(button + ':release', function() {
      output.sendMessage([144, self.getNote(i), 0]);
    });

  });

  xbox.on('lefttrigger', function(position) {
    var bend = Math.floor(position / 4);
    output.sendMessage([224, bend, bend]);
  });

  this.xbox = xbox;
  this.output = output;
}

XboxMidiController.prototype._reduceScale = function(prev, curr) {
  var note = prev + curr;

  return note;
};

XboxMidiController.prototype._mapScale = function(curr, index, arr) {
  if (index === 0) return curr;

  return curr + arr[index - 1];
};

XboxMidiController.prototype.makeScale = function (root, steps) {
  root = root || 60;
  steps = steps || scales.major;
  var scale = [root];

  var notes = steps.map(function(curr, i, arr) {
    return arr.slice(0,i+1).reduce(this._reduceScale, root);
  }.bind(this));

  return scale.concat(notes);
};

XboxMidiController.prototype.makeMajorScale = function(root) {
  return this.makeScale(root);
}

XboxMidiController.prototype.makeMinorScale = function(root) {
  return this.makeScale(root, scales.minor);
}

XboxMidiController.prototype.getNote = function(index) {
  return this.scales[this.mode][index] + this.octave;
};

module.exports = XboxMidiController;
