import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 5,
  spin: 0.7,
  insideColor: '#ff6030',
  outsideColor: '#2349a9',
  pointiness: 1.5,
  branchRadius: 0.9,
  colorRandomness: 0.25,
}

let geometry
let material
let points

const randomOffset = (radius) => {
  return (
    parameters.branchRadius *
    Math.random() *
    Math.exp(-((radius / parameters.radius) ** 2) * parameters.pointiness) *
    (Math.random() < 0.5 ? 1 : -1)
  )
}

const generateGalaxy = () => {
  if (points !== undefined) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Position
    // const radius = Math.random() * parameters.radius
    const radius =
      Math.random() * Math.exp(-(Math.random() ** 2)) * parameters.radius
    const spinAngle =
      parameters.spin * Math.PI * 2 * (radius / parameters.radius)
    const branchAngle =
      ((i % parameters.branches) * Math.PI * 2) / parameters.branches

    // const offsetRadius = randomOffset(radius)
    // const offsetAngle = Math.random() * Math.PI * 2

    // const randomX =
    //   Math.cos(offsetAngle) * offsetRadius * Math.cos(spinAngle + branchAngle)
    // const randomY = Math.sin(offsetAngle) * offsetRadius
    // const randomZ =
    //   Math.cos(offsetAngle) * offsetRadius * Math.sin(spinAngle + branchAngle)

    const offsetRadius = randomOffset(radius)
    // const offsetRadius = Math.random() * (1 - radius / parameters.radius)
    const offsetAngle1 = Math.random() * Math.PI * 2
    const offsetAngle2 = Math.random() * Math.PI * 2

    const horizontalOffset = offsetRadius * Math.cos(offsetAngle2)
    const verticalOffset = offsetRadius * Math.sin(offsetAngle2)
    const randomX = horizontalOffset * Math.cos(offsetAngle1)
    const randomY = verticalOffset
    const randomZ = horizontalOffset * Math.sin(offsetAngle1)

    vertices[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
    vertices[i3 + 1] = randomY
    vertices[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

    // Color
    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3] =
      mixedColor.r + (Math.random() - 0.5) * 2 * parameters.colorRandomness
    colors[i3 + 1] =
      mixedColor.g + (Math.random() - 0.5) * 2 * parameters.colorRandomness
    colors[i3 + 2] =
      mixedColor.b + (Math.random() - 0.5) * 2 * parameters.colorRandomness
    if (colors[i3] < 0) {
      colors[i3] = 0
    } else if (colors[i3] > 1) {
      colors[i3] = 1
    }
    if (colors[i3 + 1] < 0) {
      colors[i3 + 1] = 0
    } else if (colors[i3 + 1] > 1) {
      colors[i3 + 1] = 1
    }
    if (colors[i3 + 2] < 0) {
      colors[i3 + 2] = 0
    } else if (colors[i3 + 2] > 1) {
      colors[i3 + 2] = 1
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()

gui
  .add(parameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'spin')
  .min(-2)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'branchRadius')
  .min(0)
  .max(1.5)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'pointiness')
  .min(0.01)
  .max(3)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'colorRandomness')
  .min(0)
  .max(1)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
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
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
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

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
