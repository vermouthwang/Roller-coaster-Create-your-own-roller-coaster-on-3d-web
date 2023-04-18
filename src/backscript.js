//fog
const fog = new THREE.Fog("#262837",1,15)
scene.fog= fog


//const dooralphatexture = textureLoader.load('/textures/door/alpha.jpg',)
const doorheighttexture = textureLoader.load('/textures/door/height.jpg',)
const doormetalnesstexture = textureLoader.load('/textures/door/metalness.jpg',)
const doornormaltexture = textureLoader.load('/textures/door/normal.jpg',)
const doorroughtexture = textureLoader.load('/textures/door/roughness.jpg',)
const doorambienttexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')

const brickscolortexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksnormaltexture = textureLoader.load('/textures/bricks/normal.jpg',)
const bricksroughtexture = textureLoader.load('/textures/bricks/roughness.jpg',)
const bricksambienttexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')

const grasscolortexture = textureLoader.load('/textures/grass/color.jpg')
const grassnormaltexture = textureLoader.load('/textures/grass/normal.jpg',)
const grassroughtexture = textureLoader.load('/textures/grass/roughness.jpg',)
const grassambienttexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')

grasscolortexture.repeat.set(8,8)
grassambienttexture.repeat.set(8,8)
grassnormaltexture.repeat.set(8,8)
grassroughtexture.repeat.set(9,8)

grasscolortexture.wrapS = THREE.RepeatWrapping
grassambienttexture.wrapS = THREE.RepeatWrapping
grassnormaltexture.wrapS = THREE.RepeatWrapping
grassroughtexture.wrapS = THREE.RepeatWrapping

grasscolortexture.wrapT = THREE.RepeatWrapping
grassambienttexture.wrapT = THREE.RepeatWrapping
grassnormaltexture.wrapT = THREE.RepeatWrapping
grassroughtexture.wrapT = THREE.RepeatWrapping


const y1 = 2.5
const walls= new THREE.Mesh(
    new THREE.BoxGeometry(4,y1,4),
    new THREE.MeshStandardMaterial({
        map: brickscolortexture,
        normalMap: bricksnormaltexture,
        aoMap: bricksambienttexture,
        roughnessMap: bricksroughtexture
    })
)

//roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5,1,4),
    new THREE.MeshStandardMaterial({color:'#b35f45'})
)
roof.position.y = 3
roof.rotation.y = Math.PI * 0.25
house.add(roof)

//door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2,2.2,100,100),
    new THREE.MeshStandardMaterial({
        map: doorcolortexture,
        transparent : true,
        alphaMap: dooralphatexture,
        aoMap: doorambienttexture,
        displacementMap: doorheighttexture,
        displacementScale:0.1,
        normalMap: doornormaltexture,
        metalnessMap: doormetalnesstexture,
        roughnessMap: doorroughtexture
    })
)
door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array,2)
)

door.position.y = 1
door.position.z = 2+0.01
house.add(door)

//bushes
const bushgeometry = new THREE.SphereGeometry(1,16,16)
const bushmaterial = new THREE.MeshStandardMaterial({color:'#89c854'})

for(let i =0; i < 5; i++){
    const bush = new THREE.Mesh(bushgeometry,bushmaterial)

    const scale = Math.random()*0.5
    bush.scale.set(scale,scale,scale)
    bush.position.x = (Math.random()-0.5)*3
    bush.position.z = 2.5
    bush.position.y = scale/2
    bush.castShadow = true
    house.add(bush)
}

//graves
const graves = new THREE.Group()
scene.add(graves)
const gravegeometry = new THREE.BoxGeometry(0.6,0.8,0.2)
const gravematerial = new THREE.MeshStandardMaterial({color:'#b2b6b1'})
for (let i = 0; i<50; i++){
    const angle = Math.random()*Math.PI*2
    const radius = Math.random()*(9.5-4)+4
    const x = Math.sin(angle)*radius
    const z = Math.cos(angle)*radius

    const grave = new THREE.Mesh(gravegeometry,gravematerial)
    grave.rotation.y = Math.random()-0.5
    grave.rotation.z = Math.random()*0.8-0.3
    grave.position.set(x,0.2,z)
    grave.castShadow = true
    graves.add(grave)
    

}
// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
        map: grasscolortexture,
        aoMap:grassambienttexture,
        normalMap:grassnormaltexture,
        roughnessMap: grassroughtexture 
    })
)
floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array,2)
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.receiveShadow = true
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.12)
console.log("add")
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)



const moonLight = new THREE.DirectionalLight('#ffffff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)







/**
 * Line Group
 */
 const lines = new THREE.Group()
 scene.add(lines)
 
 const pipeSpline = new THREE.CatmullRomCurve3( [
     new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
     new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),])
 
 lines.add(pipeSpline)



 // gui.add(controls, 'enabled')
// gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)



// /**
//  * shadow
//  */
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap