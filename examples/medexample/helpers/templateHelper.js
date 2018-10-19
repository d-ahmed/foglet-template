const updateLocation = peers => {
  setInterval(() => {
    // Updating coordinates of a random peer, this part will be removed in gps mode
    const rn = Math.floor(Math.random() * peers.length);
    const peer = peers[rn];
    const x = Math.floor(Math.random() * (peers.length + 3));
    const y = Math.floor(Math.random() * (peers.length + 3));
    peer.updateDescriptor({ x, y }, "tman");
  }, 20 * 1000);
};

// Listeners
function broadcast(peer, message, overlay) {
  peer.foglet.overlay(overlay).communication.sendBroadcast(message);
}

function setListeners() {
  peers.forEach(p => {
    p.on("receive-rps", (id, message) => {
      const { event } = message;
      switch (event) {
        case "descriptor.updated": {
          let senderPeer;
          peers.forEach(peer => {
            if (peer.foglet.inViewID == id) {
              senderPeer = peer;
            }
          });
          if (!senderPeer) return;
          p.connection(senderPeer);
        }
      }
    });
    p.on("receive-overlay", (id, message) => {
      console.log(
        "[%s][OVERLAY] receive an unicasted message from %s: ",
        p.foglet.id,
        id,
        message
      );
    });
    p.foglet.overlay().communication.onBroadcast((id, message) => {
      console.log(
        "[%s][RPS] receive a broadcasted message from %s: ",
        p.foglet.id,
        id,
        message
      );
    });
    p.foglet.overlay("tman").communication.onBroadcast((id, message) => {
      console.log(
        "[%s][OVERLAY] receive a broadcasted message from %s: ",
        p.foglet.id,
        id,
        message
      );
    });
  });
}
