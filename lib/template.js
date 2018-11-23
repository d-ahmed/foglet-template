const FC = require("foglet-core");
const Foglet = FC.Foglet;
const lmerge = require("lodash.merge");
const debug = require("debug")("template");
const EventEmitter = require("events");
const MUpdatePartialView = require("./overlay/messages/mupdatepartialview.js");

class Template extends EventEmitter {
  constructor(options, moc = false) {
    super();
    this.options = lmerge(
      {
        foglet: {
          verbose: true, // want some logs ? switch to false otherwise
          rps:{
            type: "cyclon",
            options: {
              protocol: "foglet-template", // foglet running on the protocol foglet-example, defined for spray-wrtc
              webrtc: {
                // add WebRTC options
                trickle: true, // enable trickle (divide offers in multiple small offers sent by pieces)
                config: { iceServers: [] } // define iceServers in non local instance
              },
              timeout: 2 * 1000, // spray-wrtc timeout before definitively close a WebRTC connection.
              pendingTimeout: 5 * 1000, // time before the connection timeout in neighborhood-wrtc
              delta: 1 * 1000, // spray-wrtc shuffle interval
              maxPeers: 100,
              a: 1, // for spray: a*ln(N) + b, inject a arcs
              b: 2, // for spray: a*ln(N) + b, inject b arcs
              signaling: {
                address: "https://signaling.herokuapp.com/",
                // signalingAdress: 'https://signaling.herokuapp.com/', // address of the signaling server
                room: "room-foglet-template" // room to join
              }
            }
          },
          overlays: [],
          ssh: undefined /* {
          address: 'http://localhost:4000/'
        } */
        }
      },
      options
    );
    // if moc === true we use a WebRTC moc for the rps, still webrtc connection for the overlay, dont use the same moc!!
    if (moc) {
      this.options.foglet.rps.options.socketClass = require("foglet-core").SimplePeerMoc;
    }
    this.foglet = new Foglet(this.options.foglet);

    this.foglet.overlay().network.rps.on("open", id => {
      debug("[%s] connection opened on the rps: ", this.foglet.inViewID, id);
      this.emit("rps-open", id);
    });

    this.foglet.overlay().network.rps.on("close", id => {
      debug("[%s] connection closed on the rps: ", this.foglet.inViewID, id);
      this.emit("rps-close", id);
    });

    debug("Template initialized.");

    // Added functionalities ______________________________
    this.targets = [];

    this.on("descriptor-updated", descriptor => {
      // TOCHANGE
      const myDescriptor = descriptor.descriptor;
      this.targets.forEach(target => {
        // 1. check if target withing my perimeter
        if (target.isNearby(myDescriptor)) {
          // 2. if within, check if i already have it
          if (this.foglet.overlay(target.id)) return;
          this.buildOverlay(
            lmerge(target.getOverlay(), {
              options: {
                descriptor: myDescriptor
              }
            })
          );
        } else {
          if (this.foglet.overlay(target.id)) {
            console.log('leave overlay')
            this.leaveOverlay(target.id);
          }
        }
        // broadcast to everyone that i am not there anymore?
      });
    });
  }

  /*connection(template = undefined, overlay = undefined) {
    if (!overlay && !!template) return this.foglet.connection(template.foglet);
    if (overlay) {
      this.foglet.share();
      return this.foglet.connection(template, overlay);
    }
    return Promise.reject();
  }*/

  connection(template, overlay='tman') {
    if (template) return this.foglet.connection(template.foglet, overlay);
    this.foglet.share();
    return this.foglet.connection(null, overlay);
  }

  sendUnicast(id, message) {
    return this.foglet.sendUnicast(id, message);
  }

  sendUnicastAll(message) {
    this.neighbours().forEach(peer => {
      this.sendUnicast(peer, message);
    });
  }

  sendOverlayUnicast(overlay, id, message) {
    return this.foglet.overlay(overlay).communication.sendUnicast(id, message);
  }

  sendOverlayUnicastAll(message) {
    this.neighboursOverlay().forEach(peer => {
      this.send(peer, message);
    });
  }

  neighbours() {
    return this.foglet.getNeighbours();
  }

  neighboursOverlay(overlay) {
    return this.foglet.overlay(overlay).network.getNeighbours();
  }

  updateDescriptor(descriptor, overlay) {
    // TOCHANGE
    if (!overlay) return console.log("please specify an overlay");

    const myDescriptor = (this.foglet.overlay(
      overlay
    ).network.descriptor = this.foglet.overlay(
      overlay
    ).network.options.descriptor);

    myDescriptor.x = descriptor.x;
    myDescriptor.y = descriptor.y;
    myDescriptor.z = descriptor.z;
    
    this.emit("descriptor-updated", {
      id: this.foglet.inViewID,
      descriptor: myDescriptor
    });
  }


  buildOverlay(overlay) {
    this.foglet._networkManager._buildOverlay(overlay);
    this.foglet.overlay(overlay.name).network.rps.on("open", id => {
      debug("[%s] connection opened on the rps: ", this.foglet.inViewID, id);
      this.emit(overlay.name + "-open", id);
    });

    this.foglet.overlay(overlay.name).network.rps.on("close", id => {
      debug("[%s] connection closed on the rps: ", this.foglet.inViewID, id);
      this.emit(overlay.name + "-close", id);
    });

    this.foglet.overlay(overlay.name)._network._rps._start();
    return Promise.resolve();
  }

  leaveOverlay(overlay) {
    this.foglet.overlay(overlay)._network._rps._stop()
    this.foglet.overlay(overlay)._network.getNeighbours().forEach(peerId=>{
        this.foglet.overlay(overlay)._network._rps.disconnect(peerId)
    })
    
    return Promise.resolve();
  }

  targetSpawned(target) {
    // TOCHANGE
    this.targets.push(target);
    if (!target.isNearby(this.getDescriptor())) return;
    this.buildOverlay(
      lmerge(target.getOverlay(), {
        options: { descriptor: this.getDescriptor() }
      })
    );
    return true;
  }

  getLeader(overlay) {
    const leader = this.foglet.overlay(overlay).network.options.target.leader;
    return leader;
  }
  getDescriptor() {
    return this.descriptor;
  }
  setDescriptor(descriptor) {
    this.descriptor = descriptor;
  }
}

module.exports = Template;
