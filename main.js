import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiente suave
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5); // Posiciona a luz para iluminar o modelo
scene.add(directionalLight);

// Configuração básica do OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Loader para modelos GLTF/GLB
const loader = new GLTFLoader();
let mixer; // Declarando a variável do mixer para animações

// Array para armazenar os modelos carregados
const models = [];

// Função para carregar e posicionar modelos
function loadModel(path, position, rotation) {
    loader.load(
        path,
        (gltf) => {
            const model = gltf.scene;
            model.position.set(position.x, position.y, position.z); // Define a posição inicial
            scene.add(model);
            if(path != 'assets/ilha.glb') models.push({ model, direction: new THREE.Vector3(0, 0, 0.15)}); // Adiciona direção de movimento
            console.log(`Modelo ${path} carregado.`, gltf.animations);
            if(path == 'assets/fish.gib') model.rotation.set(0, 3.14, 0)

            // Configuração de animações (se houver)
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }
        },
        (xhr) => {
            console.log(`Progresso do carregamento de ${path}: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error(`Erro ao carregar o modelo ${path}:`, error);
        }
    );
}

// Carregar modelos com posições diferentes
loadModel('assets/ilha.glb', { x: 0, y: 0, z: 0 });
loadModel('assets/shark.glb', { x: -25, y: 2, z: -3 });
loadModel('assets/fish.glb', { x: 30, y: 1, z: 2 });

// Configurando o renderer e adicionando ao documento
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajustar o tamanho na mudança de tamanho da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Loop de animação
function animate(deltaTime) {
    // Atualiza as animações se o mixer existir
    if (mixer) mixer.update(deltaTime / 1000);

    // Movimenta os modelos
    models.forEach((entry, index) => {
        const { model, direction} = entry;

        // Atualiza posição com base na direção
        model.position.add(direction);

        // Inverte direção ao atingir limites
        //if (model.position.x > 20 || model.position.x < -20) direction.x *= -1; // Ajuste para peixe e tubarão
        if (model.position.z > 15 || model.position.z < -15){
            direction.z *= -1; // Limites ajustados para ambos
            model.rotation.y += 3.1415;
        }
    });

    renderer.render(scene, camera);
}

// Usa setAnimationLoop para animações consistentes
renderer.setAnimationLoop(animate);
