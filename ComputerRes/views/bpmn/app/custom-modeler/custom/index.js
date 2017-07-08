module.exports = {
  __init__: [
      'paletteProvider',
      'resizeAllRules',
      'contextPadProvider',
      'replaceMenuProvider'
  ],
  paletteProvider: [ 'type', require('./palette/CustomPalette') ],
    resizeAllRules: [ 'type', require('./resize-all-rules/ResizeAllRules') ],
    contextPadProvider: [ 'type', require('./context-pad/ContextPadProvider') ],
    replaceMenuProvider: [ 'type', require('./pop-menu/CustomPopMenu') ]
};
