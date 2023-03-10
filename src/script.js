import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// object
const geometry = new THREE.SphereGeometry(0.3, 30, 20);
const geometry2 = new THREE.SphereGeometry(0.3, 30, 20);
const geometry3 = new THREE.SphereGeometry(0.3, 30, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
material.wireframe = true
const sphere = new THREE.Mesh(geometry, material);
const sphere1 = new THREE.Mesh(geometry2, material);
const sphere2 = new THREE.Mesh(geometry3, material);
sphere1.position.x = -0.9;
sphere2.position.x = 0.9;
scene.add(sphere, sphere1, sphere2)

// light
const Ambientlight = new THREE.AmbientLight(0x404040, 0.5); // soft white light

scene.add(Ambientlight);
// const light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
// const helper = new THREE.DirectionalLightHelper(light, 1);
// scene.add(helper)
// gui.add(geometry, 'wireframe')
// // .min(- 3)
// //     .max(3)
// //     .step(0.01)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    sphere.position.y = Math.sin(elapsedTime)
    sphere1.position.y = Math.sin(elapsedTime) / 2
    sphere2.position.y = Math.sin(elapsedTime) / 2
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()