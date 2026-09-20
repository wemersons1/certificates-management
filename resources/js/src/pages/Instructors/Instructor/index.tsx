import { ChangeEvent, FC, Fragment, useContext, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';
import api from '@/src/lib/api';
import AppContext from '@/src/AppContext/Context';
import {
    FiUser,
    FiBookOpen,
    FiAward,
    FiFileText,
    FiUploadCloud,
    FiTrash2,
    FiArrowLeft,
    FiSave,
    FiImage,
    FiCheck,
    FiInfo,
    FiEdit3,
    FiArrowRight
} from 'react-icons/fi';
import { firstLetterUppercase } from '@/src/lib/helper';

interface Instructor {
    name: string;
    formation: string;
    crea: string;
    description?: string;
    signature: string | null;
    stamp: string | null;
}

const Instructor: FC = () => {
    const reduxTheme = useSelector((state: any) => state);
    const themeMode = reduxTheme?.dataThemeMode === 'dark' ? 'dark' : 'light';
    const { checkRole } = useContext(AppContext);

    const initialState: Instructor = {
        name: '',
        formation: '',
        crea: '',
        description: '',
        signature: null,
        stamp: null
    };

    const [item, setItem] = useState<Instructor>(initialState);
    const [disabledSubmitForm, setDisabledSubmitForm] = useState(false);
    const { instructorId } = useParams();
    const [nameWithError, setNameWithError] = useState<boolean>(false);
    const [originalName, setOriginalName] = useState('');
    const [signatureFileName, setSignatureFileName] = useState<string>('');
    const [stampFileName, setStampFileName] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'general' | 'assets'>('general');

    const navigate = useNavigate();

    const [creditsBalance, setCreditsBalance] = useState<{ total: number } | null>(null);
    const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

    useEffect(() => {
        api.get('/credits/balance')
            .then(res => {
                setCreditsBalance(res.data);
                if (!checkRole('Master') && res.data.total === 0) {
                    setShowPaywallModal(true);
                }
            })
            .catch(err => console.error("Error fetching credit balance in Instructor edit:", err));
    }, [checkRole]);

    useEffect(() => {
        if (instructorId) {
            api.get(`/instructors/${instructorId}`).then(response => {
                const { data } = response;
                setOriginalName(data.name);
                setItem({
                    name: data.name,
                    formation: data.formation ?? '',
                    crea: data.crea ?? '',
                    description: data.description ?? '',
                    signature: data.signature_base64 || data.signature || null,
                    stamp: data.stamp_base64 || data.stamp || null
                });
                if (data.signature_base64 || data.signature) setSignatureFileName('Assinatura salva');
                if (data.stamp_base64 || data.stamp) setStampFileName('Selo salvo');
            });
        }
    }, [instructorId]);

    const handlerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, field: 'signature' | 'stamp') => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('O tamanho máximo permitido é 4MB.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, envie um arquivo de imagem válido.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setItem(prev => ({ ...prev, [field]: reader.result as string }));
                if (field === 'signature') setSignatureFileName(file.name);
                else setStampFileName(file.name);
                toast.success(`${field === 'signature' ? 'Assinatura' : 'Selo'} carregado temporariamente!`);
            };
            reader.readAsDataURL(file);
        } else {
            setItem(prev => ({ ...prev, [field]: null }));
            if (field === 'signature') setSignatureFileName('');
            else setStampFileName('');
        }
    };

    const removeImage = (field: 'signature' | 'stamp') => {
        setItem(prev => ({ ...prev, [field]: null }));
        if (field === 'signature') setSignatureFileName('');
        else setStampFileName('');
        toast.info(`${field === 'signature' ? 'Assinatura' : 'Selo'} removido.`);
    };

    const handlerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item.name.trim()) {
            toast.error('O nome do instrutor é obrigatório.');
            setActiveTab('general');
            return;
        }
        if (nameWithError) {
            toast.error('Já existe um instrutor com este nome cadastrado');
            setActiveTab('general');
            return;
        }

        const payload = { ...item };
        setDisabledSubmitForm(true);

        const request = instructorId
            ? api.put(`/instructors/${instructorId}`, payload)
            : api.post('/instructors', payload);

        request.then(() => {
            Swal.fire({
                icon: "success",
                title: instructorId ? 'Instrutor Atualizado!' : 'Instrutor Cadastrado!',
                text: instructorId ? "Os dados foram salvos com sucesso." : "O novo instrutor foi criado com sucesso.",
                showCancelButton: true,
                confirmButtonText: "Emitir certificados",
                cancelButtonText: instructorId ? "Voltar para instrutores" : "Ir para instrutores",
                background: '#151d30',
                color: '#fff',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/documents/create');
                } else {
                    navigate('/instructors');
                }
            });
        }).catch((err) => {
            console.error(err);
            toast.error('Erro ao processar a requisição.');
        }).finally(() => {
            setDisabledSubmitForm(false);
        });
    };

    const verifyAvailableName = () => {
        if (!item.name.trim()) return;
        if (originalName.toLowerCase() !== item.name.toLowerCase()) {
            api.get(`/instructors/name-available?name=${item.name}`).then(response => {
                const { data } = response;
                setNameWithError(false);
            }).catch(() => {
                setNameWithError(false);
            });
        } else {
            setNameWithError(false);
        }
    };

    return (
        <Fragment>
            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-instructor-container {
                    display: flex;
                    min-height: calc(100vh - 120px);
                    background: ${themeMode === 'dark' ? '#111317' : '#ffffff'};
                    border-radius: 16px;
                    border: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    box-shadow: ${themeMode === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.05)'};
                }

                .premium-instructor-sidebar {
                    width: 300px;
                    background: ${themeMode === 'dark' ? '#171923' : '#f8fafc'};
                    border-right: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                    padding: 32px 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .premium-instructor-content {
                    flex: 1;
                    background: ${themeMode === 'dark' ? '#131419' : '#ffffff'};
                    padding: 40px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                }

                .premium-sidebar-title-section {
                    margin-bottom: 32px;
                }

                .premium-sidebar-subtitle {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #4f46e5;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .premium-sidebar-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: ${themeMode === 'dark' ? '#ffffff' : '#0f172a'};
                }

                .premium-tab-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .premium-tab-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#475569'};
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                }

                .premium-tab-item:hover {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
                    color: ${themeMode === 'dark' ? '#f1f5f9' : '#0f172a'};
                }

                .premium-tab-item.active {
                    background: ${themeMode === 'dark' ? 'rgba(26, 86, 219, 0.08)' : '#eff6ff'};
                    border-color: ${themeMode === 'dark' ? 'rgba(26, 86, 219, 0.3)' : '#3b82f6'};
                    color: ${themeMode === 'dark' ? '#3b82f6' : '#1d4ed8'};
                    box-shadow: 0 0 15px rgba(26, 86, 219, 0.15);
                    font-weight: 600;
                }

                .premium-tab-icon {
                    font-size: 20px;
                }

                .premium-form-section {
                    animation: fadeIn 0.4s ease-out;
                }

                .premium-form-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: ${themeMode === 'dark' ? '#ffffff' : '#0f172a'};
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .premium-input-group {
                    position: relative;
                    margin-bottom: 28px;
                }

                .premium-input-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 800;
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#1e293b'};
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                }

                .premium-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .premium-input-icon {
                    position: absolute;
                    left: 16px;
                    color: #64748b;
                    font-size: 18px;
                    transition: color 0.3s;
                }

                .premium-control {
                    width: 100%;
                    padding: 14px 16px 14px 48px;
                    background: ${themeMode === 'dark' ? '#1a1b23' : '#ffffff'};
                    border: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1'};
                    border-radius: 10px;
                    color: ${themeMode === 'dark' ? '#f8fafc' : '#0f172a'};
                    font-size: 14px;
                    transition: all 0.3s;
                }

                .premium-control:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    background: ${themeMode === 'dark' ? '#20212b' : '#ffffff'};
                }

                .premium-control:focus + .premium-input-icon {
                    color: #3b82f6;
                }

                .premium-textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                /* Upload Area Style */
                .premium-upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .premium-upload-card {
                    background: ${themeMode === 'dark' ? '#171923' : '#f8fafc'};
                    border: 2px dashed ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'};
                    border-radius: 14px;
                    padding: 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 250px;
                }

                .premium-upload-card:hover {
                    border-color: ${themeMode === 'dark' ? '#3b82f6' : '#2563eb'};
                    background: ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.03)' : '#f0f7ff'};
                }

                .premium-upload-icon {
                    font-size: 40px;
                    color: #64748b;
                    margin-bottom: 16px;
                    transition: all 0.3s;
                }

                .premium-upload-card:hover .premium-upload-icon {
                    color: #3b82f6;
                    transform: translateY(-5px);
                }

                .premium-upload-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: ${themeMode === 'dark' ? '#e2e8f0' : '#1e293b'};
                    margin-bottom: 4px;
                }

                .premium-upload-subtext {
                    font-size: 11px;
                    color: #64748b;
                }

                .premium-preview-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .premium-preview-img {
                    max-width: 90%;
                    max-height: 150px;
                    object-fit: contain;
                    border-radius: 8px;
                    background: #ffffff;
                    padding: 10px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s;
                }

                .premium-preview-delete {
                    position: absolute;
                    top: -12px;
                    right: -12px;
                    background: #ef4444;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
                    transition: all 0.2s;
                    z-index: 10;
                }

                .premium-preview-delete:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                .premium-footer-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                }

                .premium-btn-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: 1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'};
                    color: ${themeMode === 'dark' ? '#94a3b8' : '#475569'};
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .premium-btn-back:hover {
                    background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'};
                    color: ${themeMode === 'dark' ? '#f1f5f9' : '#0f172a'};
                    border-color: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#cbd5e1'};
                }

                .premium-btn-submit {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                    color: #ffffff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
                    transition: all 0.3s;
                }

                .premium-btn-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(30, 64, 175, 0.45);
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                }

                .premium-btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` }} />

            <div className="premium-instructor-container">
                {/* Sidebar Navigation */}
                <div className="premium-instructor-sidebar">
                    <div>
                        <div className="premium-sidebar-title-section">
                            <div className="premium-sidebar-subtitle">Painel de Controle</div>
                            <h2 className="premium-sidebar-title">
                                {instructorId ? 'Editar Instrutor' : 'Novo Instrutor'}
                            </h2>
                        </div>

                        <div className="premium-tab-list">
                            <button
                                type="button"
                                className={`premium-tab-item ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <FiUser className="premium-tab-icon" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Informações Gerais</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Nome, CREA, Biografia</div>
                                </div>
                            </button>

                            {/* <button
                                type="button"
                                className={`premium-tab-item ${activeTab === 'assets' ? 'active' : ''}`}
                                onClick={() => setActiveTab('assets')}
                            >
                                <FiImage className="premium-tab-icon" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Assinatura & Selo</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Imagens de autenticação</div>
                                </div>
                            </button> */}
                        </div>
                    </div>

                    <div style={{ color: '#4b5563', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiInfo size={14} />
                        <span>Preencha as informações obrigatórias (*) antes de salvar.</span>
                    </div>
                </div>

                {/* Form Content Area */}
                <form onSubmit={handlerSubmit} className="premium-instructor-content">
                    <div>
                        {activeTab === 'general' ? (
                            <div className="premium-form-section">
                                <h3 className="premium-form-title">
                                    <FiEdit3 size={18} />
                                    <span>Identificação do Instrutor</span>
                                </h3>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Nome Completo *</label>
                                            <div className="premium-input-wrapper">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={firstLetterUppercase(item.name)}
                                                    onChange={handlerChange}
                                                    onBlur={verifyAvailableName}
                                                    required
                                                    className="premium-control"
                                                    placeholder="Digite o nome completo do instrutor"
                                                />
                                                <FiUser className="premium-input-icon" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Formação Profissional</label>
                                            <div className="premium-input-wrapper">
                                                <input
                                                    type="text"
                                                    name="formation"
                                                    value={item.formation}
                                                    onChange={handlerChange}
                                                    className="premium-control"
                                                    placeholder="Ex.: Engenheiro Eletricista"
                                                />
                                                <FiBookOpen className="premium-input-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="premium-input-group">
                                            <label className="premium-input-label">Número do CREA / Registro</label>
                                            <div className="premium-input-wrapper">
                                                <input
                                                    type="text"
                                                    name="crea"
                                                    value={item.crea}
                                                    onChange={handlerChange}
                                                    className="premium-control"
                                                    placeholder="Ex.: CREA-SP 506123456"
                                                />
                                                <FiAward className="premium-input-icon" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="premium-input-group" style={{ marginBottom: 0 }}>
                                            <label className="premium-input-label">Resumo / Descrição curta</label>
                                            <div className="premium-input-wrapper">
                                                <textarea
                                                    name="description"
                                                    value={item.description}
                                                    onChange={handlerChange}
                                                    className="premium-control premium-textarea"
                                                    placeholder="Uma breve biografia que aparecerá no verso dos certificados ou nas informações do curso."
                                                />
                                                <FiFileText className="premium-input-icon" style={{ top: '16px' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-form-section">
                                <h3 className="premium-form-title">
                                    <FiImage size={18} />
                                    <span>Elementos de Autenticidade</span>
                                </h3>

                                <div className="premium-upload-grid">
                                    {/* Signature Upload Card */}
                                    <div>
                                        <label className="premium-input-label">Assinatura Digitalizada</label>
                                        <div
                                            className="premium-upload-card"
                                            onClick={() => document.getElementById('signature-file-input')?.click()}
                                        >
                                            {item.signature ? (
                                                <div className="premium-preview-container" onClick={(e) => e.stopPropagation()}>
                                                    <img
                                                        src={item.signature}
                                                        alt="Assinatura Digitalizada"
                                                        className="premium-preview-img"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="premium-preview-delete"
                                                        onClick={() => removeImage('signature')}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                                                        {signatureFileName}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <FiUploadCloud className="premium-upload-icon" />
                                                    <div className="premium-upload-text">Importar Assinatura</div>
                                                    <div className="premium-upload-subtext">Arraste ou clique para carregar (PNG/JPG até 4MB)</div>
                                                </>
                                            )}
                                            <input
                                                id="signature-file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'signature')}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stamp Upload Card */}
                                    <div>
                                        <label className="premium-input-label">Selo de Autenticação / Logomarca</label>
                                        <div
                                            className="premium-upload-card"
                                            onClick={() => document.getElementById('stamp-file-input')?.click()}
                                        >
                                            {item.stamp ? (
                                                <div className="premium-preview-container" onClick={(e) => e.stopPropagation()}>
                                                    <img
                                                        src={item.stamp}
                                                        alt="Selo / Logo"
                                                        className="premium-preview-img"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="premium-preview-delete"
                                                        onClick={() => removeImage('stamp')}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                                                        {stampFileName}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <FiUploadCloud className="premium-upload-icon" />
                                                    <div className="premium-upload-text">Importar Selo / Carimbo</div>
                                                    <div className="premium-upload-subtext">Arraste ou clique para carregar (PNG/JPG até 4MB)</div>
                                                </>
                                            )}
                                            <input
                                                id="stamp-file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'stamp')}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="premium-footer-actions">
                        <button
                            type="button"
                            className="premium-btn-back"
                            onClick={() => navigate('/instructors')}
                        >
                            <FiArrowLeft size={16} />
                            <span>Voltar para Lista</span>
                        </button>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            {/* {activeTab === 'general' ? (
                                <button
                                    type="button"
                                    className="premium-btn-submit"
                                    onClick={() => setActiveTab('assets')}
                                >
                                    <span>Próximo Passo</span>
                                    <FiCheck size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="premium-btn-back"
                                    onClick={() => setActiveTab('general')}
                                    style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#3b82f6' }}
                                >
                                    <span>Informações Gerais</span>
                                </button>
                            )} */}

                            <button
                                type="submit"
                                disabled={disabledSubmitForm}
                                className="premium-btn-submit"
                            >
                                <FiSave size={16} />
                                <span>{instructorId ? 'Salvar Alterações' : 'Cadastrar Instrutor'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {/* Paywall Limit Modal */}
            <Modal show={showPaywallModal} onHide={() => setShowPaywallModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                    <Modal.Title className="text-danger fw-bold">Limite de Créditos Atingido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-4">
                        <FiAward size={64} className="text-danger animate__animated animate__bounceIn" />
                    </div>
                    <h4 className="fw-bold mb-3">Você não possui créditos disponíveis</h4>
                    <p className="text-muted mb-4" style={{ fontSize: '15px' }}>
                        Para continuar gerando e emitindo certificados oficiais para seus alunos, é necessário fazer o upgrade do seu plano ou adquirir créditos adicionais.
                    </p>
                    <div className="d-flex flex-column gap-2 px-4">
                        <Button
                            variant="primary"
                            className="fw-bold py-2.5"
                            style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => window.location.href = '/checkout'}
                        >
                            Comprar Créditos / Upgrade <FiArrowRight className="ms-1" />
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="py-2.5"
                            style={{ borderRadius: '12px' }}
                            onClick={() => navigate('/dashboard')}
                        >
                            Ir para resumo
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
};

export default Instructor;
