module.exports = {
  __depends__: [
    require('diagram-js/lib/features/popup-menu'),
    require('bpmn-js/lib/features/replace')
  ],
  __init__: [ 'replaceMenuProvider' ],
  replaceMenuProvider: [ 'type', require('./CustomPopMenu') ]
};