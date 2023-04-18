import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Scene } from 'three'

/**
 * Base
 */
//const gui = new dat.GUI()
var Line = []
var new_line = []
let canvas, scene, sizes, cursor, axesHelper
let draw, newline_create, newline_finished
let curveObject
let camera, controls, renderer
let splineCamera
let parent
let mesh
let cubeGeometry
let tube
let extrudePath
let camera_point
let cameraEye
let support_geo
let support
let support_par = new THREE.Object3D();
let testcurve
let curve
let roller = false
let r_counter = 0

init()
set_camera()
drawing()
set_render()

console.log("df")
/**Camera
 * 
 */
// Base camera
function set_camera(){
    camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 4
    camera.rotation.set(0,0,0)
    console.log(camera)
    scene.add(camera)
}
console.log("main changes")

/** Controls
  * 
 */
controls = new OrbitControls(camera, canvas)
controls.enabled = false
controls.enableDamping = false

/** initiate
 * 
 */
function init(){
    //canvas
    canvas = document.querySelector('canvas.webgl')
    //scene
    scene = new THREE.Scene()

    //window sizes
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    window.addEventListener('resize', () =>
    {
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

    //cursor 
    cursor = {x:0,y:0}
    window.addEventListener('mousemove', (event) =>
    {
        cursor.x = event.clientX / sizes.width - 0.5
        cursor.y = event.clientY / sizes.height - 0.5
    })

    axesHelper = new THREE.AxesHelper(3)
    axesHelper.position.y = 2
    scene.add(axesHelper)

    //Key C pressed for turn on or off the orbit control(when turn on, the drawing function will be unabled)
    window.addEventListener('keypress',(event)=>
    {   var name = event.key
        var code = event.code
        if (name === 'c'){
            if (controls.enabled == false) {
                controls.enabled = true
            }
            else{
                controls.enabled = false
                camera.position.x = 0
                camera.position.y = 0
                camera.position.z = 4
                camera.rotation.set(0,0,0)
            }}
    })

    window.addEventListener('keypress',(event)=>
    {   var name = event.key
        var code = event.code
        if (name === 'r'){
            r_counter += 1
            if (roller == false) {
                roller = true
                Rback.classList.add('visible')
            }
            else{
                roller = false
            }}
    })

    //parent group
    parent = new THREE.Object3D();
    scene.add( parent );

    //splinecamera & camerahelper
    splineCamera = new THREE.PerspectiveCamera( 80, sizes.width / sizes.height, 0.005, 1000 );
    parent.add( splineCamera );
    //console.log(splineCamera)
    var cameraHelper = new THREE.CameraHelper( splineCamera );
    scene.add( cameraHelper );
    cameraHelper.visible = false

    //debug splinecamera
    cameraEye = new THREE.Mesh( new THREE.SphereGeometry( 0.08 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
    cameraEye.position.y = -5
    scene.add( cameraEye );

    scene.add( new THREE.AmbientLight( 0x443380, 0.6 ) );

	const dirLight1 = new THREE.DirectionalLight( 0xffddcc, 0.2 )
	dirLight1.position.set( 0, 2, 1 );
	scene.add( dirLight1 )

    const dirLight2 = new THREE.DirectionalLight( 0xffddcc, 0.7 )
	dirLight2.position.set( -1, 1, 0 );
	scene.add( dirLight2 )
    
    const cubeTextureLoader = new THREE.CubeTextureLoader()
	const environmentMap = cubeTextureLoader.load([
		'/textures/environ/dark-s_px.jpg',
		'/textures/environ/dark-s_nx.jpg',
		'/textures/environ/dark-s_py.jpg',
		'/textures/environ/dark-s_ny.jpg',
		'/textures/environ/dark-s_pz.jpg',
		'/textures/environ/dark-s_nz.jpg'
	])
	scene.background = environmentMap

    const textureLoader = new THREE.TextureLoader();
	// alphatexture = textureLoader.load( './textures/bricks/color.jpg' )

    const loader1 = new GLTFLoader()
    loader1.load( './models/model.gltf',( gltf )=>{
        //console.log(gltf.scene.children)
        mesh = gltf.scene.children[0]
        mesh.material = new THREE.MeshToonMaterial()
		mesh.material.roughnesss = 0.01
		mesh.material.metalness = 0.1
        scene.add( mesh )

		mesh.position.y = 0
        // mesh2.position.y = -25
		mesh.position.x = -1.5
        // mesh2.position.x = 0
		mesh.position.z = -25

        // mesh2.position.z = 0
		mesh.rotation.y -= 0
		mesh.scale.set(0.02,0.02,0.02)

	} );
    
    const fog = new THREE.Fog('#221844', 1, 60)
	scene.fog = fog	

}
/** roller coaster view
 * This function will update the position animation of the splineCamera
 */
function render(thecurve){
    
    const time = Date.now();
	const looptime = 20 * 1000;
	const t = ( time % looptime ) / looptime;
    camera_point = thecurve.getPointAt(t);
    splineCamera.position.x = camera_point.x
    splineCamera.position.y = camera_point.y
    splineCamera.position.z = camera_point.z
    cameraEye.position.x = camera_point.x
    cameraEye.position.y = camera_point.y
    cameraEye.position.z = camera_point.z
    
    //let the camera look ahead
    var lookpoint = thecurve.getPointAt( ( t + 1.1 / thecurve.getLength() ) % 1);
    splineCamera.lookAt(lookpoint)
    //console.log(splineCamera.lookAt)

}

/** Add a tube of the drawing line
 * 
 */
function addTube(thecurve){
    extrudePath = thecurve
    console.log(extrudePath)
    cubeGeometry = new THREE.TubeGeometry(extrudePath, 400, 0.2, 6, true)
    const material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
    material.wireframe = true
    material.wireframeLinewidth = 3
    console.log(cubeGeometry)
    tube = new THREE.Mesh (cubeGeometry,material)
    scene.add(tube)
}

/** create the support collums of roller coaster
 * 
 */
function addsupport(sup_point,height){
    support_geo = new THREE.BoxGeometry( 0.05, height, 0.05 );
    const material_sup = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
    material_sup.wireframe = true
    support = new THREE.Mesh( support_geo, material_sup );
    support.position.set (sup_point.x,sup_point.y - 0.5*height -0.25,sup_point.z)
    //console.log(support)
    support_par.add( support );
}

/** Drawing 
 * this part contain a eventlistener of pointer up and down which detect 
 * if the user is creating a new line
 * var newlin_create: the varible used to detect if a new line is created by the user
 * Line: a temporary list of point
 * new_line : a list of ultimate line point x.y [cursor.x, cursor.y]
*/
function drawing(){
    draw = false
    newline_create = false
    newline_finished = false

    window.addEventListener('pointerdown', () =>
    {
        draw = true
    })
    window.addEventListener('pointerup', () =>
    {
        draw = false
    })
}

function record_drawing(){
    if (draw == true && controls.enabled == false){ 
        Line.push([(cursor.x)*20, (cursor.y)*(-10)])
        newline_create = true
    }
    if (draw == false){
        if (newline_create == true){
            new_line = Line
            newline_finished = true
            // console.log(new_line)
        }
        newline_create = false
        Line = []
    }
}

/** Create CatmullRomCurve
 * this part create a curveObject by using catmullromcurve algorithm
 * the curve is constrainedly closed 
 * the curve is represent by lists of points and is visualized by points geometry
 */
function create_curve(){
    //create lists of vector 3 (x,y,z)
    var catcurve_list = []
    var z 
    for (let i = 0; i < new_line.length; i++){
        z = Math.cos(i/8) *5 - 15
        catcurve_list.push(new THREE.Vector3(new_line[i][0],new_line[i][1],z))
    }
    //console.log(catcurve_list)
    const curve = new THREE.CatmullRomCurve3(catcurve_list);
    curve.closed = true
    //segmentation of the curve = 50
    if (new_line.length <= 100){
        var points = curve.getPoints(100);
    }
    else{
        var points = curve.getPoints(Math.round(new_line.length/1.2));
    }
    //create visualized geometry by points
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    // Create the final object to add to the scene
    curveObject = new THREE.Line( geometry, material );
    curveObject.visible = false
    scene.add(curveObject)
    //curve for camera
    testcurve = curve
    //add tube
    addTube(curve)
    //add support
    for (let i=0; i <=1; i += 0.07) {
        var sup_point = curve.getPoint(i)
        var cube_height = 3.5 + sup_point.y
        addsupport(sup_point,cube_height)
        scene.add(support_par)
    }
}

/** Renderer
 * 
 */
 function set_render(){
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor('#262837')
}

/** UI
 * 
 */
let question = document.querySelector('.point-0')
let Rkey = document.querySelector('.point-1')
let Rback = document.querySelector('.point-2')

/** Animate
 * 
 */
// const clock = new THREE.Clock()
const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    //record drawing cursorx and cursory as list
    record_drawing()
    //create the curveobjct
    if (newline_finished == true){
        question.classList.remove('visible')
        Rkey.classList.add('visible')
        //clean the previous line if existed
        if(curveObject == undefined){
            create_curve()
        }
        else{
            scene.remove(curveObject)
            scene.remove(tube)
            scene.remove(support_par)
            support_par = new THREE.Object3D();
            create_curve()
        }
    }
    newline_finished = false
    
    if (r_counter%2 == 0){
        console.log(r_counter)
        Rback.classList.remove('visible')    
    }
    //update splinecamera route
    if (testcurve != undefined){
        curve = testcurve
    }
    //just in case at the begining there is no curve which might lead to "undefined"
    if (curve != undefined){
        render(curve)
    }

    // Render
    renderer.render(scene, roller === true ? splineCamera : camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()