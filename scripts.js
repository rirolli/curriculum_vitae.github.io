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
        [/prefect|airflow/i, '🏗️']
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
            `<h2>Profilo</h2><p>${profile.profile}</p>`;

        // Contatti
        document.getElementById("contacts").innerHTML = `
            <h2>Contatti</h2>
            <p><strong>Email:</strong> <a href="mailto:${contacts.email}">${contacts.email}</a></p>
            <p><strong>Tel:</strong> <a href="tel:${contacts.phone}">${contacts.phone}</a></p>
            <p><strong>LinkedIn:</strong> <a href="${contacts.linkedin}" target="_blank" rel="noopener">${contacts.linkedin.split("/").pop()}</a></p>
        `;

        // Skills (render come chips)
        document.getElementById("skills").innerHTML =
            `<h2>Skills</h2>` +
            skills.sections.map(section => `
                <div class="skill-group">
                    <h3>${section.title}</h3>
                    <div class="skills-chips">${section.items.map(renderSkillChip).join("")}</div>
                </div>
            `).join("");

        // Esperienza
        document.getElementById("experience").innerHTML =
            `<h2>Esperienza</h2>` +
            experience.map(job => `
                <div class="job">
                    <h3>${job.role} — ${job.company}</h3>
                    <span class="date">${job.period}</span>
                    <ul>${job.points.map(p => `<li>${p}</li>`).join("")}</ul>
                    <div class="skills-chips">${job.skills.map(renderSkillChip).join("")}</div>
                </div>
            `).join("");

        // Formazione
        document.getElementById("education").innerHTML =
            `<h2>Formazione</h2>` +
            education.map(edu => `
                <div class="edu">
                    <h3>${edu.title}</h3>
                    <span class="date">${edu.institution} — ${edu.year}</span>
                    <p>${edu.detail}</p>
                </div>
            `).join("");

        // JSON-LD per SEO
        injectJSONLD(profile, contacts);

        // Posiziona l'avatar sotto il nome su mobile
        setupResponsiveAvatarPlacement();
        window.addEventListener('resize', setupResponsiveAvatarPlacement);
    } catch (err) {
        // Mostra errori user-friendly
        renderError('profile', 'Impossibile caricare i dati del profilo.');
        renderError('contacts', 'Impossibile caricare i contatti.');
        renderError('skills', 'Impossibile caricare le competenze.');
        renderError('experience', "Impossibile caricare l'esperienza.");
        renderError('education', 'Impossibile caricare la formazione.');
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
