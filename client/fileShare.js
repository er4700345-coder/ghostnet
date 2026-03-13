export default class FileShare {

    constructor(webrtc) {

        this.webrtc = webrtc

        this.files = {}

    }

    async shareFile(file) {

        const buffer = await file.arrayBuffer()

        const chunkSize = 16000

        const totalChunks = Math.ceil(buffer.byteLength / chunkSize)

        for (let i = 0; i < totalChunks; i++) {

            const chunk = buffer.slice(
                i * chunkSize,
                (i + 1) * chunkSize
            )

            this.webrtc.broadcast({

                type: "FILE_CHUNK",

                name: file.name,

                index: i,

                total: totalChunks,

                data: Array.from(new Uint8Array(chunk))

            })

        }

    }

}
