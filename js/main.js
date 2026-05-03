import { artifacts } from './data.js';

const gridContainer = document.getElementById('gallery-grid');

function getDetailUrl(itemId) {
    return `detail.html?id=${encodeURIComponent(itemId)}`;
}

function createCardHTML(item) {
    const div = document.createElement('div');
    div.className = 'artifact-item';
    div.setAttribute('data-category', item.category);

    const detailUrl = getDetailUrl(item.id);

    div.innerHTML = `
        <div class="artifact-card" style="cursor: pointer;">
            <div style="width: 100%; height: 280px; position: relative; overflow: hidden; border-radius: 2px; background: #fafafa;">
                <video
                    src="${item.video}"
                    poster="images/placeholder.jpg"
                    autoplay
                    loop
                    muted
                    playsinline
                    style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;">
                </video>
            </div>

            <p class="artifact-name">${item.name}</p>
            <p class="artifact-category">${item.category}</p>

            <a href="${detailUrl}" class="button is-small is-outlined mt-3" style="border-color: var(--accent-gold); color: var(--accent-red);">
                Explore Details
            </a>
        </div>
    `;

    const card = div.querySelector('.artifact-card');
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }

        window.location.href = detailUrl;
    });

    return div;
}

artifacts.forEach(item => {
    if (item.video) {
        gridContainer.appendChild(createCardHTML(item));
    }
});

// Filter button
const filterButtons = document.querySelectorAll('#filter-buttons button');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.artifact-item').forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
