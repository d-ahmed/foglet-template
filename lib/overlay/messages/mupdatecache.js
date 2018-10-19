'use strict'

/**
 * Message sent by a peer asking for the receiver to send its descriptor.
 */
class MUpdateCache {
  constructor (inview, descriptor) {
    this.peer = inview
    this.descriptor = descriptor
    this.type = 'MUpdateCache'
  }
}

module.exports = MUpdateCache
