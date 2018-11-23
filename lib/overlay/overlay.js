const TMAN = require("./abstract");
const debug = require("debug")("template:overlay");
const MUpdateCache = require("./messages/mupdatecache.js");
const MUpdatePartialView = require("./messages/mupdatepartialview.js");

module.exports = class Overlay extends TMAN {
  constructor(...Args) {
    super(...Args);
    debug("Overlay initialized");
    this.rps._partialViewSize = () => this.options.maxPeers;
    this.rps._sampleSize = () => this.options.maxPeers;
    this._setupListener();
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

  _setupListener(delay = this.options.delta) {
    const overlay = this.options.pid;
    setTimeout(() => {
      this._manager.overlay(overlay).communication.onUnicast((id, message) => {
        if (message.type === "MUpdateCache") {
          this._rps.cache.set(message.peer, message.descriptor);
          if (this._rps.partialView.has(message.peer)) {
            const myDescriptor = this._rps.partialView.get(message.peer)
              .descriptor;
            myDescriptor.x = message.descriptor.x;
            myDescriptor.y = message.descriptor.y;
            myDescriptor.z = message.descriptor.z;
          }
        }
      });
    }, 0.5 * 1000);
  }

  _updateCache(delay = this.options.delta) {
    this.periodic = setInterval(() => {
      const overlay = this.options.pid;
      this._rps.parent.getPeers().forEach(peerId => {
          this._manager
          .overlay(overlay) && this._manager
          .overlay(overlay)
          .communication.sendUnicast(
            peerId,
            new MUpdateCache(this.inviewId, this._rps.options.descriptor)
          ).then().catch(
            e => {

            }
          );
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
      const { x: xa, y: ya, z: za } = descriptor1;
      const { x: xb, y: yb, z: zb } = descriptor2;
      const dx = xa - xb;
      const dy = ya - yb;
      const dz = za - zb;
      return Math.sqrt(dx * dx + dy * dy);
      //return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    const distanceA = getDistance(neighbour.descriptor, descriptorA);
    const distanceB = getDistance(neighbour.descriptor, descriptorB);

    if (distanceA === distanceB) {
      if (descriptorA.x >= descriptorB.x) {
        return -1;
      } else if (descriptorA.x < descriptorB.x) {
        return 1;
      }
    }
    return distanceA - distanceB;
  }
};
