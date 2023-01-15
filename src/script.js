import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Color } from 'three';
gsap.registerPlugin(ScrollTrigger)
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
    background: "#5e62d9",
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
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true })
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
const scenes = {
    real: new THREE.Scene(),
    wire: new THREE.Scene()
};

scenes.wire.overrideMaterial = wireframeMaterial
scenes.wire.background = new THREE.Color(COLORS.black);

scenes.real.background = new THREE.Color(COLORS.background);
scenes.real.fog = new THREE.Fog(COLORS.background, 15, 20);

// const scene = new THREE.Scene()
// scene.background = new THREE.Color('#5e62d9')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// View 
const views = [
    { height: 1, bottom: 0, scene: scenes.real, camera: null },
    { height: 0, bottom: 0, scene: scenes.wire, camera: null }
];
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
    new THREE.PlaneGeometry(10, 10, 20, 60),
    material
)
plan.position.z = -1
plan.receiveShadow = true;
// scenes.real.add(plan)
scenes.real.add(plan)


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
scenes.real.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(
    COLORS.light,
    COLORS.black,
    2
);
scenes.real.add(hemisphereLight)


window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer
        // Update renderer
        .setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */



// Base camera
// const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
// camera.position.z = 6
let cameraTarget = new THREE.Vector3(0, 0, 6)

// two cameras to the views 
views.forEach(view => {
    view.camera = new THREE.PerspectiveCamera(
        35,
        sizes.width / sizes.height,
        0.1,
        100
    );
    view.camera.position.set(0, 0, 6);

    view.scene.add(view.camera);
})

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
    views.forEach(view => {
        view.camera.lookAt(cameraTarget);
        let bottom = sizes.height * view.bottom
        let height = sizes.height * view.height
        renderer.setViewport(0, 0, sizes.width, sizes.height)
        renderer.setScissor(0, bottom, sizes.width, height)
        renderer.setScissorTest(true)
        renderer.render(view.scene, view.camera);
    })
    // Render

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
let cloneGroup = null;
let bears = {};
// loading

const loadingMasger = new THREE.LoadingManager(() => {
    setupAnimation()
})

const gltfLoader = new GLTFLoader(loadingMasger)
gltfLoader.load(model.url, (model) => {

    // shadows
    model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    })
    modelGroup.add(model.scene)
    cloneGroup = modelGroup.clone();
    // modelGroup.position.y = -3.3
    // modelGroup.position.x = 1.3
    modelGroup.scale.set(2.7, 2.7, 2.7)
    cloneGroup.scale.set(2.7, 2.7, 2.7)
    // modelGroup.rotation.y = - Math.PI * 0.2
    scenes.real.add(modelGroup)
    scenes.wire.add(cloneGroup)
})
const setupAnimation = () => {
    bears = {
        position: [modelGroup.position, cloneGroup.position],
        rotation: [modelGroup.rotation, cloneGroup.rotation],
    };

    gsap.set(bears.position, { x: 1.4, y: -2.6 })
    // gsap.set(bears.scale, { x: 1.4, y: 1.4, z: 1.4 })
    gsap.set(bears.rotation, { y: - Math.PI * 0.2 })
    desktopAnimation()
    console.log('here');

}



const desktopAnimation = () => {
    let section = 0;
    const tl = gsap.timeline({
        default: {
            duration: 1,
            ease: "power2.inOut"
        },
        scrollTrigger: {
            trigger: ".page",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.1,
            markers: true
        }
    })

    // section1
    tl.to(bears.rotation, { y: Math.PI * 0.2 }, section);
    tl.to(bears.position, { x: -1.5 }, section);
    tl.to(plan.position, { y: -7.5 }, section);

    section++

    tl.to(bears.position, { y: - 1 }, section);
    tl.to(bears.rotation, { y: Math.PI * 0 }, section);
    tl.to(bears.position, { x: 0 }, section);
    tl.to(modelGroup.scale, { x: 1.4, y: 1.4, z: 1.4 }, section);
    tl.to(cloneGroup.scale, { x: 1.4, y: 1.4, z: 1.4 }, section);
    tl.to(plan.position, { y: 7.5 }, section);
    section++

    tl.to(bears.position, { y: - 1 }, section);
    tl.to(bears.rotation, { y: Math.PI * 0 }, section);
    tl.to(bears.position, { x: 0 }, section);
    tl.to(modelGroup.scale, { x: 1.4, y: 1.4, z: 1.4 }, section);
    tl.to(cloneGroup.scale, { x: 1.4, y: 1.4, z: 1.4 }, section);

    // tl.to(plan.position, { y: 10.5 }, section);
}