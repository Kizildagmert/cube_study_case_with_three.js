import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/TransformControls.js';

//değişkenler
let scene, camera, renderer, cube, secondCube, controls, transformControls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedObject = null;

const xSlider = document.getElementById('xSlider');
const ySlider = document.getElementById('ySlider');
const zSlider = document.getElementById('zSlider');
const xValue = document.getElementById('xValue');
const yValue = document.getElementById('yValue');
const zValue = document.getElementById('zValue');

const x2Slider = document.getElementById('x2Slider');
const y2Slider = document.getElementById('y2Slider');
const z2Slider = document.getElementById('z2Slider');
const x2Value = document.getElementById('x2Value');
const y2Value = document.getElementById('y2Value');
const z2Value = document.getElementById('z2Value');

const colorPicker1 = document.getElementById('colorPicker1');
const colorPicker2 = document.getElementById('colorPicker2');
const deleteBtn = document.getElementById('deleteBtn');

init();
createCube(0.5, 0.5, 0.5); //default cube 50cm
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  transformControls = new TransformControls(camera, renderer.domElement);
  scene.add(transformControls);

  transformControls.addEventListener('dragging-changed', e => {
    controls.enabled = !e.value;
  });

  xSlider.addEventListener('input', handleMainSliderChange);
  ySlider.addEventListener('input', handleMainSliderChange);
  zSlider.addEventListener('input', handleMainSliderChange);
  colorPicker1.addEventListener('input', updateCube);

  x2Slider.addEventListener('input', updateSecondCube);
  y2Slider.addEventListener('input', updateSecondCube);
  z2Slider.addEventListener('input', updateSecondCube);
  colorPicker2.addEventListener('input', updateSecondCube);

  deleteBtn.addEventListener('click', () => {
    if (secondCube) {
      scene.remove(secondCube);
      transformControls.detach();
      secondCube = null;
      document.getElementById("second-controls").style.display = "none";
    }
  });
  
  window.addEventListener('pointerdown', onClick, false);
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([cube, secondCube].filter(Boolean));
  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    transformControls.attach(selectedObject);
  }
}

function handleMainSliderChange() {
  xValue.textContent = (xSlider.value * 100).toFixed(0);
  yValue.textContent = (ySlider.value * 100).toFixed(0);
  zValue.textContent = (zSlider.value * 100).toFixed(0);
  updateCube();
}

//update modül 2
function updateSecondCube() {
  x2Value.textContent = (x2Slider.value * 100).toFixed(0);
  y2Value.textContent = (y2Slider.value * 100).toFixed(0);
  z2Value.textContent = (z2Slider.value * 100).toFixed(0);

  if (secondCube) {
    secondCube.geometry.dispose();
    secondCube.geometry = new THREE.BoxGeometry(
      parseFloat(x2Slider.value),
      parseFloat(y2Slider.value),
      parseFloat(z2Slider.value)
    );
    secondCube.material.color.set(colorPicker2.value);

    //cube 2 yi 1 e göre ayarlama
    const mainRightEdge = cube.position.x + cube.geometry.parameters.width / 2;
    const secondHalfWidth = parseFloat(x2Slider.value) / 2;
    const gap = 0.5;

    secondCube.position.x = mainRightEdge + gap + secondHalfWidth;
    secondCube.position.y = parseFloat(y2Slider.value) / 2;
    secondCube.position.z = 0;
  }
}

function createCube(width, height, depth) {
  if (cube) {
    cube.geometry.dispose();
    scene.remove(cube);
  }

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({ color: colorPicker1.value });
  cube = new THREE.Mesh(geometry, material);

  cube.position.x = width / 2;
  cube.position.y = height / 2;
  cube.position.z = 0;

  scene.add(cube);
}
//2.cube oluşturma
function addSecondModule(mainWidth) {
  const width = parseFloat(x2Slider.value);
  const height = parseFloat(y2Slider.value);
  const depth = parseFloat(z2Slider.value);

  if (secondCube) {
    secondCube.geometry.dispose();
    scene.remove(secondCube);
    transformControls.detach();
    secondCube = null;
  }

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({ color: colorPicker2.value });
  secondCube = new THREE.Mesh(geometry, material);

  const mainRightEdge = cube.position.x + mainWidth / 2;
  const secondHalfWidth = width / 2;
  const gap = 0.5;

  secondCube.position.x = mainRightEdge + gap + secondHalfWidth;
  secondCube.position.y = height / 2;
  secondCube.position.z = 0;

  scene.add(secondCube);
  document.getElementById("second-controls").style.display = "block";

  updateSecondCube();
}

function updateCube() {
  const width = parseFloat(xSlider.value);
  const height = parseFloat(ySlider.value);
  const depth = parseFloat(zSlider.value);

  createCube(width, height, depth);

  if (width > 0.6) {
    addSecondModule(width);
  } else if (secondCube) {
    scene.remove(secondCube);
    transformControls.detach();
    secondCube = null;
    document.getElementById("second-controls").style.display = "none";
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}