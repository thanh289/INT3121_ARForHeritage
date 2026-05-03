import { Viewer } from '@mkkellogg/gaussian-splats-3d';
import { artifacts } from './data.js';

const urlParams = new URLSearchParams(window.location.search);
const artifactId = urlParams.get('id');

const item = artifacts.find(a => a.id === artifactId);

if (item) {
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-category').innerText = item.category;
    document.getElementById('detail-desc').innerText = item.description;
    document.getElementById('detail-significance').innerText = item.significance;

    // Set download links
    document.getElementById('link-download-ply').href = item.ply;
    document.getElementById('link-download-glb').href = item.glb;

    // .glb
    const meshViewer = document.getElementById('mesh-view-container');
    meshViewer.src = item.glb;

    // .ply
    const splatContainer = document.getElementById('splat-view-container');

    // Khởi tạo Viewer
    const viewer = new Viewer({
        'rootElement': splatContainer,
        'cameraUp': [0, 1, 0],
        'initialCameraPosition': [0, 1, 2],
        'initialCameraLookAt': [0, 0, 0],
        'sharedMemoryForWorkers': false,
        'useBuiltInSplatLoader': true,
        'selfDrivenMode': true,
    });

    viewer.addSplatScene(item.ply, {
        'showLoadingUI': false,
        'position': [0, 0, 0],
        'rotation': [0, 0, 0],
        'scale': [1, 1, 1]
    }).then(() => {
        viewer.start();
        viewer.renderer.setClearColor(0xffffff, 1);
        const loading = splatContainer.querySelector('.loading-text');
        if (loading) loading.remove();
    })
        .catch((err) => {
            console.error("Chi tiết lỗi:", err);
            const loading = splatContainer.querySelector('.loading-text');
            if (loading) loading.innerText = "Error loading file!";
        });

    const btnSplat = document.getElementById('btn-show-splat');
    const btnMesh = document.getElementById('btn-show-mesh');

    btnSplat.addEventListener('click', () => {
        updateButtonStyles(btnSplat, btnMesh);
        splatContainer.style.display = 'block';
        meshViewer.style.display = 'none';
    });

    btnMesh.addEventListener('click', () => {
        updateButtonStyles(btnMesh, btnSplat);

        splatContainer.style.display = 'none';
        meshViewer.style.display = 'block';
    });

} else {
    document.querySelector('.container').innerHTML = `
        <div class="has-text-centered mt-6">
            <h1 class="title is-3">Artifact Not Found</h1>
            <a href="index.html" class="button">Return to Gallery</a>
        </div>
    `;
}

function updateButtonStyles(activeBtn, inactiveBtn) {
    activeBtn.classList.add('is-active');
    activeBtn.style.backgroundColor = 'var(--accent-red)';
    activeBtn.style.color = 'white';
    activeBtn.style.fontWeight = 'bold';

    inactiveBtn.classList.remove('is-active');
    inactiveBtn.style.backgroundColor = 'transparent';
    inactiveBtn.style.color = '#666';
    inactiveBtn.style.fontWeight = 'normal';
}