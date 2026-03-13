export default class ReliablePacket {

    constructor() {

        this.sent = {}
        this.timeout = 5000

    }

    createPacket(type, payload) {

        const id = crypto.randomUUID()

        return {
            id,
            type,
            payload
        }

    }

    track(packet, sendFunction) {

        this.sent[packet.id] = packet

        setTimeout(() => {

            if (this.sent[packet.id]) {

                sendFunction(packet)

            }

        }, this.timeout)

    }

    acknowledge(id) {

        delete this.sent[id]

    }

}
