import './style.css'

// ==========================================
// 1. MAPEAMENTO DO DOM (PADRÃO KEBAB-CASE)
// ==========================================
const galeriaContainer = document.getElementById('galeriaContainer');
const bulletsContainer = document.getElementById('bulletsContainer');

// Elementos do Modal de Projetos
const projectModal = document.getElementById('project-modal');
const projectModalDialog = document.getElementById('project-modal-dialog');
const projectModalImg = document.getElementById('project-modal-img');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalDesc = document.getElementById('project-modal-desc');
const projectModalCat = document.getElementById('project-modal-cat');
const projectModalPerf = document.getElementById('project-modal-perf');
const projectModalStatus = document.getElementById('project-modal-status');
const projectModalLink = document.getElementById('project-modal-link');

// Elementos do Modal de Contato
const contatoModal = document.getElementById('contato-modal');
const contatoModalBackdrop = document.getElementById('contato-modal-backdrop');
const contatoModalDialog = document.getElementById('contato-modal-dialog');
const contatoModalCloseBtn = document.getElementById('contato-modal-close-btn');
const contatoModalCancelBtn = document.getElementById('contato-modal-cancel-btn');
const contatoModalConfirmBtn = document.getElementById('contato-modal-confirm-btn');
const contatoModalTitle = document.getElementById('contato-modal-title');
const contatoModalMessage = document.getElementById('contato-modal-message');
const contatoModalIcon = document.getElementById('contato-modal-icon');

// Configurações Globais de Comunicação
const CONTATO_CONFIG = {
    whatsapp_phone: '5515981450001',
    email_address: 'pepa@pepa.dev.br',
    messages: {
        'projeto-zap': 'Olá, Pepa! Curti seu portfólio e gostaria de bater um papo para fazer um orçamento para o meu projeto.',
        'projeto-email': 'Olá, Pepa!\n\nGostaria de solicitar um orçamento e validar a disponibilidade para o desenvolvimento de um projeto exclusivo.\n\nAguardo retorno!',
        'default': 'Olá! Gostaria de iniciar um atendimento com você.'
    }
};

// Mapeamento Centralizado de Badges por Status
const STATUS_BADGES = {
    "No Ar": `<span class="text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">● NO AR</span>`,
    "Aguardando Conteúdo": `<span class="text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">● AGUARDANDO CONTEÚDO</span>`,
    "Disponível": `<span class="text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">● DEMONSTRAÇÃO</span>`
};

// Variáveis de Estado Globais
let listaDeProjetos = [];
let currentIndex = 0;
let autoplayTimer = null;
let autoplayAtivo = true;
let isProgrammaticScroll = false;

// ==========================================
// 2. SISTEMA DO PORTFÓLIO & GALERIA (DATA DINÂMICA)
// ==========================================

async function initProjetos() {
    try {
        const response = await fetch('/projetos.json');
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

        const dados = await response.json();
        listaDeProjetos = dados.itens || [];

        const dataEl = document.getElementById('projetos-updated-at');
        if (dataEl && dados.ultima_atualizacao) {
            dataEl.innerText = `> Última atualização: ${dados.ultima_atualizacao}`;
        }

        renderProjetos(listaDeProjetos);
        updateActiveState(0);
        startAutoplay();
        setupInteractions();

    } catch (error) {
        console.error("Erro no portfólio:", error);
        if (galeriaContainer) {
            galeriaContainer.innerHTML = `<p class="font-mono text-red-500 p-8"># Erro ao carregar projetos.</p>`;
        }
    }
}

function renderProjetos(projetos) {
    if (!galeriaContainer || !bulletsContainer) return;

    galeriaContainer.innerHTML = '';
    bulletsContainer.innerHTML = '';

    projetos.forEach((proj, index) => {
        const card = document.createElement('div');
        card.className = "w-[100vw] lg:w-[33.333vw] h-[60vh] flex-none snap-center relative group cursor-pointer border-r border-t-4 border-t-transparent border-slate-800 transition-all duration-300 hover:border-t-slate-600 hover:bg-slate-900/20";
        card.setAttribute('data-index', index);

        card.addEventListener('click', () => {
            stopAutoplayCompletely();
            openProjectModal(proj);
        });

        // Captura a badge correta baseada no status mapeado do JSON
        const badgeHTML = STATUS_BADGES[proj.status] || STATUS_BADGES["Disponível"];

        card.innerHTML = `
            <img src="${proj.imgSrc}" alt="${proj.title}" class="w-full h-full object-cover lg:grayscale lg:group-hover:grayscale-0 transition-all duration-500">
            <div class="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex flex-col justify-end p-8 transition-opacity duration-300">
                <div class="mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                    <h3 class="font-serif text-3xl text-white">${proj.title}</h3>
                </div>
                <div class="mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-50">
                    ${badgeHTML}
                </div>
                <p class="font-mono text-brand-accent text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform delay-100">[+] Ver detalhes</p>
            </div>
        `;
        galeriaContainer.appendChild(card);

        const bullet = document.createElement('button');
        bullet.className = "w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-300 focus:outline-none bg-slate-700 hover:bg-slate-500 cursor-pointer";
        bullet.setAttribute('aria-label', `Ir para projeto ${index + 1}`);
        bullet.setAttribute('data-bullet-index', index);

        bullet.addEventListener('click', (e) => {
            e.stopPropagation();
            stopAutoplayCompletely();
            scrollToIndex(index);
        });

        bulletsContainer.appendChild(bullet);
    });
}

function scrollToIndex(index) {
    const cards = galeriaContainer.querySelectorAll('[data-index]');
    if (!cards.length || !cards[index]) return;

    isProgrammaticScroll = true;
    updateActiveState(index);

    const targetCard = cards[index];
    const containerWidth = galeriaContainer.offsetWidth;
    const targetScrollLeft = targetCard.offsetLeft + (targetCard.offsetWidth / 2) - (containerWidth / 2);

    galeriaContainer.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });

    setTimeout(() => {
        isProgrammaticScroll = false;
    }, 600);
}

function updateActiveState(index) {
    if (!listaDeProjetos.length) return;
    currentIndex = index;

    const bullets = bulletsContainer.querySelectorAll('button');
    bullets.forEach((bullet, idx) => {
        if (idx === index) {
            bullet.classList.remove('bg-slate-700', 'hover:bg-slate-500');
            bullet.classList.add('bg-brand-accent', 'scale-125');
        } else {
            bullet.classList.remove('bg-brand-accent', 'scale-125');
            bullet.classList.add('bg-slate-700', 'hover:bg-slate-500');
        }
    });

    const cards = galeriaContainer.querySelectorAll('[data-index]');
    cards.forEach((card, idx) => {
        if (idx === index) {
            card.classList.remove('border-t-transparent', 'hover:border-t-slate-600', 'hover:bg-slate-900/20');
            card.classList.add('border-t-brand-accent', 'bg-slate-900/40');
            const img = card.querySelector('img');
            if (img) img.classList.remove('lg:grayscale');
        } else {
            card.classList.remove('border-t-brand-accent', 'bg-slate-900/40');
            card.classList.add('border-t-transparent', 'hover:border-t-slate-600', 'hover:bg-slate-900/20');
            const img = card.querySelector('img');
            if (img) img.classList.add('lg:grayscale');
        }
    });
}

function handleManualScroll() {
    if (isProgrammaticScroll) return;

    const cards = galeriaContainer.children;
    if (!cards.length) return;

    const containerWidth = galeriaContainer.offsetWidth;
    const containerCenter = galeriaContainer.scrollLeft + (containerWidth / 2);

    let closestIndex = 0;
    let closestDistance = Infinity;

    Array.from(cards).forEach((card, idx) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = idx;
        }
    });

    if (closestIndex !== currentIndex && closestIndex < listaDeProjetos.length) {
        updateActiveState(closestIndex);
    }
}

if (galeriaContainer) {
    galeriaContainer.addEventListener('scroll', handleManualScroll);
}

function startAutoplay() {
    if (!autoplayAtivo) return;
    clearInterval(autoplayTimer);

    autoplayTimer = setInterval(() => {
        if (!listaDeProjetos.length) return;

        let randomIndex = currentIndex;
        if (listaDeProjetos.length > 1) {
            while (randomIndex === currentIndex) {
                randomIndex = Math.floor(Math.random() * listaDeProjetos.length);
            }
        }
        scrollToIndex(randomIndex);
    }, 4000);
}

function pauseAutoplay() {
    if (autoplayAtivo) clearInterval(autoplayTimer);
}

function stopAutoplayCompletely() {
    autoplayAtivo = false;
    clearInterval(autoplayTimer);
}

function setupInteractions() {
    if (!galeriaContainer) return;
    galeriaContainer.addEventListener('mouseenter', pauseAutoplay);
    galeriaContainer.addEventListener('mouseleave', () => {
        if (autoplayAtivo) startAutoplay();
    });
}

// ==========================================
// 3. CONTROLE DO MODAL DE PROJETOS
// ==========================================

function openProjectModal(projeto) {
    if (!projectModal) return;

    projectModalImg.src = projeto.imgSrc;
    projectModalTitle.innerText = projeto.title;
    projectModalDesc.innerText = projeto.desc;
    projectModalCat.innerText = projeto.categoria || '--';
    projectModalPerf.innerText = projeto.performance || '--';

    // Injeta a badge semântica estilizada em formato HTML também dentro do Modal
    projectModalStatus.innerHTML = STATUS_BADGES[projeto.status] || STATUS_BADGES["Disponível"];
    projectModalLink.href = projeto.url || '#';

    projectModal.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
    projectModalDialog.classList.remove('translate-y-4');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    if (!projectModal) return;

    projectModal.classList.add('opacity-0', 'pointer-events-none', 'invisible');
    projectModalDialog.classList.add('translate-y-4');
    document.body.style.overflow = '';
}

document.getElementById('project-modal-close-btn')?.addEventListener('click', closeProjectModal);
document.getElementById('project-modal-cancel-btn')?.addEventListener('click', closeProjectModal);
document.getElementById('project-modal-backdrop')?.addEventListener('click', closeProjectModal);


// ==========================================
// 4. CONTROLE DO MODAL DE CONTATO DINÂMICO
// ==========================================

function initContatoModal() {
    if (!contatoModal) return;

    const svgs = {
        whatsapp: `<svg class="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.296 1.489 4.93 1.49 5.361 0 9.749-4.305 9.752-9.605.001-2.568-1.002-4.979-2.825-6.793C16.68 2.431 14.269 1.43 11.72 1.43 6.361 1.43 1.974 5.735 1.971 11.036c-.001 1.742.476 3.442 1.391 4.912l-.982 3.593 3.667-.957z"></path></svg>`,
        email: `<svg class="h-5 w-5 text-brand-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
    };

    function openModal(type, ctaKey) {
        const rawMessage = CONTATO_CONFIG.messages[ctaKey] || CONTATO_CONFIG.messages['default'];
        contatoModalMessage.innerText = rawMessage;
        contatoModalIcon.innerHTML = svgs[type] || '';

        if (type === 'whatsapp') {
            contatoModalTitle.innerText = 'Abrir WhatsApp';
            contatoModalConfirmBtn.innerText = 'Abrir Zap';
            contatoModalConfirmBtn.href = `https://api.whatsapp.com/send?phone=${CONTATO_CONFIG.whatsapp_phone}&text=${encodeURIComponent(rawMessage)}`;
            contatoModalConfirmBtn.className = "px-5 py-2.5 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-2";
        } else {
            contatoModalTitle.innerText = 'Redirecionar para Email';
            contatoModalConfirmBtn.innerText = 'Abrir Email';
            contatoModalConfirmBtn.href = `mailto:${CONTATO_CONFIG.email_address}?subject=${encodeURIComponent('Solicitação de Projeto // Pepa Dev')}&body=${encodeURIComponent(rawMessage)}`;
            contatoModalConfirmBtn.className = "px-5 py-2.5 rounded font-bold text-slate-950 bg-brand-accent hover:bg-brand-accent/90 transition-colors cursor-pointer flex items-center gap-2";
        }

        contatoModal.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
        contatoModalDialog.classList.remove('translate-y-4');
        document.body.style.overflow = 'hidden';
        contatoModalConfirmBtn.focus();
    }

    function closeModal() {
        contatoModal.classList.add('opacity-0', 'pointer-events-none', 'invisible');
        contatoModalDialog.classList.add('translate-y-4');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.modal-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(btn.getAttribute('data-type'), btn.getAttribute('data-cta'));
        });
    });

    contatoModalCloseBtn?.addEventListener('click', closeModal);
    contatoModalCancelBtn?.addEventListener('click', closeModal);
    contatoModalBackdrop?.addEventListener('click', closeModal);
    contatoModalConfirmBtn?.addEventListener('click', () => setTimeout(closeModal, 400));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (contatoModal && !contatoModal.classList.contains('invisible')) {
            contatoModalCancelBtn.click();
        }
        if (projectModal && !projectModal.classList.contains('invisible')) {
            closeProjectModal();
        }
    }
});


// ==========================================
// 5. SISTEMA DE TELEMETRIA (LIVE STATS)
// ==========================================

const initLiveStats = () => {
    const counters = document.querySelectorAll(".counter-up");
    const progressBars = document.querySelectorAll(".progress-fill");

    if (!counters.length && !progressBars.length) return;

    const startCounting = (element) => {
        const target = +element.getAttribute("data-target");
        const isFloat = element.getAttribute("data-float") === "true";
        const duration = 1500;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * target;

            element.innerText = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.innerText = isFloat ? target.toFixed(1) : target;
            }
        };
        requestAnimationFrame(updateNumber);
    };

    const statsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (el.classList.contains("counter-up")) startCounting(el);
                    // if (el.classList.contains("progress-fill")) el.style.width = (80 + (dataWidth - 90) * 2 - 2) + "%";
                    if (el.classList.contains("progress-fill")) el.style.width = el.getAttribute("data-width");
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.15 },
    );

    counters.forEach((counter) => statsObserver.observe(counter));
    progressBars.forEach((bar) => statsObserver.observe(bar));
};

// ==========================================
// CONTROLE DO BOTÃO SCROLL TO TOP
// ==========================================
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        } else {
            scrollTopBtn.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

initScrollToTop();

// ==========================================
// 6. INICIALIZAÇÃO E BOOTSTRAP
// ==========================================

initProjetos();
initContatoModal();

document.addEventListener("DOMContentLoaded", () => {
    initLiveStats();
});