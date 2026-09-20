import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Col, Row, Spinner } from 'react-bootstrap';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
    FiUsers,
    FiBook,
    FiBriefcase,
    FiActivity,
    FiAward,
    FiCheckCircle,
    FiArrowRight,
    FiDatabase,
    FiClock,
    FiCpu,
    FiBookOpen
} from 'react-icons/fi';
import api from '@/src/lib/api';
import AppContext from '@/src/AppContext/Context';

interface ChartItem {
    name: string;
    total: number;
}

interface DashboardResume {
    documents_today: number;
    employees_count: number;
    courses_count: number;
    companies_count: number;
}

interface DashboardData {
    total_by_employees: ChartItem[];
    total_by_courses: ChartItem[];
    total_by_companies: ChartItem[];
    total_by_positions: ChartItem[];
    total_documents_this_today: { total: number };
    total_documents_this_week: ChartItem[];
    total_documents_by_month: ChartItem[];
    total_documents_expiring_next_six_months: ChartItem[];
    resume: DashboardResume;
    certificates_balance?: {
        limit: number;
        used: number;
        remaining: number;
    } | null;
}

const Dashboard: FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { theme } = useContext(AppContext);
    const [period, setPeriod] = useState<number>(7);
    const [activeTab, setActiveTab] = useState<'overview' | 'limits' | 'courses' | 'rankings'>('overview');

    // Estado do tema escuro/claro
    const [isDark, setIsDark] = useState<boolean>(
        document.documentElement.getAttribute('data-theme-mode') === 'dark'
    );

    const [creditsBalance, setCreditsBalance] = useState<{ total: number; free: number; monthly_yearly: number; addon: number } | null>(null);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.getAttribute('data-theme-mode') === 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-mode'] });
        return () => observer.disconnect();
    }, []);

    const fetchCreditsBalance = () => {
        api.get('/credits/balance')
            .then(res => setCreditsBalance(res.data))
            .catch(err => console.error("Error fetching credits balance", err));
    };

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resuming, setResuming] = useState<boolean>(false);

    const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleResumeSubmit = async () => {
        if (!resumeFile) return;
        setResuming(true);
        try {
            const fileReader = new FileReader();
            fileReader.onload = async (event) => {
                try {
                    const parsed = JSON.parse(event.target?.result as string);
                    const recoveryData = parsed.recovery ? parsed.recovery : parsed;

                    const res = await api.post('/credits/resume', {
                        recovery_data: recoveryData
                    });

                    if (res.data.partial) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Emissão Parcial Realizada',
                            text: `Processados ${res.data.processed_count} certificados. Restam ${res.data.remaining_count}. Baixando novo arquivo de recuperação.`,
                            confirmButtonColor: '#f59e0b'
                        });

                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.recovery));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", "interrupted_emission_recovery.json");
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso',
                            text: 'Emissão de certificados retomada e finalizada com sucesso!',
                            confirmButtonColor: '#10b981'
                        });
                    }
                    setResumeFile(null);
                    fetchCreditsBalance();
                } catch (e) {
                    console.error(e);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro ao ler ou processar o JSON de recuperação.',
                        confirmButtonColor: '#ef4444'
                    });
                }
            };
            fileReader.readAsText(resumeFile);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha ao fazer upload do arquivo.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setResuming(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        api.get('/dashboard', { params: { period } })
            .then(res => {
                setData(res.data);
                fetchCreditsBalance();
            })
            .finally(() => setLoading(false));
    }, [period]);

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            </div>
        );
    }

    // Informações do Plano do Usuário (Gratuito vs Pago)
    const hasPlanContract = !!data.certificates_balance;
    const isPaidPlan = hasPlanContract && !!data.certificates_balance?.is_paid;
    const planName = hasPlanContract
        ? (data.certificates_balance?.plan_name || (isPaidPlan ? 'Plano Profissional / Pro' : 'Plano Gratuito / Free'))
        : 'Plano Gratuito / Free';

    // Cálculo dos limites
    const usedCertificates = hasPlanContract
        ? data.certificates_balance!.used
        : data.resume.documents_today; // no Free fictício, usamos as emissões hoje como referência

    const limitCertificates = hasPlanContract
        ? data.certificates_balance!.limit
        : 5; // limite fictício de teste para versão gratuita de avaliação

    const remainingCertificates = Math.max(0, limitCertificates - usedCertificates);

    // Componente circular de progresso SVG
    const CircularProgress = ({ value, max, size = 110, strokeWidth = 8, color = "#0d6efd" }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const percentage = max > 0 ? (value / max) * 100 : 0;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', lineHeight: 1 }}>
                        {Math.round(percentage)}%
                    </span>
                    <span style={{ fontSize: '0.6rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                        Usado
                    </span>
                </div>
            </div>
        );
    };

    // Estilos comuns compatíveis com o anexo
    const styles = {
        cardContainer: {
            borderRadius: '24px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
            background: isDark ? 'linear-gradient(145deg, #131625 0%, #0c0d18 100%)' : '#ffffff',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            margin: '0 auto 2rem'
        },
        leftPane: {
            borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            background: isDark ? 'rgba(10, 11, 20, 0.6)' : '#f8fafc',
            padding: '2.2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between'
        },
        rightPane: {
            padding: '2.5rem 2rem',
            background: isDark ? 'rgba(12, 13, 24, 0.2)' : '#ffffff',
            minHeight: '520px'
        },
        menuTitle: {
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.725rem',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: '1.25rem',
            paddingLeft: '0.75rem'
        },
        menuButtonActive: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.85rem 1.1rem',
            borderRadius: '14px',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: isDark ? '1px solid rgba(13, 110, 253, 0.5)' : '1px solid #0d6efd',
            boxShadow: isDark ? '0 0 15px rgba(13, 110, 253, 0.25)' : '0 0 10px rgba(13, 110, 253, 0.15)',
            background: isDark ? 'rgba(13, 110, 253, 0.08)' : 'rgba(13, 110, 253, 0.05)',
            color: isDark ? '#ffffff' : '#0d6efd',
            transition: 'all 0.25s ease',
            textAlign: 'left' as const,
            marginBottom: '0.5rem',
            cursor: 'pointer'
        },
        menuButtonInactive: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.85rem 1.1rem',
            borderRadius: '14px',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: '1px solid transparent',
            background: 'transparent',
            color: isDark ? '#94a3b8' : '#64748b',
            transition: 'all 0.25s ease',
            textAlign: 'left' as const,
            marginBottom: '0.5rem',
            cursor: 'pointer'
        },
        neonBadge: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDark ? '2px solid rgba(13, 110, 253, 0.35)' : '2px solid rgba(13, 110, 253, 0.2)',
            background: isDark ? 'rgba(13, 110, 253, 0.08)' : 'rgba(13, 110, 253, 0.05)',
            boxShadow: isDark ? '0 0 12px rgba(13, 110, 253, 0.15)' : 'none',
            color: '#0d6efd',
            fontSize: '1.2rem',
            marginBottom: '1rem'
        },
        glowButton: {
            background: 'linear-gradient(135deg, #0d6efd 0%, #1e40af 100%)',
            color: '#ffffff',
            border: isDark ? '1px solid rgba(13, 110, 253, 0.5)' : '1px solid rgba(13, 110, 253, 0.3)',
            boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
            borderRadius: '12px',
            padding: '0.65rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        ghostButton: {
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.12)',
            background: 'transparent',
            color: isDark ? '#ffffff' : '#1e293b',
            borderRadius: '12px',
            padding: '0.65rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        premiumBenefitCard: {
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
            background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            padding: '1.5rem',
            marginBottom: '1.5rem'
        }
    };

    return (
        <Fragment>
            {/* Header com o seletor de período */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 0.25rem' }}>Dashboard</h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b', margin: 0, fontSize: '0.875rem' }}>
                        FlashCertificados • Bem-vindo ao estúdio de emissão.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        className="form-select"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                        style={{
                            width: '180px',
                            backgroundColor: isDark ? '#121526' : '#ffffff',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                            fontSize: '0.875rem',
                            borderRadius: '10px',
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontWeight: 600,
                            padding: '0.45rem 1rem'
                        }}
                    >
                        <option value={7}>Últimos 7 dias</option>
                        <option value={15}>Últimos 15 dias</option>
                        <option value={30}>Últimos 30 dias</option>
                    </select>
                </div>
            </div>

            {/* Container Principal Dual-Pane */}
            <div style={styles.cardContainer}>
                <Row className="g-0">
                    {/* Left Pane: Navegador interno similar ao anexo */}
                    <Col xl={3} lg={4} md={12} style={styles.leftPane}>
                        <div>
                            <div style={styles.menuTitle}>Gerenciador</div>

                            <div
                                style={activeTab === 'overview' ? styles.menuButtonActive : styles.menuButtonInactive}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FiActivity size={18} />
                                Visão Geral
                            </div>

                            <div
                                style={activeTab === 'limits' ? styles.menuButtonActive : styles.menuButtonInactive}
                                onClick={() => setActiveTab('limits')}
                            >
                                <FiAward size={18} />
                                Plano & Limites
                            </div>

                            <div
                                style={activeTab === 'courses' ? styles.menuButtonActive : styles.menuButtonInactive}
                                onClick={() => setActiveTab('courses')}
                            >
                                <FiBook size={18} />
                                Emissões por Curso
                            </div>

                            <div
                                style={activeTab === 'rankings' ? styles.menuButtonActive : styles.menuButtonInactive}
                                onClick={() => setActiveTab('rankings')}
                            >
                                <FiUsers size={18} />
                                Rankings & Alunos
                            </div>
                        </div>


                    </Col>

                    {/* Right Pane: Conteúdo Dinâmico com estilo de alta fidelidade */}
                    <Col xl={9} lg={8} md={12} style={styles.rightPane}>

                        {/* ========================================================
                            TAB: VISÃO GERAL (OVERVIEW)
                            ======================================================== */}
                        {activeTab === 'overview' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={styles.neonBadge}>
                                        <FiActivity />
                                    </div>
                                    <div>
                                        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Atividades da Plataforma</span>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', margin: 0 }}>Visão Geral de Emissões</h2>
                                    </div>
                                </div>

                                {/* Mini Cards de Métricas */}
                                <Row className="g-3 mb-4">
                                    <Col md={6} xl={4}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Certificados Emitidos</span>
                                                <FiAward style={{ color: '#6366f1' }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#fff' : '#1f2937', margin: 0 }}>
                                                {data.resume.documents_today.toLocaleString('pt-BR')}
                                            </h3>
                                            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Emitidos Hoje</span>
                                        </div>
                                    </Col>

                                    <Col md={6} xl={4}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Total de Alunos</span>
                                                <FiUsers style={{ color: '#0d6efd' }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#fff' : '#1f2937', margin: 0 }}>
                                                {data.resume.employees_count.toLocaleString('pt-BR')}
                                            </h3>
                                            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Alunos Cadastrados</span>
                                        </div>
                                    </Col>

                                    <Col md={6} xl={4}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Cursos Ativos</span>
                                                <FiBook style={{ color: '#10b981' }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#fff' : '#1f2937', margin: 0 }}>
                                                {data.resume.courses_count.toLocaleString('pt-BR')}
                                            </h3>
                                            <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Cursos Registrados</span>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Gráfico de Atividades */}
                                <div style={{ padding: '1.5rem', borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#ffffff' : '#1f2937', marginBottom: '1.2rem' }}>
                                        Evolução Semanal de Emissões
                                    </h4>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={data.total_documents_this_week} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#0d6efd" stopOpacity={0.95} />
                                                    <stop offset="100%" stopColor="#0d6efd" stopOpacity={0.3} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "#f3f4f6"} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                                            <Tooltip
                                                cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb' }}
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#1e2130' : '#ffffff',
                                                    border: isDark ? '1px solid #2d3246' : '1px solid #eaecf0',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Bar dataKey="total" fill="url(#colorBar)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ========================================================
                            TAB: PLANO & LIMITES (LIMITS & PLAN) - CRITICAL REQUEST
                            ======================================================== */}
                        {activeTab === 'limits' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={styles.neonBadge}>
                                        <FiAward />
                                    </div>
                                    <div>
                                        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Consumo & Plano</span>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', margin: 0 }}>
                                            {isPaidPlan ? 'Limite Mensal de Geração' : 'Limite Total de Geração'}
                                        </h2>
                                    </div>
                                </div>

                                <Row className="g-4 mb-4">
                                    {/* Esquerda: Circular Gauge de Consumo */}
                                    <Col lg={5} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                        {hasPlanContract ? (
                                            <CircularProgress value={usedCertificates} max={limitCertificates} color={remainingCertificates / limitCertificates > 0.3 ? "#10b981" : (remainingCertificates / limitCertificates >= 0.11 ? "#f59e0b" : "#ef4444")} />
                                        ) : (
                                            <div style={styles.neonBadge}>
                                                <FiAward style={{ fontSize: '2rem' }} />
                                            </div>
                                        )}

                                        <div style={{ textAlign: 'center', marginTop: '1.25rem', width: '100%' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.05em',
                                                textTransform: 'uppercase',
                                                background: isPaidPlan ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                                color: isPaidPlan ? '#10b981' : '#f59e0b',
                                                display: 'inline-block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {planName}
                                            </span>

                                            {hasPlanContract ? (
                                                <>
                                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: isDark ? '#fff' : '#1e293b' }}>
                                                        {remainingCertificates} <span style={{ fontSize: '0.875rem', color: isDark ? '#64748b' : '#94a3b8', fontWeight: 500 }}>disponíveis</span>
                                                    </h4>
                                                    <p style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>
                                                        {isPaidPlan
                                                            ? `Cota: ${usedCertificates} de ${limitCertificates} emitidos este mês`
                                                            : `Cota: ${usedCertificates} de ${limitCertificates} emitidos no total`
                                                        }
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: isDark ? '#fff' : '#1e293b' }}>
                                                        Versão de Testes
                                                    </h4>
                                                    <p style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>
                                                        Emissões de homologação
                                                    </p>
                                                </>
                                            )}

                                            {/* Monthly Progress Bar with Dynamic Warning States */}
                                            <div style={{ marginTop: '1.5rem', width: '100%', textAlign: 'left' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                                    <span>Consumo de Créditos</span>
                                                    <span>{usedCertificates} de {limitCertificates} usados</span>
                                                </div>
                                                <div style={{ width: '100%', height: '10px', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${Math.min(100, limitCertificates > 0 ? (usedCertificates / limitCertificates) * 100 : 0)}%`,
                                                        height: '100%',
                                                        background: (limitCertificates > 0 && (remainingCertificates / limitCertificates) > 0.3) ? '#10b981' : ((limitCertificates > 0 && (remainingCertificates / limitCertificates) >= 0.11) ? '#f59e0b' : '#ef4444'),
                                                        transition: 'width 0.4s ease'
                                                    }} />
                                                </div>

                                                {creditsBalance && (
                                                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span>Você possui <strong>{creditsBalance.addon}</strong> créditos adicionais (Add-ons) e <strong>{creditsBalance.free}</strong> créditos de boas-vindas (Welcome/Free) disponíveis.</span>
                                                    </div>
                                                )}

                                                {((limitCertificates > 0 && (remainingCertificates / limitCertificates) <= 0.3)) && (
                                                    <div style={{ marginTop: '14px' }}>
                                                        <button
                                                            style={{
                                                                background: '#3b82f6',
                                                                color: '#ffffff',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                padding: '8px 14px',
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                                                                transition: 'all 0.2s',
                                                                width: '100%'
                                                            }}
                                                            onClick={() => window.location.href = '/checkout'}
                                                        >
                                                            Fazer Upgrade / Comprar Créditos
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Direita: Explicação das Versões (Free vs Paga) */}
                                    <Col lg={7}>
                                        <div style={styles.premiumBenefitCard}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiCheckCircle style={{ color: '#0d6efd' }} />
                                                Informações da Assinatura
                                            </h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)' }}>
                                                    <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Plano Atual:</span>
                                                    <span style={{ fontWeight: 700, color: isPaidPlan ? '#10b981' : '#f59e0b' }}>
                                                        {hasPlanContract
                                                            ? (data.certificates_balance?.plan_name || (isPaidPlan ? 'Premium (Profissional)' : 'Gratuito'))
                                                            : 'Gratuito (Avaliação)'
                                                        }
                                                    </span>
                                                </div>

                                                {hasPlanContract ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)' }}>
                                                            <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                                                                {isPaidPlan ? 'Cota Mensal:' : 'Cota Total:'}
                                                            </span>
                                                            <span style={{ fontWeight: 700 }}>{limitCertificates} certificados</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)' }}>
                                                            <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                                                                {isPaidPlan ? 'Emitidos este Mês:' : 'Emitidos no Total:'}
                                                            </span>
                                                            <span>{usedCertificates} certificados</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Saldo Restante:</span>
                                                            <span style={{ fontWeight: 700, color: '#10b981' }}>{remainingCertificates} certificados</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)' }}>
                                                            <span style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Cota Mensal:</span>
                                                            <span style={{ fontWeight: 700 }}>Sem cota ativa (Modo de Testes)</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                                            <span>• Você está em um ambiente de testes para homologação e criação de templates.</span>
                                                            <span>• Para habilitar a emissão de certificados oficiais de produção e liberar as cotas mensais de envio, realize a contratação de uma assinatura.</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Apenas exibe se o usuário for Free (para fazer o upgrade) */}
                                        {!isPaidPlan && (
                                            <div style={{ padding: '1rem 1.25rem', borderRadius: '14px', background: isDark ? 'rgba(13, 110, 253, 0.08)' : 'rgba(13, 110, 253, 0.05)', border: isDark ? '1px solid rgba(13, 110, 253, 0.2)' : '1px solid rgba(13, 110, 253, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 2px', color: isDark ? '#fff' : '#0d6efd' }}>Contratar Plano de Produção</h5>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Adquira uma cota de emissões oficiais para liberar o estúdio em produção.</p>
                                                </div>
                                                <button style={styles.glowButton} onClick={() => window.location.href = '/checkout'}>
                                                    Assinar Agora <FiArrowRight />
                                                </button>
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                {/* Footer de Ações compatível com o anexo */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {isPaidPlan ? '✓ Sua assinatura Premium está ativa' : '⚠ Você está rodando em modo Free'}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button style={styles.ghostButton} onClick={() => setActiveTab('overview')}>Voltar</button>
                                        <button style={styles.glowButton} onClick={() => window.location.href = '/checkout'}>
                                            {isPaidPlan ? 'Upgrade / Planos' : 'Contratar Versão Paga'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================
                            TAB: EMISSÕES POR CURSO (COURSES)
                            ======================================================== */}
                        {activeTab === 'courses' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={styles.neonBadge}>
                                        <FiBook />
                                    </div>
                                    <div>
                                        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Cursos Ativos</span>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', margin: 0 }}>Distribuição por Curso</h2>
                                    </div>
                                </div>

                                <div style={{ minHeight: '320px' }}>
                                    {data.total_by_courses.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                                            Nenhum certificado emitido para cursos até o momento.
                                        </div>
                                    ) : (
                                        <Row className="g-3">
                                            {data.total_by_courses.slice(0, 8).map((item, index) => {
                                                const maxTotal = data.total_by_courses.reduce((max, c) => Math.max(max, c.total), 0);
                                                const percentage = maxTotal > 0 ? Math.round((item.total / maxTotal) * 100) : 0;

                                                return (
                                                    <Col xl={4} md={6} key={index}>
                                                        <div style={{
                                                            padding: '1.25rem',
                                                            borderRadius: '16px',
                                                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0',
                                                            background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                <div style={{
                                                                    width: '2rem', height: '2rem', borderRadius: '8px',
                                                                    background: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff',
                                                                    color: '#6366f1',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    <FiBook />
                                                                </div>
                                                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#fff' : '#1f2937' }}>
                                                                    {item.total}
                                                                </span>
                                                            </div>
                                                            <div style={{ color: isDark ? '#e2e8f0' : '#4b5563', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.75rem' }} title={item.name}>
                                                                {item.name}
                                                            </div>

                                                            {/* Barra de Progresso Interna */}
                                                            <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div style={{
                                                                    height: '100%',
                                                                    background: '#6366f1',
                                                                    width: `${percentage}%`,
                                                                    transition: 'width 0.8s ease'
                                                                }}></div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========================================================
                            TAB: RANKINGS & ALUNOS (RANKINGS)
                            ======================================================== */}
                        {activeTab === 'rankings' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={styles.neonBadge}>
                                        <FiUsers />
                                    </div>
                                    <div>
                                        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Rankings</span>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', margin: 0 }}>Top Alunos com Certificados</h2>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', borderRadius: '20px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaecf0', background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff' }}>
                                    {data.total_by_employees.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                                            Nenhum aluno recebeu certificados neste período.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {data.total_by_employees.slice(0, 6).map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '0.85rem 1rem',
                                                        borderRadius: '12px',
                                                        border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #f3f4f6',
                                                        background: isDark ? 'rgba(255,255,255,0.01)' : '#f9fafb',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                                                            background: isDark ? 'rgba(13, 110, 253, 0.12)' : '#e7f1ff',
                                                            color: '#0d6efd',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: '0.875rem', marginRight: '1rem'
                                                        }}>
                                                            {item.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: isDark ? '#f3f4f6' : '#374151', fontSize: '0.875rem' }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{ color: isDark ? '#64748b' : '#9ca3af', fontSize: '0.72rem', marginTop: '0.125rem' }}>
                                                                Emitidos recentemente
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{
                                                            padding: '0.2rem 0.65rem',
                                                            borderRadius: '100px',
                                                            fontSize: '0.725rem',
                                                            fontWeight: 700,
                                                            background: isDark ? 'rgba(13, 110, 253, 0.15)' : 'rgba(13, 110, 253, 0.08)',
                                                            color: '#0d6efd'
                                                        }}>
                                                            {item.total} {item.total === 1 ? 'certificado' : 'certificados'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default Dashboard;
