'use strict';

//Toggle Function
const elemToggleFunc = function(elem) { elem.classList.toggle('active'); }

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header Sticky & Go-Top

const header = document.querySelector('[data-header]');
const goTopBtn = document.querySelector('[data-go-top]');
window.addEventListener('scroll', function(){ if(window.scrollY >= 10) { header.classList.add('active'); goTopBtn.classList.add('active'); }
                                                                else { header.classList.remove('active'); goTopBtn.classList.remove('active'); } });

// Mobile Menu

const navToggleBtn = document.querySelector('[data-nav-toggle-btn]');
const navbar = document.querySelector('[data-navbar]');

navToggleBtn.addEventListener('click', function() { 
    elemToggleFunc(navToggleBtn);
    elemToggleFunc(navbar);
    elemToggleFunc(document.body);
})

// Skills Toggling Button

const toggleBtnBox = document.querySelector('[data-toggle-box]');
const toggleBtns = document.querySelectorAll('[data-toggle-btn]');
const skillsBox = document.querySelector('[data-skills-box]');

for(let i = 0; i < toggleBtns.length; i++){
    toggleBtns[i].addEventListener('click', function(){
        elemToggleFunc(toggleBtnBox);

        for(let i = 0; i < toggleBtns.length; i++) { elemToggleFunc(toggleBtns[i]); }
        elemToggleFunc(skillsBox);
    });
}

// Dark & Light Theme Toggle

const themeToggleBtn = document.querySelector('[data-theme-btn]');

themeToggleBtn.addEventListener('click', function(){
    elemToggleFunc(themeToggleBtn);

    if(themeToggleBtn.classList.contains('active')){
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');

        localStorage.setItem('theme', 'light-theme');
    }else{
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');

        localStorage.setItem('theme', 'dark-theme');
    }
})

//Applying Theme kept in Local Storage 

if(localStorage.getItem('theme') === 'light-theme'){
    themeToggleBtn.classList.add('active');
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
}else{
    themeToggleBtn.classList.remove('active');
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
}

// i18n translations loaded from JSON files
const translationsCache = {};

async function loadTranslations(lang) {
    if (translationsCache[lang]) return translationsCache[lang];
    try {
        const res = await fetch(`./locales/${lang}.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${lang}`);
        const json = await res.json();
        translationsCache[lang] = json;
        return json;
    } catch (err) {
        if (lang !== 'en') {
            return loadTranslations('en');
        }
        return {};
    }
}

function applyTranslations(dict, lang) {
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });
}

const languageSelector = document.getElementById('lang');

async function setLanguage(lang) {
    const dict = await loadTranslations(lang);
    localStorage.setItem('language', lang);
    applyTranslations(dict, lang);
}

languageSelector.addEventListener('change', function() {
    const selectedLang = this.value;
    setLanguage(selectedLang);
});

const savedLanguage = localStorage.getItem('language') || 'en';
languageSelector.value = savedLanguage;
setLanguage(savedLanguage);

// Form validation and enhanced UX
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !message) {
            e.preventDefault();
            alert('Please fill in all required fields.');
            return;
        }
        
        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            e.preventDefault();
            alert('Please enter a valid email address.');
            return;
        }
    });
}

// Add loading animation for project cards
const projectCards = document.querySelectorAll('.project-card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});