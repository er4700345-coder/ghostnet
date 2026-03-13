export default class NetworkHealer {

    constructor(webrtc, discovery) {

        this.webrtc = webrtc
        this.discovery = discovery

        this.interval = 15000

        this.start()

    }

    start() {

        setInterval(() => {

            const peers = this.discovery.knownPeers

            peers.forEach(peer => {

                if (!this.webrtc.channels[peer]) {

                    this.webrtc.connectToPeer(peer)

                }

            })

        }, this.interval)

    }

}
