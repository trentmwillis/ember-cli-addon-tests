"use strict";

var RSVP     = require('rsvp');
var debug    = require('../utilities/debug');
var runEmber = require('../utilities/run-ember');
var defaults = require('lodash/defaults');
var temp     = require('../utilities/temp');

module.exports = function runServer(options) {
  return new RSVP.Promise(function(resolve, reject) {
    options = options || { };

    defaults(options, {
      port: '49741',
      command: 'server'
    });

    var args = [
      '--port', options.port
    ];

    if (options.additionalArguments) {
      args = args.concat(options.additionalArguments);
    }

    var commandOptions = {
      verbose: true,

      onOutput: function(output, child) {
        if (detectServerStart(output)) {
          resolve(child);
        }
      }
    };

    args.push(commandOptions);

    debug('starting server; command=%s; port=%s', options.command, options.port);

    runEmber(options.command, args, temp.pristineNodeModulesPath)
      .then(function() {
        throw new Error('The server should not have exited successfully.');
      })
      .catch(function(e) {
        reject(e);
      });
  });
};

function detectServerStart(output) {
  var indicators = [
    'Ember FastBoot running at',
    'Serving on'
  ];

 for (var i = 0; i < indicators.length; i++) {
   if (output.indexOf(indicators[i]) > -1) {
     return true;
   }
 }
}
