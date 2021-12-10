import * as THREE from '/src/threejs/three.module.min.js';


let isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = 0, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;


// function updateParameters() {
//     lon = DATA.streetView[sessionStorage.getItem('streetViewRedirect')].model2image[0].firstEntryPoint;
// }

// Camera configuration
const camera = new THREE.PerspectiveCamera(
    100, 
    window.innerWidth / window.innerHeight, 
    1, 
    1100
);
camera.position.set(10, 10, 10);


// Window resize Handling
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();


}
window.addEventListener('resize', onWindowResize);

//Scene
const scene = new THREE.Scene();

// MapControls
// const controls = new OrbitControls(camera, renderer.domElement);


function createSphere() {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(- 1, 1, 1);

    var texture = new THREE.TextureLoader().load('/assets/images/panoramaMain.PNG')

    const material = new THREE.MeshBasicMaterial({ map: texture });

    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
    console.log('Sphere successfully created')
}


// function createArrow() {
//     // var planeDocument = document.getElementById('plane');

//     var map = new THREE.TextureLoader().load( '/src/assets/x-angle.png' );


//     const geometry = new THREE.PlaneGeometry( 1, 1 );
//     const material = new THREE.MeshBasicMaterial( {map: map, opacity: 0.5} );
//     const plane = new THREE.Mesh( geometry, material );
//     scene.add( plane );
//     // scene.add( new THREE.AxisHelper( 100 ) );

    

//     plane.position.set(30, 0, 8);
//     plane.scale.set(3, 3, 3);
//     plane.background = (0x000000, .1);
    
//     plane.rotateX(Math.PI / -2);
    
//     plane.userData.redirect = true;
//     plane.userData.name = 1;


//     // domEvents.addEventListener(plane, 'mouseover', function(event) {
//     //     new_material.color = mesh.material.color;
//     //     mesh.material = new_material;
//     //     return renderer.render(scene, camera);
//     //   });
//     //   return domEvents.addEventListener(plane, 'mouseout', function(event) {
//     //     mesh.material = materials[mesh.uuid];
//     //     return renderer.render(scene, camera);
//     //   });

// }


// const raycaster = new THREE.Raycaster();
// const clickMouse = new THREE.Vector2();
// var redirect = new THREE.Object3D();

// var arrowRedirect = function (event) {
//     // calculate mouse position in normalized device coordinates
//     // (-1 to +1) for both components

//     clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

//     // update the picking ray with the camera and mouse position
//     raycaster.setFromCamera(clickMouse, camera);

//     // calculate objects intersecting the picking ray
//     const found = raycaster.intersectObjects(scene.children);

//     if (found.length > 0 && found[0].object.userData.redirect) {
//         redirect = found[0].object
//         console.log(`found clickable ${redirect.userData.name}`);

//         let progress = {};
//         progress.fov = camera.fov;


//         gsap.to(progress, {
//             duration: .5,
//             fov: 45,
//             onUpdate: function () {
//                 //   camera.lookAt(0,0,0);
//                 camera.updateProjectionMatrix();
//                 camera.fov = progress.fov;

//                 // renderer.render(scene, camera);
//             },
//             onComplete: function () {
//                 sessionStorage.setItem('image2image', sessionStorage.getItem('streetViewRedirect'));
//                 createSphere();
//               }
//         });
//     }

// };

// window.addEventListener('mousemove', arrowRedirect, false);

// var i = 1;
// function streetViewRedirect() {
//     while (i < 2) {
//         console.log('streetViewRedirect established');
//         window.addEventListener('click', arrowRedirect, false);
//         i++;
//       }
    
// }




document.body.style.touchAction = 'none';
document.addEventListener('pointerdown', onPointerDown);

document.addEventListener('wheel', onDocumentMouseWheel);


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

    camera.fov = THREE.MathUtils.clamp(fov, 30, 100);

    camera.updateProjectionMatrix();

}


function update() {

    // if (isUserInteracting === false) {

    //     lon += 0.01;

    // }

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(x, y, z);

    // Sets the eventlistener for image to image redirect
    streetViewRedirect();

    // renderer.render(scene, camera);

}

createSphere();



export { scene, camera, update, createSphere, updateParameters };