'use strict'

/**
 * Message sent by a peer asking for the receiver to send its descriptor.
 */
class MCible {
  constructor (inview, descriptor) {
    this.peer = inview
    this.descriptor = descriptor
    this.type = 'MCible'
  }
}

module.exports = MCible
