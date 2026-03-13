const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const PeerManager = require("./peerManager");

const PORT = 3000;

const wss = new WebSocket.Server({ port: PORT });

const peers = new PeerManager();

console.log(`GhostNet signaling server running on ${PORT}`);

wss.on("connection", (ws) => {
    const peerId = uuidv4();

    peers.addPeer(peerId, ws);

    ws.send(JSON.stringify({
        type: "INIT",
        peerId
    }));

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);

        if (data.type === "DISCOVER") {
            const peerList = peers.getPeers(peerId);

            ws.send(JSON.stringify({
                type: "PEER_LIST",
                peers: peerList
            }));
        }

        if (data.type === "SIGNAL") {
            const target = peers.getPeer(data.target);

            if (target) {
                target.send(JSON.stringify({
                    type: "SIGNAL",
                    from: peerId,
                    signal: data.signal
                }));
            }
        }
    });

    ws.on("close", () => {
        peers.removePeer(peerId);
    });
});
