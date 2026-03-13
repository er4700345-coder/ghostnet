export default class NetworkGraph {

    constructor() {

        this.nodes = {}
        this.links = []

        this.canvas = document.getElementById("network")

    }

    addNode(id) {

        if (!this.nodes[id]) {

            this.nodes[id] = { id }

            this.render()

        }

    }

    connect(a, b) {

        this.links.push({ source: a, target: b })

        this.render()

    }

    removeNode(id) {

        delete this.nodes[id]

        this.links = this.links.filter(
            l => l.source !== id && l.target !== id
        )

        this.render()

    }

    render() {

        if (!this.canvas) return

        const data = {

            nodes: Object.values(this.nodes),
            links: this.links

        }

        this.canvas.innerHTML = JSON.stringify(data, null, 2)

    }

}
