import * as THREE from './three.module.min.js';

let camera, scene, renderer;

let isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = -56, onPointerDownLon = 0,
    lat = -20, onPointerDownLat = 0,
    phi = 0, theta = 0;

const binaryClock = document.getElementById('onProgressContainer');
const container = document.getElementById('container');

init();
animate();

function init() {

    

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1100);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x152024);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(- 1, 1, 1);

    const manager = new THREE.LoadingManager();
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        binaryClock.classList.add('show');
    
    };
    
    manager.onLoad = function () {
    
        console.log( 'Loading complete!');
        binaryClock.classList.add('hide');
        binaryClock.classList.remove('show');
        
        container.classList.remove('hide');
    
    };
    
    
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        binaryClock.classList.add('show');
    
    };
    
    manager.onError = function ( url ) {
    
        console.log( 'There was an error loading ' + url );
    
    };
    
    const loader = new THREE.TextureLoader( manager );
    loader.load( './assets/images/panoramaMain.PNG', function ( texture ) {

        const material = new THREE.MeshBasicMaterial({ map: texture });

        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
    
    } );


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    container.style.touchAction = 'none';
    container.addEventListener('pointerdown', onPointerDown);

    document.addEventListener('wheel', onDocumentMouseWheel);

    //

    document.addEventListener('dragover', function (event) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    });

    document.addEventListener('dragenter', function () {

        document.body.style.opacity = 0.5;

    });

    document.addEventListener('dragleave', function () {

        document.body.style.opacity = 1;

    });

    document.addEventListener('drop', function (event) {

        event.preventDefault();

        const reader = new FileReader();
        reader.addEventListener('load', function (event) {

            material.map.image.src = event.target.result;
            material.map.needsUpdate = true;

        });
        reader.readAsDataURL(event.dataTransfer.files[0]);

        document.body.style.opacity = 1;

    });

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event) {

    if (event.isPrimary === false) return;

    isUserInteracting = true;

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;

}

function onPointerUp() {

    if (event.isPrimary === false) return;

    isUserInteracting = false;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {

    const fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, 30, 90);

    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame(animate);
    update();

}

function update() {

    // if (isUserInteracting === false) {

    //     lon += 0.1;

    // }

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(x, y, z);

    renderer.render(scene, camera);

}

