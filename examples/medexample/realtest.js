const overlay = createSigma("overlay");

const MAX_PEERS = 0;
const max = 10;
const delta = 5 * 1000

const fogletTemplate = new template(
    {
        foglet: {
        // id: Math.floor(Math.random() * 1000) + '',
        overlays: [
            {
            name: "tman",
            options: {
                delta: delta,
                timeout: 10 * 1000,
                pendingTimeout: 5 * 1000,
                maxPeers: MAX_PEERS,
                descriptor: {
                    id: 'da-' + Math.random() * max,
                    x:   Math.floor(Math.random() * max), // i * 2, // 
                    y:    Math.floor(Math.random() * max),  //i % 5, //  i % 5, //  
                    z: Math.floor(Math.random() * max),
                }
            }
            }
        ]
        }
    },
    false
);

const options = {
    color: '#000',
    index: null
};




pos = (template, id=null) =>{
    let partial = template.foglet.overlay('tman')._network._rps.partialView;
    let descriptors = Array.from(partial.values()).filter(peer=>peer.peer === id).map(r=>r.descriptor)
    if(descriptors.length>0) return descriptors[0]
    return null;
}

addCible = (idCible, x, y, perimeter)=>{
    const id = 'C-' + idCible
    const cible = {
      id: id,
      x:x,
      y:y,
      perimeter:perimeter
    }
    fogletTemplate.foglet.overlay('tman')._network.addCible(cible);
    overlay.graph.addNode({
      id: cible.id,
      label: cible.id,
      x: cible.x,
      y: cible.y,
      size: 5,
      color: '#000'
    });
    overlay.refresh()
}



let leader = new Leader(fogletTemplate)

// fogletTemplate.foglet.share()
fogletTemplate.connection(null, null).then(() => {
    fogletTemplate.foglet.overlay('tman')._network._rps._start();
});


refresh = () =>{
    let peersN = Array.from(fogletTemplate.foglet.overlay('tman')._network._rps.partialView.values());
    let edges = overlay.graph.edges()
    let nodes = overlay.graph.nodes()

    edges.forEach(edge=>{
      dropEdge(overlay, edge.id)
    })

    nodes.forEach(node=>{
        dropNode(overlay, node.id)
    })

    addCible(1,5,5,5)

    addMyNode()
    
    addMyNeighbourNodes(peersN)

    overlay.refresh()
  }

  setInterval(()=>{
    refresh()
  }, 1000)

  addMyNode = ()=>{
    const {x, y} = fogletTemplate.foglet.overlay('tman')._network._rps.options.descriptor;

    addNode(overlay, fogletTemplate.foglet.inViewID, {
        x,
        y
    }, options);
  }

  addMyNeighbourNodes = (peersN)=>{
    peersN.forEach(peerN => {
        const {x, y} = peerN.descriptor || {
            x:Math.floor(Math.random()*max),
            y:Math.floor(Math.random()*max)
        }
        addNode(overlay, peerN.peer, {
            x,
            y
        }, options);
        addEdge(overlay, fogletTemplate.foglet.inViewID, peerN.peer)
    })
  }