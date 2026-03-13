import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js"

export default class Network3D {

constructor(){

this.nodes={}

this.scene=new THREE.Scene()

this.camera=new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
)

this.renderer=new THREE.WebGLRenderer()

this.renderer.setSize(window.innerWidth,400)

document.getElementById("network3d").appendChild(this.renderer.domElement)

this.camera.position.z=30

this.animate()

}

addNode(id){

const geometry=new THREE.SphereGeometry(0.5)

const material=new THREE.MeshBasicMaterial({

color:0x00ff9f

})

const sphere=new THREE.Mesh(geometry,material)

sphere.position.x=Math.random()*20-10
sphere.position.y=Math.random()*20-10
sphere.position.z=Math.random()*20-10

this.scene.add(sphere)

this.nodes[id]=sphere

}

connect(a,b){

if(!this.nodes[a]||!this.nodes[b])return

const material=new THREE.LineBasicMaterial({

color:0x5555ff

})

const points=[]

points.push(this.nodes[a].position)
points.push(this.nodes[b].position)

const geometry=new THREE.BufferGeometry().setFromPoints(points)

const line=new THREE.Line(geometry,material)

this.scene.add(line)

}

animate(){

requestAnimationFrame(()=>this.animate())

this.scene.rotation.y+=0.001

this.renderer.render(this.scene,this.camera)

}

}
