'use strict';

var Modeler = require('bpmn-js/lib/Modeler');

var inherits = require('inherits');

function CustomModeler(options) {
  Modeler.call(this, options);

  this._customElements = [];
}

inherits(CustomModeler, Modeler);

CustomModeler.prototype._modules = [].concat(
  CustomModeler.prototype._modules,
  [
    require('./custom')
  ]
);

module.exports = CustomModeler;
