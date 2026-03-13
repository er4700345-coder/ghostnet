export default class SearchEngine {

    constructor(dht) {

        this.dht = dht

    }

    async index(keywords, dataKey) {

        for (const word of keywords) {

            const key = "search:" + word

            this.dht.store(key, dataKey)

        }

    }

    async search(keyword) {

        const key = "search:" + keyword

        return await this.dht.find(key)

    }

}
