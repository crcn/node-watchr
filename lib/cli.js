var structr = require("structr"),
watch_r     = require("./"),
_           = require("underscore"),
ejs         = require("ejs"),
child_process = require("child_process"),
spawn = child_process.spawn,
exec = child_process.exec;

module.exports = structr({

  /**
   */

  "start": function (options)  {
    var self = this;

    this._options = options;
    this._output  = this._fixPath(options.output || options.input);
    this._input   = this._fixPath(options.input);
    this._delay   = options.delay || 500;
    this._changed = {}

    watch_r(this._input, function(err, monitor) {
      ["file", "change", "remove"].forEach(function(event) {
        monitor.on(event, function(target) {
          self._change(target);
        })
      })
    });


    this._process = _.debounce(function() {
      self._process2();
    }, this._delay);
  },

  /**
   */

  "_fixPath": function(path) {
    return String(path).replace(/^\./, process.cwd()).replace(/^~/, process.env.HOME);
  },

  /**
   */

  "_change": function (target) {
    this._changed[target.path] = 1;
    this._process();
  },

  /**
   */

  "_process2": function () {
    if(this._options.each) {
      this._each();
    }
    if(this._options.restart) {
      this._restart();
    }
  },

  /**
   */

  "_each": function() {
    for(var file in this._changed) {
      var command = ejs.render(this._options.each, { input: file, output: this._dstFile(file) });
      console.log(command);
      exec(command, function(err, stdout, stderr) {
        process.stdout.write(stdout);
        process.stderr.write(stderr);
      })
    }
  },

  /**
   */

  "_dstFile": function(source) {
    return source.replace(this._input, this._output);
  }
});