# ⚡ PEPA.DEV.br // HIGH-DENSITY PORTFOLIO

[![Stack](https://img.shields.io/badge/Stack-Vite%20%7C%20Tailwind__v4%20%7C%20Vanilla__JS-emerald.svg?style=flat-pro)](https://github.com/pepa667)
[![Status](https://img.shields.io/badge/System__Status-Online-brightgreen.svg?style=flat-pro)](#)
[![Performance](https://img.shields.io/badge/Lighthouse-100%2F100-blueviolet.svg?style=flat-pro)](#)

Ambiente de portfólio pessoal e showcase técnico projetado com foco em densidade de dados, performance bruta e estética brutalista voltada para engenharia de software e hardware. O projeto elimina qualquer overhead de frameworks modernos, operando exclusivamente com renderização dinâmica nativa e otimização extrema de assets.

---

## 🛠️ Especificações Técnicas (Architecture Stack)

- **Engine Visual:** Tailwind CSS v4 (Compilação nativa ultra-leve, variáveis CSS nativas).
- **Core Runtime:** Vanilla JavaScript (ES6+) assíncrono isolado de dependências externas.
- **Data Layer:** Modelo assíncrono baseado em polling/fetch de arquivo estático centralizado (`projetos.json`).
- **Telemetry System:** Módulo tracker dinâmico integrado com `IntersectionObserver` para animação fluida de contadores e barras de hardware sem engasgos na thread principal do DOM.
- **Layout Control:** Carrossel horizontal inteligente integrado com travas (`isProgrammaticScroll`) para anular conflitos entre sensores manuais e rotinas de autoplay por amostragem aleatória.

---

## 📁 Estrutura de Diretórios Criítica

```text
├── src/
│   ├── assets/          # Sprites, mídias e imagens tratadas (WebP/SVG)
│   ├── styles/
│   │   └── style.css    # Diretivas do Tailwind v4 e resets fundamentais
│   └── main.js          # Core engine (Modais, Galeria, Telemetria e Eventos)
├── projetos.json        # Banco de dados estático e metadados de release
├── index.html           # Ponto de montagem estrutural semanticamente limpo
└── package.json         # Dependências de desenvolvimento e bundling

```

---

## ⚙️ Funcionalidades Implementadas

### 1. Roteamento de Comunicação Duplo (`initContatoModal`)

Injeção automatizada de strings predefinidas baseadas em contextos de chamadas à ação (CTAs). O sistema detecta o gatilho (`data-type` e `data-cta`) e reconfigura instantaneamente o nó do DOM, direcionando o payload via buffers específicos para APIs de mensageria (WhatsApp/Email), reduzindo o lixo de memória.

### 2. Sincronização Inteligente de Scroll (`scrollToIndex`)

Cálculo geométrico puro em eixos horizontais para centralizar elementos dinâmicos na viewport do cliente sem disparar saltos verticais indesejados nas janelas (`window`).

### 3. Teclado Físico & Acessibilidade Global

Tratamento centralizado de eventos físicos por meio de escutas nativas de barramento (`keydown`), permitindo o encerramento em cascata de elementos interativos e modais suspensos pela tecla `Escape`.

### 4. Telemetria Ativa (`initLiveStats`)

Rotinas baseadas em `requestAnimationFrame` que realizam interpolações matemáticas não-lineares (*easing*) em contadores numéricos, ativadas apenas quando os elementos entram na viewport ativa.

---

## 🚀 Inicialização Local

1. Instale os pacotes de desenvolvimento:
```bash
npm install

```


2. Dispare o servidor local em ambiente de sandbox:
```bash
npm run dev

```


3. Compile e otimize os assets finais para deploy em produção:
```bash
npm run build

```



---

## 📄 Licença

Desenvolvido por **Pedro Santos // Pepa**. Sob licença MIT.
Operando estritamente sob especificações de alta densidade visual.
