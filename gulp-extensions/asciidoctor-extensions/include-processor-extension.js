'use strict'

function toBlock(block) {
  // arity is a mandatory field
  block.$$arity = block.length
  return block
}

const $$includeHandler = Symbol('$$includeHandler')

module.exports = class AsciidoctorIncludeProcessorExtension {

  constructor(asciidoctor) {

    // impossible to do it properly
    const includeProcessor = this

    const Extensions = asciidoctor.$$scope.Extensions

    // this could be removed in future versions of asciidoctor.js
    Extensions.Registry.$$proto.includeProcessor = function (name, block) {
      if (typeof name === 'function' && typeof block === 'undefined') {
        return Opal.send(this, 'include_processor', null, toBlock(name))
      } else {
        return Opal.send(this, 'include_processor', [name], toBlock(block))
      }
    }

    Extensions.register(function () {

      this.includeProcessor('git-include', function () {

        this.process((doc, reader, target, attributes) => {
          const process = includeProcessor[$$includeHandler]
          if (!process) {
            return
          }
          const contents = process(doc, target, attributes)
          if (contents != null) {
            reader.$push_include(contents)
          }
        })
      })
    })

    this[$$includeHandler] = new Set()
  }

  onInclude(callback) {
    this[$$includeHandler] = callback
  }
}
