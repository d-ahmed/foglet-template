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

// fogletTemplate.foglet.share()
fogletTemplate.connection().then(() => {
    fogletTemplate.foglet.overlay('tman')._network.addCible({id:'C-0', x:10, y:10, perimettre:100})
    fogletTemplate.on("overlay-open", id => console.log('overlay-open', id));
    fogletTemplate.on("rps-open", id => console.log('rps-open', id));
});
