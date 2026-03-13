class PeerManager {

    constructor() {
        this.peers = new Map();
    }

    addPeer(id, socket) {
        this.peers.set(id, socket);
    }

    removePeer(id) {
        this.peers.delete(id);
    }

    getPeer(id) {
        return this.peers.get(id);
    }

    getPeers(excludeId) {
        return [...this.peers.keys()].filter(id => id !== excludeId);
    }

}

module.exports = PeerManager;
