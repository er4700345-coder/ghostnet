export default class LatencyMonitor {

    constructor(webrtc, router) {

        this.webrtc = webrtc
        this.router = router

        this.start()

    }

    start() {

        setInterval(()=>{

            const start = Date.now()

            this.webrtc.broadcast({

                type:"PING",
                time:start

            })

        },5000)

    }

    handlePing(from, packet){

        this.webrtc.send(from,{

            type:"PONG",
            time:packet.time

        })

    }

    handlePong(from, packet){

        const latency = Date.now() - packet.time

        this.router.updateLatency(from, latency)

    }

}
