const TMAN = require('./abstract')
const debug = (require('debug'))('template:overlay')

module.exports = class Overlay extends TMAN {
  constructor (...Args) {
    super(...Args)
    debug('Overlay initialized')
    this.rps._partialViewSize = () => this.options.maxPeers
    this._start();
  }

  /**
   * Gives the start descriptor used by the TMan overlay (can be an empty object).
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {Object} The start descriptor used by the TMan overlay
   */
  _startDescriptor () {
    return {
      id: 'test',
      x: Math.floor(Math.random()*10),
      y: Math.floor(Math.random()*10)
    }
  }

  /**
   * Give the delay **in milliseconds** after which the descriptor must be recomputed.
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {number} The delay **in milliseconds** after which the descriptor must be recomputed
   */
  _descriptorTimeout () {
    return 1 * 1000
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
      const { x: xa, y: ya } = descriptor1;
      const { x: xb, y: yb } = descriptor2;
      const dx = xa - xb;
      const dy = ya - yb;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const distanceA = getDistance(neighbour.descriptor, descriptorA);
    const distanceB = getDistance(neighbour.descriptor, descriptorB);

    // console.log(neighbour);

    /*const db = neighbour.descriptor.x - descriptorA.x
    const da = neighbour.descriptor.x - descriptorB.x
    return db < da ? -1 : 1;*/

    return distanceA > distanceB ? 1 : distanceA === distanceB ? 0 : -1;
    // return 1;
  }

  _start (delay = this.options.delta) {

    this.periodic = setInterval(() => {
        // console.log("Delta is here", this.getNeighbours())
        // this._manager.overlay('tman')._network._rps.neighbours().inview.map(el => el.peer)
        this.getNeighbours().forEach((peerId)=>{
          this._manager.overlay('tman')._network._rps.unicast.emit('requestDescriptor',
          peerId, this._manager.overlay('tman')._network._rps.getOutviewId())
          .catch((e) => {
            console.error(e)
          })
        })
    }, delay*0.8)
  }

  

  /*_rankPeers (neighbour, descriptorA, descriptorB, peerA, peerB) {
    const da = (
      Math.sqrt(
          Math.pow((neighbour.descriptor.x - descriptorA.x),2) +
          Math.pow((neighbour.descriptor.y - descriptorA.y),2)
      ))
    const db = (
        Math.sqrt(
            Math.pow((neighbour.descriptor.x - descriptorB.x),2) +
            Math.pow((neighbour.descriptor.y - descriptorB.y),2)
        ))
    
    let result = 0;
    let diff = da-db;
    if(neighbour.descriptor === descriptorA || neighbour.descriptor === descriptorB){
      console.log("poblème");
    }else
    if(diff<0){
      result = -1;
    }else if(diff>0){
      result = 1;
    }
    /*console.group("_rankPeers")
    console.log("neighbour", neighbour.descriptor)
    console.log("descriptorA", descriptorA)
    console.log("descriptorB", descriptorB)
    console.groupEnd()
    // return diff;
    return 1;
}*/
}
