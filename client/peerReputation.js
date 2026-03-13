export default class PeerReputation {

    constructor() {

        this.scores = {}

    }

    addPeer(peerId) {

        if (!this.scores[peerId]) {

            this.scores[peerId] = 100

        }

    }

    reward(peerId) {

        this.scores[peerId] += 5

    }

    punish(peerId) {

        this.scores[peerId] -= 20

    }

    getScore(peerId) {

        return this.scores[peerId] || 0

    }

    isTrusted(peerId) {

        return this.getScore(peerId) > 50

    }

}
