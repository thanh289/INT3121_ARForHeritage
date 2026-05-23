import { Viewer } from '@mkkellogg/gaussian-splats-3d';
import { artifacts } from './data.js';

const urlParams = new URLSearchParams(window.location.search);
const artifactId = urlParams.get('id');
const item = artifacts.find(a => a.id === artifactId);

let currentUtterance = null;

// ── AR Subtitle Overlay ──────────────────────────────────────────────────────
let subtitleOverlay = null;
let subtitleTimeout = null;

function createSubtitleOverlay() {
    if (subtitleOverlay) return;
    subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'ar-subtitle-overlay';
    subtitleOverlay.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        max-width: 85vw;
        background: rgba(0, 0, 0, 0.72);
        color: #fff;
        font-family: 'Lora', serif;
        font-size: clamp(14px, 3.5vw, 18px);
        line-height: 1.5;
        padding: 10px 20px;
        border-radius: 8px;
        text-align: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.35s ease;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.15);
        letter-spacing: 0.2px;
    `;
    document.body.appendChild(subtitleOverlay);
}

function showSubtitle(text) {
    if (!subtitleOverlay) createSubtitleOverlay();
    clearTimeout(subtitleTimeout);
    subtitleOverlay.textContent = text;
    subtitleOverlay.style.opacity = '1';
}

function hideSubtitle() {
    if (!subtitleOverlay) return;
    subtitleOverlay.style.opacity = '0';
    subtitleTimeout = setTimeout(() => {
        if (subtitleOverlay) subtitleOverlay.textContent = '';
    }, 400);
}

// ── Text chunker: split narration into readable phrases ──────────────────────
function splitIntoChunks(text, maxWords = 10) {
    // Split on sentence boundaries first, then chunk long sentences
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const chunks = [];
    for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);
        for (let i = 0; i < words.length; i += maxWords) {
            const chunk = words.slice(i, i + maxWords).join(' ').trim();
            if (chunk) chunks.push(chunk);
        }
    }
    return chunks;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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
        if (!response.ok) throw new Error(`QR image request failed: ${response.status}`);
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

// ── QR: Generate AR-launch URL ───────────────────────────────────────────────
function getArLaunchQrUrl(itemId, size = 720) {
    const arUrl = new URL('ar-launch.html', window.location.href);
    arUrl.searchParams.set('id', itemId);
    const targetUrl = arUrl.href;
    return getQrImageUrl(targetUrl, size);
}

// ── Voice helpers ─────────────────────────────────────────────────────────────
function warmUpVoices() {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
}

function getPreferredFemaleVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'ava', 'allison', 'susan', 'google us english', 'google uk english female'];
    const maleKeywords = ['male', 'david', 'mark', 'alex', 'daniel', 'fred', 'tom', 'george', 'aaron'];
    return (
        englishVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k))) ||
        englishVoices.find(v => !maleKeywords.some(k => v.name.toLowerCase().includes(k))) ||
        voices[0] || null
    );
}

if ('speechSynthesis' in window) {
    warmUpVoices();
    window.speechSynthesis.onvoiceschanged = warmUpVoices;
}

// ── Core speak function (with optional subtitle support) ─────────────────────
function speakArtifactInfo(artifact, { withSubtitles = false } = {}) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        alert('Sorry, this browser does not support text-to-speech.');
        return;
    }

    window.speechSynthesis.cancel();
    hideSubtitle();

    const fullText = buildNarrationText(artifact);

    if (withSubtitles) {
        // Split into chunks and speak sequentially so we can show subtitles
        const chunks = splitIntoChunks(fullText, 10);
        speakChunks(chunks, 0);
    } else {
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'en-US';
        utterance.rate = 0.92;
        utterance.pitch = 1.12;
        utterance.volume = 1;
        const voice = getPreferredFemaleVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => { currentUtterance = null; };
        utterance.onerror = () => { currentUtterance = null; };
        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }
}

function speakChunks(chunks, index) {
    if (index >= chunks.length) {
        hideSubtitle();
        currentUtterance = null;
        return;
    }

    const chunk = chunks[index];
    showSubtitle(chunk);

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    const voice = getPreferredFemaleVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => speakChunks(chunks, index + 1);
    utterance.onerror = () => {
        hideSubtitle();
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
    hideSubtitle();
}

// ── Main ─────────────────────────────────────────────────────────────────────
if (item) {
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-category').innerText = item.category;
    document.getElementById('detail-desc').innerText = item.description;
    document.getElementById('detail-significance').innerText = item.significance;

    document.getElementById('link-download-ply').href = item.ply;
    document.getElementById('link-download-glb').href = item.glb;

    // QR now points to ar-launch.html for direct AR entry
    const arLaunchQrUrl = getArLaunchQrUrl(item.id, 720);
    document.getElementById('detail-ar-qr').src = arLaunchQrUrl;

    // Also update download QR to use the ar-launch URL
    const btnDownloadQr = document.getElementById('btn-download-qr');
    btnDownloadQr.addEventListener('click', async (e) => {
        e.preventDefault();
        await downloadQrCode(arLaunchQrUrl, `${item.id}-ar-qr.png`);
    });

    // ── Model Viewer (mesh/AR) ────────────────────────────────────────────────
    const meshViewer = document.getElementById('mesh-view-container');
    meshViewer.src = item.glb;
    meshViewer.alt = `3D model of ${cleanName(item.name)}`;
    if (item.usdz) meshViewer.setAttribute('ios-src', item.usdz);

    // ── AR status events: voice + subtitle start AFTER model is placed ────────
    meshViewer.addEventListener('ar-status', (e) => {
        const status = e.detail?.status;

        if (status === 'object-placed') {
            // AR is live and model placed → start narration with subtitles
            speakArtifactInfo(item, { withSubtitles: true });
        }

        if (status === 'not-presenting') {
            // User exited AR → stop voice and hide subtitles
            stopVoice();
        }
    });

    // ── Gaussian Splat Viewer ─────────────────────────────────────────────────
    const splatContainer = document.getElementById('splat-view-container');
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
    }).catch((err) => {
        console.error('Splat load error:', err);
        const loading = splatContainer.querySelector('.loading-text');
        if (loading) loading.innerText = 'Error loading file!';
    });

    // ── Button wiring ─────────────────────────────────────────────────────────
    const btnSplat = document.getElementById('btn-show-splat');
    const btnMesh = document.getElementById('btn-show-mesh');
    const btnOpenAr = document.getElementById('btn-open-ar');
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

    // "Read Info" button: speak WITHOUT subtitles (normal browser mode)
    btnReadInfo.addEventListener('click', () => speakArtifactInfo(item, { withSubtitles: false }));

    btnPauseVoice.addEventListener('click', pauseVoice);
    btnContinueVoice.addEventListener('click', continueVoice);
    btnStopVoice.addEventListener('click', stopVoice);

    btnOpenAr.addEventListener('click', () => triggerAR());

    // Auto-launch AR if redirected from ar-launch.html with ?autoar=1 (iOS without USDZ)
    if (urlParams.get('autoar') === '1') {
        // Wait for model-viewer to be ready
        meshViewer.addEventListener('load', () => {
            setTimeout(() => triggerAR(), 600);
        }, { once: true });
        // Also switch to mesh view immediately
        updateButtonStyles(btnMesh, btnSplat);
        splatContainer.style.display = 'none';
        meshViewer.style.display = 'block';
    }

    async function triggerAR() {
        updateButtonStyles(btnMesh, btnSplat);
        splatContainer.style.display = 'none';
        meshViewer.style.display = 'block';

        // Do NOT speak here — voice starts only after ar-status = object-placed
        try {
            await meshViewer.updateComplete;
            await meshViewer.activateAR();
        } catch (error) {
            console.warn('AR could not be launched:', error);
            alert('AR is not available on this browser/device. Please try Chrome on Android or Safari on iOS.');
        }
    }

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