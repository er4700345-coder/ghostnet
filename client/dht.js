export default class DHT {

    constructor(webrtc) {

        this.webrtc = webrtc

        this.storage = new Map()

        this.pending = {}

    }

    hash(key) {

        let hash = 0

        for (let i = 0; i < key.length; i++) {

            hash = (hash << 5) - hash + key.charCodeAt(i)
            hash |= 0

        }

        return Math.abs(hash)

    }

    store(key, value) {

        const hash = this.hash(key)

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

    find(key) {

        const hash = this.hash(key)

        if (this.storage.has(hash)) {

            return Promise.resolve(this.storage.get(hash))

        }

        const requestId = crypto.randomUUID()

        return new Promise(resolve => {

            this.pending[requestId] = resolve

            this.webrtc.broadcast({
                type: "DHT_FIND",
                hash,
                requestId
            })

        })

    }

    handleFind(hash, requestId, from) {

        if (this.storage.has(hash)) {

            const value = this.storage.get(hash)

            this.webrtc.channels[from].send(JSON.stringify({
                type: "DHT_RESPONSE",
                requestId,
                value
            }))

        }

    }

    handleResponse(requestId, value) {

        if (this.pending[requestId]) {

            this.pending[requestId](value)

            delete this.pending[requestId]

        }

    }

}
