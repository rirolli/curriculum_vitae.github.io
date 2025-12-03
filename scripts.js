// Configuration: visitor counter
const SITE_URL = "https://rirolli.github.io/curriculum_vitae";

const ICON_PAIRS = [
    // General ML & frameworks
    [/python|pandas|numpy|scikit/i, '<i class="fa-brands fa-python"></i>'],
    [/supervised\/?unsupervised\s*learning|deep\s*learning/i, '<i class="fa-solid fa-brain"></i>'],
    [/computer\s*vision|opencv/i, '<i class="fa-solid fa-eye"></i>'],
    [/pytorch/i, '<i class="fa-solid fa-fire-flame-curved"></i>'],
    [/tensorflow/i, '<i class="fa-solid fa-wave-square"></i>'],
    [/scikit\s*-?learn/i, '<i class="fa-solid fa-gears"></i>'],

    // Data engineering & databases
    [/pandas/i, '<i class="fa-solid fa-table"></i>'],
    [/numpy/i, '<i class="fa-solid fa-cubes"></i>'],
    [/scipy/i, '<i class="fa-solid fa-flask"></i>'],
    [/sql|postgresql|mysql/i, '<i class="fa-solid fa-database"></i>'],
    [/nosql|mongo\s*db|mongodb/i, '<i class="fa-solid fa-database"></i>'],

    // MLOps & APIs
    [/docker/i, '<i class="fa-brands fa-docker"></i>'],
    [/rest\s*apis|rest\s*api|graphql|api/i, '<i class="fa-solid fa-plug"></i>'],
    [/fastapi/i, '<i class="fa-solid fa-bolt"></i>'],
    [/mlflow/i, '<i class="fa-solid fa-chart-line"></i>'],
    [/dvc/i, '<i class="fa-solid fa-code-branch"></i>'],
    [/git/i, '<i class="fa-brands fa-git-alt"></i>'],

    // Programming languages
    [/java/i, '<i class="fa-brands fa-java"></i>'],
    [/^c\+\+$|^r$|\br\b/i, '<i class="fa-solid fa-code"></i>'],
    [/^c#$/i, '<i class="fa-solid fa-code"></i>'],
    [/^c$/i, '<i class="fa-solid fa-code"></i>'],
    [/bash|scripting|shell/i, '<i class="fa-solid fa-terminal"></i>'],

    // Geospatial tools
    [/gdal|rasterio|geopandas|qgis|gis/i, '<i class="fa-solid fa-map"></i>'],

    // Soft skills
    [/problem\s*solving/i, '<i class="fa-regular fa-lightbulb"></i>'],
    [/communication/i, '<i class="fa-solid fa-comments"></i>'],
    [/critical\s*thinking/i, '<i class="fa-solid fa-brain"></i>'],
    [/teamwork|collaboration|cross\s*functional/i, '<i class="fa-solid fa-people-group"></i>'],
    [/adaptability|flexibility/i, '<i class="fa-solid fa-shuffle"></i>'],

    // Extras
    [/kubernetes/i, '<i class="fa-solid fa-cubes"></i>'],
    [/cloud|aws|azure|gcp/i, '<i class="fa-solid fa-cloud"></i>'],
    [/javascript|typescript|react|vue|angular/i, '<i class="fa-solid fa-code"></i>'],
    [/html|css/i, '<i class="fa-solid fa-globe"></i>'],
    [/linux/i, '<i class="fa-brands fa-linux"></i>'],
    [/data\s*engineering|etl|pipeline/i, '<i class="fa-solid fa-diagram-project"></i>'],
    [/prefect|airflow/i, '<i class="fa-solid fa-project-diagram"></i>'],
    [/nlp|bert|transformers|spacy|nltk/i, '<i class="fa-solid fa-language"></i>'],
    [/time\s*series|forecast|arima|prophet/i, '<i class="fa-solid fa-chart-area"></i>'],
    [/spark|hadoop|big\s*data/i, '<i class="fa-solid fa-fire"></i>'],
    [/tableau|power\s*bi|metabase|superset/i, '<i class="fa-solid fa-chart-bar"></i>'],
    [/pytest|unittest|testing/i, '<i class="fa-solid fa-vial"></i>'],
    [/ci\/?cd|github\s*actions|gitlab\s*ci|jenkins/i, '<i class="fa-solid fa-gear"></i>'],
    [/microservice|distributed|scalable/i, '<i class="fa-solid fa-network-wired"></i>'],
    [/optimization|optimizer|tuning/i, '<i class="fa-solid fa-sliders"></i>'],
    [/statistics|probability|bayes/i, '<i class="fa-solid fa-square-root-variable"></i>'],
    [/matplotlib|seaborn|plotly|charts/i, '<i class="fa-solid fa-chart-pie"></i>']
];

function setLoading() {
    const ids = ["profile", "contacts", "skills", "experience", "education"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p>Caricamento…</p>`;
    });
}

async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Errore ${res.status} caricando ${path}`);
    return res.json();
}
async function tryLoadJSON(path) {
    try { return await loadJSON(path); } catch { return null; }
}

function renderEduBlock(item) {
    const title = renderRichText(item.title || '');
    const date = [item.institution || item.issuer || item.org || '', item.year || ''].filter(Boolean).join(' — ');
    const detail = item.detail ? `<p>${renderRichText(item.detail)}</p>` : '';
    return `
        <div class="edu">
            <h3>${title}</h3>
            ${date ? `<span class="date">${date}</span>` : ''}
            ${detail}
        </div>
    `;
}

function renderBulletSection(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<ul>${items.map(p => `<li>${renderRichText(p)}</li>`).join('')}</ul>`;
}

function injectJSONLD(profile, contacts) {
    try {
        const sameAs = [];
        if (contacts?.linkedin) sameAs.push(contacts.linkedin);
        const data = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile?.name || "",
            "email": contacts?.email ? `mailto:${contacts.email}` : undefined,
            "telephone": contacts?.phone || undefined,
            "sameAs": sameAs.length ? sameAs : undefined
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    } catch (_) {
        // Silenziosamente ignora
    }
}

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
        document.documentElement.setAttribute('data-theme', saved);
    } else {
        // Nessuna preferenza salvata: segui il sistema (nessun attributo)
        document.documentElement.removeAttribute('data-theme');
    }
    btn.addEventListener('click', () => {
        const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        const systemDark = mql ? mql.matches : false;
        const forced = document.documentElement.getAttribute('data-theme');
        let next;
        if (forced === 'dark' || forced === 'light') {
            next = forced === 'dark' ? 'light' : 'dark';
        } else {
            next = systemDark ? 'light' : 'dark';
        }
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

function renderError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<p style="color:#c0392b">${message}</p>`;
}

// Icone/emoji per rendere le skill più leggibili
function skillIconFor(label) {
    for (const [re, ico] of ICON_PAIRS) if (re.test(label)) return ico;
    // Default icon when no mapping matches
    return '<i class="fa-solid fa-tag"></i>';
}

function renderSkillChip(item) {
    let label = '';
    let level = null;
    if (typeof item === 'string') {
        label = item;
    } else if (item && typeof item === 'object') {
        label = item.label || item.name || '';
        level = item.level ?? null; // opzionale
    }
    const icon = skillIconFor(label);
    const iconSpan = icon ? `<span class="chip-icon" aria-hidden="true">${icon}</span>` : '';
    const levelAttr = level != null ? ` data-level="${level}"` : '';
    return `<span class="chip"${levelAttr} title="${label}">${iconSpan}${label}</span>`;
}

// Parser semplice per testo "ricco": consente **grassetto**, *corsivo* e <b>/<i>
function renderRichText(text) {
    if (typeof text !== 'string') return '';
    let out = text;
    // Correggi chiusure errate come <\b>
    out = out.replace(/<\\b>/gi, '</b>').replace(/<\\i>/gi, '</i>');
    // Converte Markdown-like in HTML
    out = out
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>');
    // Mantiene <b>, </b>, <i>, </i> se presenti (già consentiti)
    return out;
}

/**
 * Initializes the CV application by loading and rendering all necessary data.
 * 
 * This function orchestrates the entire application startup sequence by:
 * 1. Setting the initial loading state
 * 2. Configuring the theme toggle functionality
 * 3. Fetching all required JSON data files in parallel
 * 4. Rendering profile information, contacts, skills, experience, and education sections
 * 5. Injecting structured data (JSON-LD) for SEO optimization
 * 
 * @async
 * @function init
 * @returns {Promise<void>} A promise that resolves when all data is loaded and rendered
 * 
 * @throws {Error} Logs errors to console and displays user-friendly error messages
 *                 in respective sections if data loading fails
 * 
 * @description
 * The function loads the following data files concurrently:
 * - profile.json: Personal profile information and description
 * - contacts.json: Contact details (email, phone, LinkedIn)
 * - skills.json: Technical and professional skills organized by sections
 * - experience.json: Work experience with roles, companies, and achievements
 * - education.json: Educational background and qualifications
 * 
 * @example
 * // Called on page load
 * document.addEventListener('DOMContentLoaded', init);
 */
async function init() {
    setLoading();
    setupThemeToggle();
    try {
        const [profile, languages, contacts, skills, experience, education] = await Promise.all([
            loadJSON("data/profile.json"),
            loadJSON("data/languages.json"),
            loadJSON("data/contacts.json"),
            loadJSON("data/skills.json"),
            loadJSON("data/experience.json"),
            loadJSON("data/education.json")
        ]);

        // Nome
        document.getElementById("name").textContent = profile.name;

        // Foto profilo (sotto il nome)
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) {
            const custom = (profile.photo || "").trim();
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Profilo')}&background=3b6aff&color=fff&size=256`;
            const src = custom || fallback;
            avatarEl.src = src;
            avatarEl.alt = `Foto di ${profile.name}`;
            avatarEl.title = `Foto di ${profile.name}`;
            // Improve in-view load performance
            avatarEl.loading = 'eager';
            avatarEl.decoding = 'async';
            try { avatarEl.fetchPriority = 'high'; } catch (_) {}
            // Provide intrinsic size to avoid reflow
            avatarEl.width = 256;
            avatarEl.height = 256;
        }

        // Profilo
        document.getElementById("profile").innerHTML =
            `<h2>Profile</h2><p>${renderRichText(profile.profile)}</p>`;

        // Contatti (render solo campi presenti e non vuoti)
        {
            const el = document.getElementById("contacts");
            if (el) {
                const safe = (v) => (typeof v === 'string' ? v.trim() : '');
                const email = safe(contacts?.email);
                const phone = safe(contacts?.phone);
                const linkedin = safe(contacts?.linkedin);
                const website = safe(contacts?.website);
                const portfolio = safe(contacts?.portfolio);
                const github = safe(contacts?.github);
                const twitter = safe(contacts?.twitter);
                const location = safe(contacts?.location);

                const icon = {
                    email: '<i class="fa-solid fa-envelope" aria-hidden="true"></i>',
                    phone: '<i class="fa-solid fa-phone" aria-hidden="true"></i>',
                    linkedin: '<i class="fa-brands fa-linkedin" aria-hidden="true"></i>',
                    website: '<i class="fa-solid fa-globe" aria-hidden="true"></i>',
                    portfolio: '<i class="fa-regular fa-folder-open" aria-hidden="true"></i>',
                    github: '<i class="fa-brands fa-github" aria-hidden="true"></i>',
                    twitter: '<i class="fa-brands fa-x-twitter" aria-hidden="true"></i>',
                    location: '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>'
                };

                const rows = [];
                if (email) rows.push(`<p>${icon.email} <strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`);
                if (phone) rows.push(`<p>${icon.phone} <strong>Tel:</strong> <a href="tel:${phone}">${phone}</a></p>`);
                if (linkedin) rows.push(`<p>${icon.linkedin} <strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank" rel="noopener">${linkedin.split("/").pop()}</a></p>`);
                if (website) rows.push(`<p>${icon.website} <strong>Website:</strong> <a href="${website}" target="_blank" rel="noopener">${website.replace(/^https?:\/\//, '')}</a></p>`);
                if (portfolio) rows.push(`<p>${icon.portfolio} <strong>Portfolio:</strong> <a href="${portfolio}" target="_blank" rel="noopener">${portfolio.replace(/^https?:\/\//, '')}</a></p>`);
                if (github) rows.push(`<p>${icon.github} <strong>GitHub:</strong> <a href="${github}" target="_blank" rel="noopener">${github.replace(/^https?:\/\//, '').split('/').slice(-1)[0]}</a></p>`);
                if (twitter) rows.push(`<p>${icon.twitter} <strong>Twitter:</strong> <a href="${twitter}" target="_blank" rel="noopener">${twitter.replace(/^https?:\/\//, '').split('/').slice(-1)[0]}</a></p>`);
                if (location) rows.push(`<p>${icon.location} <strong>Location:</strong> ${renderRichText(location)}</p>`);

                el.innerHTML = `<h2>Contacts</h2>` + (rows.length ? rows.join("\n") : `<p>Nessun contatto disponibile.</p>`);
            }
        }

        // Skills (render as chips)
        document.getElementById("skills").innerHTML =
            `<h2>Skills</h2>` +
            skills.sections.map(section => `
                <div class="skill-group">
                    <h3>${section.title}</h3>
                    <div class="skills-chips">${section.items.map(renderSkillChip).join("")}</div>
                </div>
            `).join("");

        // Experience
        document.getElementById("experience").innerHTML =
            `<h2>Experience</h2>` +
            experience.map(job => `
                <div class="job">
                    <h3>${job.role} — ${job.company}</h3>
                    <span class="date">${job.period}</span>
                    ${job.description ? `<p>${renderRichText(job.description)}</p>` : ''}
                    <ul>${job.points.map(p => `<li>${renderRichText(p)}</li>`).join("")}</ul>
                    ${job.skills ? `<div class="skills-chips">${job.skills.map(renderSkillChip).join("")}</div>` : ''}
                </div>
            `).join("");

        // Education
        document.getElementById("education").innerHTML =
            `<h2>Education</h2>` +
            education.map(edu => `
                <div class="edu">
                    <h3>${edu.title}</h3>
                    <span class="date">${edu.institution} — ${edu.year}</span>
                    <p>${renderRichText(edu.detail)}</p>
                </div>
            `).join("");

        // Registry for optional sections
        const registry = [
            { id: 'certifications', file: 'data/certifications.json', title: 'Certifications', render: (data) => data.map(renderEduBlock).join('') },
            { id: 'publications', file: 'data/publications.json', title: 'Publications', render: (data) => data.map(renderEduBlock).join('') },
            { id: 'projects', file: 'data/projects.json', title: 'Projects', render: (data) => data.map(p => `
                <div class="edu">
                    <h3>${renderRichText(p.title)}</h3>
                    ${p.period ? `<span class="date">${p.period}</span>` : ''}
                    ${p.description ? `<p>${renderRichText(p.description)}</p>` : ''}
                    ${renderBulletSection(p.points)}
                    ${p.skills ? `<div class="skills-chips">${p.skills.map(renderSkillChip).join('')}</div>` : ''}
                </div>
            `).join('') }
            ,{ id: 'languages', file: 'data/languages.json', title: 'Languages', render: (data) => data.map(l => {
                const level = (l.level || '').toUpperCase();
                const map = { A1: 16, A2: 33, B1: 50, B2: 67, C1: 83, C2: 100 };
                const pct = map[level] ?? (typeof l.percent === 'number' ? Math.max(0, Math.min(100, l.percent)) : null);
                const note = l.note ? `<span class="note">${renderRichText(l.note)}</span>` : '';
                const badge = level ? `<span class="badge">${level}</span>` : '';
                const progress = pct != null ? `<div class="lang-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="lang-meter-fill" style="width:${pct}%"></div></div>` : '';
                return `
                    <div class="lang">
                        <p><i class="fa-solid fa-language" aria-hidden="true"></i> ${renderRichText(l.name || '')} ${badge}</p>
                        ${progress}
                        ${note}
                    </div>
                `;
            }).join('') }
        ];

        for (const sec of registry) {
            const el = document.getElementById(sec.id);
            if (!el) continue;
            const data = await tryLoadJSON(sec.file);
            if (data && Array.isArray(data) && data.length) {
                el.innerHTML = `<h2>${sec.title}</h2>` + sec.render(data);
            } else {
                el.innerHTML = '';
            }
        }

        // JSON-LD per SEO
        injectJSONLD(profile, contacts);

        // Posiziona l'avatar sotto il nome su mobile
        setupResponsiveAvatarPlacement();
        window.addEventListener('resize', setupResponsiveAvatarPlacement);
    } catch (err) {
        // Mostra errori user-friendly
        renderError('profile', 'Unable to load profile data.');
        renderError('contacts', 'Unable to load contacts.');
        renderError('skills', 'Unable to load skills.');
        renderError('experience', "Unable to load experience.");
        renderError('education', 'Unable to load education.');
        console.error(err);
    } finally {
        // Visitor badge injection (always runs)
        // setupVisitorBadge();
    }
}

init();

function setupVisitorBadge() {
    const el = document.getElementById('visitor-badge');
    if (!el) {
        console.warn('visitor-badge element not found');
        return;
    }
    const encoded = encodeURIComponent(SITE_URL);
    const badgeUrl = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${encoded}&count_bg=%233B6AFF&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Visitors&edge_flat=false`;
    el.innerHTML = `<img src="${badgeUrl}" alt="Visitor count" loading="lazy" />`;
    console.log('Visitor badge injected:', badgeUrl);
}

function setupResponsiveAvatarPlacement() {
    const avatar = document.getElementById('avatar');
    const nameEl = document.getElementById('name');
    const sidebar = document.querySelector('.sidebar');
    if (!avatar || !nameEl || !sidebar) return;
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
        // Sposta l'avatar subito sotto il nome (nel main)
        if (nameEl.nextElementSibling !== avatar) {
            nameEl.insertAdjacentElement('afterend', avatar);
        }
    } else {
        // Riporta l'avatar nella sidebar (prima delle sezioni)
        if (avatar.parentElement !== sidebar) {
            sidebar.insertBefore(avatar, sidebar.firstElementChild);
        }
    }
}
