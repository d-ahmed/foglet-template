const TMAN = require("./abstract");
const debug = require("debug")("template:overlay");
const MUpdateCache = require('./messages/mupdatecache.js')

module.exports = class Overlay extends TMAN {
  constructor(...Args) {
    super(...Args);
    debug("Overlay initialized");
    this.rps._partialViewSize = () => this.options.maxPeers;
    this.rps._sampleSize = () => this.options.maxPeers;
    this._updateCache();
  }

  /**
   * Gives the start descriptor used by the TMan overlay (can be an empty object).
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {Object} The start descriptor used by the TMan overlay
   */
  _startDescriptor() {
    return {
      id: "test",
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
      z: Math.floor(Math.random() * 50)
    };
  }

  _updateCache(delay = this.options.delta) {

    setTimeout(() => {
      this._manager.overlay('tman').communication.onUnicast((id, message) => { 
        if(message.type === 'MUpdateCache'){
          this._rps.cache.set(message.peer, message.descriptor)
        }
      })
    }, delay*0.5)

    this.periodic = setInterval(() => {
      this._rps.parent.getPeers().forEach(peerId => {
        this._manager.overlay('tman').communication.sendUnicast(peerId, new MUpdateCache(this.inviewId, this._rps.options.descriptor))
      });
    }, 2 * 1000);
  }

  /**
   * Give the delay **in milliseconds** after which the descriptor must be recomputed.
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {number} The delay **in milliseconds** after which the descriptor must be recomputed
   */
  _descriptorTimeout() {
    return 5 * 1000;
  }

  /**
   * Compare two peers and rank them according to a ranking function.
   * This function must return `0 if peerA == peerB`, `1 if peerA < peerB` and `-1 if peerA > peerB`.
   *
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @param {*} neighbour - The neighbour to rank with
   * @param {Object} descriptorA - Descriptor of the first peer
   * @param {Object} descriptorB - Descriptor of the second peer
   * @param {TManOverlay} peerA - (optional) The overlay of the first peer
   * @param {TManOverlay} peerB - (optional) The overlay of the second peer
   * @return {integer} `0 if peerA == peerB`, `1 if peerA < peerB` and `-1 if peerA > peerB` (according to the ranking algorithm)
   */
  _rankPeers(neighbour, descriptorA, descriptorB, peerA, peerB) {
    const getDistance = (descriptor1, descriptor2) => {
      const { x: xa, y: ya, z:za } = descriptor1;
      const { x: xb, y: yb, z:zb } = descriptor2;
      const dx = xa - xb;
      const dy = ya - yb;
      const dz = za - zb;
      /return Math.sqrt(dx * dx + dy * dy);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    const distanceA = getDistance(neighbour.descriptor, descriptorA);
    const distanceB = getDistance(neighbour.descriptor, descriptorB);
    return distanceA - distanceB;
  }
};
