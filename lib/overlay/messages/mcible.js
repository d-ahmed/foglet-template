'use strict'

/**
 * Message sent by a peer asking for the receiver to send its descriptor.
 */
class MCible {
  constructor (inview, descriptor, func='add') {
    this.peer = inview
    this.descriptor = descriptor
    this.type = 'MCible'
    this.func = func
  }
}

module.exports = MCible
