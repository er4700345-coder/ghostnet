export default class WebRTCManager {

    constructor(socket, peerId) {

        this.socket = socket
        this.peerId = peerId

        this.connections = {}
        this.channels = {}

        this.packetHandlers = {}

        this.heartbeatInterval = 10000
        this.health = {}

        this.startHealthCheck()

    }

    registerHandler(type, handler) {

        this.packetHandlers[type] = handler

    }

    async connectToPeer(target) {

        if (this.connections[target]) return

        const pc = new RTCPeerConnection({

            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" }
            ]

        })

        this.connections[target] = pc

        const channel = pc.createDataChannel("ghostnet")

        this.setupChannel(target, channel)

        pc.onicecandidate = (event) => {

            if (event.candidate) {

                this.socket.send(JSON.stringify({
                    type: "SIGNAL",
                    target,
                    signal: { candidate: event.candidate }
                }))

            }

        }

        pc.onconnectionstatechange = () => {

            if (pc.connectionState === "disconnected") {

                this.removePeer(target)

            }

        }

        const offer = await pc.createOffer()

        await pc.setLocalDescription(offer)

        this.socket.send(JSON.stringify({
            type: "SIGNAL",
            target,
            signal: { sdp: pc.localDescription }
        }))

    }

    async handleSignal(from, signal) {

        let pc = this.connections[from]

        if (!pc) {

            pc = new RTCPeerConnection({

                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" }
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
                        signal: { candidate: event.candidate }
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
                    signal: { sdp: pc.localDescription }
                }))

            }

        }

        if (signal.candidate) {

            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate))

        }

    }

    setupChannel(peerId, channel) {

        this.channels[peerId] = channel
        this.health[peerId] = Date.now()

        channel.onopen = () => {

            console.log("Connected to peer:", peerId)

        }

        channel.onmessage = (event) => {

            const packet = JSON.parse(event.data)

            this.health[peerId] = Date.now()

            if (packet.type && this.packetHandlers[packet.type]) {

                this.packetHandlers[packet.type](peerId, packet)

            }

        }

        channel.onclose = () => {

            this.removePeer(peerId)

        }

    }

    send(peerId, packet) {

        const channel = this.channels[peerId]

        if (!channel) return

        if (channel.readyState === "open") {

            channel.send(JSON.stringify(packet))

        }

    }

    broadcast(packet) {

        Object.entries(this.channels).forEach(([peer, channel]) => {

            if (channel.readyState === "open") {

                channel.send(JSON.stringify(packet))

            }

        })

    }

    route(packet, excludePeer = null) {

        Object.entries(this.channels).forEach(([peer, channel]) => {

            if (peer !== excludePeer && channel.readyState === "open") {

                channel.send(JSON.stringify(packet))

            }

        })

    }

    removePeer(peerId) {

        delete this.channels[peerId]
        delete this.connections[peerId]
        delete this.health[peerId]

        console.log("Peer removed:", peerId)

    }

    startHealthCheck() {

        setInterval(() => {

            const now = Date.now()

            Object.entries(this.health).forEach(([peer, lastSeen]) => {

                if (now - lastSeen > this.heartbeatInterval * 3) {

                    console.log("Peer timed out:", peer)

                    this.removePeer(peer)

                }

            })

        }, this.heartbeatInterval)

    }

}
