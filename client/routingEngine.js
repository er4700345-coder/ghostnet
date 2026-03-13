export default class RoutingEngine {

    constructor(webrtc, reputation) {

        this.webrtc = webrtc
        this.reputation = reputation

        this.latency = {}

    }

    updateLatency(peer, time) {

        this.latency[peer] = time

    }

    getBestPeers() {

        const peers = Object.keys(this.webrtc.channels)

        return peers.sort((a,b)=>{

            const repA = this.reputation.getScore(a)
            const repB = this.reputation.getScore(b)

            const latA = this.latency[a] || 999
            const latB = this.latency[b] || 999

            return (repB - repA) || (latA - latB)

        })

    }

    route(packet) {

        const peers = this.getBestPeers()

        if(peers.length === 0) return

        const target = peers[0]

        this.webrtc.send(target, packet)

    }

}
