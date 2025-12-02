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
    const pairs = [
        [/python|pandas|numpy|scikit/i, '🐍'],
        [/pytorch|tensorflow|supervised learning|unsupervised learning|deep learning/i, '🧠'],
        [/docker|kubernetes/i, '🐳'],
        [/sql|mongodb|postgres|mysql/i, '💾'],
        [/fastapi/i, '⚡'],
        [/mlflow|dvc/i, '📈'],
        [/computer\s*vision|vision/i, '👁️'],
        [/git|devops/i, '🔧'],
        [/cloud|aws|azure|gcp/i, '☁️'],
        [/javascript|typescript|react|vue|angular/i, '🖥️'],
        [/html|css/i, '🌐'],
        [/linux|bash|shell/i, '🐧'],
        [/data engineering|etl|pipeline/i, '🔄'],
        [/prefect|airflow/i, '🏗️'],
        [/geospatial|gis|remote sensing/i, '🗺️']
    ];
    for (const [re, ico] of pairs) if (re.test(label)) return ico;
    return '';
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
        const [profile, contacts, skills, experience, education] = await Promise.all([
            loadJSON("data/profile.json"),
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
            avatarEl.loading = 'lazy';
            avatarEl.decoding = 'async';
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
                    <p>${edu.detail}</p>
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
    }
}

init();

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
