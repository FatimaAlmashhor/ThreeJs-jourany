import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Color } from 'three';

// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
// gradientTexture.magFilter = THREE.NearestFilter
/**
 * Debug
 */
const gui = new dat.GUI()
// --- CONSTS

const COLORS = {
    background: "white",
    light: "#ffffff",
    black: "#e1e1e1",
    sky: "#aaaaff",
    ground: "#88ff88",
    blue: "steelblue"
};
const parameters = {
    materialColor: '#1b0a43'
}
// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})
gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#5e62d9')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Test cube
 */
// Meshes
// const mesh1 = new THREE.Mesh(
//     new THREE.TorusGeometry(1, 0.4, 16, 60),
//     material
// )
// scene.add(mesh1)

const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8, 20, 60),
    material
)
plan.position.z = -1
plan.receiveShadow = true;
scene.add(plan)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(1, 1, 0)
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
// directionalLight.position.set(2, 5, 3);
scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(
    COLORS.light,
    COLORS.black,
    2
);
scene.add(hemisphereLight)


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

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// scroll 
let scrollY = window.scrollY;

window.addEventListener("scroll", (e) => {
    scrollY = window.scrollY

}, false)
/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})


// Distance 

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// models 
const model = {
    name: 'bear',
    url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bear/model.gltf',
    position: new THREE.Vector3(0, - 0.5, 0)
}
let modelGroup = new THREE.Group();

// loading

const loadingMasger = new THREE.LoadingManager(() => {
    setupAnimation()
})

const gltfLoader = new GLTFLoader(loadingMasger)
gltfLoader.load(model.url, (model) => {
    console.log('here');
    // shadows
    model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    })
    modelGroup.add(model.scene)
    modelGroup.position.y = -3.3
    modelGroup.position.x = 1.3
    modelGroup.scale.set(2.7, 2.7, 2.7)
    modelGroup.rotation.y = - Math.PI * 0.2
    scene.add(modelGroup)
})
const setupAnimation = () => {

}



