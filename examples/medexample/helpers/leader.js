class Leader{

    constructor(template = null){
        this.template = template;

        this.leaderOfCible = new Map()

        this.template.on('overlay-open', (id) => {
            this.doLeaderElection();
        })

        this.template.on('overlay-close', (id) => {
            this.doLeaderElection();
        })

        this.ranking = (neighbor, callkack) => (a, b) => {
                const getDistance = (descriptor1, descriptor2) => {
                  const { x: xa, y: ya, z:za } = descriptor1;
                  const { x: xb, y: yb, z:zb } = descriptor2;
                  const dx = xa - xb;
                  const dy = ya - yb;
                  const dz = za - zb;
                  return Math.sqrt(dx * dx + dy * dy);
                };
              
                const distanceA = getDistance(neighbor, a);
                const distanceB = getDistance(neighbor, b);
                if(distanceA === distanceB){
                  if(a.id<b.id){
                    return -1;
                  }else  if(a.id>=b.id){
                    return 1;
                  }
                }
                // console.log('neighbor ', neighbor, ' a ', a, ' b ', b)
                return distanceA - distanceB;
        }
    }

    doLeaderElection(){
        
        let network = this.template.foglet.overlay('tman')._network;
        let rps = network._rps;
        let myPeers = Array.from(rps.partialView.values()).map(evp=>evp.descriptor);
        myPeers.push(rps.options.descriptor);
        let cibles = network.myCibles;

        Array.from(this.leaderOfCible.keys(), key=>{
            let findedCible = cibles.filter(cible=>cible.id===key);
            if(findedCible.length<=0) {
                this.leaderOfCible.delete(key);
            }
        })

        if(myPeers.length>0){
            cibles.forEach(cible => {
                myPeers.sort(this.ranking(cible));
                this.leaderOfCible.set(cible.id, myPeers[0])
            });
        }
    }

    getLeaders(){
        return Array.from(this.leaderOfCible.values()).map(desc=>desc.id);
    }
}