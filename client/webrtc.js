export default class WebRTCManager {

    constructor(socket, peerId) {
        this.socket = socket
        this.peerId = peerId
        this.connections = {}
        this.channels = {}
    }

    async connectToPeer(targetId) {

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        })

        this.connections[targetId] = pc

        const channel = pc.createDataChannel("ghostnet")

        this.setupChannel(targetId, channel)

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.send(JSON.stringify({
                    type: "SIGNAL",
                    target: targetId,
                    signal: {
                        candidate: event.candidate
                    }
                }))
            }
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        this.socket.send(JSON.stringify({
            type: "SIGNAL",
            target: targetId,
            signal: {
                sdp: pc.localDescription
            }
        }))
    }

    async handleSignal(from, signal) {

        let pc = this.connections[from]

        if (!pc) {

            pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" }
                ]
            })

            this.connections[from] = pc

            pc.ondatachannel = (event) => {
                this.setupChannel(from, event.channel)
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.send(JSON.stringify({
                        type: "SIGNAL",
                        target: from,
                        signal: {
                            candidate: event.candidate
                        }
                    }))
                }
            }
        }

        if (signal.sdp) {

            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))

            if (signal.sdp.type === "offer") {

                const answer = await pc.createAnswer()

                await pc.setLocalDescription(answer)

                this.socket.send(JSON.stringify({
                    type: "SIGNAL",
                    target: from,
                    signal: {
                        sdp: pc.localDescription
                    }
                }))
            }
        }

        if (signal.candidate) {

            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate))

        }

    }

    setupChannel(peerId, channel) {

        this.channels[peerId] = channel

        channel.onopen = () => {
            console.log("Connected to peer:", peerId)
        }

        channel.onmessage = (event) => {
            console.log("Message from", peerId, event.data)
        }

        channel.onclose = () => {
            console.log("Disconnected from", peerId)
        }

    }

    broadcast(message) {

        Object.values(this.channels).forEach(channel => {

            if (channel.readyState === "open") {
                channel.send(JSON.stringify(message))
            }

        })

    }

}
