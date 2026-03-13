export default class UI {

    constructor(dht, fileShare) {

        this.dht = dht
        this.fileShare = fileShare

        this.init()

    }

    init() {

        const storeBtn = document.getElementById("store")

        const findBtn = document.getElementById("find")

        const fileInput = document.getElementById("file")

        storeBtn.onclick = () => {

            this.dht.store("hello", "GhostNet world")

        }

        findBtn.onclick = async () => {

            const value = await this.dht.find("hello")

            console.log("Found:", value)

        }

        fileInput.onchange = (e) => {

            const file = e.target.files[0]

            this.fileShare.shareFile(file)

        }

    }

}
