const Leader = require('./leader.js');

const messages = {
    PREPARE_REQUEST: 'prepare_request',
    PREPARE_RESPONSE: 'prepare_response',
    ACCEPT_REQUEST: 'accept_request',
    ACCEPTED: 'accepted',
    MSGET_CIBLE: 'get_cible'
}

class bollot{
    constructor(n, pid){
        this.n = n;
        this.pid = pid;
    }
}

class Message{
    constructor(peer, type, name, bollotNum, acceptNum, acceptVal, nbPeers=0){
        this.NAME = name;
        this.PEER = peer;
        this.TYPE = type;
        this.BALLOT_NUM = bollotNum;
        this.ACCEPT_NUM = acceptNum;
        this.ACCEPT_VAL = acceptVal;
        this.NB_PEERS = nbPeers;
    }
}


class Paxos {

    constructor(template){

        this.NO_VALUE = "__0xDEADBEEF";

        this.BALLOT_NUM = {};

        this.ACCEPT_NUM= {};

        this.ACCEPT_VAL= {};

        this.LEARNED_VALUE = {};

        this.NUM_PEERS = {};

        this.INITALVALUE = {};

        this.isProssesing  = {};

        this.template = template;
        this.leader = new Leader(template)
        this.listeners = new Set();
        
        this.initiateListener(null);
        
        this.template.on('overlay-open', (overlay) => {
            if(!this.listeners.has(overlay)){
                this.listeners.add(overlay);
                this.initiateListener(overlay);
            }
        })

        this.template.on('receive-rps', (id, message) => {
            console.log('[%s][RPS] receive an unicasted message from %s: ', id, message)
        })
    }

    initiateListener(overlay){
        this.template.foglet.overlay(overlay).communication.onUnicast((id, message) => {
            switch (message.TYPE) {
                case messages.MSGET_CIBLE:
                    this.initiateProposal(message);
                    break;
                case messages.PREPARE_REQUEST:
                    this.handlePrepareRequest(message);
                    break;
                case messages.PREPARE_RESPONSE:
                    this.handlePrepareResponse(message);
                    break;

                case messages.ACCEPT_REQUEST:
                    this.handleAcceptRequest(message);
                    break;

                case messages.ACCEPTED:
                    this.handleAccept(message);
                    break;
            
                default:
                    break;
            }
        });
    }

    initiateProposal(message){
        if(this.leader.leaderOfCible.get(message.NAME).peer===this.template.foglet.inViewID){
            if(!this.isProssesing.hasOwnProperty(message.NAME)){

                this.BALLOT_NUM[message.NAME] = new bollot(0,0);
    
                this.ACCEPT_NUM[message.NAME] = new bollot(0,0);
    
                this.ACCEPT_VAL[message.NAME] = this.NO_VALUE;
    
                this.isProssesing[message.NAME] = true;
                this.NUM_PEERS[message.NAME] = this.template.neighboursOverlay(message.NAME).length + 1
                this.INITALVALUE[message.NAME] = message.ACCEPT_VAL;
                this.BALLOT_NUM[message.NAME].n++;
                this.BALLOT_NUM[message.NAME].pid = this.template.foglet.inViewID;
                this.sendAll(
                    message.NAME,
                    new Message(this.template.foglet.inViewID, messages.PREPARE_REQUEST, message.NAME, this.BALLOT_NUM[message.NAME], null, null, this.NUM_PEERS[message.NAME])
                )
            }else{
                console.log('there is a process in progress')
            }
        }else{
            console.log('I\'am not the leader')
        }
    }

    getCible(cible){
        if(!this.leader.leaderOfCible.get(cible)){
            console.log('No leader chosen')
            return
        }
        let leader = this.leader.leaderOfCible.get(cible).peer;

        let message = new Message(this.template.foglet.inViewID, messages.MSGET_CIBLE, cible, null, null, {
            perimeter: cible,
            pid: this.template.foglet.inViewID,
            cible: cible
        })

        this.send(cible, leader, message )
    }

    handlePrepareRequest(message){
        console.log('handlePrepareRequest')
        if(!this.BALLOT_NUM.hasOwnProperty(message.NAME)){
            this.BALLOT_NUM[message.NAME] = new bollot(0,0);
        }
        if(!this.ACCEPT_NUM.hasOwnProperty(message.NAME)){
            this.ACCEPT_NUM[message.NAME] = new bollot(0,0);
        }
        if(!this.ACCEPT_VAL.hasOwnProperty(message.NAME)){
            this.ACCEPT_VAL[message.NAME] = this.NO_VALUE
        }
        if(this.greaterThan(message.BALLOT_NUM, this.BALLOT_NUM[message.NAME])){
            console.log(this.template.foglet.inViewID, message)
            this.NUM_PEERS[message.NAME] = message.NB_PEERS;
            this.BALLOT_NUM[message.NAME] = message.BALLOT_NUM
            let to = message.PEER
            message.PEER = this.template.foglet.inViewID
            message.TYPE = messages.PREPARE_RESPONSE
            message.ACCEPT_NUM = this.ACCEPT_NUM[message.NAME]
            message.ACCEPT_VAL = this.ACCEPT_VAL[message.NAME]
            // Renvoyer le message
            this.send(message.NAME, to, message )
        }
    }


    handlePrepareResponse(message){
        console.log(this.template.foglet.inViewID, message)

        if(!this.LEARNED_VALUE.hasOwnProperty(message.BALLOT_NUM)){
            this.LEARNED_VALUE[message.BALLOT_NUM] = [];
        }

        this.LEARNED_VALUE[message.BALLOT_NUM].push(message);
        
        if(this.LEARNED_VALUE[this.BALLOT_NUM[message.NAME]].length >= Math.floor((this.NUM_PEERS[message.NAME] / 2) + 1)){
            
            let isNOVALUE = true;
            
            this.LEARNED_VALUE[this.BALLOT_NUM[message.NAME]].forEach(message => {
                isNOVALUE = isNOVALUE && this.NO_VALUE === message.ACCEPT_VAL;
            });
            let VAL = this.NO_VALUE;
            
            if(isNOVALUE){
                VAL = this.INITALVALUE[message.NAME];
            }else{
                let maxAcceptNum = this.LEARNED_VALUE[this.BALLOT_NUM[message.NAME]][0].ACCEPT_NUM
                let maxAcceptNumIndex = 0;
                this.LEARNED_VALUE[message.BALLOT_NUM].forEach(message => {
                   if(this.greaterThan(maxAcceptNum, message.ACCEPT_NUM)){
                    maxAcceptNum = message.ACCEPT_NUM;
                    maxAcceptNumIndex = i;
                   }
                });
                VAL = this.LEARNED_VALUE[message.BALLOT_NUM][maxAcceptNumIndex].ACCEPT_VAL
            }
            // Send proposition type ACCEPT_REQUEST
            message.PEER = this.template.foglet.inViewID
            message.ACCEPT_VAL = VAL;
            message.TYPE = messages.ACCEPT_REQUEST
            console.log(message);
            // Proposition
            this.sendAll(message.NAME, message)
        }
    }

    handleAcceptRequest(message){
        console.log(this.template.foglet.inViewID, message)
        if(!this.BALLOT_NUM.hasOwnProperty(message.NAME)){
            this.BALLOT_NUM[message.NAME] = new bollot(0,0);
        }
        if(this.greaterThan(message.BALLOT_NUM, this.BALLOT_NUM[message.NAME])){
            this.ACCEPT_NUM[message.NAME] = message.BALLOT_NUM
            this.ACCEPT_VAL[message.NAME] = message.ACCEPT_VAL
            message.PEER = this.template.foglet.inViewID
            message.TYPE = messages.ACCEPTED
            this.sendAll(message.NAME, message)
        }
    }

    handleAccept(message){
        console.log(this.template.foglet.inViewID, message)
    }

    greaterThan(ballot1, ballot2){
        // A proposal is greater than or equal to another if:
        // 1. it is the same (both the n and pid index are equal)
        // 2. The n is higher
        // 3. The n is the same but the pid is higher
        if (ballot1.n > ballot2.n) {
            return true;
        }
        else if (ballot1.n === ballot2.n && ballot1.pid > ballot2.pid) {
            return true;
        }
        else if (ballot1.n === ballot2.n && ballot1.pid === ballot2.pid) {
            return true;
        }
        else {
            return false;
        }
    }

    send(overlay, pid, message){
        if(pid===this.template.foglet.inViewID){
            console.log('send to my self', pid);
        }
        this.template.sendOverlayUnicast(
            pid===this.template.foglet.inViewID ? null : overlay,
            pid,
            message
        ).then().catch(
            e => {

            }
        );
    }


    sendAll(overlay, message){
        this.template.sendOverlayUnicastAll(
            overlay,
            message
        )
        this.send(overlay, this.template.foglet.inViewID, message)
    }
}

module.exports = Paxos;