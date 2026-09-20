import AppContext from '@/src/AppContext/Context';
import api from '@/src/lib/api';
import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

interface ResetPasswordScreenProps {};

const ResetPasswordScreen: FC<ResetPasswordScreenProps> = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const { setUserLogged, setUserToken, applyTheme } = useContext(AppContext);
    const code = searchParams.get('code'); // Get code from URL
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/home.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link); // Clean up on unmount
        };
    }, []);

    const handleSubmit = (e: { preventDefault: () => void;}) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!code) {
            setError('Código de redefinição não encontrado na URL.');
            return;
        }

        setError(''); // Clear any previous errors

        const data = {
            code,
            password,
            password_confirmation: confirmPassword
        };

        setIsLoading(true);

        api.post('/change-password', data).then(response => {
                toast.success('Redefinição realizada com sucesso');
                setUserToken(response.data.token);
                setUserLogged(response.data.user);
                setTimeout(() => {
                    navigate('/dashboard');
                    applyTheme(response.data.user?.entity?.config);
                }, 3000);
        }).catch(err => {
            console.error(err);
            toast.error('Erro na requisição. Verifique sua conexão ou tente novamente.');
            setError('Erro ao redefinir a senha. Por favor, tente novamente mais tarde');
        }).finally(() => {
            setIsLoading(false);
        });
    }

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
                </div>
            </div>

            {/* Main Reset Password Content */}
            <section style={{
                background: 'linear-gradient(120deg, #eaf1fb 0%, #f7fafd 100%)',
                padding: '5rem 1.5rem',
                textAlign: 'center',
                minHeight: 'calc(100vh - 100px)', // Adjust for header/footer height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#1e3a8b'
            }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '21px',
                    boxShadow: '0 10px 32px #2563eb1a',
                    padding: '46px 34px',
                    maxWidth: '500px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <h1 style={{
                        fontFamily: "'Montserrat', 'Nunito', sans-serif",
                        fontSize: '2.2rem',
                        fontWeight: 900,
                        color: '#18306b',
                        lineHeight: 1.2,
                        marginBottom: '0.8em'
                    }}>
                        Redefinir Senha
                    </h1>

                    <form style={{ marginBottom: '1.5rem' }} onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="password" style={{
                                display: 'block',
                                textAlign: 'left',
                                marginBottom: '0.5rem',
                                color: '#18306b',
                                fontWeight: 700
                            }}>
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={error ? 'border-danger' : ''}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    border: '1px solid #dbeafe',
                                    boxSizing: 'border-box',
                                    color: '#18306b',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="confirmPassword" style={{
                                display: 'block',
                                textAlign: 'left',
                                marginBottom: '0.5rem',
                                color: '#18306b',
                                fontWeight: 700
                            }}>
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={error ? 'border-danger' : ''}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    border: '1px solid #dbeafe',
                                    boxSizing: 'border-box',
                                    color: '#18306b',
                                    outline: 'none'
                                }}
                            />
                            {error && <p style={{ color: '#dc3545', marginTop: '0.5rem' }}>{error}</p>}
                        </div>
                        <button type="submit" 
                            style={{
                                background: 'linear-gradient(110deg, #2563eb 0%, #4f8cff 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                border: 'none',
                                borderRadius: '10px',
                                padding: '1rem 2.25rem',
                                fontSize: '1.14rem',
                                boxShadow: '0 2px 12px 0 rgba(37,99,235,0.13)',
                                display: 'block', // Make it full width
                                width: '100%',
                                transition: '0.24s cubic-bezier(.57,1.37,.58,1), transform .14s',
                                cursor: 'pointer',
                                outline: 'none',
                                textDecoration: 'none'
                            }}
                            disabled={isLoading}
                        >
                            Redefinir Senha
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer - Replicando a estrutura e estilos do home.blade.php */}
            <footer style={{
                background: '#1e3a8a',
                color: 'white',
                padding: '4.375rem 2.125rem 2.5rem 2.125rem',
                boxShadow: '0 0 44px 0 rgba(30,58,138,0.09)'
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
            <ToastContainer />
        </Fragment>
    );
};

export default ResetPasswordScreen;