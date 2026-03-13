import WebRTCManager from "./webrtc.js"

const socket = new WebSocket("ws://localhost:3000")

let peerId = null
let webrtc = null

socket.onmessage = async (event) => {

    const data = JSON.parse(event.data)

    if (data.type === "INIT") {

        peerId = data.peerId

        webrtc = new WebRTCManager(socket, peerId)

        socket.send(JSON.stringify({
            type: "DISCOVER"
        }))
    }

    if (data.type === "PEER_LIST") {

        for (const peer of data.peers) {

            webrtc.connectToPeer(peer)

        }

    }

    if (data.type === "SIGNAL") {

        await webrtc.handleSignal(data.from, data.signal)

    }

}
