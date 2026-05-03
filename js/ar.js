import { artifacts } from './data.js';

const urlParams = new URLSearchParams(window.location.search);
const artifactId = urlParams.get('id');
const item = artifacts.find(a => a.id === artifactId);
let currentUtterance = null;

function buildNarrationText(artifact) {
    return `${artifact.name.replace(/\n/g, ' ')}. Category: ${artifact.category}. ${artifact.description} Significance: ${artifact.significance}`;
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

function setButtonContent(button, iconClass, label) {
    button.innerHTML = `
        <span class="icon"><i class="${iconClass}"></i></span>
        <span>${label}</span>
    `;
}

function createVoiceButtonFrom(baseButton, id, iconClass, label) {
    const existingButton = document.getElementById(id);
    if (existingButton) return existingButton;

    const button = baseButton.cloneNode(true);
    button.id = id;
    setButtonContent(button, iconClass, label);
    baseButton.parentNode.insertBefore(button, baseButton);
    return button;
}

function setupVoiceControlButtons() {
    const stopButton = document.getElementById('btn-stop-ar-voice');
    if (!stopButton) return {};

    const pauseButton = createVoiceButtonFrom(stopButton, 'btn-pause-ar-voice', 'fas fa-pause', 'Pause');
    const continueButton = createVoiceButtonFrom(stopButton, 'btn-continue-ar-voice', 'fas fa-play', 'Continue');
    setButtonContent(stopButton, 'fas fa-stop', 'Stop');

    return { pauseButton, continueButton, stopButton };
}

if (item) {
    document.title = `${item.name.replace(/\n/g, ' ')} AR`;
    document.getElementById('ar-detail-name').innerText = item.name;
    document.getElementById('ar-detail-category').innerText = item.category;
    document.getElementById('ar-detail-desc').innerText = item.description;
    document.getElementById('ar-detail-significance').innerText = item.significance;
    document.getElementById('back-to-detail').href = `detail.html?id=${encodeURIComponent(item.id)}`;

    const modelViewer = document.getElementById('ar-model-viewer');
    modelViewer.src = item.glb;
    modelViewer.alt = `AR model of ${item.name.replace(/\n/g, ' ')}`;

    // Optional iOS Quick Look source. Add `usdz: "models/name.usdz"` to data.js if you have it.
    if (item.usdz) {
        modelViewer.setAttribute('ios-src', item.usdz);
    }

    const { pauseButton, continueButton, stopButton } = setupVoiceControlButtons();

    document.getElementById('btn-read-ar-info').addEventListener('click', () => speakArtifactInfo(item));
    if (pauseButton) pauseButton.addEventListener('click', pauseVoice);
    if (continueButton) continueButton.addEventListener('click', continueVoice);
    if (stopButton) stopButton.addEventListener('click', stopVoice);

    document.getElementById('btn-start-ar-voice').addEventListener('click', async () => {
        speakArtifactInfo(item);

        try {
            await modelViewer.updateComplete;
            await modelViewer.activateAR();
        } catch (error) {
            console.warn('AR could not be launched from this browser/device:', error);
            document.getElementById('ar-support-note').innerText =
                'AR could not be opened on this device/browser. You can still rotate the 3D model here and listen to the voice guide.';
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
