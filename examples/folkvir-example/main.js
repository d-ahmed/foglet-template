console.log(template); // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'

let rps = new sigma("rps");
let overlay = new sigma("overlay");

let peers = [];
const max = 10;
peers.push(new template(undefined, true));
rps.graph.addNode({
  id: peers[0].foglet.inViewID,
  firstLabel: 0 + "",
  label: 0 + "",
  x: 0,
  y: 0,
  size: 3
});
overlay.graph.addNode({
  id: peers[0].foglet.inViewID,
  label: 0 + "",
  firstLabel: 0 + "",
  x: 0,
  y: 0,
  size: 3
});
peers[0].on("rps-open", id => {
  rps.graph.addEdge({
    id: id + "-" + peers[0].foglet.inViewID,
    source: peers[0].foglet.inViewID,
    target: id
  });
  refresh(id, rps);
  refresh(peers[0].foglet.inViewID, rps);
});
peers[0].on("rps-close", id => {
  rps.graph.dropEdge(id + "-" + peers[0].foglet.inViewID);
  refresh(id, rps);
  refresh(peers[0].foglet.inViewID, rps);
});
peers[0].on("overlay-open", id => {
  overlay.graph.addEdge({
    id: id + "-" + peers[0].foglet.inViewID,
    source: peers[0].foglet.inViewID,
    target: id
  });
  refresh(id, overlay);
  refresh(peers[0].foglet.inViewID, overlay);
});
peers[0].on("overlay-close", id => {
  overlay.graph.dropEdge(id + "-" + peers[0].foglet.inViewID);
  refresh(id, overlay);
  refresh(peers[0].foglet.inViewID, overlay);
});

let p = [];
for (let i = 1; i < max; ++i) {
  p.push(i);
}

p.reduce(
  (acc, i) =>
    acc.then(() => {
      return new Promise((resolve, reject) => {
        let t = new template(undefined, true);
        rps.graph.addNode({
          id: t.foglet.inViewID,
          label: i + "",
          firstLabel: i + "",
          x: Math.floor(Math.random() * max),
          y: Math.floor(Math.random() * max),
          size: 3
        });
        overlay.graph.addNode({
          id: t.foglet.inViewID,
          label: i + "",
          firstLabel: i + "",
          x: Math.floor(Math.random() * max),
          y: Math.floor(Math.random() * max),
          size: 3
        });
        t.on("rps-open", id => {
          rps.graph.addEdge({
            id: id + "-" + t.foglet.inViewID,
            source: t.foglet.inViewID,
            target: id
          });
          refresh(id, rps);
          refresh(t.foglet.inViewID, rps);
        });
        t.on("rps-close", id => {
          rps.graph.dropEdge(id + "-" + t.foglet.inViewID);
          refresh(id, rps);
          refresh(t.foglet.inViewID, rps);
        });
        t.on("overlay-open", id => {
          overlay.graph.addEdge({
            id: id + "-" + t.foglet.inViewID,
            source: t.foglet.inViewID,
            target: id
          });
          refresh(id, overlay);
          refresh(t.foglet.inViewID, overlay);
        });
        t.on("overlay-close", id => {
          overlay.graph.dropEdge(id + "-" + t.foglet.inViewID);
          refresh(id, overlay);
          refresh(t.foglet.inViewID, overlay);
        });
        const rn = Math.floor(Math.random() * peers.length);
        let p = peers[rn];
        peers.push(t);
        t.connection(p)
          .then(() => {
            rps.refresh();
            setTimeout(resolve, 500);
          })
          .catch(e => {
            reject(e);
          });
      });
    }),
  Promise.resolve()
).then(() => {
  rps.graph.nodes().forEach(n => {
    n.color = "#DC143C";
  });
  rps.refresh();
  overlay.graph.nodes().forEach(n => {
    n.color = "#FFA500";
  });
  overlay.refresh();

  setListeners();
  broadcast(peers[0], "miaouBroadcast", undefined);
  broadcast(peers[0], "miaouBroadcast", "tman");
  peers[0].sendUnicastAll("miaouUnicast");
});

function broadcast(peer, message, overlay) {
  peer.foglet.overlay(overlay).communication.sendBroadcast(message);
}

function setListeners() {
  peers.forEach(p => {
    p.on("receive-rps", (id, message) => {
      console.log(
        "[%s][RPS] receive an unicasted message from %s: ",
        p.foglet.id,
        id,
        message
      );
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

function refresh(id, graph, overlay) {
  const n = graph.graph.nodes(id);
  n.label = n.firstLabel + " d=" + graph.graph.degree(id);
  graph.refresh();
}
