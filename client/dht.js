export default class DHT {

    constructor(webrtc) {
        this.webrtc = webrtc
        this.storage = new Map()
        this.pendingRequests = {}
    }

    hashKey(key) {

        let hash = 0

        for (let i = 0; i < key.length; i++) {
            hash = (hash << 5) - hash + key.charCodeAt(i)
            hash |= 0
        }

        return Math.abs(hash)
    }

    store(key, value) {

        const hash = this.hashKey(key)

        this.storage.set(hash, value)

        this.webrtc.broadcast({
            type: "DHT_STORE",
            hash,
            value
        })

    }

    handleStore(hash, value) {

        if (!this.storage.has(hash)) {

            this.storage.set(hash, value)

        }

    }

    async find(key) {

        const hash = this.hashKey(key)

        if (this.storage.has(hash)) {

            return this.storage.get(hash)

        }

        const requestId = crypto.randomUUID()

        return new Promise((resolve) => {

            this.pendingRequests[requestId] = resolve

            this.webrtc.broadcast({
                type: "DHT_FIND",
                hash,
                requestId
            })

        })

    }

    handleFind(hash, requestId, fromPeer) {

        if (this.storage.has(hash)) {

            const value = this.storage.get(hash)

            this.webrtc.channels[fromPeer].send(JSON.stringify({
                type: "DHT_RESPONSE",
                requestId,
                value
            }))

        }

    }

    handleResponse(requestId, value) {

        if (this.pendingRequests[requestId]) {

            this.pendingRequests[requestId](value)

            delete this.pendingRequests[requestId]

        }

    }

}
