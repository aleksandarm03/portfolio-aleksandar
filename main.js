'use strict';

const header = document.querySelector('[data-header]');
const goTopBtn = document.querySelector('[data-go-top]');
const navToggleBtn = document.querySelector('[data-nav-toggle-btn]');
const navbar = document.querySelector('[data-navbar]');
const themeToggleBtn = document.querySelector('[data-theme-btn]');
const languageSelector = document.getElementById('lang');
const contactForm = document.getElementById('contact-form');
const formError = document.querySelector('[data-form-error]');

const translationsCache = {};
let currentDict = {};
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lookup(dict, path) {
    return path.split('.').reduce((acc, key) => {
        if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
            return acc[key];
        }
        return undefined;
    }, dict);
}

function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function svgIcon(id) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + id);
    svg.append(use);
    return svg;
}

function appendPeriod(parent, item) {
    const line = document.createElement('p');
    line.className = 'timeline-time';
    const start = document.createElement('time');
    start.dateTime = item.start;
    start.textContent = item.startLabel;
    line.append(start);

    const sameLabel = item.startLabel === item.endLabel;
    if (!sameLabel) {
        line.append(document.createTextNode(' – '));
        if (item.end) {
            const end = document.createElement('time');
            end.dateTime = item.end;
            end.textContent = item.endLabel;
            line.append(end);
        } else {
            line.append(document.createTextNode(item.endLabel));
        }
    }

    parent.append(line);
}

function renderTimeline(list, items) {
    clearNode(list);
    items.forEach((item) => {
        const entry = document.createElement('li');
        entry.className = 'timeline-item';

        const role = document.createElement('h3');
        role.className = 'h4 timeline-role';
        role.textContent = item.role;
        entry.append(role);

        const meta = document.createElement('p');
        meta.className = 'timeline-meta';
        meta.textContent = item.type ? item.company + ' · ' + item.type : item.company;
        entry.append(meta);

        appendPeriod(entry, item);

        if (item.location) {
            const location = document.createElement('p');
            location.className = 'timeline-location';
            location.textContent = item.location;
            entry.append(location);
        }

        if (item.summary) {
            const summary = document.createElement('p');
            summary.className = 'timeline-summary';
            summary.textContent = item.summary;
            entry.append(summary);
        }

        list.append(entry);
    });
}

function renderHighlights(list, items) {
    clearNode(list);
    items.forEach((item) => {
        const card = document.createElement('li');
        card.className = 'stats-card';

        const iconWrap = document.createElement('div');
        iconWrap.className = 'card-icon';
        iconWrap.setAttribute('aria-hidden', 'true');
        iconWrap.append(svgIcon(item.icon));
        card.append(iconWrap);

        const title = document.createElement('p');
        title.className = 'h2 card-title';
        const value = document.createElement('span');
        value.className = 'stats-value';
        value.textContent = item.value;
        const label = document.createElement('strong');
        label.textContent = item.label;
        title.append(value, label);
        card.append(title);

        list.append(card);
    });
}

function renderSkills(list, items) {
    clearNode(list);
    items.forEach((item) => {
        const entry = document.createElement('li');
        const card = document.createElement('div');
        card.className = 'skills-card';
        card.setAttribute('role', 'img');
        card.setAttribute('aria-label', item.name);

        if (item.icon) {
            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = '';
            img.width = 48;
            img.height = 48;
            card.append(img);
        } else {
            const label = document.createElement('span');
            label.className = 'skill-label';
            label.textContent = item.name;
            card.append(label);
        }

        const tip = document.createElement('span');
        tip.className = 'tooltip';
        tip.setAttribute('aria-hidden', 'true');
        tip.textContent = item.name;
        card.append(tip);

        entry.append(card);
        list.append(entry);
    });
}

function renderProjects(list, items) {
    clearNode(list);
    const external = lookup(currentDict, 'a11y.external') || '';

    items.forEach((item) => {
        const entry = document.createElement('li');
        const card = item.href ? document.createElement('a') : document.createElement('article');
        card.className = 'project-card';

        if (item.href) {
            card.href = item.href;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.setAttribute('aria-label', item.title + (external ? '. ' + external : ''));
        }

        const figure = document.createElement('figure');
        figure.className = 'card-banner';
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt || item.title;
        figure.append(img);
        card.append(figure);

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.className = 'h4 card-title';
        title.textContent = item.title;
        content.append(title);

        if (item.summary) {
            const summary = document.createElement('p');
            summary.className = 'card-text';
            summary.textContent = item.summary;
            content.append(summary);
        }

        const time = document.createElement('time');
        time.className = 'publish-date';
        time.dateTime = item.date;
        time.textContent = item.dateLabel;
        content.append(time);

        card.append(content);
        entry.append(card);
        list.append(entry);
    });

    revealProjects();
}

function renderParagraphs(node, text) {
    clearNode(node);
    text.split(/\n\n+/).forEach((part) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = part;
        node.append(paragraph);
    });
}

function renderLists(dict) {
    const highlights = document.querySelector('[data-list="highlights"]');
    const experience = document.querySelector('[data-list="experience"]');
    const education = document.querySelector('[data-list="education"]');
    const skills = document.querySelector('[data-list="skills"]');
    const projects = document.querySelector('[data-list="projects"]');

    if (highlights && dict.highlights) renderHighlights(highlights, dict.highlights);
    if (experience && dict.experience) renderTimeline(experience, dict.experience.items);
    if (education && dict.education) renderTimeline(education, dict.education.items);
    if (skills && dict.skills) renderSkills(skills, dict.skills.items);
    if (projects && dict.projects) renderProjects(projects, dict.projects.items);
}

function applyTranslations(dict, lang) {
    currentDict = dict;
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    const title = lookup(dict, 'meta.title');
    const description = lookup(dict, 'meta.description');
    if (title) {
        document.title = title;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);
    }
    if (description) {
        const meta = document.querySelector('meta[name="description"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (meta) meta.setAttribute('content', description);
        if (ogDesc) ogDesc.setAttribute('content', description);
    }

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', lang === 'sr' ? 'sr_RS' : 'en_US');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const value = lookup(dict, el.getAttribute('data-i18n'));
        if (typeof value === 'string') el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const value = lookup(dict, el.getAttribute('data-i18n-placeholder'));
        if (typeof value === 'string') el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const value = lookup(dict, el.getAttribute('data-i18n-aria'));
        if (typeof value === 'string') el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const value = lookup(dict, el.getAttribute('data-i18n-alt'));
        if (typeof value === 'string') el.alt = value;
    });

    document.querySelectorAll('[data-i18n-paragraphs]').forEach((el) => {
        const value = lookup(dict, el.getAttribute('data-i18n-paragraphs'));
        if (typeof value === 'string') renderParagraphs(el, value);
    });

    renderLists(dict);
}

async function loadTranslations(lang) {
    if (translationsCache[lang]) return translationsCache[lang];
    const response = await fetch('./locales/' + lang + '.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load ' + lang);
    const json = await response.json();
    translationsCache[lang] = json;
    return json;
}

async function setLanguage(lang) {
    try {
        const dict = await loadTranslations(lang);
        localStorage.setItem('language', lang);
        applyTranslations(dict, lang);
    } catch (err) {
        if (lang !== 'en') setLanguage('en');
    }
}

function closeNav() {
    navToggleBtn.classList.remove('active');
    navbar.classList.remove('active');
    document.body.classList.remove('active');
    navToggleBtn.setAttribute('aria-expanded', 'false');
}

window.addEventListener('scroll', function () {
    const active = window.scrollY >= 10;
    header.classList.toggle('active', active);
    goTopBtn.classList.toggle('active', active);
});

navToggleBtn.addEventListener('click', function () {
    const open = !navbar.classList.contains('active');
    navToggleBtn.classList.toggle('active', open);
    navbar.classList.toggle('active', open);
    document.body.classList.toggle('active', open);
    navToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

navbar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
});

themeToggleBtn.addEventListener('click', function () {
    const light = !document.body.classList.contains('light-theme');
    themeToggleBtn.classList.toggle('active', light);
    document.body.classList.toggle('light-theme', light);
    document.body.classList.toggle('dark-theme', !light);
    localStorage.setItem('theme', light ? 'light-theme' : 'dark-theme');
});

if (localStorage.getItem('theme') === 'light-theme') {
    themeToggleBtn.classList.add('active');
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
}

languageSelector.addEventListener('change', function () {
    setLanguage(this.value);
});

const savedLanguage = localStorage.getItem('language') || 'en';
languageSelector.value = savedLanguage;
setLanguage(savedLanguage);

function showFormError(message) {
    formError.hidden = false;
    formError.textContent = message;
}

contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
        showFormError(lookup(currentDict, 'form.required') || 'Name, email, and message are required.');
        return;
    }

    if (!emailPattern.test(email)) {
        showFormError(lookup(currentDict, 'form.invalidEmail') || 'Enter a valid email address.');
        return;
    }

    formError.hidden = true;
    formError.textContent = '';

    const lines = [
        lookup(currentDict, 'form.name') + ': ' + name,
        lookup(currentDict, 'form.email') + ': ' + email
    ];
    if (phone) lines.push(lookup(currentDict, 'form.phone') + ': ' + phone);
    lines.push('', message);

    const subject = encodeURIComponent(lookup(currentDict, 'form.subject') || 'Portfolio message');
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = 'mailto:accam003@gmail.com?subject=' + subject + '&body=' + body;
});

function revealProjects() {
    const cards = document.querySelectorAll('.project-card');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    cards.forEach((card) => {
        card.classList.add('will-reveal');
        observer.observe(card);
    });
}
