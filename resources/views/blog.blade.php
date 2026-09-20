<!DOCTYPE html>
<html lang="pt-BR">
<head>
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

    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

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
                <img src="{{ asset('assets/images/logo-flash.png') }}" width="50px"  alt="Tela de Certificados">
                Flash Certificados
            </a>
            <div class="nav-items d-none d-lg-flex">
                <a class="nav-link" href="/#recursos">Recursos</a>
                <a class="nav-link" href="/#precos">Preços</a>
                <a class="nav-link" href="/sobre">Sobre</a>
                <a class="nav-link" href="/blog">Blog</a>
                <a class="btn-outline" href="/?signin=true">Entrar</a>
                <a class="btn-cta" href="/?plan=free">Teste Grátis</a>
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
            <a class="btn-outline mb-3" href="#" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="#loginModal">Entrar</a>
            <a class="btn-cta mt-auto" href="#teste" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="#registrationModal">Teste Grátis</a>
        </div>
    </div>

    
    {{-- INÍCIO DA NOVA SEÇÃO DE BLOG - ADAPTADA DO TEMPLATE ANEXADO --}}
    <section class="section" id="blog" style="background: var(--background-alt); padding-top: 5rem; padding-bottom: 5rem;">
        <div class="container">
            <h2 class="section-title">Blog e Dicas sobre Certificados</h2>
            <div class="section-desc mb-5">
                Explore nossos artigos e aprenda como emitir, validar e personalizar certificados de cursos de forma profissional.
            </div>

            <div class="row g-4 justify-content-center">
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="{{ asset('assets/images/blog/emitir-certificados-online-gratis.jpg') }}" class="card-img-top" alt="Como emitir certificados online gratuitamente">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">
                                <a href="/blog/como-emitir-certificados-online-gratuitamente"
                                   title="Como emitir certificados online gratuitamente"
                                   class="text-decoration-none text-dark">
                                   Como emitir certificados online gratuitamente
                                </a>
                            </h5>
                            <p class="card-text text-muted">
                                Descubra o passo a passo para criar e emitir certificados online, de forma simples e gratuita, com modelos prontos e automação total.
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-0 text-center">
                            <a href="/blog/como-emitir-certificados-online-gratuitamente"
                               class="btn btn-outline-primary btn-sm"
                               aria-label="Ler artigo Como emitir certificados online gratuitamente">
                               Ler artigo completo
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="{{ asset('assets/images/blog/modelos-de-certificados.jpg') }}" class="card-img-top" alt="Modelos de certificados para cursos e treinamentos">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">
                                <a href="/blog/modelos-de-certificados-para-cursos-e-treinamentos"
                                   title="Modelos de certificados para cursos e treinamentos"
                                   class="text-decoration-none text-dark">
                                   Modelos de certificados para cursos e treinamentos
                                </a>
                            </h5>
                            <p class="card-text text-muted">
                                Veja exemplos de certificados profissionais e aprenda a personalizar molduras, assinaturas e cores conforme o tipo de curso.
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-0 text-center">
                            <a href="/blog/modelos-de-certificados-para-cursos-e-treinamentos"
                               class="btn btn-outline-primary btn-sm"
                               aria-label="Ler artigo Modelos de certificados para cursos e treinamentos">
                               Ler artigo completo
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="{{ asset('assets/images/blog/validar-certificados-online.jpg') }}" class="card-img-top" alt="Como validar certificados de cursos online">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">
                                <a href="/blog/como-validar-certificados-de-cursos-online"
                                   title="Como validar certificados de cursos online"
                                   class="text-decoration-none text-dark">
                                   Como validar certificados de cursos online
                                </a>
                            </h5>
                            <p class="card-text text-muted">
                                Entenda como garantir autenticidade e criar links públicos de verificação para os certificados emitidos pela sua escola.
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-0 text-center">
                            <a href="/blog/como-validar-certificados-de-cursos-online"
                               class="btn btn-outline-primary btn-sm"
                               aria-label="Ler artigo Como validar certificados de cursos online">
                               Ler artigo completo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {{-- FIM DA NOVA SEÇÃO DE BLOG --}}


    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/home.js') }}"></script>
    <script>
        // Função para simular a chamada API e atualizar o container
        function loadPlans(periodicity) {
            const container = document.getElementById('plansContainer');
            container.innerHTML = `
                <div class="col-12 text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Carregando planos...</p>
                </div>
            `;
            $.ajax({
                url: '/api/v1/plans', // Altere para sua rota real de API
                type: 'GET',
                data: { periodicity: periodicity },
                success: function(response) {
                    container.innerHTML = '';
                    let plansHtml = '';

                    // Adicionar o botão de toggle de periodicidade
                    plansHtml += `
                        <div class="col-12">
                            <div class="pricing-toggle-card">
                                <button class="btn ${periodicity === 'monthly' ? 'active' : ''}" onclick="loadPlans('monthly')">Mensal</button>
                                <button class="btn ${periodicity === 'yearly' ? 'active' : ''}" onclick="loadPlans('yearly')">Anual (20% OFF)</button>
                            </div>
                        </div>
                    `;

                    if (response.plans && response.plans.length > 0) {
                        response.plans.forEach(plan => {
                            let priceDisplay;
                            let periodDisplay;
                            let isFree = plan.id === 1;

                            if (isFree) {
                                priceDisplay = 'Grátis';
                                periodDisplay = 'Para sempre';
                            } else {
                                priceDisplay = `R$ ${parseFloat(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                periodDisplay = periodicity === 'monthly' ? '/mês' : '/ano';
                            }

                            const benefits = plan.benefits.map(benefit => {
                                const isIncluded = benefit.is_included;
                                const cssClass = isIncluded ? 'included' : 'not-included';
                                return `<li class="${cssClass}">${benefit.description}</li>`;
                            }).join('');

                            const btnText = isFree ? 'Começar Teste Grátis' : 'Contratar Agora';
                            const btnClass = isFree ? 'btn-outline-primary' : 'btn-main';
                            const planClass = isFree ? 'free' : 'paid';

                            plansHtml += `
                                <div class="col-lg-4 col-md-6 mb-4">
                                    <div class="plan-card ${planClass}">
                                        <div class="plan-header">
                                            <div class="plan-name">${plan.name}</div>
                                            <div class="plan-price">${priceDisplay}</div>
                                            <div class="plan-period">${periodDisplay}</div>
                                        </div>
                                        <ul class="plan-benefits">
                                            ${benefits}
                                        </ul>
                                        <a href="#"
                                           class="btn ${btnClass} btn-lg btn-main-alt"
                                           data-bs-toggle="modal"
                                           data-bs-target="${isFree ? '#registrationModal' : '#hireModal'}"
                                           data-plan-id="${plan.id}"
                                           data-plan-name="${plan.name}"
                                           data-plan-price="${priceDisplay}"
                                           data-plan-benefits="${plan.benefits.map(b => b.description).join('||')}"
                                           data-term-id="${response.term_id}"
                                           data-periodicity="${periodicity}">
                                            ${btnText}
                                        </a>
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        plansHtml += `
                            <div class="col-12 text-center my-5">
                                <p class="text-danger">Não foi possível carregar os planos. Tente novamente mais tarde.</p>
                            </div>
                        `;
                    }
                    container.innerHTML = plansHtml;
                },
                error: function() {
                    container.innerHTML = `
                        <div class="col-12 text-center my-5">
                            <p class="text-danger">Erro ao carregar os planos. Tente novamente mais tarde.</p>
                        </div>
                    `;
                }
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Carregar os planos mensais por padrão ao iniciar
            loadPlans('monthly');

            // JavaScript para lidar com o modal de Contratação (HireModal)
            const hireModal = document.getElementById('hireModal');
            if (hireModal) {
                hireModal.addEventListener('show.bs.modal', function(event) {
                    const button = event.relatedTarget;
                    const planId = button.getAttribute('data-plan-id');
                    const planName = button.getAttribute('data-plan-name');
                    const planPrice = button.getAttribute('data-plan-price');
                    const planBenefitsString = button.getAttribute('data-plan-benefits');
                    const termId = button.getAttribute('data-term-id');
                    const periodicity = button.getAttribute('data-periodicity');

                    document.getElementById('modalPlanName').textContent = planName;
                    document.getElementById('modalPlanPrice').textContent = planPrice;
                    document.getElementById('hirePlanId').value = planId;
                    document.getElementById('hireTermId').value = termId;
                    document.getElementById('hirePeriodicity').value = periodicity;

                    const benefitsList = document.getElementById('modalPlanBenefits');
                    benefitsList.innerHTML = '';
                    if (planBenefitsString) {
                        planBenefitsString.split('||').forEach(benefit => {
                            const li = document.createElement('li');
                            li.textContent = '✅ ' + benefit;
                            benefitsList.appendChild(li);
                        });
                    }
                });
            }

            // JavaScript para lidar com o modal de Registro (RegistrationModal)
            const registrationModal = document.getElementById('registrationModal');
            if (registrationModal) {
                registrationModal.addEventListener('show.bs.modal', function(event) {
                    const button = event.relatedTarget;
                    // Se o botão tiver atributos de plano, é para o teste grátis (Plano 1)
                    const planId = button.getAttribute('data-plan-id') || 1;
                    const termId = button.getAttribute('data-term-id') || null;

                    document.getElementById('regPlanId').value = planId;
                    document.getElementById('regTermId').value = termId;
                    document.getElementById('regPeriodicity').value = 'monthly'; // O teste grátis é sempre mensal
                });
            }


            // Toggle Password Visibility
            const passwordInput = document.getElementById('loginPassword');
            const toggleButton = document.getElementById('togglePasswordVisibility');

            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);

                    const eyeIcon = this.querySelector('svg');
                    if (type === 'text') {
                        eyeIcon.innerHTML = `<path d="M13.359 11.238C15.06 9.722 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/> <path d="M11.297 9.761a2.5 2.5 0 1 1-2.93-2.93l.775.775a1.5 1.5 0 0 0-1.87 1.87l-.775.775a3.5 3.5 0 0 1 4.793-4.793z"/> <path d="M.293 1.707A.997.997 0 0 1 1.707.293L15.707 14.293a.997.997 0 0 1-1.414 1.414L.293 1.707z"/>`; // Icone de olho cortado
                    } else {
                        eyeIcon.innerHTML = `<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/> <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>`; // Icone de olho aberto
                    }
                });
            }

            // Repetir para o login com seleção de entidade
            const passwordInputSelectEntity = document.getElementById('loginPasswordSelectEntity');
            const toggleButtonSelectEntity = document.getElementById('togglePasswordVisibilitySelectEntity');

            if (toggleButtonSelectEntity) {
                toggleButtonSelectEntity.addEventListener('click', function() {
                    const type = passwordInputSelectEntity.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInputSelectEntity.setAttribute('type', type);

                    const eyeIcon = this.querySelector('svg');
                    if (type === 'text') {
                        eyeIcon.innerHTML = `<path d="M13.359 11.238C15.06 9.722 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/> <path d="M11.297 9.761a2.5 2.5 0 1 1-2.93-2.93l.775.775a1.5 1.5 0 0 0-1.87 1.87l-.775.775a3.5 3.5 0 0 1 4.793-4.793z"/> <path d="M.293 1.707A.997.997 0 0 1 1.707.293L15.707 14.293a.997.997 0 0 1-1.414 1.414L.293 1.707z"/>`; // Icone de olho cortado
                    } else {
                        eyeIcon.innerHTML = `<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/> <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>`; // Icone de olho aberto
                    }
                });
            }

        });
    </script>
</body>
</html>