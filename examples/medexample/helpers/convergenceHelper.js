const convergence = () => {
  const getDistance = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const voisins = new Array();
  let fails = 0;
  for (let i = 0; i < overlay.graph.nodes().length; i++) {
    for (let j = 0; j < overlay.graph.nodes().length; j++) {
      voisins[j] = getDistance(
        overlay.graph.nodes()[i],
        overlay.graph.nodes()[j]
      );
    }
    // Là on a la distance à tous les autres voisins.
    let min;
    for (let k = 1; k <= MAX_PEERS; k++) {
      if (voisins[0] == 0) {
        min = 1;
      } else {
        min = 0;
      }
      for (let l = 0; l < voisins.length; l++) {
        if (voisins[l] != 0) {
          if (voisins[min] > voisins[l]) {
            min = l;
          }
        }
      } // Là on a le voisin le + proche.
      let jelai = false;
      for (let m = 0; m < overlay.graph.edges().length; m++) {
        if (overlay.graph.edges()[m].source == overlay.graph.nodes()[i].id) {
          if (
            overlay.graph.edges()[m].target == overlay.graph.nodes()[min].id
          ) {
            jelai = true;
          }
        }
      }
      if (!jelai) {
        fails++;
      }
      voisins[min] = 1000;
    }
  }
  return Math.floor(
    ((overlay.graph.edges().length - fails) / overlay.graph.edges().length) *
      100
  );
};

const scramble = (delay = 0) => {
  for (let i = 0; i < max; ++i) {
    setTimeout(
      nth => {
        peers[nth].foglet.overlay("tman")._network.rps._exchange(); // force exchange
      },
      i * delay,
      i
    );
  }
};

const ranking = (neighbor, callback) => (a, b) => {
  const getDistance = (descriptor1, descriptor2) => {
    const { x: xa, y: ya, z: za } = descriptor1;
    const { x: xb, y: yb, z: zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    return Math.sqrt(dx * dx + dy * dy);
    // return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const distanceA = getDistance(neighbor, a);
  const distanceB = getDistance(neighbor, b);
  /*if(distanceA === distanceB){
      callback(neighbor, a, b)
    }*/
  if (distanceA === distanceB) {
    if (a.x >= b.x) {
      return -1;
    } else if (a.x < b.x) {
      return 1;
    }
  }
  return distanceA - distanceB;
};

doConvergence = () => {
  let cpt = 1;
  let span = document.getElementById("converge");
  let ranked = getRanked().map(r => r.map(r1 => r1.id));
  const i = setInterval(() => {
    // const conv = compareNeighbours(ranked, peersNeighbours());
    const conv = this.compareNeighbours2(ranked, peersNeighbours());
    span.innerHTML = conv + " %";
    doPlot(cpt, conv);
    if (conv === 100) {
      clearInterval(i);
    }
    ++cpt;
    span.innerHTML = conv + "%";
  }, 1 * 1000);
};

let axeY = [0];
let axeX = [0];

doPlot = (cpt, conv) => {
  axeY.push(conv);
  axeX.push(cpt);
  graph = createGraph(axeX, axeY);
};

let equidistance = new Map();
addToEuidistance = (neighborId, aId, bId) => {
  if (!equidistance.has(neighborId)) {
    equidistance.set(neighborId, new Set());
  }
  equidistance.get(neighborId).add(aId + "-" + bId);
  equidistance.get(neighborId).add(bId + "-" + aId);
};

let getRanked = () => {
  let datacopy = deepcopy(getPeersF());
  return deepcopy(getPeersF()).map(p =>
    deepcopy(
      datacopy
        .filter(p1 => p.id !== p1.id)
        .sort(
          ranking(p, (neighbor, a, b) => {
            //console.log("Ranking equal",neighbor, a, b)
            addToEuidistance(neighbor.id, a.id, b.id);
          })
        )
        .slice(0, MAX_PEERS)
    )
  );
};
let peersNeighbours = () =>
  peers.map(p => p.foglet.overlay("tman")._network.getNeighbours());

let getPeersF = () =>
  deepcopy(
    peers.map(p => {
      descriptor = p.foglet.overlay("tman")._network._rps.options.descriptor;
      descriptor.id = p.foglet.overlay("tman")._network.inviewId;
      return descriptor;
    })
  );

compareNeighbours = (tab1, tab2) => {
  if (tab1.length !== tab2.length) {
    throw new Error("Require same size");
  }
  const reducer = (acc, val) => acc + val;
  // const iterator = this.equidistance.values();
  return Math.floor(
    (tab1
      .map((value, index) => {
        const a = new Set(value);
        const b = new Set(tab2[index].neighbours);
        const union = new Set([...Array.from(a), ...Array.from(b)]);
        const differenceA = new Set([...Array.from(a)].filter(x => !b.has(x)));
        const differenceB = new Set([...Array.from(b)].filter(x => !a.has(x)));
        const unionAB = new Set([
          ...Array.from(differenceA),
          ...Array.from(differenceB)
        ]);

        let contains = false;
        const nextIte = equidistance.get(tab2[index].id);
        // console.log('union', union, 'nextIte', nextIte, 'unionAB', unionAB);
        if (nextIte) {
          for (const id of Array.from(unionAB)) {
            for (const id1 of Array.from(unionAB)) {
              if (nextIte.has(id + "-" + id1)) {
                contains = true;
              }
            }
          }
        }
        let numerateur = b;
        if (contains && b.size > 0 && b.size !== union.size) {
          numerateur = new Set([...Array.from(b), ...Array.from(unionAB)]);
        }
        return numerateur.size / union.size;
      })
      .reduce(reducer) /
      tab1.length) *
      100
  );
};

compareNeighbours2 = (tab1, tab2) => {
  if (tab1.length !== tab2.length) {
    throw new Error("Require same size");
  }
  const reducer = (acc, val) => acc + val;
  return Math.floor(
    (tab1
      .map((value, index) => {
        let nbEq = 0;
        value.length > 0 &&
          value.forEach(neighbor => {
            if (tab2[index].length > 0 && tab2[index].indexOf(neighbor) !== -1)
              nbEq++;
          });
        return nbEq / value.length;
      })
      .reduce(reducer) /
      tab1.length) *
      100
  );
};
