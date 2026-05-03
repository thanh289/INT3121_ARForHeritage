import { Viewer } from '@mkkellogg/gaussian-splats-3d';
import { artifacts } from './data.js';

const urlParams = new URLSearchParams(window.location.search);
const artifactId = urlParams.get('id');
const item = artifacts.find(a => a.id === artifactId);

let currentUtterance = null;

function cleanName(name) {
    return name.replace(/\n/g, ' ');
}

function buildNarrationText(artifact) {
    return `${cleanName(artifact.name)}. Category: ${artifact.category}. ${artifact.description} Significance: ${artifact.significance}`;
}


function getDetailPageUrl(itemId) {
    const url = new URL('detail.html', window.location.href);
    url.searchParams.set('id', itemId);
    return url.href;
}

function getQrImageUrl(targetUrl, size = 720) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}`;
}

async function downloadQrCode(qrImageUrl, fileName) {
    try {
        const response = await fetch(qrImageUrl);

        if (!response.ok) {
            throw new Error(`QR image request failed: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error('Cannot download QR image directly:', err);
        window.open(qrImageUrl, '_blank', 'noopener');
    }
}

function warmUpVoices() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
}

function getPreferredFemaleVoice() {
    if (!('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));

    const femaleVoiceKeywords = [
        'female',
        'zira',
        'samantha',
        'victoria',
        'karen',
        'moira',
        'tessa',
        'ava',
        'allison',
        'susan',
        'google us english',
        'google uk english female'
    ];

    const maleVoiceKeywords = [
        'male',
        'david',
        'mark',
        'alex',
        'daniel',
        'fred',
        'tom',
        'george',
        'aaron'
    ];

    return englishVoices.find(v =>
        femaleVoiceKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    ) || englishVoices.find(v =>
        !maleVoiceKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    ) || voices[0] || null;
}

if ('speechSynthesis' in window) {
    warmUpVoices();
    window.speechSynthesis.onvoiceschanged = warmUpVoices;
}

function speakArtifactInfo(artifact) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        alert('Sorry, this browser does not support text-to-speech.');
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(buildNarrationText(artifact));
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    utterance.volume = 1;

    const preferredFemaleVoice = getPreferredFemaleVoice();
    if (preferredFemaleVoice) {
        utterance.voice = preferredFemaleVoice;
    }

    utterance.onend = () => {
        currentUtterance = null;
    };

    utterance.onerror = () => {
        currentUtterance = null;
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

function pauseVoice() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
    }
}

function continueVoice() {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
}

function stopVoice() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
    }
}

if (item) {
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-category').innerText = item.category;
    document.getElementById('detail-desc').innerText = item.description;
    document.getElementById('detail-significance').innerText = item.significance;

    // Set download links
    document.getElementById('link-download-ply').href = item.ply;
    document.getElementById('link-download-glb').href = item.glb;

    // THÊM ĐOẠN NÀY: Hiển thị hình ảnh QR lên web
    const detailPageUrl = getDetailPageUrl(item.id);
    const qrImageUrl = getQrImageUrl(detailPageUrl, 720);
    document.getElementById('detail-ar-qr').src = qrImageUrl;

    // .glb / AR-capable model-viewer
    const meshViewer = document.getElementById('mesh-view-container');
    meshViewer.src = item.glb;
    meshViewer.alt = `3D model of ${cleanName(item.name)}`;

    // Optional iOS Quick Look source. Add `usdz: "models/name.usdz"` to data.js if you have it.
    if (item.usdz) {
        meshViewer.setAttribute('ios-src', item.usdz);
    }

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
            console.error('Chi tiết lỗi:', err);
            const loading = splatContainer.querySelector('.loading-text');
            if (loading) loading.innerText = 'Error loading file!';
        });

    const btnSplat = document.getElementById('btn-show-splat');
    const btnMesh = document.getElementById('btn-show-mesh');
    const btnOpenAr = document.getElementById('btn-open-ar');
    const btnDownloadQr = document.getElementById('btn-download-qr');
    const btnReadInfo = document.getElementById('btn-read-info');
    const btnPauseVoice = document.getElementById('btn-pause-voice');
    const btnContinueVoice = document.getElementById('btn-continue-voice');
    const btnStopVoice = document.getElementById('btn-stop-voice');

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

    btnReadInfo.addEventListener('click', () => speakArtifactInfo(item));
    btnDownloadQr.addEventListener('click', async (e) => {
        e.preventDefault();
        const detailPageUrl = getDetailPageUrl(item.id);
        const qrImageUrl = getQrImageUrl(detailPageUrl, 720);
        await downloadQrCode(qrImageUrl, `${item.id}-detail-qr.png`);
    });
    btnPauseVoice.addEventListener('click', pauseVoice);
    btnContinueVoice.addEventListener('click', continueVoice);
    btnStopVoice.addEventListener('click', stopVoice);

    btnOpenAr.addEventListener('click', async () => {
        updateButtonStyles(btnMesh, btnSplat);
        splatContainer.style.display = 'none';
        meshViewer.style.display = 'block';

        speakArtifactInfo(item);

        try {
            await meshViewer.updateComplete;
            await meshViewer.activateAR();
        } catch (error) {
            console.warn('AR could not be launched from this browser/device:', error);
            alert('AR is not available on this browser/device. Please try Chrome on Android or Safari on iOS.');
        }
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
