const overlay = createSigma("overlay");

const MAX_PEERS = 0;
const max = 10;
const delta = 2 * 1000

const fogletTemplate = new template(
    {
        foglet: {
        // id: Math.floor(Math.random() * 1000) + '',
        overlays: [
            {
            name: "tman",
            options: {
                delta: delta,
                timeout: 5 * 1000,
                pendingTimeout: 5 * 1000,
                maxPeers: MAX_PEERS,
                descriptor: {
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
    color: randomColor(),
    index: null
};

const {x, y} = fogletTemplate.foglet.overlay('tman')._network._rps.options.descriptor;

addNode(overlay, fogletTemplate.foglet.inViewID, {
    x,
    y
}, options);


pos = (template, id=null) =>{
    let partial = template.foglet.overlay('tman')._network._rps.partialView;
    let descriptors = Array.from(partial.values()).filter(peer=>peer.peer === id).map(r=>r.descriptor)
    if(descriptors.length>0) return descriptors[0]
    return null;
}

// fogletTemplate.foglet.share()
fogletTemplate.connection(null, null).then(() => {
    fogletTemplate.foglet.overlay('tman')._network._rps._start();
    fogletTemplate.foglet.overlay('tman')._network.addCible({id:'C-0', x:10, y:10, perimettre:100});
    fogletTemplate.on("overlay-open", id => {
        console.log('overlay-open', id);
        pos(fogletTemplate, id)
        const {x, y} = pos(fogletTemplate, id) || {
            x:Math.floor(Math.random()*max),
            y:Math.floor(Math.random()*max)
        }
        addNode(overlay, id, {
            x,
            y
        }, options);
        addEdge(overlay, fogletTemplate.foglet.inViewID, id)
    });

    fogletTemplate.on("overlay-close", id => {
        console.log('overlay-close', id);
        dropNode(overlay, id);
        dropEdge(overlay, `${fogletTemplate.foglet.inViewID}-${id}`);
    });

    fogletTemplate.on("rps-open", id => {
        // console.log('rps-open', id);
        // addTemplateToGraph(rps, fogletTemplate, options);
        
    });
});
