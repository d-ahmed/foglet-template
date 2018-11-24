const { template, target, Leader } = consensus; // eslint-disable-line

const overlay = createSigma("overlay");


const MAX_PEERS = 0;
const max = 100;
const delta = 5 * 1000

let peers = []


const fogletTemplate = new template(
    {
        foglet: {
        // id: Math.floor(Math.random() * 1000) + '',
        overlays: [
            
        ]
        }
    },
    false
);

fogletTemplate.setDescriptor({
    id: 'da-'+getRandom(100),
    x: getRandom(max), // i*2, // 
    y: getRandom(max)// i%5, //
});

peers.push(fogletTemplate)

const options = {
    color: '#000',
    index: null
};




/*pos = (template, id=null) =>{
    let partial = template.foglet.overlay('tman')._network._rps.partialView;
    let descriptors = Array.from(partial.values()).filter(peer=>peer.peer === id).map(r=>r.descriptor)
    if(descriptors.length>0) return descriptors[0]
    return null;
}*/



let leader = new Leader(fogletTemplate);

// fogletTemplate.foglet.share()
fogletTemplate.connection(null, null).then(()=>{
    spawnTarget("1", {
        coordinates: { x: 5, y: 5 },
        perimeter: 5
    });
});



const spawnTargetNode = (targetId, options = {}) => {
    // Create target
    if (!targetId) return console.log("please specify an id");
    const spawned = new target(targetId, options);
    const { x, y } = spawned.getCoordinates();
    const color = randomColor();
    addNode(overlay, {
      id: spawned.id,
      label: `p-${targetId}(${x}, ${y})`,
      x,
      y,
      size: 4,
      color
    });
  };

const refresher = () => {

    const edges = overlay.graph.edges()
    const nodes = overlay.graph.nodes()

    edges.forEach(edge=>{
      dropEdge(overlay, edge.id)
    })

    nodes.forEach(node=>{
        dropNode(overlay, node.id)
    })

    spawnTargetNode("1", {
        coordinates: { x: 5, y: 5 },
        perimeter: 1000
    });

    addMyNode(overlay)
    Array.from(fogletTemplate.foglet._networkManager._overlays.keys(), overlay=>{
        let peersN = Array.from(fogletTemplate.foglet.overlay(overlay)._network._rps.partialView.values());
        addMyNeighbourNodes(peersN)
    })
    
    overlay.refresh()
}

  setInterval(()=>{
    refresher()
  }, 1000)

  addMyNode = (_overlay)=>{
    const {x, y} = fogletTemplate.getDescriptor();
    const id = fogletTemplate.foglet.inViewID
    addNode(overlay, {
        id,
        label: `${id.substring(0, 4)}(${x},${y})`,
        x,
        y,
        size: 2,
        color:"#000"
    });

    
  }

  addMyNeighbourNodes = (peersN)=>{
    peersN.forEach(peerN => {
        const {x, y} = peerN.descriptor || {
            x:getRandom(max),
            y:getRandom(max)
        }
        const id = peerN.peer
        addNode(overlay, {
            id,
            label: `${id.substring(0, 4)}(${x},${y})`,
            x,
            y,
            size: 2,
            color:"#000"
        });
        addEdge(overlay, fogletTemplate.foglet.inViewID, peerN.peer)
    })
  }