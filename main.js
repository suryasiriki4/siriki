import gsap from "gsap";
import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

import * as dat from 'dat.gui';


// mouse object
const mouse = {
    x: undefined,
    y: undefined
};

const gui = new dat.GUI;
const world = {
    plane:{
        width: 400,
        height: 400,
        widthFragments: 50,
        heightFragments: 50,
    }
}
gui.add(world.plane, 'width', 1, 500).
onChange(generatePlane);

// gui for changing the height
gui.add(world.plane, 'height', 1, 500).
onChange(generatePlane);

gui.add(world.plane, 'widthFragments', 1, 100).
onChange(generatePlane);

gui.add(world.plane, 'heightFragments', 1, 100).
onChange(generatePlane);

// generate the plane with jaggies
function generatePlane() {
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry( world.plane.width, world.plane.height, world.plane.widthFragments, world.plane.heightFragments);

    // vertex coordinates randamization.
    const array_of_plane_positions = plane.geometry.attributes.position.array;
    const randomValues = [];
    for (let i = 0; i < array_of_plane_positions.length; i ++)
    {

        if (i%3 == 0)
        {
            const x = array_of_plane_positions[i];
            const y = array_of_plane_positions[i+1];
            const z = array_of_plane_positions[i+2];

            array_of_plane_positions[i] = x + (Math.random()-0.5)*3;
            array_of_plane_positions[i+1] = y + (Math.random()-0.5)*3;
            array_of_plane_positions[i+2] = z + (Math.random()-0.5)*3;
        }

        randomValues.push(Math.random() * Math.PI * 2); 
    }

    plane.geometry.attributes.position.randomValues = 
        randomValues;
    plane.geometry.attributes.position.originalPosition =
        plane.geometry.attributes.position.array;

    // creating a new colors array
    const colors = [];
    for (let i = 0; i < plane.geometry.attributes.position.count; i++)
    {
        colors.push(0, .19, .4);
    }
    plane.geometry.setAttribute('color', new THREE.BufferAttribute(
        new Float32Array(colors),
        3
    ));
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    innerWidth/innerHeight,
    0.1,
    1000);
const renderer = new THREE.WebGLRenderer(
);

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthFragments,
    world.plane.heightFragments);
const planeMaterial = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide,
                                                    flatShading: THREE.FlatShading,
                                                    vertexColors: true} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
scene.add( plane );

generatePlane();

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

const light = new THREE.DirectionalLight(
    0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(
    0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

let frame = 0;
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);
    frame += 0.01;

    const {array,
            originalPosition,
            randomValues} = plane.geometry.attributes.position;
    for (let i = 0; i < array.length; i+=3)
    {
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.02;
        array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.01;
    }

    plane.geometry.attributes.position.needsUpdate = true;

    const intersects = raycaster.
                        intersectObject(plane);
    
    if (intersects.length > 0) {
        const {color} = intersects[0].object.geometry.attributes;

        const intialColor = {
            r: 0,
            g: .19,
            b: .4,
        }

        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1,
        }

        gsap.to(hoverColor,{
            r: intialColor.r,
            g: intialColor.g,
            b: intialColor.b,
            duration: 1,
            onUpdate: () => {
                // vertex 1
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);

                // vertex 2
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);

                // vertex 3
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);

                color.needsUpdate = true;
            }
        })
    }
}

animate();


// adding hover effect

addEventListener('mousemove', (event) => {
    mouse.x = (event.x / innerWidth) * 2 - 1;
    mouse.y = -(event.y / innerHeight) * 2 + 1;
});