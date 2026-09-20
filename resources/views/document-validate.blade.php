<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flash Certificados - Validação de Certificado</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/home.css') }}">
  <style>
    :root {
        --primary: #2563eb;
    }
    body {
      font-family: 'Nunito', 'Montserrat', Arial, sans-serif;
      background-color: #f3f7fc;
    }
    .landing-navbar {
        position: fixed !important;
    }
    .landing-navbar.scrolled {
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #1d4ed8;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .flash-logo-text {
        background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
  </style>
</head>

<body class="flex flex-col min-h-screen">
  <!-- Navbar -->
  <nav class="landing-navbar">
      <div class="navbar-inner">
          <a href="/" class="logo-group">
              <img src="{{ asset('assets/images/logo-flash.png') }}" width="90px" alt="Flash Certificados">
              Flash Certificados
          </a>
          <div class="nav-items d-none d-lg-flex">
              <a class="nav-link" href="/#recursos">Recursos</a>
              <a class="nav-link" href="/#precos">Preços</a>
              <a class="nav-link" href="/sobre">Sobre</a>
              <a class="nav-link" href="/blog">Blog</a>
              <a class="nav-link d-flex align-items-center gap-1" href="/public/events/checkin" style="color: #2563eb; font-weight: 700; text-decoration: none;">
                  <i class="bi bi-qr-code-scan"></i> Check-in
              </a>
              <a class="btn-outline" href="/login">Entrar</a>
              <a class="btn-cta" href="/register">Teste Grátis</a>
          </div>
          <button class="btn btn-link d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-controls="mobileNav" style="color: var(--primary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
          </button>
      </div>
  </nav>

  <!-- Offcanvas Mobile Menu -->
  <div class="offcanvas offcanvas-end" tabindex="-1" id="mobileNav" aria-labelledby="mobileNavLabel">
      <div class="offcanvas-header">
          <h5 class="offcanvas-title logo-group" id="mobileNavLabel">Flash Certificados</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column">
          <a class="nav-link mb-3" href="/#recursos" data-bs-dismiss="offcanvas">Recursos</a>
          <a class="nav-link mb-3" href="/#precos" data-bs-dismiss="offcanvas">Preços</a>
          <a class="nav-link mb-3" href="/sobre" data-bs-dismiss="offcanvas">Sobre</a>
          <a class="nav-link mb-3 d-flex align-items-center gap-2" href="/public/events/checkin" data-bs-dismiss="offcanvas" style="color: #2563eb; font-weight: 700; text-decoration: none;">
              <i class="bi bi-qr-code-scan"></i> Check-in
          </a>
          <a class="btn-outline mb-3 text-center" href="/login" style="padding: 10px;">Entrar</a>
          <a class="btn-cta mt-auto text-center" href="/register">Teste Grátis</a>
      </div>
  </div>

  <!-- Main Section -->
  <main class="flex-grow pt-28 px-4">
    <section class="flex flex-col items-center justify-center py-12">
      <div id="validation-container" class="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl w-full text-center border-t-8 border-green-500">
        
        <!-- Loading State -->
        <div id="loading-state" class="flex flex-col items-center justify-center py-10">
            <div class="spinner mb-4"></div>
            <p class="text-lg text-gray-600">Verificando certificado...</p>
        </div>

        <!-- Success Content (Hidden by default) -->
        <div id="success-content" class="hidden">
            <div class="mb-6">
                <svg class="mx-auto w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h1 id="validation-title" class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Certificado Validado com Sucesso!</h1>
            <p id="validation-message" class="text-lg text-gray-600 mb-8">As informações do certificado foram verificadas e são autênticas.</p>

            <div class="bg-blue-50 rounded-xl p-6 md:p-8 mb-8 text-left shadow-inner">
                <h2 class="text-2xl font-bold text-blue-800 mb-4 text-center">Detalhes do Certificado</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div><p class="font-semibold">Nome do Aluno:</p><p id="student-name">Carregando...</p></div>
                    <div><p class="font-semibold">Curso:</p><p id="course-name">Carregando...</p></div>
                    <div><p class="font-semibold">Emitido em:</p><p id="issue-date">Carregando...</p></div>
                    <div id="company-container"><p class="font-semibold">Entidade/Empresa:</p><p id="company-name" class="font-mono text-blue-700">Carregando...</p></div>
                    <div id="validity-container" class="hidden"><p class="font-semibold">Validade:</p><p id="validity-period">Carregando...</p></div>
                </div>
     
            </div>

            <div class="flex flex-col md:flex-row justify-center gap-4">
                <button id="print-certificate" class="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white transition shadow bg-blue-600 hover:bg-blue-700">
                Baixar Certificado
                </button>           
            </div>
        </div>

        <!-- Error Content (Hidden by default) -->
        <div id="error-content" class="hidden">
            <div class="mb-6">
                <svg class="mx-auto w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h1 id="error-title" class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Erro na Validação
            </h1>
            <p id="error-message" class="text-lg text-gray-600 mb-8">
                Não foi possível validar o certificado. Por favor, verifique o código ou tente novamente.
            </p>
            <div class="flex justify-center">
                <a href="/" class="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-blue-600 border border-blue-600 hover:bg-blue-50 transition duration-200">
                    Ir para a página inicial
                </a>
            </div>
        </div>

      </div>
    </section>
  </main>

  <footer style="background: #1e3a8a; color: white; padding: 70px 34px 40px 34px; box-shadow: var(--shadow-footer);">
    <div class="section row gx-4 gy-4 justify-content-between">
        <div class="col-12 col-md-3 text-center text-md-start">
            <div class="logo-group d-flex justify-content-center justify-content-md-start">
                <img src="{{ asset('assets/images/logo-flash.png') }}" width="60px" alt="Flash Certificados" class="me-2">
                Flash Certificados
            </div>
            <p style="font-size: 1.09rem; color: #dbeafe;">A plataforma mais completa para emissão de certificados profissionais</p>
        </div>
        <div class="col-12 col-md-2 text-center text-md-start">
            <h5 style="margin-bottom: 13px; font-weight: bold;">Produto</h5>
            <a href="/#recursos" style="color: #fff; display: block; margin-bottom: 7px; text-decoration: none;">Recursos</a>
            <a href="/#precos" style="color: #fff; display: block; margin-bottom: 7px; text-decoration: none;">Preços</a>
        </div>
    </div>
    <div style="text-align: center; font-size: 15px; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.13); padding-top: 22px;">
        © {{ date('Y') }} Flash Certificados. Todos os direitos reservados.
    </div>
  </footer>

  <!-- Bootstrap JS Bundle - Adicionado para o Offcanvas -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
        const loadingState = document.getElementById('loading-state');
        const successContent = document.getElementById('success-content');
        const errorContent = document.getElementById('error-content');
        const validationContainer = document.getElementById('validation-container');

        const studentNameElem = document.getElementById('student-name');
        const courseNameElem = document.getElementById('course-name');
        const issueDateElem = document.getElementById('issue-date');
        const validationCodeElem = document.getElementById('validation-code');
        const validationTitleElem = document.getElementById('validation-title');
        const validationMessageElem = document.getElementById('validation-message');
        const companyNameElem = document.getElementById('company-name');

        // Get UUID from the URL path
        const pathSegments = window.location.pathname.split('/');
        const uuid = pathSegments[pathSegments.length - 1]; // Assumes UUID is the last segment

        // Show loading state initially
        loadingState.classList.remove('hidden');
        successContent.classList.add('hidden');
        errorContent.classList.add('hidden');
        validationContainer.classList.remove('border-green-500', 'border-red-500'); // Remove any previous border color

        try {
            // Real API call (replace with your actual endpoint)
            const apiUrl = `/api/document-validate/${uuid}`; // Endpoint no mesmo aplicativo
            const response = await fetch(apiUrl, {
                method: 'GET', // Conforme especificado na rota da API
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // Pode ser necessário para requisições Laravel
                },
                // body: JSON.stringify({}) // Adicione um corpo se a API esperar um (mesmo que vazio)
            });
           
            const result = await response.json();

            if (response.ok && result?.id) { // Verifica se a resposta HTTP foi OK e se a validação foi bem-sucedida

                validationContainer.classList.add('border-green-500');
                validationTitleElem.textContent = 'Certificado Validado com Sucesso!';
                validationMessageElem.textContent = 'As informações do certificado foram verificadas e são autênticas.';
                studentNameElem.textContent = result?.employee?.name;
                courseNameElem.textContent = result?.course?.name;
                issueDateElem.textContent = result?.issue_date;
                const entityName = result?.entity?.name || result?.employee?.company?.entity?.name || result?.employee?.company?.name;
                companyNameElem.textContent = entityName;

                // Oculta empresa se não houver dados
                const companyContainer = document.getElementById('company-container');
                if (!entityName) {
                    companyContainer.classList.add('hidden');
                } else {
                    companyContainer.classList.remove('hidden');
                }

                if (result?.date_init_validate && result?.date_end_validate) {
                    const initDate = new Date(result.date_init_validate + 'T00:00:00').toLocaleDateString('pt-BR');
                    const endDate = new Date(result.date_end_validate + 'T00:00:00').toLocaleDateString('pt-BR');
                    document.getElementById('validity-period').textContent = `${initDate} até ${endDate}`;
                    document.getElementById('validity-container').classList.remove('hidden');
                } else {
                    document.getElementById('validity-container').classList.add('hidden');
                }

                successContent.classList.remove('hidden');
            } else {
                validationContainer.classList.add('border-red-500');
                document.getElementById('error-title').textContent = 'Erro na Validação';
                document.getElementById('error-message').textContent = result.message || 'Não foi possível validar o certificado. Por favor, verifique o código ou tente novamente.';
                errorContent.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Erro ao validar certificado:', error);
            validationContainer.classList.add('border-red-500');
            document.getElementById('error-title').textContent = 'Erro Inesperado';
            document.getElementById('error-message').textContent = 'Ocorreu um erro ao tentar validar o certificado. Tente novamente mais tarde.';
            errorContent.classList.remove('hidden');
        } finally {
            loadingState.classList.add('hidden');
        }
    });

    // O offcanvas é gerenciado pelo Bootstrap nativamente via data-bs-target

    // Optional: Add scroll effect for navbar if desired
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav'); // Select the nav element
        if(window.scrollY > 10) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

     document.getElementById('print-certificate').addEventListener('click', async () => {
        const btn = document.getElementById('print-certificate');
        const originalContent = btn.innerHTML;
        
        // Desativa o botão e mostra loading
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processando...`;
        
        try {
            const uuid = window.location.pathname.split('/').pop();
            const response = await fetch(`/api/document-validate/${uuid}`);
            const data = await response.json();
            const html = data.certificate_template_mounted;

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const iframeWindow = iframe.contentWindow || iframe;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;

            if (doc) {
                doc.open();
                doc.write(`
                <html>
                    <head>
                    <title>Certificado</title>
                    <style>
                        @media print {
                        @page { size: A4; margin: 0; }
                        body { margin: 0; }
                        }
                    </style>
                    </head>
                    <body onload="window.focus(); window.print(); setTimeout(() => window.close(), 1000)">
                    ${html}
                    </body>
                </html>
                `);
                doc.close();
            }
        } catch (error) {
            console.error('Erro ao baixar certificado:', error);
        }

        // Aguarda 5 segundos antes de reabilitar
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }, 5000);
    });
    
  </script>
</body>
</html>
