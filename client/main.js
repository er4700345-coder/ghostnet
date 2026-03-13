import WebRTCManager from "./webrtc.js"
import DHT from "./dht.js"
import Encryption from "./encryption.js"
import OnionRouter from "./onionRouter.js"
import FileShare from "./fileShare.js"
import PeerReputation from "./peerReputation.js"
import NetworkGraph from "./networkGraph.js"
import DecentralizedDNS from "./decentralizedDNS.js"
import RoutingEngine from "./routingEngine.js"
import LatencyMonitor from "./latencyMonitor.js"
import Network3D from "./network3D.js"

const socket = new WebSocket("ws://localhost:3000")

let peerId
let webrtc
let dht
let encryption
let onion
let fileShare
let reputation
let graph
let dns
let router
let latency
let network3D

function log(msg) {

const consoleUI = document.getElementById("console")

if(consoleUI){

consoleUI.innerHTML += msg + "<br>"
consoleUI.scrollTop = consoleUI.scrollHeight

}

}

socket.onmessage = async(event)=>{

const data = JSON.parse(event.data)

if(data.type === "INIT"){

peerId = data.peerId

log("Connected as peer: " + peerId)

webrtc = new WebRTCManager(socket,peerId)

dht = new DHT(webrtc)

encryption = new Encryption()

onion = new OnionRouter(webrtc)

fileShare = new FileShare(webrtc)

reputation = new PeerReputation()

graph = new NetworkGraph()

dns = new DecentralizedDNS(dht)

router = new RoutingEngine(webrtc,reputation)

latency = new LatencyMonitor(webrtc,router)

network3D = new Network3D()

graph.addNode(peerId)

network3D.addNode(peerId)

registerHandlers()

socket.send(JSON.stringify({

type:"DISCOVER"

}))

}

if(data.type === "PEER_LIST"){

for(const peer of data.peers){

webrtc.connectToPeer(peer)

graph.addNode(peer)

network3D.addNode(peer)

graph.connect(peerId,peer)

network3D.connect(peerId,peer)

reputation.addPeer(peer)

}

}

if(data.type === "SIGNAL"){

await webrtc.handleSignal(data.from,data.signal)

}

}

function registerHandlers(){

webrtc.registerHandler("PING",(from,packet)=>{

latency.handlePing(from,packet)

})

webrtc.registerHandler("PONG",(from,packet)=>{

latency.handlePong(from,packet)

})

webrtc.registerHandler("DHT_STORE",(from,packet)=>{

dht.handleStore(packet.hash,packet.value)

})

webrtc.registerHandler("DHT_FIND",(from,packet)=>{

dht.handleFind(packet.hash,packet.requestId,from)

})

webrtc.registerHandler("DHT_RESPONSE",(from,packet)=>{

dht.handleResponse(packet.requestId,packet.value)

})

webrtc.registerHandler("ONION_PACKET",(from,packet)=>{

onion.handlePacket(packet,from)

})

webrtc.registerHandler("FILE_CHUNK",(from)=>{

log("Receiving file chunk from " + from)

})

}

document.getElementById("store").onclick = ()=>{

dht.store("hello","GhostNet")

log("Stored data in DHT")

}

document.getElementById("find").onclick = async()=>{

const value = await dht.find("hello")

log("DHT result: " + value)

}

document.getElementById("file").onchange = (e)=>{

const file = e.target.files[0]

if(file){

fileShare.shareFile(file)

log("Sharing file: " + file.name)

}

}
