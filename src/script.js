import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { Sphere } from 'three'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// ganeral material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4
// const material = new THREE.MeshNormalMaterial();
// const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
// material.wireframe = true;
// object
const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
for (let i = 0; i < 6; i++) {
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 10, 10),
        material
    )
    let angle = (i * 60) * (Math.PI / 180)
    sphere.position.x = -0.9 * Math.cos(angle) * 2;
    sphere.position.z = -0.9 * Math.sin(angle) * 2;
    scene.add(sphere)
}

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 1),
    material
)
cube.position.x = 0.9;
plan.rotation.x = - Math.PI * .5
// plan.rotation.y = - 0.50;
plan.position.y = -0.5;

scene.add(plan, cube)


// light
const directLight = new THREE.DirectionalLight(0x00fffc, 0.3);
const helper = new THREE.DirectionalLightHelper(directLight, 5);
directLight.position.set(1, 0.25, 0)
// scene.add(directLight);

// const Ambientlight = new THREE.AmbientLight(0xFFFFFF, 0.5); // soft white light
// gui.add(Ambientlight, 'intensity').min(0).max(1).step(0.001)
// scene.add(Ambientlight);
const hemisphereLight = new THREE.HemisphereLight(0x00fffc, 0x0000ff, 0.1)
scene.add(hemisphereLight)

const pointLight = new THREE.PointLight(0x00fffc, 0.5)
gui.add(pointLight, 'intensity').min(0).max(1).step(0.001)
pointLight.castShadow = true
pointLight.position.x = 1
pointLight.position.y = 2
pointLight.position.z = 1
// scene.add(pointLight)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)


const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 8, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(2, 2, 3)
spotLight.target.position.x = - 0.75
scene.add(spotLight)

const spotLightHelper = new THREE.SpotLightHelper(spotLight)
// scene.add(spotLightHelper)
window.requestAnimationFrame(() => {
    spotLightHelper.update()
})
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
camera.position.x = 3
camera.position.y = 1.3
camera.position.z = 4
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
// gsap.to(sphere.position, { duration: 1, y: 2 })

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const speed = elapsedTime * 2;
    let angle = 30;

    // for(i = 0 ; i< 6 ; i++){}
    angle = (angle) * (Math.PI / 180) * speed;
    const rotateY = Math.sin(angle) * 2;
    const rotateX = Math.cos(angle) * 2;

    // sphere.position.x = rotateX;
    // sphere.position.z = rotateY;
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()