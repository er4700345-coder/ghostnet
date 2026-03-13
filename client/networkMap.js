export default class NetworkMap {

    constructor() {

        this.peers = new Set()

    }

    addPeer(peerId) {

        this.peers.add(peerId)

        this.render()

    }

    removePeer(peerId) {

        this.peers.delete(peerId)

        this.render()

    }

    render() {

        const container = document.getElementById("network")

        if (!container) return

        container.innerHTML = ""

        this.peers.forEach(peer => {

            const node = document.createElement("div")

            node.innerText = peer

            node.style.border = "1px solid white"
            node.style.padding = "5px"
            node.style.margin = "5px"

            container.appendChild(node)

        })

    }

}
