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
    <title>Sobre Nós - Flash Certificados</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/images/logo-flash.png') }}">

    <meta name="description" content="Conheça a história da Flash Certificados. Criada para solucionar a dificuldade e o tempo gasto na emissão de certificados de cursos, nossa plataforma automatiza e simplifica este processo para empresas de todos os portes.">
    <meta name="keywords" content="sobre a empresa, história, missão, visão, certificados, gestão de certificados, emissão de certificados">

    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
    <style>
        .pricing-toggle-card { display: flex; justify-content: center; margin-bottom: 20px; }
        .pricing-toggle-card .btn { border-radius: 50px; padding: 5px 15px; font-weight: bold; transition: all 0.3s ease; font-size: 0.85rem; }
        .pricing-toggle-card .btn.active { background-color: var(--primary); color: white; }
        .pricing-toggle-card .btn:not(.active) { background-color: #e9ecef; color: #495057; }
        .plan-card { background: white; border-radius: 21px; box-shadow: 0 10px 32px #2563eb1a; padding: 46px 34px; text-align: center; border-top: 8px solid; display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
        .plan-card.free { border-color: #7c6cfa; }
        .plan-card.paid { border-color: #2563eb; }
        .plan-card .plan-name { font-size: 1.45rem; font-weight: 900; color: #18306b; margin-bottom: 15px; }
        .plan-card .plan-price { font-size: 3.3rem; font-weight: 900; color: #2563eb; margin-bottom: 10px; }
        .plan-card .plan-period { font-size: 1.12rem; color: #64748b; margin-bottom: 22px; }
        .plan-card .plan-benefits { text-align: left; list-style: none; padding: 0; margin-bottom: 24px; color: #0c3b6e; flex-grow: 1; }
        .plan-card .plan-benefits li { margin-bottom: 10px; }
        .plan-card .plan-benefits li.included::before { content: '✅ '; }
        .plan-card .plan-benefits li.not-included::before { content: '❌ '; color: #ff4d4f; }
        .plan-card .btn-main { margin-top: auto; display: inline-block; }
        .modal-body ul { list-style: none; padding: 0; }
        .modal-body ul li { margin-bottom: 8px; }
        .email-unavailable-badge { background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.85rem; margin-top: 5px; display: inline-block; }
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 1090; }
        .toast.align-items-center { padding: 10px 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .toast.text-bg-success { background-color: #d4edda !important; color: #155724 !important; border-color: #badbcc; }
        .toast.text-bg-danger { background-color: #f8d7da !important; color: #721c24 !important; border-color: #f5c6cb; }
        .toast-header { background-color: transparent !important; border-bottom: none !important; padding-bottom: 0; }
        .toast-body { padding-top: 0; }
        .btn-loading .spinner-border { width: 1rem; height: 1rem; margin-right: 0.5rem; }
        .custom-select-container { position: relative; margin-bottom: 15px; width: 100%; }
        .custom-select-trigger { background-color: #fff; border: 1px solid #ced4da; border-radius: 0.375rem; padding: 0.375rem 0.75rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; min-height: calc(1.5em + 0.75rem + 2px); }
        .custom-select-trigger.active { border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
        .custom-select-trigger .selected-entity-content { display: flex; align-items: center; flex-grow: 1; }
        .custom-select-trigger .selected-entity-content img { width: 24px; height: 24px; border-radius: 50%; margin-right: 10px; object-fit: cover; flex-shrink: 0; }
        .custom-select-trigger .selected-entity-content span { font-size: 1rem; color: #495057; }
        .custom-select-trigger .dropdown-arrow { margin-left: 10px; transition: transform 0.3s ease; }
        .custom-select-trigger.active .dropdown-arrow { transform: rotate(180deg); }
        .custom-select-options { position: absolute; top: 100%; left: 0; right: 0; background-color: #fff; border: 1px solid #ced4da; border-radius: 0.375rem; margin-top: 5px; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15); z-index: 1000; max-height: 200px; overflow-y: auto; display: none; }
        .custom-select-options.show { display: block; }
        .custom-select-option { padding: 0.5rem 0.75rem; cursor: pointer; display: flex; align-items: center; transition: background-color 0.2s ease; }
        .custom-select-option:hover { background-color: #e9ecef; }
        .custom-select-option.selected { background-color: #0d6efd; color: white; }
        .custom-select-option img { width: 24px; height: 24px; border-radius: 50%; margin-right: 10px; object-fit: cover; flex-shrink: 0; }
        .custom-select-option span { font-size: 1rem; }
        .hidden-entity-input { display: none; }
        .whatsapp-float { position: fixed; bottom: 20px; right: 20px; z-index: 999; display: flex; align-items: center; background-color: #25D366; color: white; border-radius: 50px; padding: 10px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); text-decoration: none; transition: all 0.3s ease; }
        .whatsapp-float:hover { background-color: #128C7E; transform: scale(1.05); }
        .whatsapp-float .icon { width: 24px; height: 24px; margin-right: 10px; filter: brightness(0) invert(1); }
        .whatsapp-float .text { font-weight: bold; }
        .carousel-item img { border-radius: 32px; }
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
            <a href="/#" class="logo-group">
                <img src="{{ asset('assets/images/logo-flash.png') }}" width="50px"  alt="Tela de Certificados">
                Flash Certificados
            </a>
            <div class="nav-items d-none d-lg-flex">
                <a class="nav-link" href="/#recursos">Recursos</a>
                <a class="nav-link" href="/#precos">Preços</a>
                <a class="nav-link" href="/sobre">Sobre</a>
                <a class="btn-outline" href="/#" data-bs-toggle="modal" data-bs-target="/#loginModal">Entrar</a>
                <a class="btn-cta" href="/#teste" data-bs-toggle="modal" data-bs-target="/#registrationModal">Teste Grátis</a>
            </div>
            <button class="btn btn-link d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="/#mobileNav" aria-controls="mobileNav" style="color: var(--primary);">
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
            <a class="nav-link mb-3" href="/#recursos" data-bs-dismiss="offcanvas">Recursos</a>
            <a class="nav-link mb-3" href="/#precos" data-bs-dismiss="offcanvas">Preços</a>
            <a class="nav-link mb-3" href="/#sobre" data-bs-dismiss="offcanvas">Sobre</a>
            <a class="btn-outline mb-3" href="/#" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="/#loginModal">Entrar</a>
            <a class="btn-cta mt-auto" href="/#teste" data-bs-dismiss="offcanvas" data-bs-toggle="modal" data-bs-target="/#registrationModal">Teste Grátis</a>
        </div>
    </div>

    <main class="container my-5">
        <div class="row">
            <div class="col-lg-8 mx-auto text-center">
                <h1 class="display-4 mb-4">Sobre a Flash Certificados</h1>
                
                <p class="lead">
                    A Flash Certificados nasceu da observação de uma dificuldade comum e recorrente no mundo corporativo e educacional: o processo manual, demorado e burocrático de Emitir certificados de cursos e treinamentos. Percebemos que empresas de todos os portes gastavam um tempo valioso na emissão individual de cada documento, lidando com formatação, preenchimento de dados e validação, o que frequentemente resultava em erros e ineficiência.
                </p>

                <p class="lead">
                    Com a missão de transformar essa realidade, desenvolvemos uma plataforma inteligente e totalmente automatizada. Nosso objetivo é simples: ajudar empresas a economizar tempo, reduzir custos e garantir a máxima qualidade e profissionalismo em cada certificado emitido. Acreditamos que a tecnologia deve ser uma aliada para simplificar tarefas complexas, permitindo que nossos clientes foquem no que realmente importa: o conteúdo de seus cursos e o desenvolvimento de seus alunos.
                </p>

                <p class="lead">
                    Hoje, a Flash Certificados é a solução completa para geração, emissão e gestão de certificados. Nossa plataforma oferece automação de ponta a ponta, assinaturas dinâmicas, modelos personalizáveis e um sistema de validação que garante a autenticidade de cada documento. Estamos aqui para simplificar seu trabalho e elevar o padrão de profissionalismo de sua empresa.
                </p>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const registrationModal = document.getElementById('registrationModal');
        const loginModal = document.getElementById('loginModal');
        const termsModal = document.getElementById('termsModal');
        const hireModal = document.getElementById('hireModal');
        let activeModalInstance = null;
        let activeTermsCheckbox = null;
    
        if (registrationModal) {
            registrationModal.addEventListener('shown.bs.modal', function () {
                activeModalInstance = bootstrap.Modal.getInstance(registrationModal);
            });
        }
    
        if (loginModal) {
            loginModal.addEventListener('shown.bs.modal', function () {
                activeModalInstance = bootstrap.Modal.getInstance(loginModal);
            });
        }
    
        if (hireModal) {
            hireModal.addEventListener('shown.bs.modal', function () {
                activeModalInstance = bootstrap.Modal.getInstance(hireModal);
            });
        }
    
        if (termsModal) {
            termsModal.addEventListener('hidden.bs.modal', function () {
                if (activeModalInstance) {
                    activeModalInstance.show();
                }
            });
        }
    
        if (registrationModal) {
            registrationModal.addEventListener('hidden.bs.modal', function () {
                activeModalInstance = null;
                activeTermsCheckbox = null;
            });
        }
    
        if (loginModal) {
            loginModal.addEventListener('hidden.bs.modal', function () {
                activeModalInstance = null;
                activeTermsCheckbox = null;
            });
        }
    
        if (hireModal) {
            hireModal.addEventListener('hidden.bs.modal', function () {
                activeModalInstance = null;
                activeTermsCheckbox = null;
            });
        }
    
        if (termsModal) {
            termsModal.addEventListener('hidden.bs.modal', function () {
                if (activeModalInstance) {
                    activeModalInstance.show();
                }
            });
        }
    
        function acceptCookies() {
            const cookieBar = document.getElementById('cookieConsentBar');
            if (cookieBar) {
                cookieBar.classList.add('hidden');
            }
            localStorage.setItem('cookieConsentGiven', 'true');
        }
    
        window.onload = function() {
            if (localStorage.getItem('cookieConsentGiven') === 'true') {
                const cookieBar = document.getElementById('cookieConsentBar');
                if (cookieBar) {
                    cookieBar.classList.add('hidden');
                }
            }
        };
    </script>
</body>
</html>