const { template, target, Leader, paxos } = consensus; // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 3;

// Create sigma graphs _________
// const rps = createSigma("rps");
const overlay = createSigma("overlay");

// Creating peers and sigma nodes
const MAX_NODES = 20;
const peers = [];
const paxoses = [];
const delta = 2 * 1000;

for (let i = 0; i < MAX_NODES; i++) {
  const fogletTemplate = new template({ foglet: { id: i + "" } }, true);
  fogletTemplate.setDescriptor({
    id: i,
    x: i * 2, // getRandom(), //
    y: i % 5 // getRandom() //
  });
  peers.push(fogletTemplate);
  paxoses.push(new paxos(fogletTemplate));

  // Add nodes *to graph
  // addTemplateToGraph(rps, fogletTemplate, {
  //   color: randomColor(),
  //   index: i
  // });

  addTemplateToGraph(overlay, fogletTemplate, {
    color: "#000",
    index: i
  });

  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;

  // fogletTemplate.on("rps-open", id => addEdge(rps, fgId, id));
  // fogletTemplate.on("rps-close", id => dropEdge(rps, `${fgId}-${id}`));
  fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    // updateNode(rps, id, descriptor);
    updateNode(overlay, id, descriptor);
  });

  // updateLocation(peers);
}

// Connect random peers with each others in the rps
Array.from(peers, (peer, index) => {
  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      peer.connection(randomPeer).then(resolve);
    }, index * 0.5 * 500)
  );
});

spawnTarget("1", {
  coordinates: { x: 3, y: 1 },
  perimeter: 20
});
spawnTarget("2", {
  coordinates: { x: 12, y: 1 },
  perimeter: 7
});

// spawnTarget("1", {
//   coordinates: { x: getRandom(), y: getRandom() },
//   perimeter: 6
// });
// spawnTarget("2", {
//   coordinates: { x: getRandom(), y: getRandom() },
//   perimeter: 7
// });
// spawnTarget("5", {
//   coordinates: { x: getRandom(), y: getRandom() },
//   perimeter: 5
// });
