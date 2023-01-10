import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import CANNON from 'cannon'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Physics
 */
const world = new CANNON.World()
world.gravity.set(0, - 9.82, 0)

// material 
const material = new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    // envMap: environmentMapTexture,
    // envMapIntensity: 0.5
});
// object
const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3, 1, 1),
    material
)
plan.rotation.x = - Math.PI * 0.5
// plan.position.y = - 0.5
plan.receiveShadow = true

// physics world 
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// shpere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 20),
    material
)
sphere.castShadow = true
// sphere.position.y = 0.2
// physics world
const sphereShape = new CANNON.Sphere(0.2)
const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape
})
world.addBody(sphereBody)
scene.add(plan, sphere)

// light
const Ambientlight = new THREE.AmbientLight(0xffffff, 0.7); // soft white light

scene.add(Ambientlight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 10
directionalLight.shadow.camera.left = - 4
directionalLight.shadow.camera.top = 4
directionalLight.shadow.camera.right = 4
directionalLight.shadow.camera.bottom = - 4
directionalLight.position.set(2, 2, 2)
gui.add(directionalLight, 'intensity').min(-5).max(5)
const helper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(directionalLight)
scene.add(helper)
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
let oldElapsedTime = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)
    // sphere.position.x = sphereBody.position.x
    // sphere.position.y = sphereBody.position.y
    // sphere.position.z = sphereBody.position.z
    sphere.position.copy(sphereBody.position)
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()