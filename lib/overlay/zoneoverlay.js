const TMAN = require("./abstract");
const debug = require("debug")("template:overlay");
const MUpdateCache = require('./messages/mupdatecache.js')
const _ = require("lodash");

module.exports = class ZoneOverlay extends TMAN {
  constructor(...Args) {
    super(...Args);
    debug("Overlay initialized");
    this.rps._partialViewSize = () => this._rps.options.maxPeers;
    this.rps._sampleSize = () => 20;
    this._setupListener();
    this._updateCache();
    this.myneighbours = new Set();
    this.cibles = new Map();
    this.myCibles = []
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

  addCible(cible){
    this.cibles.set(cible.id, cible);
    this.calculateCible();
  }

  removeCible(id){
    this.cibles.delete(id)
    this.myCibles = this.myCibles.filter(cid=>cid.id!==id)
  }


  _setupListener(delay = this.options.delta){
    setTimeout(() => {
      this._manager.overlay('tman').communication.onUnicast((id, message) => { 
        if(message.type === 'MUpdateCache'){
          this._rps.cache.set(message.peer, message.descriptor)
        }
      })
    }, 0.5 * 1000)

    setTimeout(() => {
      this._manager.overlay('tman').communication.onUnicast((id, message) => { 
        if(message.type === 'MUpdatePartialView'){
          this._rps.cache.set(message.peer, message.descriptor)
          if(this._rps.partialView.has(message.peer)){
            const myDescriptor = this._rps.partialView.get(message.peer).descriptor;
            myDescriptor.x = message.descriptor.x;
            myDescriptor.y = message.descriptor.y;
            myDescriptor.z = message.descriptor.z;
          }
        }
      })
    }, 0.5 * 1000)
  }

  _updateCache(delay = this.options.delta) {
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

  getDistance (descriptor1, descriptor2) {
    const { x: xa, y: ya, z:za } = descriptor1;
    const { x: xb, y: yb, z:zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    return Math.sqrt(dx * dx + dy * dy);
    //return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  calculateCible () {
      Array.from(this.cibles.values(), (cible)=>{
        if(this._isNearby(cible, this._rps.options.descriptor, cible.perimeter)){
          if(this.myCibles.filter(cid=>cid.id===cible.id).length<=0){
            this.myCibles.push(cible);
          }
        }else{
          if(this.myCibles.filter(cid=>cid.id===cible.id).length>0){
            this.myCibles = this.myCibles.filter(cid=>cid.id!==cible.id)
          }
        }
      })
  }

  /**
   *
   *
   * @param {*} descriptor1
   * @param {*} descriptor2
   * @param {*} perimeter
   * @returns
   */
  _isNearby(descriptor1, descriptor2, perimeter) {
    const distance = this.getDistance(descriptor1, descriptor2);
    //  Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance > perimeter ? false : true;
  }

  _needConnectionTo(descriptor){
    let trouve = false;
    let i = 0;
    while(i<this.myCibles.length && !trouve){
      let cible = this.myCibles[i];
      if(this._isNearby(cible, descriptor, cible.perimeter)){
        trouve = true;
      }
      i++;
    }
    return trouve;
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
    
    if(
      (this._rps.options.descriptor.id === neighbour.descriptor.id) &&
      (this._needConnectionTo(descriptorA))
    ){
        if(  this._rps.options.maxPeers < this.rps._sampleSize() && !this.myneighbours.has(descriptorA.id)){
          this._rps.options.maxPeers =  this._rps.options.maxPeers+1
          this.myneighbours.add(descriptorA.id)
        }
        return -1;
    }else if(
      (this._rps.options.descriptor.id === neighbour.descriptor.id) && 
      this.myneighbours.has(descriptorA.id) &&
      (!this._needConnectionTo(descriptorA)))
    {
            this._rps.options.maxPeers =  this._rps.options.maxPeers-1
            this.myneighbours.delete(descriptorA.id)
    }

    return 1;
  }
  
 
};
