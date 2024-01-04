import './style.css'
import {
    AnimationMixer,
    BoxGeometry, Color,
    ConeGeometry, CylinderGeometry, DirectionalLight, Group,
    Mesh, MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera, PlaneGeometry, PointLight, Raycaster,
    Scene, SphereGeometry, TextureLoader, Vector2,
    WebGLRenderer
} from "three";
import GUI from 'lil-gui';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

const random = (min: number, max: number): number => {
    return min + Math.random() * (max - min)
}

const randomColor = () => {
    return new Color(Math.random(), Math.random(), Math.random());
}


// SIZES
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// PARAMETERS
const colorParameters = {
    color: 0xffffff,
}


// CANVAS
const canvas: any = document.querySelector('canvas.webgl')


// SCENE
const scene: Scene = new Scene()
const animations: Array<Function> = [];
const DirectionalSunLight = new DirectionalLight(new Color(0xffffff), 5);
DirectionalSunLight.position.set(15, 50, 25);
DirectionalSunLight.castShadow = true;
scene.add(DirectionalSunLight);

const rayCaster = new Raycaster();
const mouse = new Vector2();


// CAMERA
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 20
camera.position.y = 10
camera.position.x = 3
scene.add(camera)
const controls = new OrbitControls(camera, canvas)


// HOUSE
const houseGeometry = new BoxGeometry(2, 2, 2)
const houseMaterial = new MeshStandardMaterial({color: 0xF5F5DC})
const house = new Mesh(houseGeometry, houseMaterial)
house.castShadow = true;
scene.add(house)

// ROOF
const roofGeometry = new ConeGeometry(1.8, 1.5, 30);
const roofMaterial = new MeshStandardMaterial({color: 0x8B4513});
const roof = new Mesh(roofGeometry, roofMaterial);
roof.position.y = 1.7;
roof.castShadow = true;
scene.add(roof);

// DOOR
const doorGeometry = new PlaneGeometry(0.8, 1.2);
const doorMaterial = new MeshStandardMaterial({color: 0x8B4513});
const door = new Mesh(doorGeometry, doorMaterial);
door.position.z = 1.001;
door.position.y = -0.4;
door.castShadow = true;
scene.add(door);

const onClickDoor = (event: { clientX: number; clientY: number; }) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    rayCaster.setFromCamera(mouse, camera);
    const intersects = rayCaster.intersectObject(door);

    if (intersects.length > 0) {
        console.log('knock knock');
    }
}

// GROUND
const groundGeometry = new PlaneGeometry(30, 30);
const groundMaterial = new MeshStandardMaterial({color: 0x00ff00});
const ground = new Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

// BUSHES
const createBushes = (bushesNumber: number): void => {
    for (let i = 0; i < bushesNumber; i++) {
        const radius = random(0.5, 0.8);
        const bushGeometry = new SphereGeometry(radius, 10, 10);
        const bushMaterial = new MeshStandardMaterial({color: 0x006400});
        const bush = new Mesh(bushGeometry, bushMaterial);

        bush.position.x = random(-14, 14);
        bush.position.z = random(-14, 14);
        bush.position.y = -0.50;
        bush.castShadow = true;

        scene.add(bush);
    }
};

// FLOWERS
const createFlowers = (flowersNumber: number) => {
    const flowers = new Group();

    for (let i = 0; i < flowersNumber; i++) {
        const flower = new Group()
        flower.castShadow = true;

        const color = randomColor()

        const cylinderGeometry = new CylinderGeometry(0.2, 0.1, 0.5, 5)
        const cylinderMaterial = new MeshStandardMaterial({color: 0x006400})
        const cylinder = new Mesh(cylinderGeometry, cylinderMaterial)
        cylinder.position.y = -0.1
        flower.add(cylinder)

        const coneGeometry = new ConeGeometry(0.2, 0.3, 5)
        const coneMaterial = new MeshStandardMaterial({color: color, emissive: color, emissiveIntensity: 1});
        const cone = new Mesh(coneGeometry, coneMaterial);
        cone.position.y = 0.2;
        cone.rotation.x = Math.PI
        flower.add(cone);

        const pointLight = new PointLight(color, 1, 3);
        flower.add(pointLight);

        flower.position.x = random(-14, 14);
        flower.position.z = random(-14, 14);
        flower.position.y = -0.50;

        flowers.add(flower)
    }

    scene.add(flowers)
}

// BIRDS
const createBird = (birdURL: string) => {
    const birdGroup = new Group();

    const loader = new GLTFLoader();
    loader.load(birdURL, (gltf: { scene: any; animations: any[]; }) => {
        const bird = gltf.scene;
        bird.scale.set(0.02, 0.02, 0.02);
        bird.castShadow = true;
        bird.position.y = 5;
        birdGroup.add(bird)

        const animationMixer = new AnimationMixer(bird);
        const flyAnimation = gltf.animations[0];
        const flyAction = animationMixer.clipAction(flyAnimation);
        flyAction.play();

        animations.push(() => animationMixer.update(0.005));
    })

    scene.add(birdGroup);
    return birdGroup;
}

const flamingo = createBird('models/Flamingo.glb')
const parrot = createBird('models/Parrot.glb')

let flamingoRotation = Math.PI
let parrotRotation = Math.PI

const updateBirds = () => {
    flamingoRotation += 0.005;
    parrotRotation -= 0.005;

    const flamingoX = -10* Math.cos(flamingoRotation);
    const flamingoY = Math.sin(flamingoRotation);
    const flamingoZ = -10 * Math.sin(flamingoRotation);
    flamingo.position.x = flamingoX;
    flamingo.position.y = flamingoY;
    flamingo.position.z = flamingoZ;

    const parrotX = 4 * Math.cos(parrotRotation);
    const parrotY = 1.5 + Math.cos(parrotRotation);
    const parrotZ = 4 * Math.sin(parrotRotation);
    parrot.position.x = parrotX;
    parrot.position.y = parrotY;
    parrot.position.z = parrotZ;

    flamingo.rotation.y -= 0.005;
    parrot.rotation.y += 0.005;
    animations.forEach(animate => animate());
}



// TEXT
const fontLoader = new FontLoader();
fontLoader.load('/node_modules/three/examples/fonts/gentilis_regular.typeface.json', (font: any) => {
    const textGeometry = new TextGeometry('mathis.moreau', {
        font: font,
        size: 0.05,
        height: 0.01,
    });
    const textMaterial = new MeshBasicMaterial();
    const text = new Mesh(textGeometry, textMaterial);
    text.position.set(-0.2, 0.1, 1);
    scene.add(text);
});



// TEXTURES
const loadHouseTextures = () => {
    const textureLoader = new TextureLoader();
    const houseParams = {
        map: textureLoader.load('textures/house/color.jpg'),
        normalMap: textureLoader.load('textures/house/normal.jpg'),
        aoMap: textureLoader.load('textures/house/ambientOcclusion.jpg'),
        roughnessMap: textureLoader.load('textures/house/roughness.jpg')
    };

    for (const param in houseParams) {
        houseParams[param].onError = () => {
            console.error('Texture could not load:', param);
        };
    }

    houseMaterial.setValues(houseParams);
};

const loadDoorTextures = () => {
    const textureLoader = new TextureLoader();
    const doorParams = {
        map: textureLoader.load('textures/door/color.jpg'),
        alphaMap: textureLoader.load('textures/door/alpha.jpg'),
        normalMap: textureLoader.load('textures/door/normal.jpg'),
        displacementMap: textureLoader.load('textures/door/height.jpg'),
        roughnessMap: textureLoader.load('textures/door/roughness.jpg'),
        metalnessMap: textureLoader.load('textures/door/metalness.jpg'),
        aoMap: textureLoader.load('textures/door/ambientOcclusion.jpg'),
    };

    for (const param in doorParams) {
        doorParams[param].onError = () => {
            console.error('Texture could not load:', param);
        };
    }

    doorMaterial.setValues(doorParams);
};

const loadTextures = () => {
    loadHouseTextures()
    loadDoorTextures()
}


// RENDERER
const renderer = new WebGLRenderer({
    canvas: canvas,
})

renderer.setClearColor(0x0077be)
renderer.shadowMap.enabled = true;

// WINDOW
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const newWidth = window.innerWidth;
    const newHeight = window.innerWidth / aspect;

    renderer.setSize(newWidth, newHeight);
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onClickDoor);


// DEBUGGER
const gui = new GUI();

const houseFolder = gui.addFolder('House');
houseFolder.add(house, 'visible').name('Visible')
houseFolder.add(house.position, 'x', -3, 3).name('Position X');
houseFolder.add(house.position, 'y', -3, 3).name('Position Y');
houseFolder.add(house.position, 'z', -3, 3).name('Position Z');
houseFolder.add(house.scale, 'x', 0.1, 2).name('Scale X');
houseFolder.add(house.scale, 'y', 0.1, 2).name('Scale Y');
houseFolder.add(house.scale, 'z', 0.1, 2).name('Scale Z');
houseFolder.addColor(colorParameters, 'color').onChange(() => {
    house.material.color.set(colorParameters.color);
});

const roofFolder = gui.addFolder('Roof');
roofFolder.add(roof, 'visible').name('Visible')
roofFolder.add(roof.position, 'x', -3, 3).name('Position X');
roofFolder.add(roof.position, 'y', -3, 3).name('Position Y');
roofFolder.add(roof.position, 'z', -3, 3).name('Position Z');
roofFolder.add(roof.scale, 'x', 0.1, 2).name('Scale X');
roofFolder.add(roof.scale, 'y', 0.1, 2).name('Scale Y');
roofFolder.add(roof.scale, 'z', 0.1, 2).name('Scale Z');
roofFolder.addColor(colorParameters, 'color').onChange(() => {
    roof.material.color.set(colorParameters.color);
});

const doorFolder = gui.addFolder('Door');
doorFolder.add(door, 'visible').name('Visible')
doorFolder.add(door.position, 'x', -3, 3).name('Position X');
doorFolder.add(door.position, 'y', -3, 3).name('Position Y');
doorFolder.add(door.position, 'z', -3, 3).name('Position Z');
doorFolder.addColor(colorParameters, 'color').onChange(() => {
    door.material.color.set(colorParameters.color);
});

const groundFolder = gui.addFolder('Ground');
groundFolder.add(ground, 'visible').name('Visible')
groundFolder.add(ground.position, 'x', -3, 3).name('Position X');
groundFolder.add(ground.position, 'y', -3, 3).name('Position Y');
groundFolder.add(ground.position, 'z', -3, 3).name('Position Z');
groundFolder.add(ground.scale, 'x', 0.1, 2).name('Scale X');
groundFolder.add(ground.scale, 'y', 0.1, 2).name('Scale Y');
groundFolder.add(ground.scale, 'z', 0.1, 2).name('Scale Z');
groundFolder.addColor(colorParameters, 'color').onChange(() => {
    ground.material.color.set(colorParameters.color);
});



// RENDERING
onWindowResize();

createBushes(15)
createFlowers(10)

loadTextures()

const update = () => {
    updateBirds();
    renderer.render(scene, camera)
    controls.update();

    window.requestAnimationFrame(update)
}

update()