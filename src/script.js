import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import CANNON from 'cannon'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')
// texts 
const text = document.querySelectorAll('.text p')
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



// physics naterial 
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
const defaultMaterial = new CANNON.Material('default')

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    // concreteMaterial,
    // plasticMaterial,
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)


// Text 
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
const coloringMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
// Font 
const create3DText = (font) => {
    text.forEach((item, index) => {
        const textGeometry = new TextGeometry(
            item.textContent,
            {
                font: font,
                size: 0.34,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.03,
                bevelOffset: 0,
                bevelSegments: 1
            }
        )
        const text = new THREE.Mesh(textGeometry, coloringMaterial)
        const hight = -(-index * -0.3) + 0.5;
        textGeometry.center();
        textGeometry.translate(0, hight, 0)
        textGeometry.computeBoundingBox()
        textGeometry.size = textGeometry.boundingBox.getSize(new THREE.Vector3());
        scene.add(text)

        // cannon
        const box = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3().copy(textGeometry.size)),
            position: new CANNON.Vec3(0, hight - 0.2, 0),
            material: defaultMaterial
        });
        // text.position.copy(box.position)
        world.addBody(box);
    })

}
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    create3DText
)
world.addContactMaterial(concretePlasticContactMaterial)
// object
const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3, 1, 1),
    coloringMaterial)
plan.rotation.x = - Math.PI * 0.5
// plan.position.y = - 0.5
plan.receiveShadow = true
scene.add(plan)
// physics world 
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.material = defaultMaterial
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

/**
 * Utils
 */
const objectsToUpdate = []
const createSphere = (radius, position) => {
    // shpere
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 20, 20),
        coloringMaterial
    )
    sphere.castShadow = true
    sphere.position.copy(position)
    scene.add(sphere)
    // sphere.position.y = 0.2
    // physics world
    const sphereShape = new CANNON.Sphere(radius)
    const sphereBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: sphereShape,
        material: defaultMaterial

    })
    sphereBody.position.copy(position)
    // sphereBody.applyLocalForce(new CANNON.Vec3(60, 0, 0), new CANNON.Vec3(0, 0, 0))
    world.addBody(sphereBody)

    // Save in objects to update
    objectsToUpdate.push({
        mesh: sphere,
        body: sphereBody
    })

}


debugObject.createSphere = () => {
    createSphere(0.5, { x: 0, y: 3, z: 0 })
}

gui.add(debugObject, 'createSphere')



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
    // sphereBody.applyForce(new CANNON.Vec3(- 0, 0, 0.1), sphereBody.position)

    world.step(1 / 60, deltaTime, 3)
    // sphegure.position.x = sphereBody.position.x
    // sphere.position.y = sphereBody.position.y
    // sphere.position.z = sphereBody.position.z
    // sphere.position.copy(sphereBody.position)
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
    }
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()