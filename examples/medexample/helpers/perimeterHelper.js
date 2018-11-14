const spawnTarget = (id, options = {}) => {
  // Create target
  if (!id) return console.log("please specify an id");
  const spawned = new target(id, options);
  const { x, y } = spawned.getCoordinates();
  addNode(overlay, {
    id: spawned.id,
    label: `${spawned.id}`,
    x,
    y,
    size: 4,
    color: "#000"
  });
  // Add peers to the target overlay
  peers.forEach(peer => {
    const response = peer.targetSpawned(spawned);
    if (!response) return;
    const fgid = peer.foglet.inViewID;
    peer.on(spawned.id + "-open", id => addEdge(overlay, fgid, id));
    peer.on(spawned.id + "-close", id => {
      dropEdge(overlay, `${fgid}-${id}`);
      // console.log(spawned.id + "-close");
    });
  });
};
