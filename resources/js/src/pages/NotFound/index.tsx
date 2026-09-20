import AppContext from '@/src/AppContext/Context';
import If from '@/src/components/common/if/if';
import { FC, Fragment, useContext, useEffect } from 'react';

interface NotFoundPageProps {};

const NotFoundPage: FC<NotFoundPageProps> = () => {
    const { signOut, user } = useContext(AppContext);
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/home.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link); // limpa ao desmontar
        };
    }, []);

    return (
        <Fragment>
            {/* Navbar - Replicando a estrutura e estilos do home.blade.php */}
            <nav className="landing-navbar ">
                <div className="navbar-inner d-flex justify-content-end">
                  
                    <div className="nav-items d-none d-lg-flex">
                        <a className="nav-link" href="/">Início</a>
                        <a className="nav-link" href="/#recursos">Recursos</a>
                        <a className="nav-link" href="/#precos">Preços</a>
                        <a className="nav-link" href="/#sobre">Sobre</a>
                        <If condition={!!user}>
                            <button className="btn-outline" onClick={signOut}>Sair</button>
                        </If>

                        <a className="btn-cta" href="/#teste">Teste Grátis</a>
                    </div>
                    {/* Mobile Menu Toggler */}
                    <button className="btn btn-link d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-controls="mobileNav" style={{ color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                </div>
            </nav>
            {/* Offcanvas Mobile Navigation */}
            <div className="offcanvas offcanvas-end" tabIndex={-1} id="mobileNav" aria-labelledby="mobileNavLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title logo-group" id="mobileNavLabel">CertificaFácil</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
                </div>
                <div className="offcanvas-body d-flex flex-column">
                    <a className="nav-link mb-3" href="/" data-bs-dismiss="offcanvas">Início</a>
                    <a className="nav-link mb-3" href="/#recursos" data-bs-dismiss="offcanvas">Recursos</a>
                    <a className="nav-link mb-3" href="/#precos" data-bs-dismiss="offcanvas">Preços</a>
                    <a className="nav-link mb-3" href="/#sobre" data-bs-dismiss="offcanvas">Sobre</a>
                    <a className="btn-cta mt-auto" href="/#teste" data-bs-dismiss="offcanvas">Teste Grátis</a>
                </div>
            </div>

            {/* Main 404 content */}
            <section className="error-section" style={{
                background: 'linear-gradient(120deg, #eaf1fb 0 70%, #f7fafd 100%)',
                padding: '5rem 1.5rem',
                textAlign: 'center',
                minHeight: 'calc(100vh - 100px)', // Adjust for header/footer height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#1e3a8b' // Base text color from original CSS
            }}>
                <div className="error-code" style={{
                    fontFamily: "'Montserrat', 'Nunito', sans-serif",
                    fontSize: '6.5rem',
                    fontWeight: 900,
                    color: '#2563eb', // var(--primary)
                    lineHeight: 1,
                    marginBottom: '0.3em',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 20px rgba(37,99,235,0.15)'
                }}>
                    404
                </div>
                <h1 className="error-title" style={{
                    fontFamily: "'Montserrat', 'Nunito', sans-serif",
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    color: '#18306b',
                    lineHeight: 1.2,
                    marginBottom: '0.8em',
                    letterSpacing: '-1.2px',
                    textShadow: '0 2px 12px rgba(37,99,235,0.04)' // Adjusted shadow for consistency
                }}>
                    Página Não Encontrada
                </h1>
                <div className="error-desc" style={{
                    fontSize: '1.3rem',
                    color: '#2563eb', // var(--primary)
                    marginBottom: '2.75rem',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    Ops! Parece que a página que você tentou acessar não existe ou foi movida.
                    Não se preocupe, acontece com os melhores.
                </div>
                <a href="/" className="btn-main" style={{
                    background: 'linear-gradient(110deg, #2563eb 0%, #4f8cff 100%)', // var(--gradient-blue)
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '10px', // var(--radius-sm)
                    padding: '1rem 2.25rem',
                    fontSize: '1.14rem',
                    boxShadow: '0 2px 12px 0 rgba(37,99,235,0.13)', // var(--shadow-cta)
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6875rem',
                    transition: '0.24s cubic-bezier(.57,1.37,.58,1), transform .14s', // var(--transition)
                    cursor: 'pointer',
                    outline: 'none',
                    textDecoration: 'none'
                }}>
                    <span style={{ fontSize: '1.23em' }}>🏠</span>
                    Voltar para a Página Inicial
                </a>
            </section>

            {/* Footer - Replicando a estrutura e estilos do home.blade.php */}
            <footer style={{
                background: '#1e3a8a',
                color: 'white',
                padding: '4.375rem 2.125rem 2.5rem 2.125rem',
                boxShadow: '0 0 44px 0 rgba(30,58,138,0.09)' // var(--shadow-footer)
            }}>
                <div className="section row gx-4 gy-4 justify-content-between">
                    <div className="col-12 col-md-3 text-center text-md-start">
                        <div className="logo-group d-flex justify-content-center justify-content-md-start">
                            🏅 CertificaFácil
                        </div>
                        <p style={{ fontSize: '1.09rem', color: '#dbeafe' }}>A plataforma mais completa para emissão de certificados profissionais e documentos de SST.</p>
                    </div>
                    <div className="col-12 col-md-2 text-center text-md-start">
                        <h5 style={{ marginBottom: '13px', fontWeight: 'bold' }}>Produto</h5>
                        <a href="/#recursos" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Recursos</a>
                        <a href="/#precos" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Preços</a>
                        <a href="#" style={{ color: '#fff', display: 'block' }}>Integrações</a>
                    </div>
                    <div className="col-12 col-md-2 text-center text-md-start">
                        <h5 style={{ marginBottom: '13px', fontWeight: 'bold' }}>Suporte</h5>
                        <a href="#" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Central de Ajuda</a>
                        <a href="#" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Contato</a>
                        <a href="#" style={{ color: '#fff', display: 'block' }}>Status</a>
                    </div>
                    <div className="col-12 col-md-2 text-center text-md-start">
                        <h5 style={{ marginBottom: '13px', fontWeight: 'bold' }}>Empresa</h5>
                        <a href="/#sobre" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Sobre</a>
                        <a href="#" style={{ color: '#fff', display: 'block', marginBottom: '7px' }}>Blog</a>
                        <a href="#" style={{ color: '#fff', display: 'block' }}>Carreiras</a>
                    </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '15px', marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.13)', paddingTop: '22px' }}>
                    © {new Date().getFullYear()} CertificaFácil. Todos os direitos reservados.
                </div>
            </footer>
            {/* Bootstrap JS (se você estiver usando Bootstrap JS em sua aplicação React) */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </Fragment>
    );
};

export default NotFoundPage;
