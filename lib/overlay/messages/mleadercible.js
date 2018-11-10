'use strict'

/**
 * Message sent by a peer asking for the receiver to send its descriptor.
 */
class MLeaderCible {
  constructor (idCible, descriptor, func='add') {
    this.idCible = idCible
    this.descriptor = descriptor
    this.type = 'MLeaderCible'
    this.func = func
  }
}

module.exports = MLeaderCible
