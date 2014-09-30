xbox-midi-controller
====================
Only tested with OSX so far.

Requires http://tattiebogle.net/index.php/ProjectRoot/Xbox360Controller/OsxDriver (dependency of [Node Xbox Controller](https://github.com/andrew/node-xbox-controller)).

## Usage
```javascript
var Xbox = require('./xbox-midi-controller');

var rootNote = 90;
var steps = [2, 2, 1, 2, 2, 2, 1];
var channelName = 'channel name';

var controller = new Xbox(channelName, rootNote, steps);

// notice:  Xbox controller connected.
```