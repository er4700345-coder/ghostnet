import Encryption from "./encryption.js"

export default class OnionRouter {

    constructor(webrtc) {

        this.webrtc = webrtc
        this.encryption = new Encryption()

    }

    async sendAnonymous(targetPeer, message) {

        const peers = Object.keys(this.webrtc.channels)

        if (peers.length < 3) return

        const route = peers.sort(() => 0.5 - Math.random()).slice(0,3)

        let payload = message

        for (let i = route.length - 1; i >= 0; i--) {

            payload = await this.encryption.encrypt(JSON.stringify({
                next: route[i],
                payload
            }))

        }

        const firstHop = route[0]

        this.webrtc.channels[firstHop].send(JSON.stringify({
            type: "ONION_PACKET",
            payload
        }))

    }

    async handlePacket(packet, from) {

        const decrypted = await this.encryption.decrypt(packet.payload)

        const data = JSON.parse(decrypted)

        if (!data.next) return

        const next = data.next

        if (this.webrtc.channels[next]) {

            this.webrtc.channels[next].send(JSON.stringify({
                type: "ONION_PACKET",
                payload: data.payload
            }))

        }

    }

}
