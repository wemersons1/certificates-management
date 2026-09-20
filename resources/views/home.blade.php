<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <script src="https://www.google.com/recaptcha/api.js?render=6Ld8SbgrAAAAAFhq1uwesRGy-Ot95uj-g9vzo-wy"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8K1V2BK8MV"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-8K1V2BK8MV');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Certificados - Geração, Emissão de Certificados Profissionais Automatizados</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/images/logo-flash.png') }}">

    <meta name="description" content="Flash Certificados: A plataforma completa para gerar, emitir e gerenciar certificados profissionais, treinamentos automatizados em segundos. Economize tempo e garante qualidade para seus cursos. Teste grátis!">

    <meta name="keywords" content="emitir certificados, emissor de certificados, gerador de certificados, certificados profissionais, plataforma de certificados, automação de certificados, gestão de certificados, cursos online, validação de certificados, assinatura dinâmica, certificados de treinamento SST">

    <meta property="og:title" content="Flash Certificados - Geração e Emissão de Certificados Profissionais">
    <meta property="og:description" content="A plataforma mais completa para gerar, emitir e gerenciar certificados profissionais. Economize tempo, garanta qualidade e impressione seus alunos.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.flashcertificados.com.br/">
    <meta property="og:locale" content="pt_BR">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@SeuTwitterHandle">
    <meta name="twitter:title" content="Flash Certificados - Geração e Emissão de Certificados">
    <meta name="twitter:description" content="Gere, emita e gerencie certificados profissionais. A solução ideal para cursos, instituições e conformidade com segurança do trabalho. Teste grátis!">
    <meta name="twitter:image" content="https://seusite.com.br/images/twitter-card-image.jpg">

    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
            tailwind.config = {
                darkMode: "class",
                theme: {
                    extend: {
                        colors: {
                            "primary": "#0d33f2",
                            "background-light": "#f5f6f8",
                            "background-dark": "#101322",
                        },
                        fontFamily: {
                            "display": ["Inter", "sans-serif"]
                        },
                        borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                    },
                },
            }
        </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Flash Certificados",
      "operatingSystem": "Web",
      "applicationCategory": "BusinessApplication",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "120"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL",
        "description": "Teste Grátis com 30 certificados",
        "availability": "https://schema.org/InStock"
      },
      "description": "Plataforma completa para geração, emissão e gestão automatizada de certificados profissionais, treinamentos para cursos e instituições.",
      "url": "https://seusite.com.br/",
      "logo": "https://seusite.com.br/images/logo-certificafacil.png",
      "publisher": {
        "@type": "Organization",
        "name": "Flash Certificados",
        "url": "https://seusite.com.br/",
        "sameAs": [
          "https://facebook.com/seuperfil",
          "https://linkedin.com/company/seuperfil",
          "https://twitter.com/seutwitterhandle"
        ]
      }
    }
    </script>
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
    <style>
        /* Restante do seu CSS */
        .pricing-toggle-card {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        .pricing-toggle-card .btn {
            border-radius: 50px;
            padding: 5px 15px;
            font-weight: bold;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        .pricing-toggle-card .btn.active {
            background-color: var(--primary);
            color: white;
        }
        .pricing-toggle-card .btn:not(.active) {
            background-color: #e9ecef;
            color: #495057;
        }
        .plan-card {
            background: white;
            border-radius: 21px;
            box-shadow: 0 10px 32px #2563eb1a;
            padding: 46px 34px;
            text-align: center;
            border-top: 8px solid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
        }
        .plan-card.free {
            border-color: #7c6cfa;
        }
        .plan-card.paid {
            border-color: #2563eb;
        }
        .plan-card .plan-name {
            font-size: 1.45rem;
            font-weight: 900;
            color: #18306b;
            margin-bottom: 15px;
        }
        .plan-card .plan-price {
            font-size: 3.3rem;
            font-weight: 900;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .plan-card .plan-period {
            font-size: 1.12rem;
            color: #64748b;
            margin-bottom: 22px;
        }
        .plan-card .plan-benefits {
            text-align: left;
            list-style: none;
            padding: 0;
            margin-bottom: 24px;
            color: #0c3b6e;
            flex-grow: 1;
        }
        .plan-card .plan-benefits li {
            margin-bottom: 10px;
        }
        .plan-card .plan-benefits li.included::before {
            content: '✅ ';
        }
        .plan-card .plan-benefits li.not-included::before {
            content: '❌ ';
            color: #ff4d4f;
        }
        .plan-card .btn-main {
            margin-top: auto;
            display: inline-block;
        }
        .modal-body ul {
            list-style: none;
            padding: 0;
        }
        .modal-body ul li {
            margin-bottom: 8px;
        }
        .email-unavailable-badge {
            background-color: #dc3545;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.85rem;
            margin-top: 5px;
            display: inline-block;
        }
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1090;
        }
        .toast.align-items-center {
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .toast.text-bg-success {
            background-color: #d4edda !important;
            color: #155724 !important;
            border-color: #badbcc;
        }
        .toast.text-bg-danger {
            background-color: #f8d7da !important;
            color: #721c24 !important;
            border-color: #f5c6cb;
        }
        .toast-header {
            background-color: transparent !important;
            border-bottom: none !important;
            padding-bottom: 0;
        }
        .toast-body {
            padding-top: 0;
        }
        .btn-loading .spinner-border {
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
        }
        .custom-select-container {
            position: relative;
            margin-bottom: 15px;
            width: 100%;
        }
        .custom-select-trigger {
            background-color: #fff;
            border: 1px solid #ced4da;
            border-radius: 0.375rem;
            padding: 0.375rem 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            min-height: calc(1.5em + 0.75rem + 2px);
        }
        .custom-select-trigger.active {
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .custom-select-trigger .selected-entity-content {
            display: flex;
            align-items: center;
            flex-grow: 1;
        }
        .custom-select-trigger .selected-entity-content img {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            margin-right: 10px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .custom-select-trigger .selected-entity-content span {
            font-size: 1rem;
            color: #495057;
        }
        .custom-select-trigger .dropdown-arrow {
            margin-left: 10px;
            transition: transform 0.3s ease;
        }
        .custom-select-trigger.active .dropdown-arrow {
            transform: rotate(180deg);
        }
        .custom-select-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #fff;
            border: 1px solid #ced4da;
            border-radius: 0.375rem;
            margin-top: 5px;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
        .custom-select-options.show {
            display: block;
        }
        .custom-select-option {
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.2s ease;
        }
        .custom-select-option:hover {
            background-color: #e9ecef;
        }
        .custom-select-option.selected {
            background-color: #0d6efd;
            color: white;
        }
        .custom-select-option img {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            margin-right: 10px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .custom-select-option span {
            font-size: 1rem;
        }
        .hidden-entity-input {
            display: none;
        }
        .whatsapp-float {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            display: flex;
            align-items: center;
            background-color: #25D366;
            color: white;
            border-radius: 50px;
            padding: 10px 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .whatsapp-float:hover {
            background-color: #128C7E;
            transform: scale(1.05);
        }
        .whatsapp-float .icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            filter: brightness(0) invert(1);
        }
        .whatsapp-float .text {
            font-weight: bold;
        }
        /* Slider styles */
        .carousel-item img {
            border-radius: 32px;
        }
    </style>
</head>
<body>
    <a href="https://api.whatsapp.com/send?phone=5562995690496&text=Olá! Estou com uma dúvida sobre a plataforma Flash Certificados." class="btn-cta whatsapp-float" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-whatsapp icon" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.534.068 7.92c0 1.354.39 2.628 1.05 3.732L.09 15.908l4.004-1.041a7.64 7.64 0 0 0 3.843.992h-.002c4.368 0 7.92-3.593 7.92-8.035c0-1.89-.741-3.69-2.079-5.067zM9.079 12.941a.588.588 0 0 1-.61.085c-.886-.465-3.04-1.89-3.414-2.585-.374-.695-.316-1.026.04-1.428.36-.4.9-.76.993-.837.093-.077.193-.207.289-.32.09-.115.176-.25.26-.385a.82.82 0 0 0-.48-1.06c-.45-.195-1.06-.505-1.472-.544-.41-.039-.714-.047-1.024-.047-.31 0-.582.01-.79.025-.208.016-.49.06-.723.293-.23.23-.88.854-.88 2.072 0 1.218.9 2.404 1.028 2.571.128.167 1.764 2.68 4.298 3.65a5.531 5.531 0 0 0 1.21.36c.453.056.845.035 1.15-.084.305-.12.888-.362 1.013-.75.125-.39.125-.724.088-.795-.037-.07-.137-.11-.284-.183z"/>
        </svg>
        <span class="text">Dúvidas? Fale Conosco!</span>
    </a>
    <nav class="landing-navbar">
        <div class="navbar-inner">
            <a href="#" class="logo-group">
                <img src="{{ asset('assets/images/logo-flash.png') }}" width="90px"  alt="Tela de Certificados">
                Flash Certificados
            </a>
            <div class="nav-items d-none d-lg-flex">
                <a class="nav-link" href="#recursos">Recursos</a>
                <a class="nav-link" href="#precos">Preços</a>
                <a class="nav-link" href="/sobre">Sobre</a>
                <a class="nav-link" href="/blog">Blog</a>
                <a class="nav-link d-flex align-items-center gap-1" href="/public/events/checkin" style="color: #2563eb; font-weight: 700; text-decoration: none;">
                    <i class="bi bi-qr-code-scan"></i> Check-in
                </a>
                <a class="btn-outline" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Entrar</a>
                <a class="btn-cta" href="#teste" data-bs-toggle="modal" data-bs-target="#registrationModal">Teste Grátis</a>
            </div>
            <button class="btn btn-link d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-controls="mobileNav" style="color: var(--primary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
            </button>
        </div>
    </nav>
    <div class="offcanvas offcanvas-end" tabindex="-1" id="mobileNav" aria-labelledby="mobileNavLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title logo-group" id="mobileNavLabel">Flash Certificados</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column">
            <a class="nav-link mb-3" href="#recursos" data-bs-dismiss="offcanvas">Recursos</a>
            <a class="nav-link mb-3" href="#precos" data-bs-dismiss="offcanvas">Preços</a>
            <a class="nav-link mb-3" href="#sobre" data-bs-dismiss="offcanvas">Sobre</a>
            <a class="nav-link mb-3 d-flex align-items-center gap-2" href="/public/events/checkin" data-bs-dismiss="offcanvas" style="color: #2563eb; font-weight: 700; text-decoration: none;">
                <i class="bi bi-qr-code-scan"></i> Check-in
            </a>
            <a class="btn-outline mb-3" href="#" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="#loginModal">Entrar</a>
            <a class="btn-cta mt-auto" href="#teste" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="#registrationModal">Teste Grátis</a>
        </div>
    </div>

    <section class="relative overflow-hidden py-16 lg:py-24 font-display">
        <div class="container mx-auto px-4">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="flex flex-col gap-8">

                    <h1 class="text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                        Emita certificados profissionais em <span class="text-primary">segundos.</span>
                    </h1>
                    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                        A solução mais rápida e segura para seus cursos e treinamentos. Automatize o envio e foque no que importa: o conteúdo.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="bg-primary text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2" data-bs-toggle="modal" data-bs-target="#registrationModal">
                            Começar Agora Gratuitamente
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <button class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2" onclick="window.location.href='#demo'">
                            Ver Demonstração
                        </button>
                    </div>
                    
                    <div class="text-sm font-bold text-slate-500 flex items-center gap-2">
                         ✨ Teste grátis com 30 certificados • Opção de créditos avulsos sem mensalidade!
                    </div>

                    <div class="flex items-center gap-4 text-sm text-slate-500">
                        <div class="flex -space-x-2">
                            <div class="w-8 h-8 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900 overflow-hidden">
                                <div class="w-full h-full bg-cover" data-alt="User avatar 1" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_fJ1zrxTvqTOtxjrnta4NVYCeM7iblNxXNJnh4w4xpT26-9anwgZP_GvB1pjYCeDNViwUiKMpbCpKTmX4E3jYPJmLxzWCI7ZK68WZndO7iv40y7kzseagbJvzHcy8Z6UC0OxGwZumOazQ6gfHDkRcYBuhsDpDi4XPujJ63jKoIXzxXU9VoYZTSBx4p5WdUoJHI7YHj4naKLFY4C1YMZDrg_gTYMOOoGORtfRUUcehQy1v30nC1o8JKlENLRRssUtokeFvBLUTASA')"></div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 overflow-hidden">
                                <div class="w-full h-full bg-cover" data-alt="User avatar 2" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKjGzUzC6gqfaiBZ4B2OVsmYFx0fsMGdfcuRhab7ADH_ghGNWMPrveSOdMomNCvwy4kxyWezP2osclDd9AnxEkLNqxuXy4EDPucer8ZF-MwN6on0Tjhr-m4mBJIYto01-Fg3peIWu1E4YCMO7n2gMAuwZKhaa6TZkd0mBLlKL46E_PU7pbForSzd8GG4qT4LBPc14dZn8OVVeYnURsxTohd_-5afC2U6aHywX3GoA1iRQBLD-GmEUhCPV9w8rF5NI9fjIqwFeLHIc')"></div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-slate-500 border-2 border-white dark:border-slate-900 overflow-hidden">
                                <div class="w-full h-full bg-cover" data-alt="User avatar 3" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtHsiIuVYer42S4FLCfbc6Mm7B3FxoEpHR1sqTJSuU7-f4KqCQZJhyBhvnHdW3yzIFOJjuIm6u2-cO9xEeu8zkY2o3c9CFXppWf7BS0ZrfVYewAvqDZKWUld7ROlG2oBsJeXMSH34VgFMLygAqTomjFOPwPc8Ed_00rQy3x6txN4n5JYkRehV9L9DMwgCEfd9qjmaaDX9bqeSPSRUmL8jWmEj77Yu5rlHxQR2VTpmg-rx7dAcaWRJ1MblG4l4Y0_NJFf6oUQ8ulx4')"></div>
                            </div>
                        </div>
                        <span>+2.000 instrutores já confiam</span>
                    </div>
                </div>
                <div class="relative">
                    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                    <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                    <div class="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div class="w-full aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                            <div class="w-full h-full bg-cover bg-center" data-alt="Preview of professional certificate dashboard" style='background-image: url("{{ asset('assets/images/certificado_gold.png') }}")'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    

    <section class="section" id="recursos">
        <h2 class="section-title">Por que escolher o Flash Certificados?</h2>
        <div class="section-desc">
            Transforme a forma como você emite certificados com nossa tecnologia avançada
        </div>
        <div class="features-grid row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            <div class="feature-card col">
                <div class="feature-icon-bg">⚡</div>
                <div class="feature-title">Emissão Automatizada</div>
                <div class="feature-desc">Gere centenas de certificados em segundos com nossa automação inteligente</div>
            </div>
            <div class="feature-card col">
                <div class="feature-icon-bg">🔔</div>
                <div class="feature-title">Notificação Inteligente</div>
                <div class="feature-desc">Receba alertas automáticos sobre certificados próximos ao vencimento</div>
            </div>
            <div class="feature-card col">
                <div class="feature-icon-bg">✒️</div>
                <div class="feature-title">Assinatura Dinâmica</div>
                <div class="feature-desc">Assinaturas digitais personalizáveis que garantem autenticidade e segurança</div>
            </div>
            <div class="feature-card col">
                <div class="feature-icon-bg">⬇️</div>
                <div class="feature-title">Exportação PDF</div>
                <div class="feature-desc">PDFs profissionais de alta qualidade, prontos para impressão ou compartilhamento</div>
            </div>
        </div>
    </section>

    <section class="py-20 bg-slate-900 text-white font-display" id="precos">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-black mb-4">Planos que crescem com você</h2>
                <p class="text-slate-400 max-w-2xl mx-auto">Comece grátis e escale conforme sua demanda aumenta.</p>
            </div>
            
            <!-- Container for dynamic plans -->
            <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" id="plansContainer">
            </div>

            <!-- Pay-per-use Credit Packages Announcement -->
            <div class="mt-16 bg-slate-800/80 backdrop-blur border border-slate-700 p-8 md:p-12 rounded-3xl max-w-4xl mx-auto relative overflow-hidden" style="box-shadow: 0 10px 30px -10px rgba(13, 51, 242, 0.15)">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
                <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                
                <div class="relative grid md:grid-cols-3 gap-8 items-center">
                    <div class="md:col-span-2">
                        <div class="inline-flex items-center gap-2 bg-primary/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30">
                            🔥 Sem Assinatura Mensal
                        </div>
                        <h3 class="text-2xl md:text-3xl font-black mb-4">Prefere pagar apenas pelo que usar?</h3>
                        <p class="text-slate-300 text-sm md:text-base leading-relaxed">
                            Se sua demanda de certificados é esporádica, nossa modalidade de <strong>Créditos Avulsos</strong> é perfeita para você. Compre pacotes sob medida e emita seus certificados no seu próprio ritmo nos próximos 30 dias.
                        </p>
                    </div>
                    <div class="flex flex-col gap-3 justify-center">
                        <div class="bg-slate-900/60 border border-slate-700/60 p-4 rounded-2xl text-center">
                            <span class="block text-xs text-slate-400 font-bold uppercase tracking-wide">A partir de apenas</span>
                            <span class="block text-3xl font-black text-emerald-400 my-1">R$ 1,99</span>
                            <span class="block text-xs text-slate-400">por certificado emitido</span>
                        </div>
                        <button class="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all text-sm shadow-lg shadow-primary/20" data-bs-toggle="modal" data-bs-target="#registrationModal">
                            Ver Pacotes de Créditos
                        </button>
                    </div>
                </div>
                
                <div class="mt-8 pt-8 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                    <div class="flex items-center gap-3 justify-center sm:justify-start">
                        <span class="material-symbols-outlined text-emerald-400 text-2xl">shopping_cart</span>
                        <div>
                            <h4 class="font-bold text-sm text-white">Certificado Avulso</h4>
                            <p class="text-xs text-slate-400">Compre a partir de 1 crédito</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 justify-center sm:justify-start">
                        <span class="material-symbols-outlined text-emerald-400 text-2xl">trending_down</span>
                        <div>
                            <h4 class="font-bold text-sm text-white">Desconto Progressivo</h4>
                            <p class="text-xs text-slate-400">Quanto maior o pacote, menos você paga</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 justify-center sm:justify-start">
                        <span class="material-symbols-outlined text-emerald-400 text-2xl">calendar_today</span>
                        <div>
                            <h4 class="font-bold text-sm text-white">Validade de 30 Dias</h4>
                            <p class="text-xs text-slate-400">Use os créditos em até 30 dias</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-blue-section" id="tecnologia">
        <div class="section row gx-4 gy-4 align-items-start">
            <div class="col-12 col-lg-8 text-center text-lg-start">
                <div class="tech-badge">Tecnologia Avançada</div>
                <div class="tech-title">A revolução na emissão de certificados chegou</div>

                <ul class="tech-list">
                    <li>Interface intuitiva e fácil de usar</li>
                    <li>Templates profissionais personalizáveis</li>
                    <li>Segurança e autenticidade garantidas</li>
                </ul>
            </div>
            <div class="col-12 col-lg-4 d-flex justify-content-center">
                <div class="stats-box">
                    <div>
                        <div class="stats-item">50k+</div>
                        <div class="stats-label">Certificados Emitidos</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="padding-bottom:0;">
        <h2 class="section-title">Recursos Poderosos</h2>
        <div class="section-desc">
            Tudo que você precisa para uma gestão completa de certificados
        </div>
        <div class="features-grid row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" style="margin-bottom:0;">
            <div class="feature-card col">
                <div class="feature-icon-bg">👥</div>
                <div class="feature-title">Gestão de Alunos</div>
                <div class="feature-desc">Importe e gerencie dados dos alunos de forma simples e organizada.</div>
            </div>
            <div class="feature-card col">
                <div class="feature-icon-bg">🛡️</div>
                <div class="feature-title">Validação Segura</div>
                <div class="feature-desc">Códigos únicos de validação para garantir a autenticidade dos certificados.</div>
            </div>
            <div class="feature-card col">
                <div class="feature-icon-bg">⏳</div>
                <div class="feature-title">Controle de Validade</div>
                <div class="feature-desc">Defina prazos de validade e receba notificações automáticas.</div>
            </div>
        </div>
    </section>

    <section class="hero-section" style="margin-top:0; background: var(--background-alt)">
        <h2 class="section-title" id="demo">Veja como é simples</h2>
        <div class="section-desc">
            Conheça nossa plataforma e descubra como revolucionar a emissão de certificados na sua instituição
        </div>
        <div class="container">
            <div class="mx-auto" style="margin-top: 52px; max-width: 760px; border-radius: 32px; box-shadow: 0 8px 32px #2563eb0f; overflow: hidden;">
                <div id="demoCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-pause="false">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#demoCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#demoCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#demoCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        <button type="button" data-bs-target="#demoCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="{{ asset('assets/images/certificado.jpg') }}" class="d-block w-100" alt="Tela de Certificados">
                        </div>
                        <div class="carousel-item">
                            <img src="{{ asset('assets/images/dashboard.jpg') }}" class="d-block w-100" alt="Dashboard do Sistema">
                        </div>
                        <div class="carousel-item">
                            <img src="{{ asset('assets/images/gerar-certificados.jpg') }}" class="d-block w-100" alt="Tela de Importação">
                        </div>
                        <div class="carousel-item">
                            <img src="{{ asset('assets/images/validacao-online.jpg') }}" class="d-block w-100" alt="Editor de Templates">
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#demoCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" ></span>
                        <span class="visually-hidden">Anterior</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#demoCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" ></span>
                        <span class="visually-hidden">Próximo</span>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="testemunhos">
        <h2 class="section-title">O que nossos clientes dizem</h2>
        <div class="features-grid row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" style="margin-top: 24px;">
            <div class="feature-card col">
                <div style="color: #ffc107; font-size: 1.3rem; margin-bottom: 8px;">★★★★★</div>
                <div class="feature-desc" style="font-size: 1.08rem; margin-bottom: 22px;">
                    "Reduziu nosso tempo de emissão de certificados em 90%. Incrível!"
                </div>
                <div style="display:flex; align-items: center; justify-content: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: #e6edff;"></div>
                    <div>
                        <strong>Maria Silva</strong><br>
                        <small style="color:#5a6fd2;">Diretora Acadêmica</small>
                    </div>
                </div>
            </div>
            <div class="feature-card col">
                <div style="color: #ffc107; font-size: 1.3rem; margin-bottom: 8px;">★★★★★</div>
                <div class="feature-desc" style="font-size: 1.08rem; margin-bottom: 22px;">
                    "A qualidade dos certificados impressiona nossos alunos. Recomendo!"
                </div>
                <div style="display:flex; align-items: center; justify-content: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: #e6edff;"></div>
                    <div>
                        <strong>João Santos</strong><br>
                        <small style="color:#5a6fd2;">Coordenador de Cursos</small>
                    </div>
                </div>
            </div>
            <div class="feature-card col">
                <div style="color: #ffc107; font-size: 1.3rem; margin-bottom: 8px;">★★★★★</div>
                <div class="feature-desc" style="font-size: 1.08rem; margin-bottom: 22px;">
                    "Interface simples e recursos poderosos. Exatamente o que precisávamos."
                </div>
                <div style="display:flex; align-items: center; justify-content: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: #e6edff;"></div>
                    <div>
                        <strong>Ana Costa</strong><br>
                        <small style="color:#5a6fd2;">Gestora de TI</small>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="modal fade" id="hireModal" tabindex="-1" aria-labelledby="hireModalLabel" >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="hireModalLabel">Contratar Plano</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="my-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p class="text-slate-600 mb-2">Para contratar o plano <strong id="modalPlanName" class="text-slate-900"></strong>, por <strong id="modalPlanPrice" class="text-primary text-lg"></strong> você precisará criar uma conta.</p>
                        <p class="text-sm font-bold text-slate-700 mb-2">Com este plano você terá:</p>
                        <ul id="modalPlanBenefits" class="text-sm text-slate-600 space-y-1 ml-4 list-disc marker:text-primary">
                        </ul>
                    </div>
                    
                    <div class="relative flex py-2 items-center mb-4">
                        <div class="flex-grow border-t border-slate-200"></div>
                        <span class="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">Crie sua conta para prosseguir</span>
                        <div class="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div class="d-flex flex-column gap-3 mb-4">
                        <button type="button" name="googleLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md" onclick="loginComGoogle()">
                            <svg class="w-5 h-5" viewBox="0 0 186.69 190.5">
                                <g transform="translate(1184.583 765.171)">
                                    <path fill="#4285f4" d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"></path>
                                    <path fill="#34a853" d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"></path>
                                    <path fill="#fbbc05" d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"></path>
                                    <path fill="#ea4335" d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"></path>
                                </g>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button type="button" name="linkedinLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md">
                            <svg class="w-5 h-5" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
                            <span>LinkedIn</span>
                        </button>
                    </div>

                    <div class="relative flex py-2 items-center mb-4">
                        <div class="flex-grow border-t border-slate-200"></div>
                        <span class="flex-shrink-0 mx-4 text-slate-400 text-sm">ou com e-mail</span>
                        <div class="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form id="hireForm">
                        <input type="hidden" name="recaptcha_response" class="recaptchaResponse">
                        <div class="mb-4">
                            <label for="hireFullName" class="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <input type="text" name="name" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" placeholder="Nome Completo" id="hireFullName" required>
                        </div>
                        <div class="mb-4">
                            <label for="hireEmail" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" name="email" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" placeholder="email@example.com" id="hireEmail" required onblur="checkEmailAvailabilityHire()">
                            <div id="hireEmailAvailabilityFeedback"></div>
                        </div>
                        <div class="mb-4">
                            <label for="hirePhone" class="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                            <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="hirePhone" placeholder="(XX) XXXXX-XXXX" pattern="^\(\d{2}\) \d{4,5}-\d{4}$" required>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="hirePassword" class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                                <input type="password" name="password" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" placeholder="••••••••" id="hirePassword" required minlength="8">
                            </div>
                            <div>
                                <label for="hireConfirmPassword" class="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                                <input type="password" name="password_confirmation" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" placeholder="••••••••" id="hireConfirmPassword" required>
                            </div>
                        </div>

                        <div class="mb-6 flex items-center">
                            <input type="checkbox" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" id="hireTermsCheck" required>
                            <label class="ml-2 block text-sm text-slate-600" for="hireTermsCheck">
                                Eu aceito os <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal" id="openHireTermsModalLink" class="text-primary hover:text-primary-dark hover:underline">Termos e Condições</a>
                            </label>
                        </div>
                        <input type="hidden" id="hirePlanId" name="plan_id">
                        <input type="hidden" id="hireTermId" name="term_id">
                        <input type="hidden" id="hirePeriodicity" name="periodicity">
                        <button type="submit" class="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30" id="hireSubmitBtn">Criar Conta</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="registrationModal" tabindex="-1" aria-labelledby="registrationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="registrationModalLabel">Cadastre-se para o Teste Grátis</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-4">
                    
                    <div class="d-flex flex-column gap-3 mb-4">
                        <button type="button" name="googleLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md" onclick="loginComGoogle()">
                            <svg class="w-5 h-5" viewBox="0 0 186.69 190.5">
                                <g transform="translate(1184.583 765.171)">
                                    <path fill="#4285f4" d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"></path>
                                    <path fill="#34a853" d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"></path>
                                    <path fill="#fbbc05" d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"></path>
                                    <path fill="#ea4335" d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"></path>
                                </g>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button type="button" name="linkedinLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md">
                            <svg class="w-5 h-5" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
                            <span>LinkedIn</span>
                        </button>
                    </div>

                    <div class="relative flex py-2 items-center mb-4">
                        <div class="flex-grow border-t border-slate-200"></div>
                        <span class="flex-shrink-0 mx-4 text-slate-400 text-sm">ou use seu e-mail para cadastrar</span>
                        <div class="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form id="registrationForm">
                        <input type="hidden" name="recaptcha_response" class="recaptchaResponse">
                        
                        <div class="mb-4">
                            <label for="regName" class="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <input type="text" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="regName" placeholder="Seu nome" name="name" required>
                        </div>

                        <div class="mb-4">
                            <label for="regEmail" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="regEmail" placeholder="email@example.com" name="email" required onblur="checkEmailAvailabilityReg()">
                            <div id="emailAvailabilityFeedback"></div>
                        </div>

                        <div class="mb-4">
                            <label for="regPhone" class="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                            <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="regPhone" placeholder="(XX) XXXXX-XXXX" pattern="^\(\d{2}\) \d{4,5}-\d{4}$" required>
                        </div>

                        <div class="mb-4">
                            <label for="regSegment" class="block text-sm font-medium text-slate-700 mb-1">Segmento da empresa</label>
                            <select class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800 bg-white" required id="regSegment" name="business_segment_id">
                                <option value="">Selecione um segmento</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="regPassword" class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                                <input type="password" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="regPassword" placeholder="••••••••" name="password" required minlength="8">
                            </div>
                            <div>
                                <label for="regConfirmPassword" class="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                                <input type="password" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="regConfirmPassword" placeholder="••••••••" name="password_confirmation" required>
                            </div>
                        </div>

                        <div class="mb-6 flex items-center">
                            <input type="checkbox" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" id="regTermsCheck" required>
                            <label class="ml-2 block text-sm text-slate-600" for="regTermsCheck">
                                Eu aceito os <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal" id="openRegTermsModalLink" class="text-primary hover:text-primary-dark hover:underline">Termos e Condições</a>
                            </label>
                        </div>

                        <input type="hidden" id="regTermId" name="term_id">
                        <input type="hidden" id="regPlanId" name="plan_id">
                        <input type="hidden" id="regPeriodicity" name="periodicity" value="monthly">

                        <button type="submit" class="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30" id="regSubmitBtn">Criar Conta e Começar</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modern-modal-content">
                <div class="modal-header modern-modal-header">
                    <h5 class="modal-title section-title" id="loginModalLabel" style="margin-bottom: 0; text-align: center; width: 100%;">Entrar na Flash Certificados</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modern-modal-body">
                    <div class="d-flex flex-column gap-3 my-4">
                        <button name="googleLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md">
                            <svg class="w-5 h-5" viewBox="0 0 186.69 190.5">
                                <g transform="translate(1184.583 765.171)">
                                    <path fill="#4285f4" d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"></path>
                                    <path fill="#34a853" d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"></path>
                                    <path fill="#fbbc05" d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"></path>
                                    <path fill="#ea4335" d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"></path>
                                </g>
                            </svg>
                            <span>Entrar com Google</span>
                        </button>
                        <button name="linkedinLogin" class="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium gap-3 bg-white shadow-sm hover:shadow-md">
                            <svg class="w-5 h-5" fill="#0077b5" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
                            <span>Entrar com LinkedIn</span>
                        </button>
                    </div>
                    <form id="loginForm">
                        <div class="mb-4">
                            <label for="loginEmail" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="loginEmail" name="email" onkeyup="hideSelectCompanies()" required placeholder="email@example.com">
                        </div>
                        <div id="entitySelectionContainer" class="custom-select-container" style="display: none;">
                            <label for="selectedEntityDisplay" class="block text-sm font-medium text-slate-700 mb-1">Selecionar Empresa</label>
                            <div class="custom-select-trigger" id="selectedEntityDisplay">
                                <div class="selected-entity-content">
                                    <img src="" alt="Logo" class="entity-option-image" id="selectedEntityImage" style="display: none;">
                                    <span id="selectedEntityText">Selecione uma empresa</span>
                                </div>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="custom-select-options" id="customSelectOptions">
                            </div>
                            <input type="hidden" id="entityIdInput" name="entity_id">
                        </div>
                        <div class="mb-4">
                            <label for="loginPassword" class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                            <div class="relative">
                                <input type="password" class="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-slate-800" id="loginPassword" name="password" required placeholder="••••••••">
                                <button class="absolute right-0 top-0 bottom-0 px-4 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center" type="button" id="togglePasswordVisibility">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4 text-right">
                            <a href="#" class="text-sm font-medium text-primary hover:text-primary-dark hover:underline" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal" data-bs-dismiss="modal">Esqueceu a senha?</a>
                        </div>
                        <button type="submit" class="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30" id="loginSubmitBtn">Fazer Login</button>
                    </form>
                    
                    <div class="text-center mt-4">
                        <p class="section-desc mb-0">Não tem uma conta?</p>
                        <a href="#" class="create-account-link" data-bs-toggle="modal" data-bs-target="#registrationModal" data-bs-dismiss="modal">Crie sua conta gratuitamente</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="forgotPasswordModal" tabindex="-1" aria-labelledby="forgotPasswordModalLabel" >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modern-modal-content">
                <div class="modal-header modern-modal-header">
                    <h5 class="modal-title section-title" id="forgotPasswordModalLabel" style="margin-bottom: 0; text-align: center; width: 100%;">Recuperar Senha</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modern-modal-body">
                    <p class="section-desc" style="margin-bottom: 30px; text-align: center;">Informe seu email para enviarmos um link de recuperação.</p>
                    <form id="forgotPasswordForm">
                        <div class="mb-3">
                            <label for="forgotPasswordEmail" class="form-label modern-form-label">Email</label>
                            <input type="email" class="form-control modern-form-control" id="forgotPasswordEmail" name="email" required placeholder="seu@email.com">
                        </div>
                        <button type="submit" class="btn btn-primary w-100 modern-btn-primary" id="forgotPasswordSubmitBtn">Enviar Link</button>
                    </form>
                    <div class="text-center mt-4">
                        <a href="#" class="create-account-link" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Voltar para o Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="selectEntityPasswordModal" tabindex="-1" aria-labelledby="selectEntityPasswordModalLabel" >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modern-modal-content">
                <div class="modal-header modern-modal-header">
                    <h5 class="modal-title section-title" id="selectEntityPasswordModalLabel" style="margin-bottom: 0; text-align: center; width: 100%;">Selecione a Empresa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body modern-modal-body">
                    <p class="section-desc" style="margin-bottom: 30px; text-align: center;">Seu email está associado a múltiplas empresas. Por favor, selecione qual empresa você deseja redefinir a senha.</p>
                    <form id="selectEntityPasswordForm">
                        <div id="forgotPasswordEntitySelectionContainer" class="custom-select-container">
                            <label for="selectedForgotPasswordEntityDisplay" class="form-label modern-form-label">Selecionar Empresa</label>
                            <div class="custom-select-trigger" id="selectedForgotPasswordEntityDisplay">
                                <div class="selected-entity-content">
                                    <img src="" alt="Logo" class="entity-option-image" id="selectedForgotPasswordEntityImage" style="display: none;">
                                    <span id="selectedForgotPasswordEntityText">Selecione uma empresa</span>
                                </div>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="custom-select-options" id="customSelectForgotPasswordOptions">
                            </div>
                            <input type="hidden" id="forgotPasswordEntityIdInput" name="entity_id">
                            <input type="hidden" id="forgotPasswordEmailInput" name="email">
                        </div>
                        <button type="submit" class="btn btn-primary w-100 modern-btn-primary" id="selectEntityPasswordSubmitBtn">Enviar Link</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" >
        <div class="modal-dialog modal-dialog-scrollable modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="termsModalLabel">Termos e Condições de Uso</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="termsModalContent">
                    Carregando termos e condições...
                </div>
                <div class="modal-footer">
                    <button type="button" id="closeTermsBtn" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" id="acceptTermsBtn">Aceitar Termos</button>
                </div>
            </div>
        </div>
    </div>

    <div class="toast-container">
        <div id="liveToast" class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
    <input type="hidden" id="instanceModalSelected"/>

    <footer style="background: #1e3a8a; color: white; padding: 70px 34px 40px 34px; box-shadow: var(--shadow-footer);">
        <div class="section row gx-4 gy-4 justify-content-between">
            <div class="col-12 col-md-3 text-center text-md-start">
                <div class="logo-group d-flex justify-content-center justify-content-md-start">
                    🏅 Flash Certificados
                </div>
                <p style="font-size: 1.09rem; color: #dbeafe;">A plataforma mais completa para emissão de certificados profissionais</p>
            </div>
            <div class="col-12 col-md-2 text-center text-md-start">
                <h5 style="margin-bottom: 13px; font-weight: bold;">Produto</h5>
                <a href="#recursos" style="color: #fff; display: block; margin-bottom: 7px;">Recursos</a>
                <a href="#precos" style="color: #fff; display: block; margin-bottom: 7px;">Preços</a>
            </div>
        </div>
        <div style="text-align: center; font-size: 15px; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.13); padding-top: 22px;">
            © {{ date('Y') }} Flash Certificados. Todos os direitos reservados.
        </div>
    </footer>
    <div class="cookie-consent" id="cookieConsentBar">
        <p>Este site utiliza cookies para garantir que você tenha a melhor experiência. Ao continuar, você concorda com nossa <a href="/politica-de-privacidade" style="color: #fff; text-decoration: underline;">Política de Privacidade</a>.</p>
        <button onclick="acceptCookies()">Entendi!</button>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        window.addEventListener('scroll', function() {
            const nav = document.querySelector('.landing-navbar');
            if(window.scrollY > 10) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        });

        let allPlans = [];
        let termsAndConditions = null;
        let freeTrialPlanId = null;

        function showToast(message, type = 'success') {
            const toastElement = document.getElementById('liveToast');
            const toastBody = toastElement.querySelector('.toast-body');
            toastBody.textContent = message;

            toastElement.classList.remove('text-bg-success', 'text-bg-danger');
            if (type === 'success') {
                toastElement.classList.add('text-bg-success');
            } else if (type === 'error') {
                toastElement.classList.add('text-bg-danger');
            }

            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }

     
        const openRegisterFreeModal = () => {
            const registrationModalElement = document.getElementById('registrationModal');
            
            if (!registrationModalElement) {
                console.error('O elemento #registrationModal não foi encontrado.');
                return;
            }

            const registrationModal = new bootstrap.Modal(registrationModalElement);
            
            registrationModal.show();
        }

        const openLoginModal = () => {
            const loginModalElement = document.getElementById('loginModal');
            
            if (!loginModalElement) {
                console.error('O elemento #loginModal não foi encontrado.');
                return;
            }

            const loginModal = new bootstrap.Modal(loginModalElement);
            
            loginModal.show();
        }

        const fetchPlans = async () => {
            try {
                const response = await fetch('/api/setup');
                const data = await response.json();
                allPlans = data.plans;
                termsAndConditions = data.term_and_condition;

                const freePlan = allPlans.find(plan =>
                    (plan.monthly_value === null || plan.monthly_value === 0) &&
                    (plan.annual_value === null || plan.annual_value === 0) &&
                    plan.quantity_days
                );

                if (freePlan) {
                    freeTrialPlanId = freePlan.id;
                    document.getElementById('regPlanId').value = freeTrialPlanId;
                }

                document.getElementById('termsModalContent').innerHTML = termsAndConditions ? termsAndConditions.content : 'Termos e Condições não disponíveis.';
                document.getElementById('regTermId').value = termsAndConditions ? termsAndConditions.id : '';
                document.getElementById('hireTermId').value = termsAndConditions ? termsAndConditions.id : '';
                renderPlans();
            } catch (error) {
                console.error("Error fetching plans:", error);
                document.getElementById('plansContainer').innerHTML = '<p class="text-center">Não foi possível carregar os planos no momento. Tente novamente mais tarde.</p>';
                showToast('Erro ao carregar dados. Tente novamente mais tarde.', 'error');
            }
        };

        const renderPlans = () => {
            const plansContainer = document.getElementById('plansContainer');
            plansContainer.innerHTML = '';
            
            allPlans.forEach(plan => {
              
                let isAnnualSelected = false;

                const getPriceAndPeriod = (isAnnual) => {
                    const valueInCents = isAnnual ? plan.annual_value : plan.monthly_value;
                    const isFree = valueInCents === null || valueInCents === 0;

                    let priceHtml;
                    let periodText;
                    const periodicityValue = isAnnual ? 'annual' : 'monthly';

                    if (isFree) {
                        priceHtml = '<span class="text-4xl font-black">R$ 0</span>';
                        periodText = '/mês';
                    } else if (isAnnual) {
                        const valueInBRL = valueInCents / 1200;
                        const [whole, cents] = valueInBRL.toFixed(2).split('.');
                        priceHtml = `<span class="text-xl font-bold">12x</span> <span class="text-4xl font-black">R$ ${whole},${cents}</span>`;
                        periodText = '';
                    } else { // monthly
                        const valueInBRL = valueInCents / 100;
                        const [whole, cents] = valueInBRL.toFixed(2).split('.');
                        priceHtml = `<span class="text-4xl font-black">R$ ${whole},${cents}</span>`;
                        periodText = '/mês';
                    }
                    return { priceHtml, periodText, isFree, periodicityValue };
                };

                let { priceHtml, periodText, isFree, periodicityValue } = getPriceAndPeriod(isAnnualSelected);
                const certificatesInfo = plan.quantity_certificates ? `${plan.quantity_certificates} certificados` : '';

                const planCardDiv = document.createElement('div');
                // Removing col-md-3 as parent is grid
                // planCardDiv.classList.add('col-md-3');

                
                if (isFree) {
                    planCardDiv.className = 'bg-slate-800 p-10 rounded-3xl border border-slate-700 flex flex-col';
                    planCardDiv.innerHTML = `
                        <div class="mb-8">
                            <h3 class="text-2xl font-bold mb-2">${firstLetterUppercase(plan.name)}</h3>
                            <div class="flex items-baseline gap-1" class="plan-price" data-plan-id="${plan.id}">
                                ${priceHtml}
                                <span class="text-slate-400">${periodText}</span>
                            </div>
                            ${plan.quantity_certificates ? `
                            <div class="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-500/20">
                                <span class="material-symbols-outlined text-[18px]">verified</span>
                                ${plan.quantity_certificates} Certificados / mês
                            </div>` : ''}
                        </div>
                        <ul class="flex flex-col gap-4 mb-10 flex-grow plan-benefits">
                             ${plan.benefits.map(benefit => `
                                <li class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-emerald-400">check_circle</span>
                                    ${benefit.name}
                                </li>
                             `).join('')}
                        </ul>
                        <button class="w-full py-4 rounded-xl border border-slate-600 font-bold hover:bg-slate-700 transition-all text-white" data-bs-toggle="modal" data-bs-target="#registrationModal">Começar Grátis</button>
                    `;
                } else {
                    // Paid Plan (Pro style)
                    // We need to support toggle, so we inject toggle buttons
                    planCardDiv.className = 'bg-primary p-10 rounded-3xl border border-primary-light flex flex-col relative overflow-hidden';
                    planCardDiv.innerHTML = `
                         <div class="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Popular</div>
                        <div class="mb-8">
                            <h3 class="text-2xl font-bold mb-2">${firstLetterUppercase(plan.name)}</h3>
                            
                            <div class="flex gap-2 mb-4">
                                <button class="px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30 text-white monthly-toggle active" data-plan-id="${plan.id}">Mensal</button>
                                <button class="px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/30 text-white/70 annual-toggle" data-plan-id="${plan.id}">Anual</button>
                            </div>

                            <div class="flex items-baseline gap-1 plan-price-container">
                                <div class="plan-price">${priceHtml}</div>
                                <span class="text-blue-200 plan-period">${periodText}</span>
                            </div>
                            
                            ${plan.quantity_certificates ? `
                            <div class="mt-4 inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-bold border border-white/20">
                                <span class="material-symbols-outlined text-[18px]">verified</span>
                                ${plan.quantity_certificates} Certificados / mês
                            </div>` : ''}
                        </div>
                        <ul class="flex flex-col gap-4 mb-10 flex-grow plan-benefits">
                            ${plan.benefits.map(benefit => `
                                <li class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-white">check_circle</span>
                                    ${benefit.name}
                                </li>
                             `).join('')}
                        </ul>
                        <button class="w-full py-4 bg-primary-dark border border-white text-white rounded-xl font-bold hover:bg-primary-light transition-all shadow-xl btn-main"
                                data-bs-toggle="modal" data-bs-target="#hireModal"
                                data-plan-id="${plan.id}"
                                data-plan-name="${plan.name}"
                                data-plan-price=""
                                data-plan-period="${periodText}"
                                data-plan-certificates="${certificatesInfo}"
                                data-plan-benefits='${JSON.stringify(plan.benefits)}'
                                data-plan-periodicity="${periodicityValue}">Assinar Agora
                        </button>
                    `;
                }

                plansContainer.appendChild(planCardDiv);
             
                if (!isFree) {
                    const monthlyButton = planCardDiv.querySelector('.monthly-toggle');
                    const annualButton = planCardDiv.querySelector('.annual-toggle');
                    const priceElement = planCardDiv.querySelector('.plan-price');
                    const periodElement = planCardDiv.querySelector('.plan-period');
                    const hireButton = planCardDiv.querySelector('.btn-main');

                    const updateUI = () => {
                        hireButton.setAttribute('data-plan-price', priceElement.innerText.trim());
                        hireButton.setAttribute('data-plan-period', periodElement.innerText.trim());
                        hireButton.setAttribute('data-plan-periodicity', periodicityValue);
                    };
                    
                    // Initial update
                    updateUI();

                    monthlyButton.addEventListener('click', function() {
                        isAnnualSelected = false;
                        monthlyButton.classList.add('bg-white/20', 'text-white');
                        monthlyButton.classList.remove('bg-white/5', 'text-white/70');
                        annualButton.classList.add('bg-white/5', 'text-white/70');
                        annualButton.classList.remove('bg-white/20', 'text-white');
                        
                        ({ priceHtml, periodText, isFree, periodicityValue } = getPriceAndPeriod(isAnnualSelected));
                        priceElement.innerHTML = priceHtml;
                        periodElement.innerHTML = periodText;
                        updateUI();
                    });

                    annualButton.addEventListener('click', function() {
                        isAnnualSelected = true;
                        annualButton.classList.add('bg-white/20', 'text-white');
                        annualButton.classList.remove('bg-white/5', 'text-white/70');
                        monthlyButton.classList.add('bg-white/5', 'text-white/70');
                        monthlyButton.classList.remove('bg-white/20', 'text-white');

                        ({ priceHtml, periodText, isFree, periodicityValue } = getPriceAndPeriod(isAnnualSelected));
                        priceElement.innerHTML = priceHtml;
                        periodElement.innerHTML = periodText;
                        updateUI();
                    });
                }
            });
        };

        const hireModal = document.getElementById('hireModal');
        hireModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const planId = button.getAttribute('data-plan-id');
            const planName = button.getAttribute('data-plan-name');
            const planPrice = button.getAttribute('data-plan-price');
            const planPeriod = button.getAttribute('data-plan-period');
            const planBenefits = JSON.parse(button.getAttribute('data-plan-benefits'));
            const planPeriodicity = button.getAttribute('data-plan-periodicity');

            document.getElementById('modalPlanName').textContent = planName;
            document.getElementById('modalPlanPrice').innerHTML = `<div style="position: relative;" class="d-flex"><span style="font-size: 2rem;">${planPrice}</span> <span style="position: absolute; top: .5rem; left: 8.5rem;">${planPeriodicity === 'annual' ? '' : planPeriod}</span></div>`;
            document.getElementById('hirePlanId').value = planId;
            document.getElementById('hirePeriodicity').value = planPeriodicity;

            const modalBenefitsList = document.getElementById('modalPlanBenefits');
            modalBenefitsList.innerHTML = '';
            planBenefits.forEach(benefit => {
                const li = document.createElement('li');
                li.textContent = `✅ ${benefit.name}`;
                modalBenefitsList.appendChild(li);
            });

            document.getElementById('hireTermsCheck').checked = false;
            document.getElementById('hireEmailAvailabilityFeedback').innerHTML = '';
            document.getElementById('hireEmail').setCustomValidity('');
        });

        fetchPlans();

        const urlParams = new URLSearchParams(window.location.search);
            
        if (urlParams.get('plan') === 'free') {
            openRegisterFreeModal();
        }
   
        if (urlParams.get('signin') === 'true') {
            openLoginModal();
        }
        
        const registrationModal = document.getElementById('registrationModal');
        const registrationForm = document.getElementById('registrationForm');
        const regEmailInput = document.getElementById('regEmail');
        const emailAvailabilityFeedback = document.getElementById('emailAvailabilityFeedback');
        const regSegmentSelect = document.getElementById('regSegment');
        const regTermsCheck = document.getElementById('regTermsCheck');
        const regSubmitBtn = document.getElementById('regSubmitBtn');

        const hireForm = document.getElementById('hireForm');
        const hireEmailInput = document.getElementById('hireEmail');
        const hireEmailAvailabilityFeedback = document.getElementById('hireEmailAvailabilityFeedback');
        const hireTermsCheck = document.getElementById('hireTermsCheck');
        const hireSubmitBtn = document.getElementById('hireSubmitBtn');

        const loginModal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        const loginEmailInput = document.getElementById('loginEmail');
        const entitySelectionContainer = document.getElementById('entitySelectionContainer');
        const selectedEntityDisplay = document.getElementById('selectedEntityDisplay');
        const selectedEntityImage = document.getElementById('selectedEntityImage');
        const selectedEntityText = document.getElementById('selectedEntityText');
        const customSelectOptions = document.getElementById('customSelectOptions');
        const entityIdInput = document.getElementById('entityIdInput');

        const forgotPasswordModal = document.getElementById('forgotPasswordModal');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
        const forgotPasswordSubmitBtn = document.getElementById('forgotPasswordSubmitBtn');

        const selectEntityPasswordModalEl = document.getElementById('selectEntityPasswordModal');
        const selectEntityPasswordModal = new bootstrap.Modal(selectEntityPasswordModalEl);
        const selectEntityPasswordForm = document.getElementById('selectEntityPasswordForm');
        const selectedForgotPasswordEntityDisplay = document.getElementById('selectedForgotPasswordEntityDisplay');
        const selectedForgotPasswordEntityImage = document.getElementById('selectedForgotPasswordEntityImage');
        const selectedForgotPasswordEntityText = document.getElementById('selectedForgotPasswordEntityText');
        const customSelectForgotPasswordOptions = document.getElementById('customSelectForgotPasswordOptions');
        const forgotPasswordEntityIdInput = document.getElementById('forgotPasswordEntityIdInput');
        const forgotPasswordEmailInputModal = document.getElementById('forgotPasswordEmailInput');
        const selectEntityPasswordSubmitBtn = document.getElementById('selectEntityPasswordSubmitBtn');


        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }

        async function checkEmailAvailabilityReg() {
            const email = regEmailInput.value;
            emailAvailabilityFeedback.innerHTML = '';
            if (email) {
                try {
                    const response = await fetch('/api/email-available?email=' + encodeURIComponent(email), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        },
                    });
                    const data = await response.json();
                    if (!data.is_available) {
                        emailAvailabilityFeedback.innerHTML = '<span class="email-unavailable-badge">Este e-mail já está em uso. Por favor, insira outro.</span>';
                        regEmailInput.setCustomValidity('Este e-mail não está disponível.');
                    } else {
                        regEmailInput.setCustomValidity('');
                    }
                } catch (error) {
                    console.error('Erro ao verificar disponibilidade do e-mail:', error);
                    emailAvailabilityFeedback.innerHTML = '<span class="email-unavailable-badge">Erro ao verificar e-mail. Tente novamente.</span>';
                    regEmailInput.setCustomValidity('Erro ao verificar e-mail.');
                }
            }
        }

        async function checkEmailAvailabilityHire() {
            const email = hireEmailInput.value;
            hireEmailAvailabilityFeedback.innerHTML = '';
            if (email) {
                try {
                    const response = await fetch('/api/email-available?email=' + encodeURIComponent(email), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        },
                    });
                    const data = await response.json();
                    if (!data.is_available) {
                        hireEmailAvailabilityFeedback.innerHTML = '<span class="email-unavailable-badge">Este e-mail já está em uso. Por favor, insira outro.</span>';
                        hireEmailInput.setCustomValidity('Este e-mail não está disponível.');
                    } else {
                        hireEmailInput.setCustomValidity('');
                    }
                } catch (error) {
                    console.error('Erro ao verificar disponibilidade do e-mail:', error);
                    hireEmailAvailabilityFeedback.innerHTML = '<span class="email-unavailable-badge">Erro ao verificar e-mail. Tente novamente.</span>';
                    hireEmailInput.setCustomValidity('Erro ao verificar e-mail.');
                }
            }
        }

        async function hideSelectCompanies() {
            const entitySelectionContainer = document.getElementById('entitySelectionContainer');
            entitySelectionContainer.style.display = 'none';
        }

        let entitiesData = [];

        async function checkEntitiesAvailableEmail() {
            const email = loginEmailInput.value;
            entitySelectionContainer.style.display = 'none';
            customSelectOptions.innerHTML = '';
            selectedEntityImage.src = '';
            selectedEntityImage.style.display = 'none';
            selectedEntityText.textContent = 'Selecione uma empresa';
            entityIdInput.value = '';

            if (email) {
                try {
                    const response = await fetch('/api/entities-available-email?email=' + encodeURIComponent(email), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        },
                    });
                    entitiesData = await response.json();

                    if (entitiesData.length > 1) {
                        entitySelectionContainer.style.display = 'block';

                        entitiesData.forEach((item, index) => {
                            const optionDiv = document.createElement('div');
                            optionDiv.classList.add('custom-select-option');
                            optionDiv.setAttribute('data-value', item.entity ? item.entity.id : '');
                            optionDiv.setAttribute('data-name', item.entity ? item.entity.name : 'Nova Conta');
                            const imgSrc = item.entity?.config?.logo;
                            optionDiv.setAttribute('data-img-src', imgSrc ?? '');

                            const imageLogoHtml = imgSrc ? `<img src="${imgSrc}" alt="Logo" class="entity-option-image">` : '';

                            optionDiv.innerHTML = `
                                ${imageLogoHtml}
                                <span>${item.entity ? item.entity.name : 'Nova Conta'}</span>
                            `;
                            customSelectOptions.appendChild(optionDiv);

                            optionDiv.addEventListener('click', function() {
                                selectEntity(this);
                            });
                        });

                        selectEntity(customSelectOptions.children[0]);
                    } else {
                        entitySelectionContainer.style.display = 'none';
                    }

                } catch (error) {
                    console.error('Erro ao verificar entidades disponíveis:', error);
                    entitySelectionContainer.style.display = 'none';
                }
            }
        }

        selectedEntityDisplay.addEventListener('click', function() {
            customSelectOptions.classList.toggle('show');
            selectedEntityDisplay.classList.toggle('active');
        });

        document.addEventListener('click', function(event) {
            if (!entitySelectionContainer.contains(event.target)) {
                customSelectOptions.classList.remove('show');
                selectedEntityDisplay.classList.remove('active');
            }
        });

        function selectEntity(optionElement) {
            const value = optionElement.getAttribute('data-value');
            const name = optionElement.getAttribute('data-name');
            const imgSrc = optionElement.getAttribute('data-img-src');

            selectedEntityText.textContent = name;
            entityIdInput.value = value;

            if (imgSrc) {
                selectedEntityImage.src = imgSrc;
                selectedEntityImage.style.display = 'inline-block';
            } else {
                selectedEntityImage.src = '';
                selectedEntityImage.style.display = 'none';
            }

            Array.from(customSelectOptions.children).forEach(opt => {
                opt.classList.remove('selected');
            });
            optionElement.classList.add('selected');

            customSelectOptions.classList.remove('show');
            selectedEntityDisplay.classList.remove('active');
        }

        function selectForgotPasswordEntity(optionElement) {
            const value = optionElement.getAttribute('data-value');
            const name = optionElement.getAttribute('data-name');
            const imgSrc = optionElement.getAttribute('data-img-src');

            selectedForgotPasswordEntityText.textContent = name;
            forgotPasswordEntityIdInput.value = value;

            if (imgSrc) {
                selectedForgotPasswordEntityImage.src = imgSrc;
                selectedForgotPasswordEntityImage.style.display = 'inline-block';
            } else {
                selectedForgotPasswordEntityImage.src = '';
                selectedForgotPasswordEntityImage.style.display = 'none';
            }

            Array.from(customSelectForgotPasswordOptions.children).forEach(opt => {
                opt.classList.remove('selected');
            });
            optionElement.classList.add('selected');

            customSelectForgotPasswordOptions.classList.remove('show');
            selectedForgotPasswordEntityDisplay.classList.remove('active');
        }

        regEmailInput.addEventListener('blur', checkEmailAvailabilityReg);
        
        // Load business segments for registration select
        async function loadBusinessSegments() {
            if (!regSegmentSelect) return;
            try {
                const res = await fetch('/api/business-segments', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    }
                });
                if (!res.ok) return;
                const segments = await res.json();
                // Clear existing options except the placeholder
                regSegmentSelect.innerHTML = '<option value="">Selecione um segmento</option>';
                segments.forEach(seg => {
                    const opt = document.createElement('option');
                    opt.value = seg.id;
                    opt.textContent = seg.name;
                    regSegmentSelect.appendChild(opt);
                });
            } catch (err) {
                console.error('Erro ao carregar segmentos:', err);
            }
        }

        // Load segments on page load and when modal opens
        loadBusinessSegments();
        if (registrationModal) {
            registrationModal.addEventListener('show.bs.modal', function () {
                loadBusinessSegments();
            });
        }
        hireEmailInput.addEventListener('blur', checkEmailAvailabilityHire);
        loginEmailInput.addEventListener('blur', checkEntitiesAvailableEmail);

        function setButtonLoading(button, isLoading, originalText = '') {
            if (isLoading) {
                button.setAttribute('data-original-text', button.innerHTML);
                button.disabled = true;
                button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" ></span> Processando...';
                button.classList.add('btn-loading');
            } else {
                button.disabled = false;
                button.innerHTML = button.getAttribute('data-original-text') || originalText;
                button.classList.remove('btn-loading');
                button.removeAttribute('data-original-text');
            }
        }

        registrationForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            if (regSubmitBtn.disabled) return;
            setButtonLoading(regSubmitBtn, true);

            // Inicia a execução do reCAPTCHA
            grecaptcha.ready(function() {
                grecaptcha.execute('6Ld8SbgrAAAAAFhq1uwesRGy-Ot95uj-g9vzo-wy', {action: 'submit'}).then(async function(token) {

                    // PASSO 1: Atribui o token ao campo hidden
                    $('.recaptchaResponse').val(token);

                    // PASSO 2: Toda a lógica de validação e envio do formulário começa AQUI
                    // setButtonLoading(regSubmitBtn, true); // Já foi chamado antes

                    const password = document.getElementById('regPassword').value;
                    const confirmPassword = document.getElementById('regConfirmPassword').value;


                    if (password !== confirmPassword) {
                        showToast('As senhas não coincidem.', 'error');
                        setButtonLoading(regSubmitBtn, false, 'Criar Conta e Começar');
                        return;
                    }

                    if (regEmailInput.checkValidity() === false || !regTermsCheck.checked) {
                        showToast('Por favor, corrija os erros no formulário e aceite os termos e condições.', 'error');
                        setButtonLoading(regSubmitBtn, false, 'Criar Conta e Começar');
                        return;
                    }

                    const formData = new FormData(document.getElementById('registrationForm'));
                    const data = Object.fromEntries(formData.entries());
                    data.plan_id = freeTrialPlanId;
                    data.term_id = termsAndConditions ? termsAndConditions.id : null;
                    data.phone = data.phone.replace(/\D/g, '');
                    // remove empty business_segment_id so validation 'nullable|exists' treats it as null
                    if (data.business_segment_id === '' || data.business_segment_id === undefined) {
                        delete data.business_segment_id;
                    }

                    try {
                        const response = await fetch('/api/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': '{{ csrf_token() }}'
                            },
                            body: JSON.stringify(data)
                        });

                        const result = await response.json();

                        if (response.ok) {
                            showToast('Cadastro realizado com sucesso! Você será redirecionado para a página de confirmação.', 'success');
                            localStorage.removeItem('welcomeAssistantStatus');
                            localStorage.setItem('user', JSON.stringify(result.user));
                            localStorage.setItem('token', result.token);
                            setTimeout(() => {
                                window.location.href = '/confirmation-code';
                            }, 1500);
                        } else {
                            let errorMessage = 'Erro ao cadastrar. Por favor, tente novamente.';
                            if (result.errors) {
                                errorMessage = Object.values(result.errors).flat().join('\n');
                            } else if (result.message) {
                                errorMessage = result.message;
                            }
                            showToast(errorMessage, 'error');
                            setButtonLoading(regSubmitBtn, false, 'Criar Conta e Começar');
                        }
                    } catch (error) {
                        console.error('Erro na requisição de cadastro:', error);
                        showToast('Ocorreu um erro ao tentar cadastrar. Verifique sua conexão e tente novamente.', 'error');
                        setButtonLoading(regSubmitBtn, false, 'Criar Conta e Começar');
                    }
                });
            });
        });

        hireForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            if (hireSubmitBtn.disabled) return;
            setButtonLoading(hireSubmitBtn, true);

            // Inicia a execução do reCAPTCHA
            grecaptcha.ready(function() {
                grecaptcha.execute('6Ld8SbgrAAAAAFhq1uwesRGy-Ot95uj-g9vzo-wy', {action: 'submit'}).then(async function(token) {

                    // PASSO 1: Atribui o token ao campo hidden
                     $('.recaptchaResponse').val(token);

                    // PASSO 2: Toda a lógica de validação e envio do formulário começa AQUI,
                    // depois que o token já foi preenchido.
                    // setButtonLoading(hireSubmitBtn, true); // Já foi chamado antes

                    const password = document.getElementById('hirePassword').value;
                    const confirmPassword = document.getElementById('hireConfirmPassword').value;

                    
                    if (password !== confirmPassword) {
                        showToast('As senhas não coincidem.', 'error');
                        setButtonLoading(hireSubmitBtn, false, 'Criar Conta');
                        return;
                    }

                    if (hireEmailInput.checkValidity() === false || !hireTermsCheck.checked) {
                        showToast('Por favor, corrija os erros no formulário e aceite os termos e condições.', 'error');
                        setButtonLoading(hireSubmitBtn, false, 'Criar Conta');
                        return;
                    }

                    // O FormData agora será criado com o valor do reCAPTCHA
                    const formData = new FormData(document.getElementById('hireForm'));
                    const data = Object.fromEntries(formData.entries());
                    data.plan_id = document.getElementById('hirePlanId').value;
                    data.term_id = termsAndConditions ? termsAndConditions.id : null;
                    data.periodicity = document.getElementById('hirePeriodicity').value;
                    data.phone = data.phone.replace(/\D/g, '');

                    try {
                        const response = await fetch('/api/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': '{{ csrf_token() }}'
                            },
                            body: JSON.stringify(data)
                        });

                        const result = await response.json();

                        if (response.ok) {
                            showToast('Cadastro realizado com sucesso!', 'success');
                            localStorage.removeItem('welcomeAssistantStatus');
                            localStorage.setItem('user', JSON.stringify(result.user));
                            localStorage.setItem('token', result.token);
                            setTimeout(() => {
                                window.location.href = '/confirmation-code';
                            }, 1500);
                        } else {
                            let errorMessage = 'Erro ao cadastrar. Por favor, tente novamente.';
                            if (result.errors) {
                                errorMessage = Object.values(result.errors).flat().join('\n');
                            } else if (result.message) {
                                errorMessage = result.message;
                            }
                            showToast(errorMessage, 'error');
                            setButtonLoading(hireSubmitBtn, false, 'Criar Conta');
                        }
                    } catch (error) {
                        console.error('Erro na requisição de cadastro:', error);
                        showToast('Ocorreu um erro ao tentar cadastrar. Verifique sua conexão e tente novamente.', 'error');
                        setButtonLoading(hireSubmitBtn, false, 'Criar Conta');
                    }
                });
            });
        });

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (loginSubmitBtn.disabled) return;
            setButtonLoading(loginSubmitBtn, true);

            const email = document.getElementById('loginEmail').value;

            const password = document.getElementById('loginPassword').value;
            let entityId = entityIdInput.value;

            const loginData = { email, password };
            if (entityId !== '') {
                loginData.entity_id = entityId;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('Login realizado com sucesso! Redirecionando...', 'success');
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);

                    if (result.user && result.user.email_verified_at) {
                        window.location.href = '/documents/create';
                    } else {
                        window.location.href = '/confirmation-code';
                    }
                } else {
                    let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
                    if (result.message) {
                        errorMessage = result.message;
                    }
                    showToast(errorMessage, 'error');
                    setButtonLoading(loginSubmitBtn, false, 'Fazer Login');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showToast('Ocorreu um erro ao tentar fazer login. Verifique sua conexão e tente novamente.', 'error');
                setButtonLoading(loginSubmitBtn, false, 'Fazer Login');
            }
        });

        forgotPasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (forgotPasswordSubmitBtn.disabled) return;
            setButtonLoading(forgotPasswordSubmitBtn, true);

            const email = forgotPasswordEmailInput.value;


            try {
                const response = await fetch('/api/entities-available-email?email=' + encodeURIComponent(email), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                });
                const entities = await response.json();

                if (entities.length > 1) {
                    selectEntityPasswordModal.show();
                    const forgotPasswordModalInstance = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    if (forgotPasswordModalInstance) {
                        forgotPasswordModalInstance.hide();
                    }
                    customSelectForgotPasswordOptions.innerHTML = '';
                    forgotPasswordEmailInputModal.value = email;

                    entities.forEach(item => {
                        const optionDiv = document.createElement('div');
                        optionDiv.classList.add('custom-select-option');
                        optionDiv.setAttribute('data-value', item.entity ? item.entity.id : '');
                        optionDiv.setAttribute('data-name', item.entity ? item.entity.name : 'Nova Conta');
                        const imgSrc = item.entity?.config?.logo;
                        optionDiv.setAttribute('data-img-src', imgSrc ?? '');

                        const imageLogoHtml = imgSrc ? `<img src="${imgSrc}" alt="Logo" class="entity-option-image">` : '';

                        optionDiv.innerHTML = `
                            ${imageLogoHtml}
                            <span>${item.entity ? item.entity.name : 'Nova Conta'}</span>
                        `;
                        customSelectForgotPasswordOptions.appendChild(optionDiv);

                        optionDiv.addEventListener('click', function() {
                            selectForgotPasswordEntity(this);
                        });
                    });

                    if (!entities.length) {
                        forgotPasswordEntityIdInput.value = null;
                    }

                    if (customSelectForgotPasswordOptions.children.length > 0) {
                        selectForgotPasswordEntity(customSelectForgotPasswordOptions.children[0]);
                    }

                    // ... listeners for custom select ...
                    selectedForgotPasswordEntityDisplay.addEventListener('click', function() {
                        customSelectForgotPasswordOptions.classList.toggle('show');
                        selectedForgotPasswordEntityDisplay.classList.toggle('active');
                    });

                } else if (entities.length === 1) {
                    const entityId = entities[0].entity ? entities[0].entity.id : null;
                    // Keep button disabled while sending email
                    await sendPasswordResetEmail(email, entityId);
                } else {
                    showToast('Não encontramos nenhuma conta associada a este e-mail.', 'error');
                    setButtonLoading(forgotPasswordSubmitBtn, false, 'Enviar Link');
                }
            } catch (error) {
                console.error('Erro ao verificar entidades para recuperação de senha:', error);
                showToast('Erro ao verificar e-mail. Tente novamente.', 'error');
                setButtonLoading(forgotPasswordSubmitBtn, false, 'Enviar Link');
            }
        });

        selectEntityPasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (selectEntityPasswordSubmitBtn.disabled) return;
            setButtonLoading(selectEntityPasswordSubmitBtn, true);

            const email = forgotPasswordEmailInputModal.value;

            const entityId = forgotPasswordEntityIdInput.value;
            sendPasswordResetEmail(email, entityId);
        });

        async function sendPasswordResetEmail(email, entityId = null) {
            const resetData = { email };
            if (entityId) {
                resetData.entity_id = entityId;
            }

            try {
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify(resetData)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast(result.message, 'success');
                    const forgotPasswordModalInstance = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    if (forgotPasswordModalInstance) {
                        forgotPasswordModalInstance.hide();
                    }
                    selectEntityPasswordModal.hide();
                    // Reset buttons on success since the modal will hide, but if opened again we want them ready.
                    // Actually, if we hide the modal, we should probably reset the button state. 
                    // But the user asked to "manter bloqueado". 
                    // If the modal hides, "blocked" doesn't matter visually. 
                    // But if they reopen, it must be unblocked.
                    // The hidden.bs.modal event listener should handle resetting the form, let's add button reset there.
                } else {
                    let errorMessage = 'Erro ao enviar o link de recuperação de senha.';
                    if (result.message) {
                        errorMessage = result.message;
                    }
                    showToast(errorMessage, 'error');
                    setButtonLoading(forgotPasswordSubmitBtn, false, 'Enviar Link');
                    setButtonLoading(selectEntityPasswordSubmitBtn, false, 'Enviar Link');
                }
            } catch (error) {
                console.error('Erro na requisição de redefinição de senha:', error);
                showToast('Ocorreu um erro ao tentar enviar o link. Verifique sua conexão e tente novamente.', 'error');
                setButtonLoading(forgotPasswordSubmitBtn, false, 'Enviar Link');
                setButtonLoading(selectEntityPasswordSubmitBtn, false, 'Enviar Link');
            }
        }

        loginModal.addEventListener('hidden.bs.modal', function () {
            loginForm.reset();
            setButtonLoading(loginSubmitBtn, false, 'Fazer Login');
            entitySelectionContainer.style.display = 'none';
            customSelectOptions.innerHTML = '';
            selectedEntityImage.src = '';
            selectedEntityImage.style.display = 'none';
            selectedEntityText.textContent = 'Selecione uma empresa';
            entityIdInput.value = '';
            loginEmailInput.blur();
        });

        forgotPasswordModal.addEventListener('hidden.bs.modal', function () {
            forgotPasswordForm.reset();
            setButtonLoading(forgotPasswordSubmitBtn, false, 'Enviar Link');
            forgotPasswordEmailInput.blur();
        });

        selectEntityPasswordModalEl.addEventListener('hidden.bs.modal', function () {
            selectEntityPasswordForm.reset();
            setButtonLoading(selectEntityPasswordSubmitBtn, false, 'Enviar Link');
            customSelectForgotPasswordOptions.innerHTML = '';
            selectedForgotPasswordEntityImage.src = '';
            selectedForgotPasswordEntityImage.style.display = 'none';
            selectedForgotPasswordEntityText.textContent = 'Selecione uma empresa';
            forgotPasswordEntityIdInput.value = '';
            forgotPasswordEmailInputModal.value = '';
        });

        const termsModal = document.getElementById('termsModal');
        const acceptTermsBtn = document.getElementById('acceptTermsBtn');
        const closeTermsBtn = document.getElementById('closeTermsBtn');

        let activeModalInstance = null;
        let activeTermsCheckbox = null;

        document.getElementById('openRegTermsModalLink').addEventListener('click', () => {
            activeModalInstance = bootstrap.Modal.getInstance(registrationModal) || new bootstrap.Modal(registrationModal);
            $("#instanceModalSelected").val('openRegTermsModalLink');
            activeTermsCheckbox = regTermsCheck;
        });

        document.getElementById('openHireTermsModalLink').addEventListener('click', () => {
            $("#instanceModalSelected").val('openHireTermsModalLink');
            activeModalInstance = bootstrap.Modal.getInstance(hireModal) || new bootstrap.Modal(hireModal);
            activeTermsCheckbox = hireTermsCheck;
        });

        acceptTermsBtn.addEventListener('click', () => {
            if (activeTermsCheckbox) {
                activeTermsCheckbox.checked = true;
                const event = new Event('change');
                activeTermsCheckbox.dispatchEvent(event);
            }
            const termsModalInstance = bootstrap.Modal.getInstance(termsModal);
            termsModalInstance.hide();

            if (activeModalInstance) {
                activeModalInstance.show();
            }
        });

        closeTermsBtn.addEventListener('click', () => {
            if (activeModalInstance) {
                activeModalInstance.show();
            }
        });

        registrationModal.addEventListener('hidden.bs.modal', function () {
            activeModalInstance = null;
            activeTermsCheckbox = null;
        });

        hireModal.addEventListener('hidden.bs.modal', function () {
            activeModalInstance = null;
            activeTermsCheckbox = null;
        });

        termsModal.addEventListener('hidden.bs.modal', function () {
            if (activeModalInstance) {
                activeModalInstance.show();
            }
        });

        $("#acceptTermsBtn, #closeTermsBtn").on('click', function() {
            const instanceModalSelected = $("#instanceModalSelected").val();
            if (instanceModalSelected === 'openHireTermsModalLink') {
                $("#hireModal").modal('show');
                $("#hireTermsCheck").prop('checked', true).trigger('change');
            } else if (instanceModalSelected === 'openRegTermsModalLink') {
                $("#registrationModal").modal('show');
                $("#regTermsCheck").prop('checked', true).trigger('change');
            } else if (instanceModalSelected) {
                $("#loginModal").modal('show');
            }
        });

        $(document).ready(function(){
            $('#hirePhone, #regPhone').on('keyup', function() {
                const numbers = $(this).val().replace(/\D/g, '');
                let masked = '';
                let numberIndex = 0;
                const mask = '(99) 99999-9999';
                for (let i = 0; i < mask.length; i++) {
                    if (numberIndex >= numbers.length) break;
                
                    if (mask[i] === '9') {
                        masked += numbers[numberIndex];
                        numberIndex++;
                    } else {
                        masked += mask[i];
                    }
                }
            
                $(this).val(masked)
            });

            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '/documents/create';
            }
        });

        function acceptCookies() {
            const cookieBar = document.getElementById('cookieConsentBar');
            cookieBar.classList.add('hidden');
            localStorage.setItem('cookieConsentGiven', 'true');
        }

        function firstLetterUppercase(word) {
            if (word) {
                return word[0]?.toUpperCase() + word?.substring(1);
            }

            return '';
        }

        window.onload = function() {
            if (localStorage.getItem('cookieConsentGiven') === 'true') {
                const cookieBar = document.getElementById('cookieConsentBar');
                cookieBar.classList.add('hidden');
            }
            const passwordInput = document.getElementById('loginPassword');
            const toggleButton = document.getElementById('togglePasswordVisibility');

            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);

                    const eyeIcon = this.querySelector('svg');
                    if (type === 'text') {
                        eyeIcon.innerHTML = `<path d="M13.359 11.238C15.06 9.722 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                        <path d="M11.297 9.946a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 3.295 3.295l.823.823zm-2.295 1.11L.641 2.862a.5.5 0 0 0-.708.708l10.298 10.297a.5.5 0 0 0 .708-.707z"/>`;
                    } else {
                        eyeIcon.innerHTML = `<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>`;
                    }
                });
            }
        };

        window.addEventListener('message', function(evt) {
            try {

                const data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
                if (! data) return;
                
                if (data.error) {
                    console.error('Social login error:', data.error);
                    showToast('Erro no login social: ' + data.error, 'error');
                    return;
                }
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showToast('Login social efetuado com sucesso');
                    setTimeout(() => location.reload(), 800);
                }
            } catch (e) {
                console.error('Invalid message or parse error:', e);
            }
        }, false);

        // helper to call social-login API
        async function socialLogin(provider, accessToken) {
            try {
                const resp = await fetch('/api/social-login', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({provider: provider, access_token: accessToken})
                });
                const data = await resp.json();
                if (! resp.ok) throw new Error(data.message || 'Erro');
                localStorage.setItem('token', data.token);
                showToast('Login efetuado');
                setTimeout(() => location.reload(), 700);
            } catch (err) {
                console.error(err);
                showToast('Falha no login social', 'error');
            }
        }

        // Google OAuth - open auth in popup and handle callback posting message
        function openGoogleAuthPopup() {
            const clientId = '{{ env('GOOGLE_CLIENT_ID') }}';
            const redirectUri = '{{ env('GOOGLE_REDIRECT_URI', url('/auth/callback/google')) }}';
            const state = Math.random().toString(36).substring(2);
            const scope = encodeURIComponent('openid profile email');
            const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
            window.open(url, 'google_oauth', 'width=600,height=600');
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Handle postMessage from both Google and LinkedIn callback popups
            window.addEventListener('message', function(event) {
                // Verify origin security (optional but recommended)
                if (event.origin !== window.location.origin) return;
                
                const data = event.data;
                
                // Handle error response
                if (data.error) {
                    showToast('Erro: ' + data.error, 'error');
                    return;
                }
                
                // Handle success response (both Google and LinkedIn return same structure)
                if (data.token && data.user) {
                    try {
                        // Store token and user in session/localStorage
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        
                        showToast('Login realizado com sucesso!');
                        
                        // Redirect to dashboard
                        setTimeout(() => {
                            if (user.role.name === 'Entity' && user.entity?.current_contract?.status === 'active') {
                                window.location.href = '/documents/create';
                        
                            } else {
                                  window.location.href = '/audit-logs';
                            }
                          
                        }, 800);
                    } catch (err) {
                        console.error('Erro ao processar login:', err);
                        showToast('Erro ao processar login', 'error');
                    }
                }
            }, false);

            // Google social login - query by name attribute
            const googleButtons = document.querySelectorAll('button[name="googleLogin"]');
            googleButtons.forEach(btn => {
                btn.addEventListener('click', openGoogleAuthPopup);
            });

            // LinkedIn: open auth in popup and handle callback posting message
            function openLinkedInPopup() {
                const clientId = '{{ env('LINKEDIN_CLIENT_ID') }}';
                const redirectUri = '{{ env('LINKEDIN_REDIRECT_URI', url('/auth/callback/linkedin')) }}';
                const state = Math.random().toString(36).substring(2);
                const scope = encodeURIComponent('openid profile email');
                const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
                window.open(url, 'linkedin_oauth', 'width=600,height=600');
            }

            // LinkedIn social login - query by name attribute
            const linkedinButtons = document.querySelectorAll('button[name="linkedinLogin"]');
            linkedinButtons.forEach(btn => {
                btn.addEventListener('click', openLinkedInPopup);
            });
        });
    </script>
</body>
</html>
