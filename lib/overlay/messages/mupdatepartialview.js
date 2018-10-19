'use strict'

/**
 * Message sent by a peer asking for the receiver to send its descriptor.
 */
class MUpdatePartialView {
  constructor (inview, descriptor) {
    this.peer = inview
    this.descriptor = descriptor
    this.type = 'MUpdatePartialView'
  }
}

module.exports = MUpdatePartialView
