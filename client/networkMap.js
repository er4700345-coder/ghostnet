export default class NetworkMap {

    constructor() {

        this.nodes = []
        this.links = []

    }

    addConnection(a, b) {

        this.nodes.push({ id: a })
        this.nodes.push({ id: b })

        this.links.push({ source: a, target: b })

        this.render()

    }

    render() {

        const canvas = document.getElementById("network")

        if (!canvas) return

        canvas.innerHTML = JSON.stringify({
            nodes: this.nodes,
            links: this.links
        }, null, 2)

    }

}
