import './style.css'

// Mapeamento do DOM
const galeriaContainer = document.getElementById('galeriaContainer');
const bulletsContainer = document.getElementById('bulletsContainer');

const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalImg = document.getElementById('modalImg');
const modalLink = document.getElementById('modalLink');

const modalCat = document.getElementById('modalCat');
const modalPerf = document.getElementById('modalPerf');
const modalStatus = document.getElementById('modalStatus');

// Variáveis de estado globais
let listaDeProjetos = [];
let currentIndex = 0; // Guarda qual card está ativo atualmente
let autoplayTimer = null;
let autoplayAtivo = true;
let isProgrammaticScroll = false; // <-- NOVA FLAG: Trava o sensor de scroll manual durante animações
/**
 * Carrega os dados do JSON externo
 */
async function initPortfolio() {
    try {
        const response = await fetch('/projetos.json');
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

        listaDeProjetos = await response.json();

        renderPortfolio(listaDeProjetos);
        updateActiveState(0); // Começa destacando o primeiro item
        startAutoplay();      // Lança o timer aleatório
        setupInteractions();  // Configura os listeners de mouse/interação

    } catch (error) {
        console.error("Erro no portfólio:", error);
        if (galeriaContainer) {
            galeriaContainer.innerHTML = `<p class="font-mono text-red-500 p-8"># Erro ao carregar projetos.</p>`;
        }
    }
}

/**
 * Renderiza a Galeria e os Bullets com suporte a Scroll Centralizado
 */
function renderPortfolio(projetos) {
    if (!galeriaContainer || !bulletsContainer) return;

    galeriaContainer.innerHTML = '';
    bulletsContainer.innerHTML = '';

    projetos.forEach((proj, index) => {
        // Criar Card
        const card = document.createElement('div');

        // Configuração de classes do Tailwind v4:
        // Adicionado hover condicional quando o card NÃO for o ativo, e transições suaves
        card.className = "w-[100vw] lg:w-[33.333vw] h-[60vh] flex-none snap-center relative group cursor-pointer border-r border-t-4 border-t-transparent border-slate-800 transition-all duration-300 hover:border-t-slate-600 hover:bg-slate-900/20";
        card.setAttribute('data-index', index);

        card.addEventListener('click', () => {
            stopAutoplayCompletely();
            openModal(proj);
        });

        card.innerHTML = `
      <img src="${proj.imgSrc}" alt="${proj.title}" class="w-full h-full object-cover lg:grayscale lg:group-hover:grayscale-0 transition-all duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex flex-col justify-end p-8 transition-opacity duration-300">
        <h3 class="font-serif text-3xl text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">${proj.title}</h3>
        <p class="font-mono text-brand-accent text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">[+] Ver detalhes</p>
      </div>
    `;
        galeriaContainer.appendChild(card);

        // Criar Bullet
        const bullet = document.createElement('button');
        bullet.className = "w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-300 focus:outline-none bg-slate-700 hover:bg-slate-500";
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

/**
 * Move a galeria mantendo o card ativo no CENTRO da página de forma inteligente
 * SEM causar pulos ou scrolls verticais na página inteira
 */
function scrollToIndex(index) {
    const cards = galeriaContainer.querySelectorAll('[data-index]');
    if (!cards.length || !cards[index]) return;

    // Ativa a flag informando que o scroll foi programático
    isProgrammaticScroll = true;

    // Atualiza os estados visuais imediatamente
    updateActiveState(index);

    // --- O SEGREDO DO FIX AQUI: ---
    // Em vez de scrollIntoView, calculamos a posição horizontal exata para centralizar o card
    const targetCard = cards[index];
    const containerWidth = galeriaContainer.offsetWidth;

    // Posição do card em relação ao início da galeria + metade do tamanho dele - metade do tamanho da tela
    const targetScrollLeft = targetCard.offsetLeft + (targetCard.offsetWidth / 2) - (containerWidth / 2);

    // Executa o scroll horizontal puro, isolado de qualquer interferência vertical
    galeriaContainer.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });

    // Aguarda a animação suave terminar para liberar o sensor manual
    setTimeout(() => {
        isProgrammaticScroll = false;
    }, 600);
}

/**
 * Atualiza os estados visuais dos Cards e Bullets (Com tratamento especial de Hover para o ativo)
 */
function updateActiveState(index) {
    if (!listaDeProjetos.length) return;
    currentIndex = index;

    // 1. Sincroniza Bullets
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

    // 2. Sincroniza os Cards e desativa efeitos de hover genéricos no que já está ativo
    const cards = galeriaContainer.querySelectorAll('[data-index]');
    cards.forEach((card, idx) => {
        if (idx === index) {
            // Card Ativo: Ganha a borda da marca, fundo destacado e remove a variação cinza do hover comum
            card.classList.remove('border-t-transparent', 'hover:border-t-slate-600', 'hover:bg-slate-900/20');
            card.classList.add('border-t-brand-accent', 'bg-slate-900/40');

            // Força a imagem do card ativo a perder o filtro cinza mesmo sem o mouse por cima
            const img = card.querySelector('img');
            if (img) img.classList.remove('lg:grayscale');
        } else {
            // Cards Inativos: Voltam pro estado padrão esperando interação
            card.classList.remove('border-t-brand-accent', 'bg-slate-900/40');
            card.classList.add('border-t-transparent', 'hover:border-t-slate-600', 'hover:bg-slate-900/20');

            const img = card.querySelector('img');
            if (img) img.classList.add('lg:grayscale');
        }
    });
}
/**
 * Escuta o scroll manual (via trackpad/dedo) apenas se NÃO for um scroll programático
 */
function handleManualScroll() {
    // Se o scroll veio de um clique de bullet ou timer, ignora essa função completamente!
    if (isProgrammaticScroll) return;

    const cards = galeriaContainer.children;
    if (!cards.length) return;

    const containerWidth = galeriaContainer.offsetWidth;
    const containerCenter = galeriaContainer.scrollLeft + (containerWidth / 2);

    let closestIndex = 0;
    let closestDistance = Infinity;

    // Em vez de olhar só pro canto esquerdo, vamos ver qual card está mais perto do CENTRO real do container!
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

/**
 * SISTEMA DE AUTOPLAY (TIMER ALEATÓRIO)
 */
function startAutoplay() {
    if (!autoplayAtivo) return;

    // Limpa qualquer timer órfão antes de criar outro
    clearInterval(autoplayTimer);

    autoplayTimer = setInterval(() => {
        if (!listaDeProjetos.length) return;

        // Gera um número aleatório diferente do índice atual para dar efeito de troca dinâmica
        let randomIndex = currentIndex;
        if (listaDeProjetos.length > 1) {
            while (randomIndex === currentIndex) {
                randomIndex = Math.floor(Math.random() * listaDeProjetos.length);
            }
        }

        scrollToIndex(randomIndex);
    }, 4000); // Roda a cada 4 segundos
}

function pauseAutoplay() {
    if (autoplayAtivo) {
        clearInterval(autoplayTimer);
    }
}

function stopAutoplayCompletely() {
    autoplayAtivo = false;
    clearInterval(autoplayTimer);
}

/**
 * Configura as interações de Mouse para pausar temporariamente
 */
function setupInteractions() {
    if (!galeriaContainer) return;

    // Mouse entrou na galeria: Interrompe temporariamente
    galeriaContainer.addEventListener('mouseenter', pauseAutoplay);

    // Mouse saiu da galeria: Retoma o ciclo do timer de onde parou (se não tiver sido desativado por clique)
    galeriaContainer.addEventListener('mouseleave', () => {
        if (autoplayAtivo) startAutoplay();
    });
}

/**
 * Controle do Modal
 */
function openModal(projeto) {
    if (!modal) return;
    modalTitle.innerText = projeto.title;
    modalDesc.innerText = projeto.desc;
    modalImg.src = projeto.imgSrc;
    modalLink.href = projeto.url;
    modalCat.innerText = projeto.categoria;
    modalPerf.innerText = projeto.performance;
    modalStatus.innerText = projeto.status;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Inicialização Geral
initPortfolio();

window.closeModal = closeModal;