export default class PeerDiscovery {

    constructor(webrtc) {

        this.webrtc = webrtc
        this.knownPeers = new Set()

    }

    sharePeers() {

        this.webrtc.broadcast({

            type: "PEER_LIST",
            peers: Array.from(this.knownPeers)

        })

    }

    receivePeers(peers) {

        peers.forEach(p => {

            if (!this.knownPeers.has(p)) {

                this.knownPeers.add(p)

                this.webrtc.connectToPeer(p)

            }

        })

    }

}
