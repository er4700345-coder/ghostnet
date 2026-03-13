export default class DecentralizedDNS {

    constructor(dht) {

        this.dht = dht

    }

    async registerDomain(domain, peerId) {

        const key = "dns:" + domain

        this.dht.store(key, peerId)

    }

    async resolve(domain) {

        const key = "dns:" + domain

        return await this.dht.find(key)

    }

}
