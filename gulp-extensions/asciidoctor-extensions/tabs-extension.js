'use strict'

const Extensions = Opal.Asciidoctor.$$scope.Extensions

function toBlock(block) {
  // arity is a mandatory field
  block.$$arity = block.length
  return block
}

Extensions.register(function () {
  /**
   * Converts a custom listing block named "tabs" into an open block with the role "tabs".
   *
   * Usage:
   *
   *   [tabs]
   *   ------
   *   // one or more tab blocks
   *   ------
   */
  this.block(function () {
    var self = this
    self.named('tabs')
    self.onContext('listing')
    self.process(function (parent, reader, attrs) {
      var tabs = self.createBlock(parent, 'open', [], attrs)
      tabs.addRole('tabs')
      self.parseContent(tabs, reader)
      return tabs
    })
  })

  /**
   * Converts a custom literal block named "tab" into an example block with no caption.
   * Only blocks of this type should be inside of a tabs block.
   *
   * Usage:
   *
   *   [tab]
   *   .....
   *   // compound (i.e., mixed) AsciiDoc content
   *   .....
   */
  this.block(function () {
    var self = this
    self.named('tab')
    self.onContext('literal')
    self.process(function (parent, reader, attrs) {
      attrs['$[]=']('caption', '')
      var tab = self.createBlock(parent, 'example', [], attrs, Opal.hash({ 'content_model': 'compound' }))
      self.parseContent(tab, reader)
      return tab
    })
  })
})
