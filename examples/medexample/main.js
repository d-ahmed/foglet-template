console.log(template); // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 0;
// Create sigma graphs _________
// const rps = createSigma("rps");
//myChart;
const overlay = createSigma("overlay");
// Creating peers and sigma nodes
const max = 20;
const peers = [];
const delta = 2 * 1000
for (let i = 0; i < max; i++) {
  //  const fogletTemplate = new template(undefined, true);
  const fogletTemplate = new template(
    {
      foglet: {
        id: i + '',
        overlays: [
          {
            name: "tman",
            options: {
              delta: delta,
              timeout: 5 * 1000,
              pendingTimeout: 5 * 1000,
              maxPeers: MAX_PEERS,
              descriptor: {
                // iscible: i%8===0 ? true : false,
                x:   Math.floor(Math.random() * max), //i * 2, // 
                y:    Math.floor(Math.random() * max),  //i % 5, //  
                z: Math.floor(Math.random() * max),
                // perimettre: Math.floor(Math.random() * 10 + 2) // 2 //
              }
            }
          }
        ]
      }
    },
    true
  );


  peers.push(fogletTemplate);
  // Add nodes to graph
  const options = {
    color: randomColor(),
    index: i
  };
  // addTemplateToGraph(rps, fogletTemplate, options);
  addTemplateToGraph(overlay, fogletTemplate, options);
  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;
  // fogletTemplate.on("rps-open", id => addEdge(rps, fgId, id));
  fogletTemplate.on("overlay-open", id => electLeader());
  //fogletTemplate.on("rps-close", id => electLeader());
  fogletTemplate.on("overlay-close", id => electLeader());
  fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    // updateNode(rps, id, descriptor);
    updateNode(overlay, id, descriptor);
    electLeader();
  });

  // updateLocation(peers);
}


Array.from(peers, (peer, index) => {
  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise(
    (resolve, reject) =>
      setTimeout(() => {
        peer.connection(randomPeer).then(resolve);
      }, index*0.5*1000),
  );
})

// Connect random peers with each others


let scramble = (delay = 0) => {
  for (let i = 0; i < max; ++i) {
    setTimeout((nth) => {
      peers[nth].foglet.overlay('tman')._network.rps._exchange() // force exchange
    }, i * delay, i)
  };
}

var convergence = () => { 
	var getDistance = (a,b) => {
		  var dx = a.x - b.x;
		  var dy = a.y - b.y;
		  return Math.sqrt(dx * dx + dy * dy);
		};
	var voisins = new Array(); 
	var fails = 0;
	for (let i = 0; 
		i < overlay.graph.nodes().length; i++) {
		for (let j =0; j < overlay.graph.nodes().length ; j++ ) {
				voisins[j] = getDistance(overlay.graph.nodes()[i], overlay.graph.nodes()[j]);
		}
		// Là on a la distance à tous les autres voisins. 
		var min;
		for ( let k = 1; k<= MAX_PEERS ; k++){
			if (voisins[0] == 0){
				min = 1;
			} else { min = 0; }
			for(let l=0; l<voisins.length; l++){
				if(voisins[l] != 0){
					if(voisins[min] > voisins[l]){
						min = l; 
					}
				}
			} // Là on a le voisin le + proche. 
			var jelai = false; 
			for (let m =0; m < overlay.graph.edges().length;
			m++){
				if (overlay.graph.edges()[m].source == overlay.graph.nodes()[i].id){
					if (overlay.graph.edges()[m].target == overlay.graph.nodes()[min].id){
						jelai = true;
					}
				}
			}
			if (!jelai) {
				fails++;
			}
			voisins[min]=1000;
			
		}
		
	}
	return (Math.floor(((overlay.graph.edges().length-fails) / (overlay.graph.edges().length))*100 ));
}





ranking = (neighbor, callkack) => (a, b) => {
  const getDistance = (descriptor1, descriptor2) => {
    const { x: xa, y: ya, z:za } = descriptor1;
    const { x: xb, y: yb, z:zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    return Math.sqrt(dx * dx + dy * dy);
    // return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const distanceA = getDistance(neighbor, a);
  const distanceB = getDistance(neighbor, b);
  /*if(distanceA === distanceB){
    callkack(neighbor, a, b)
  }*/
  if(distanceA === distanceB){
    if(a.x>=b.x){
      return -1;
    }else  if(a.x<b.x){
      return 1;
    }
  }
  return distanceA - distanceB;
}


peersNeighbours2 = (peers) => {
  return peers.map( p => ({id: p.foglet.inViewID, neighbours: p.foglet.overlay('tman')._network.getNeighbours()}));
}

setInterval(()=>{
  refresh()
}, 0.5*1000)

refresh = () =>{
  let peersN = peersNeighbours2(peers)
  let edges = overlay.graph.edges()
  edges.forEach(edge=>{
    dropEdge(overlay, edge.id)
  })
  peersN.forEach(peerN => {
    if(peerN && peerN.neighbours.length>0){
      peerN.neighbours.forEach(n=>{
        addEdge(overlay, peerN.id, n)
      })
    }
  })
}

let peersNeighbours = () => peers.map( p => p.foglet.overlay('tman')._network.getNeighbours())

let getPeersF = () => deepcopy(peers.map(p => {
  descriptor = p.foglet.overlay('tman')._network._rps.options.descriptor
  descriptor.id = p.foglet.overlay('tman')._network.inviewId
  return descriptor
}));


let equidistance = new Map();
addToEuidistance = (neighborId, aId, bId) => {
  if(!equidistance.has(neighborId)){
    equidistance.set(neighborId, new Set())
  }
  equidistance.get(neighborId).add(aId+'-'+bId)
  equidistance.get(neighborId).add(bId+'-'+aId)
}


let getRanked = () => {
  let datacopy = deepcopy(getPeersF())
  return deepcopy(getPeersF()).map(p => deepcopy(datacopy.filter((p1 => p.id!==p1.id)).sort(ranking(p, (neighbor, a, b)=>{
    //console.log("Ranking equal",neighbor, a, b)
    addToEuidistance(neighbor.id, a.id, b.id)
  })).slice(0,MAX_PEERS)))
}

compareNeighbours = (tab1, tab2) => {
  if (tab1.length !== tab2.length) {
    throw new Error('Require same size');
  }
  const reducer = (acc, val) => acc + val;
  // const iterator = this.equidistance.values();
  return  Math.floor((tab1.map((value, index) => {
    const a = new Set(value);
    const b = new Set(tab2[index].neighbours);
    const union = new Set([...Array.from(a), ...Array.from(b)]);
    const differenceA = new Set([...Array.from(a)].filter(x => !b.has(x)));
    const differenceB = new Set([...Array.from(b)].filter(x => !a.has(x)));
    const unionAB = new Set([...Array.from(differenceA), ...Array.from(differenceB)]);


    let contains = false;
    const nextIte = equidistance.get(tab2[index].id);
    // console.log('union', union, 'nextIte', nextIte, 'unionAB', unionAB);
    if (nextIte) {
    for (const id of Array.from(unionAB)) {
        for (const id1 of Array.from(unionAB)) {
          if (nextIte.has(id + '-' + id1)) {
            contains = true;
          }
        }
      }
    }
    let numerateur = b;
    if (contains && b.size > 0 && b.size !== union.size) {
      numerateur = new Set([...Array.from(b), ...Array.from(unionAB)]);
    }
    return (numerateur.size / union.size);
  }).reduce(reducer) / tab1.length) * 100);
}


compareNeighbours2 = (tab1, tab2) => {
  if (tab1.length !== tab2.length) {
    throw new Error('Require same size');
  }
  const reducer = (acc, val) => acc + val;
  return Math.floor((tab1.map((value, index)=>{
    let nbEq = 0;
    value.length>0 && value.forEach(neighbor=>{
      if(tab2[index].length>0 && tab2[index].indexOf(neighbor)!==-1) nbEq++
    })
    return nbEq/value.length
  }).reduce(reducer) / tab1.length) * 100)
}

doConvergence = () => {
  let cpt = 1;
  let span = document.getElementById("converge");
  let ranked = getRanked().map(r=>r.map(r1=>r1.id));
  const i = setInterval(()=>{
    
    // const conv = compareNeighbours(ranked, peersNeighbours());
    const conv = this.compareNeighbours2(ranked, peersNeighbours());
    span.innerHTML = conv +" %";
    doPlot(cpt,conv)
    if(conv===100){
      clearInterval(i)
    }
    ++cpt
    span.innerHTML = conv+ '%'
  }, 1 * 1000)
}

let axeY = [0];
let axeX = [0];

doPlot =  (cpt,conv) => {
  axeY.push(conv)
  axeX.push(cpt)
  graph = createGraph(axeX, axeY)
}

doConvergence();

let idCible =0;

addCible = (x, y, perimettre)=>{
  const id = 'C-' + idCible
  const cible = {
    id: id,
    x:x,
    y:y,
    perimettre:perimettre
  }
  peers.forEach(peer=>{
    peer.foglet.overlay('tman')._network.addCible(cible)
  })
  overlay.graph.addNode({
    id: cible.id,
    label: cible.id,
    x: cible.x,
    y: cible.y,
    size: 5,
    color: randomColor()
  });
  ++idCible
}


removeCible = (id)=>{
  peers.forEach(peer=>{
    peer.foglet.overlay('tman')._network.removeCible(id)
  }) 
  overlay.graph.dropNode(id)
}


getDistance = (descriptor1, descriptor2) => {
  const { x: xa, y: ya, z:za } = descriptor1;
  const { x: xb, y: yb, z:zb } = descriptor2;
  const dx = xa - xb;
  const dy = ya - yb;
  const dz = za - zb;
  return Math.sqrt(dx * dx + dy * dy);
  //return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

electLeader = ()=> {
  peers.forEach((peer1) => {

    peer1.foglet.overlay("tman").network.descriptor.leaders = [];
    peer1.foglet.overlay("tman").network.descriptor.cibles.forEach((cible) => {
      peer1.foglet.overlay("tman").network.descriptor.leaders.push(true); //console.log("t");
    });

    peers.forEach((peer) => {

      peer1.foglet.overlay("tman").network.descriptor.cibles.forEach((maCible) => {

        peer.foglet.overlay("tman").network.descriptor.cibles.forEach((saCible) => {
          peer.foglet.overlay("tman").network.cibles.forEach((cible) => {
            if(cible.id == maCible && cible.id == saCible){
              if(getDistance(cible, peer1.foglet.overlay("tman").network.descriptor) > 
              getDistance(cible, peer.foglet.overlay("tman").network.descriptor)){
                peer1.foglet.overlay("tman")
                .network.descriptor.leaders[peer1.foglet.overlay("tman")
                .network.descriptor.cibles.indexOf(maCible)] = false;
              } else if(getDistance(cible, peer1.foglet.overlay("tman").network.descriptor) == 
              getDistance(cible, peer.foglet.overlay("tman").network.descriptor)){

                if (parseFloat(peer1.foglet.overlay("tman").network.descriptor.id) > 
                parseFloat(peer.foglet.overlay("tman").network.descriptor.id)){

                  peer1.foglet.overlay("tman")
                  .network.descriptor.leaders[peer1.foglet.overlay("tman")
                  .network.descriptor.cibles.indexOf(maCible)] = false;

                }

              } 

            }
          })


        })
      })
    })
  })}
  electLeader();