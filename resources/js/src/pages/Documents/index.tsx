import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '@/src/lib/api';
import { clearMask, formatDate } from '@/src/lib/helper';
import Pagination from '@/src/components/common/pagination';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import Select from 'react-select';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { MdOutlineLocalPrintshop, MdOutlineCloudDownload } from 'react-icons/md';

interface DocumentsProps { }
interface Option { value: number; label: string; }

const Documents: FC<DocumentsProps> = () => {
    const [items, setItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [search, setSearch] = useState('');
    const [courseIds, setCourseIds] = useState<Option[]>([]);
    const [companyIds, setCompanyIds] = useState<Option[]>([]);
    const [validade, setValidade] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const [courseOptions, setCourseOptions] = useState<Option[]>([]);
    const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [printId, setPrintId] = useState<number | null>(null);
    const [documentSelected, setDocumentSelected] = useState<string | null>(null);

    const [openFilters, setOpenFilters] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [documentToSend, setDocumentToSend] = useState<any>(null);
    const [emailFormData, setEmailFormData] = useState({ email: '', send_certificate: true, send_presence_list: false, send_authorization: false });
    const [firstLoadChecked, setFirstLoadChecked] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingBulkEmails, setIsSendingBulkEmails] = useState(false);
    const [showMissingEmailsModal, setShowMissingEmailsModal] = useState(false);
    const [missingEmailsList, setMissingEmailsList] = useState<any[]>([]);
    const [missingEmailsData, setMissingEmailsData] = useState<{ [key: number]: string }>({});
    const [isUpdatingMissingEmails, setIsUpdatingMissingEmails] = useState(false);

    const { checkRole, hasPermission } = useContext(AppContext);
    const [creditsTotal, setCreditsTotal] = useState<number | null>(null);

    const fetchCredits = () => {
        api.get('/credits/balance')
            .then(res => {
                setCreditsTotal(res.data.total);
            })
            .catch(err => console.error("Error fetching credits in Documents:", err));
    };

    useEffect(() => {
        fetchCredits();
        
        const handleCreditsUpdated = () => {
            fetchCredits();
        };
        window.addEventListener('credits-updated', handleCreditsUpdated);
        return () => {
            window.removeEventListener('credits-updated', handleCreditsUpdated);
        };
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const [eventIdFilter, setEventIdFilter] = useState<string>(() => {
        return new URLSearchParams(location.search).get('event_id') || '';
    });
    const [presenceListIdFilter, setPresenceListIdFilter] = useState<string>(() => {
        return new URLSearchParams(location.search).get('presence_list_id') || '';
    });
    const [presenceListUuidFilter, setPresenceListUuidFilter] = useState<string>(() => {
        return new URLSearchParams(location.search).get('presence_list_uuid') || '';
    });
    const [onlyDeletedFilter, setOnlyDeletedFilter] = useState(false);

    const isDownloading = (id: number, doc: string) => downloadingId === id && documentSelected === doc;
    const isAnyDownloading = downloadingId !== null;

    const hasAnyActiveFilter = Boolean(
        search ||
        courseIds.length ||
        companyIds.length ||
        validade ||
        dateStart ||
        dateEnd ||
        eventIdFilter ||
        presenceListIdFilter ||
        presenceListUuidFilter ||
        onlyDeletedFilter
    );

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setEventIdFilter(params.get('event_id') || '');
        setPresenceListIdFilter(params.get('presence_list_id') || '');
        setPresenceListUuidFilter(params.get('presence_list_uuid') || '');
        setCurrentPage(1);
    }, [location.search]);

    useEffect(() => {
        api.get('/courses?all=1').then(({ data }) => setCourseOptions(data.map((i: any) => ({ value: i.id, label: i.name }))));
        api.get('/companies?all=1').then(({ data }) => setCompanyOptions(data.map((i: any) => ({ value: i.id, label: i.name }))));
    }, []);

    useEffect(() => { fetchData(); }, [currentPage, search, courseIds, companyIds, validade, dateStart, dateEnd, eventIdFilter, presenceListIdFilter, presenceListUuidFilter, onlyDeletedFilter]);

    useEffect(() => {
        const handleRefresh = () => fetchData();
        window.addEventListener('refreshDocuments', handleRefresh);
        return () => window.removeEventListener('refreshDocuments', handleRefresh);
    }, []);

    const fetchData = async () => {
        try {
            const params: any = {
                page: currentPage,
                event_id: eventIdFilter || undefined,
                presence_list_id: presenceListIdFilter || undefined,
                presence_list_uuid: presenceListUuidFilter || undefined,
                only_deleted: onlyDeletedFilter ? 1 : undefined,
                search: search || undefined,
                validade: validade || undefined,
                course_id: courseIds.map(c => c.value),
                company_id: companyIds.map(c => c.value),
                issue_date_start: dateStart || undefined,
                issue_date_end: dateEnd || undefined,
            };
            const response = await api.get('/documents', { params });
            const { data, current_page, last_page } = response.data;

            const hasActiveFilters = Boolean(eventIdFilter || presenceListIdFilter || presenceListUuidFilter || onlyDeletedFilter || search || validade || courseIds.length || companyIds.length || dateStart || dateEnd);
            if (!firstLoadChecked && !hasActiveFilters && Number(current_page) === 1 && data.length === 0) {
                setFirstLoadChecked(true);
                navigate('/documents/create');
                return;
            }
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
            if (!firstLoadChecked) setFirstLoadChecked(true);
        } catch {
            toast.error('Erro ao carregar documentos');
        }
    };

    const showColumnCompany = () => items?.some(item => item?.company_name?.length > 0);

    const isDeletable = (createdAtString: string): boolean => {
        if (!createdAtString) return true;
        const createdAt = new Date(createdAtString);
        const now = new Date();
        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const handleDelete = (itemId: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Ao excluir, o certificado será invalidado permanentemente. Deseja realmente prosseguir com a exclusão?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        })
            .then(result => {
                if (result.isConfirmed) {
                    api.delete(`/documents/${itemId}`)
                        .then(() => {
                            Swal.fire('Excluído!', 'Documento excluído com sucesso.', 'success');
                            window.dispatchEvent(new CustomEvent('credits-updated'));
                            fetchData();
                        })
                        .catch(() => toast.error('Erro ao excluir documento'));
                }
            });
    };

    const handlePrintMountedTemplate = (html: string, docName?: string) => {
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open(); doc.write(html); doc.close();
            if (docName) {
                doc.title = docName;
            }
            iframe.onload = () => setTimeout(() => {
                const originalTitle = window.document.title;
                if (docName) {
                    window.document.title = docName;
                }
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                setTimeout(() => {
                    if (docName) {
                        window.document.title = originalTitle;
                    }
                    document.body.removeChild(iframe);
                }, 1000);
            }, 300);
        }
    };

    const getDocumentPrint = async (id: number, document: string) => {
        setDocumentSelected(document); setPrintId(id);
        try {
            const item = await api.get(`/documents/html/${id}`, { params: { document } });
            const doc: any = items.find(i => i.id === id);
            const docName = `CERTIFICADO_${doc?.employee_name}_${doc?.course}${doc?.date_init_validate ? `_${doc?.date_init_validate}` : ''}${doc?.date_end_validate ? `_ATÉ_${doc?.date_end_validate}` : ''}`.toUpperCase().split(' ').join('_');
            handlePrintMountedTemplate(item?.data?.[`${document}_template_mounted`], docName);
        } catch { toast.error('Erro ao gerar o documento'); }
        finally { setPrintId(null); }
    };

    const getDocumentDownload = async (id: number, document: string) => {
        setDocumentSelected(document); setDownloadingId(id);
        api.get(`/documents/download/${id}`, { params: { document }, responseType: 'blob' })
            .then(response => {
                const doc: any = items.find(i => i.id === id);
                const docName = `CERTIFICADO_${doc?.employee_name}_${doc?.course}${doc?.date_init_validate ? `_${doc?.date_init_validate}` : ''}${doc?.date_end_validate ? `_ATÉ_${doc?.date_end_validate}` : ''}`.toUpperCase().split(' ').join('_');
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = window.document.createElement('a');
                link.href = url; link.setAttribute('download', docName + '.pdf');
                window.document.body.appendChild(link); link.click();
            })
            .finally(() => setDownloadingId(null));
    };

    const handleOpenEmailModal = (item: any) => {
        const sentCount = item.email_sent_count ?? (item.email_sent ? 1 : 0);
        
        if (!checkRole('Master')) {
            if (sentCount >= 2) {
                toast.warning('Este certificado já foi enviado por e-mail 2 vezes. Não é permitido enviar mais.');
                return;
            }
            if (creditsTotal !== null && creditsTotal === 0 && sentCount >= 1) {
                return;
            }
        }

        if (!item.email_sent) {
            api.get(`/documents/${item.id}/check-email`)
                .then(res => {
                    const serverSentCount = res.data.email_sent_count ?? (res.data.email_sent ? 1 : 0);
                    if (res.data.email_sent) {
                        setItems(prevItems => prevItems.map(p => {
                            if (p.id === item.id) {
                                return { ...p, email_sent: true, email_sent_count: serverSentCount };
                            }
                            return p;
                        }));

                        if (!checkRole('Master')) {
                            if (serverSentCount >= 2) {
                                toast.warning('Este certificado já foi enviado por e-mail 2 vezes. Não é permitido enviar mais.');
                                return;
                            }
                            if (creditsTotal !== null && creditsTotal === 0 && serverSentCount >= 1) {
                                return;
                            }
                        }

                        toast.info('Este certificado já consta como enviado!');

                        setDocumentToSend({ ...item, email_sent: true, email_sent_count: serverSentCount });
                        setEmailFormData({
                            email: item.employee_email || '',
                            send_certificate: true,
                            send_presence_list: false,
                            send_authorization: !!item.have_authorization
                        });
                        setShowEmailModal(true);
                    } else {
                        setDocumentToSend(item);
                        setEmailFormData({
                            email: item.employee_email || '',
                            send_certificate: true,
                            send_presence_list: false,
                            send_authorization: !!item.have_authorization
                        });
                        setShowEmailModal(true);
                    }
                })
                .catch(() => {
                    setDocumentToSend(item);
                    setEmailFormData({
                        email: item.employee_email || '',
                        send_certificate: true,
                        send_presence_list: false,
                        send_authorization: !!item.have_authorization
                    });
                    setShowEmailModal(true);
                });
        } else {
            setDocumentToSend(item);
            setEmailFormData({
                email: item.employee_email || '',
                send_certificate: true,
                send_presence_list: false,
                send_authorization: !!item.have_authorization
            });
            setShowEmailModal(true);
        }
    };

    const handleCloseEmailModal = () => {
        setShowEmailModal(false); setDocumentToSend(null);
        setEmailFormData({ email: '', send_certificate: true, send_presence_list: false, send_authorization: false });
    };

    const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setEmailFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingEmail(true);

        api.post('/documents/send-email', {
            document_id: documentToSend.id,
            email: emailFormData.email,
            send_certificate: emailFormData.send_certificate,
            send_presence_list: emailFormData.send_presence_list,
            send_authorization: emailFormData.send_authorization
        })
            .then(() => {
                toast.success('O e-mail foi enviado!', {
                    position: 'bottom-right',
                    autoClose: 3000
                });

                // Atualiza na listagem também este botão para ficar verde como e-mail enviado
                setItems(prevItems => prevItems.map(item => {
                    if (item.id === documentToSend.id) {
                        return { 
                            ...item, 
                            email_sent: true,
                            email_sent_count: (item.email_sent_count ?? (item.email_sent ? 1 : 0)) + 1
                        };
                    }
                    return item;
                }));

                window.dispatchEvent(new Event('credits-updated'));

                handleCloseEmailModal();
            })
            .catch(() => toast.error('Ocorreu um erro ao enviar o e-mail. Por favor, tente novamente.'))
            .finally(() => setIsSendingEmail(false));
    };

    const handleSendBulkEmails = () => {
        const studentsWithoutEmail = items.filter(item => !item.employee_email || item.employee_email.trim() === '');
        const studentsAlreadySent = items.filter(item => item.email_sent);

        const needsModal = studentsWithoutEmail.length > 0 || studentsAlreadySent.length > 0;

        Swal.fire({
            title: 'Enviar Certificados?',
            text: needsModal
                ? `Alguns alunos estão sem e-mail ou já receberam o certificado. Deseja prosseguir para gerenciar e enviar para os demais?`
                : 'Deseja enviar os certificados gerados por e-mail para todos os alunos desta lista de presença?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, prosseguir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            borderRadius: '12px'
        }).then((result) => {
            if (result.isConfirmed) {
                if (needsModal) {
                    const allStudents = [...items].sort((a, b) => {
                        const aHasEmail = !!(a.employee_email && a.employee_email.trim() !== '');
                        const bHasEmail = !!(b.employee_email && b.employee_email.trim() !== '');
                        if (!aHasEmail && bHasEmail) return -1;
                        if (aHasEmail && !bHasEmail) return 1;

                        // Sent emails go to the bottom of the list
                        if (a.email_sent && !b.email_sent) return 1;
                        if (!a.email_sent && b.email_sent) return -1;

                        return 0;
                    });

                    const initialData: { [key: number]: string } = {};
                    allStudents.forEach(student => {
                        if (student.employee_id) {
                            initialData[student.employee_id] = student.employee_email || '';
                        }
                    });
                    setMissingEmailsData(initialData);
                    setMissingEmailsList(allStudents);
                    setShowMissingEmailsModal(true);
                } else {
                    triggerSendBulkEmails();
                }
            }
        });
    };

    const triggerSendBulkEmails = () => {
        setIsSendingBulkEmails(true);
        api.post('/documents/send-email-batch', {
            presence_list_id: presenceListIdFilter || undefined,
            presence_list_uuid: presenceListUuidFilter || undefined
        })
            .then((res: any) => {
                Swal.fire({
                    title: 'Encaminhado!',
                    text: res.data.message || 'Sua solicitação de envio em lote foi encaminhada.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });

                // Trigger real-time polling in header for the finished e-mail sending notification
                window.dispatchEvent(new CustomEvent('certificate-generation-started'));

                fetchData();
            })
            .catch(() => {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Ocorreu um erro ao processar o envio em lote.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            })
            .finally(() => setIsSendingBulkEmails(false));
    };

    const handleSubmitMissingEmails = async (e: React.FormEvent) => {
        e.preventDefault();

        const updates: { employee_id: number; email: string }[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const student of missingEmailsList) {
            const email = missingEmailsData[student.employee_id]?.trim();
            const originalEmail = student.employee_email || '';

            if (email !== originalEmail) {
                if (email) {
                    if (!emailRegex.test(email)) {
                        toast.error(`O e-mail "${email}" do aluno ${student.employee_name} não é válido.`);
                        return;
                    }
                    updates.push({
                        employee_id: student.employee_id,
                        email: email
                    });
                }
            }
        }

        setIsUpdatingMissingEmails(true);
        try {
            if (updates.length > 0) {
                await api.post('/employees/update-emails', { updates });

                setItems(prevItems => prevItems.map(item => {
                    const update = updates.find(u => u.employee_id === item.employee_id);
                    if (update) {
                        return { ...item, employee_email: update.email };
                    }
                    return item;
                }));

                toast.success('E-mails atualizados com sucesso!');
            }

            setShowMissingEmailsModal(false);
            triggerSendBulkEmails();
        } catch (error) {
            toast.error('Erro ao atualizar os e-mails no servidor. Verifique e tente novamente.');
        } finally {
            setIsUpdatingMissingEmails(false);
        }
    };

    const DocBtn = ({ onClick, disabled, loading, title, className, children }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`doc-btn ${className || ''}`}
        >
            {loading && <span className="spinner-border spinner-border-sm" role="status" style={{ width: '0.75rem', height: '0.75rem' }}></span>}
            {children}
        </button>
    );

    const canCreate = checkRole('Entity') && hasPermission('Cadastrar');
    const canDelete = checkRole('Entity') && hasPermission('Excluir');

    return (
        <Fragment>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root, [data-theme-mode="light"] {
                    --premium-bg-card: #ffffff;
                    --premium-bg-header: #f8fafc;
                    --premium-border: #e2e8f0;
                    --premium-border-light: #f1f5f9;
                    --premium-text-title: #0f172a;
                    --premium-text-subtitle: #64748b;
                    --premium-text-primary: #1e293b;
                    --premium-text-secondary: #475569;
                    --premium-input-bg: #ffffff;
                    --premium-input-border: #cbd5e1;
                    --premium-table-header-bg: #f8fafc;
                    --premium-table-hover: #f1f5f9;
                    --premium-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                [data-theme-mode="dark"] {
                    --premium-bg-card: #111317;
                    --premium-bg-header: #171923;
                    --premium-border: rgba(255,255,255,0.08);
                    --premium-border-light: rgba(255,255,255,0.04);
                    --premium-text-title: #f8fafc;
                    --premium-text-subtitle: #64748b;
                    --premium-text-primary: #e2e8f0;
                    --premium-text-secondary: #cbd5e1;
                    --premium-input-bg: #1a1b23;
                    --premium-input-border: rgba(255,255,255,0.08);
                    --premium-table-header-bg: rgba(255,255,255,0.02);
                    --premium-table-hover: rgba(255,255,255,0.025);
                    --premium-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .premium-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .premium-page-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--premium-text-title);
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .premium-page-subtitle {
                    font-size: 14px;
                    color: var(--premium-text-subtitle);
                    margin: 4px 0 0;
                }
                .premium-card {
                    background: var(--premium-bg-card);
                    border: 1px solid var(--premium-border);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: var(--premium-shadow);
                    margin-bottom: 24px;
                }
                .premium-card-header {
                    padding: 20px 28px;
                    border-bottom: 1px solid var(--premium-border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    background: var(--premium-bg-header);
                    flex-wrap: wrap;
                }
                .premium-card-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--premium-text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .premium-search-wrapper {
                    position: relative;
                    flex: 1;
                    max-width: 360px;
                    min-width: 200px;
                }
                .premium-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--premium-text-subtitle);
                    font-size: 16px;
                    pointer-events: none;
                }
                .premium-search-input, .premium-select-input {
                    width: 100%;
                    padding: 11px 16px 11px 42px;
                    background: var(--premium-input-bg);
                    border: 1px solid var(--premium-input-border);
                    border-radius: 10px;
                    color: var(--premium-text-title);
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .premium-search-input {
                    padding-right: 40px !important;
                }
                .premium-clear-icon {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--premium-text-subtitle);
                    font-size: 20px;
                    cursor: pointer;
                    transition: color 0.15s ease;
                    z-index: 5;
                }
                .premium-clear-icon:hover {
                    color: #ef4444 !important;
                }
                .premium-select-input {
                    padding-left: 16px;
                }
                .premium-search-input::placeholder { color: var(--premium-text-subtitle); }
                .premium-search-input:focus, .premium-select-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                }
                .premium-btn-create {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #1d4ed8, #1e40af);
                    color: #fff;
                    border: none;
                    padding: 11px 22px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: none;
                    box-shadow: 0 6px 16px rgba(30,64,175,0.3);
                    transition: all 0.3s;
                    white-space: nowrap;
                }
                .premium-btn-create:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 22px rgba(30,64,175,0.45);
                    color: #fff;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                }
                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .premium-table thead tr {
                    background: var(--premium-table-header-bg);
                    border-bottom: 1px solid var(--premium-border-light);
                }
                .premium-table thead th {
                    padding: 14px 20px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--premium-text-subtitle);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }
                .premium-table tbody tr {
                    border-bottom: 1px solid var(--premium-border-light);
                    transition: background 0.2s;
                }
                .premium-table tbody tr:hover {
                    background: var(--premium-table-hover);
                }
                .premium-table tbody tr:last-child { border-bottom: none; }
                .premium-table tbody td {
                    padding: 16px 20px;
                    font-size: 14px;
                    color: var(--premium-text-secondary);
                    vertical-align: middle;
                }
                .premium-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 800;
                    color: #fff;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                .premium-name-cell {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .premium-name-text {
                    font-weight: 600;
                    color: var(--premium-text-primary);
                    font-size: 14px;
                }
                .premium-clickable-student {
                    cursor: pointer !important;
                    transition: color 0.15s ease, text-decoration 0.15s ease;
                }
                .premium-clickable-student:hover {
                    color: #3b82f6 !important;
                    text-decoration: underline !important;
                }
                .premium-clickable-course {
                    cursor: pointer !important;
                    transition: color 0.15s ease, text-decoration 0.15s ease;
                    text-decoration: none !important;
                }
                .premium-clickable-course:hover {
                    color: #3b82f6 !important;
                    text-decoration: underline !important;
                }
                .premium-btn-clear-outline {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 10px;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    background: transparent;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .premium-btn-clear-outline:hover {
                    background: #ef4444 !important;
                    color: #fff !important;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
                }
                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    background: rgba(59,130,246,0.1);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.2);
                    white-space: nowrap;
                }
                .premium-badge-empty {
                    background: rgba(100,116,139,0.1);
                    color: var(--premium-text-subtitle);
                    border-color: rgba(100,116,139,0.15);
                }
                .premium-action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.25s;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .premium-action-btn i, .premium-action-btn svg,
                .doc-btn i, .doc-btn svg,
                .premium-badge i, .premium-badge svg,
                .premium-btn-clear-outline i, .premium-btn-clear-outline svg {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    vertical-align: middle !important;
                    line-height: 1 !important;
                    height: 1em !important;
                    width: 1em !important;
                    flex-shrink: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: relative !important;
                    top: 1px !important;
                }
                .premium-action-btn-view {
                    background: rgba(14,165,233,0.08);
                    color: #0284c7;
                    border-color: rgba(14,165,233,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-view {
                    color: #38bdf8;
                }
                .premium-action-btn-view:hover {
                    background: rgba(14,165,233,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn-edit {
                    background: rgba(26,86,219,0.08);
                    color: #2563eb;
                    border-color: rgba(26,86,219,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-edit {
                    color: #60a5fa;
                }
                .premium-action-btn-edit:hover {
                    background: rgba(26,86,219,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn-success {
                    background: rgba(16,185,129,0.08);
                    color: #10b981;
                    border-color: rgba(16,185,129,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-success {
                    color: #34d399;
                }
                .premium-action-btn-success:hover {
                    background: rgba(16,185,129,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn-delete {
                    background: rgba(239,68,68,0.08);
                    color: #dc2626;
                    border-color: rgba(239,68,68,0.2);
                }
                [data-theme-mode="dark"] .premium-action-btn-delete {
                    color: #f87171;
                }
                .premium-action-btn-delete:hover {
                    background: rgba(239,68,68,0.16);
                    transform: translateY(-1px);
                }
                .premium-action-btn:disabled, .premium-action-btn-delete:disabled {
                    opacity: 0.4 !important;
                    background: rgba(100, 116, 139, 0.08) !important;
                    color: #94a3b8 !important;
                    border-color: rgba(100, 116, 139, 0.15) !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                }
                [data-theme-mode="dark"] .premium-action-btn:disabled, [data-theme-mode="dark"] .premium-action-btn-delete:disabled {
                    background: rgba(255, 255, 255, 0.04) !important;
                    color: rgba(255, 255, 255, 0.25) !important;
                    border-color: rgba(255, 255, 255, 0.04) !important;
                }
                .premium-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    color: var(--premium-text-subtitle);
                    text-align: center;
                }
                .premium-empty-icon {
                    font-size: 52px;
                    margin-bottom: 16px;
                    opacity: 0.3;
                }
                .premium-empty-text {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--premium-text-subtitle);
                    margin-bottom: 6px;
                }
                .premium-empty-sub {
                    font-size: 13px;
                    color: var(--premium-text-secondary);
                }
                .premium-pagination-row {
                    padding: 16px 24px;
                    border-top: 1px solid var(--premium-border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--premium-bg-header);
                }
                .premium-pagination-info {
                    font-size: 13px;
                    color: var(--premium-text-subtitle);
                }
                /* Mobile card */
                .premium-mobile-card {
                    margin: 0;
                    padding: 0;
                    border-bottom: 1px solid var(--premium-border-light);
                }
                .premium-mobile-card:last-child { border-bottom: none; }
                .premium-mobile-inner {
                    padding: 18px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    transition: background 0.2s;
                }
                .premium-mobile-inner:hover { background: var(--premium-table-hover); }

                /* Scoped Document Listing buttons overrides to make them more evident */
                .doc-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.25s;
                    text-decoration: none;
                    white-space: nowrap;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                .doc-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                /* doc-btn-print styling (Indigo/Purple) */
                .doc-btn-print {
                    background: rgba(99, 102, 241, 0.08);
                    border-color: rgba(99, 102, 241, 0.2);
                    color: #4f46e5;
                }
                [data-theme-mode="dark"] .doc-btn-print {
                    background: rgba(129, 140, 248, 0.15);
                    border-color: rgba(129, 140, 248, 0.2);
                    color: #818cf8;
                }
                .doc-btn-print:hover:not(:disabled) {
                    background: rgba(99, 102, 241, 0.16);
                    color: #4f46e5;
                    transform: translateY(-1px);
                }
                [data-theme-mode="dark"] .doc-btn-print:hover:not(:disabled) {
                    background: rgba(129, 140, 248, 0.25);
                    color: #818cf8;
                }

                /* doc-btn-download styling (Teal) */
                .doc-btn-download {
                    background: rgba(13, 148, 136, 0.08);
                    border-color: rgba(13, 148, 136, 0.2);
                    color: #0d9488;
                }
                [data-theme-mode="dark"] .doc-btn-download {
                    background: rgba(45, 212, 191, 0.15);
                    border-color: rgba(45, 212, 191, 0.2);
                    color: #2dd4bf;
                }
                .doc-btn-download:hover:not(:disabled) {
                    background: rgba(13, 148, 136, 0.16);
                    color: #0d9488;
                    transform: translateY(-1px);
                }
                [data-theme-mode="dark"] .doc-btn-download:hover:not(:disabled) {
                    background: rgba(45, 212, 191, 0.25);
                    color: #2dd4bf;
                }

                /* doc-btn-presence styling (Fuchsia/Pink) */
                .doc-btn-presence {
                    background: rgba(217, 70, 239, 0.08);
                    border-color: rgba(217, 70, 239, 0.2);
                    color: #d946ef;
                }
                [data-theme-mode="dark"] .doc-btn-presence {
                    background: rgba(244, 114, 182, 0.15);
                    border-color: rgba(244, 114, 182, 0.2);
                    color: #f472b6;
                }
                .doc-btn-presence:hover:not(:disabled) {
                    background: rgba(217, 70, 239, 0.16);
                    color: #d946ef;
                    transform: translateY(-1px);
                }
                [data-theme-mode="dark"] .doc-btn-presence:hover:not(:disabled) {
                    background: rgba(244, 114, 182, 0.25);
                    color: #f472b6;
                }

                /* doc-btn-authorization styling (Orange) */
                .doc-btn-authorization {
                    background: rgba(249, 115, 22, 0.08);
                    border-color: rgba(249, 115, 22, 0.2);
                    color: #ea580c;
                }
                [data-theme-mode="dark"] .doc-btn-authorization {
                    background: rgba(251, 146, 60, 0.15);
                    border-color: rgba(251, 146, 60, 0.2);
                    color: #fb923c;
                }
                .doc-btn-authorization:hover:not(:disabled) {
                    background: rgba(249, 115, 22, 0.16);
                    color: #ea580c;
                    transform: translateY(-1px);
                }
                [data-theme-mode="dark"] .doc-btn-authorization:hover:not(:disabled) {
                    background: rgba(251, 146, 60, 0.25);
                    color: #fb923c;
                }
            `}} />

            {/* Page header */}
            <div className="premium-page-header">
                <div>
                    <h1 className="premium-page-title">Meus Certificados</h1>
                    <p className="premium-page-subtitle">Visualize, baixe e gerencie os certificados emitidos</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <If condition={checkRole('Master')}>
                        <button
                            onClick={() => {
                                setOnlyDeletedFilter(prev => !prev);
                                setCurrentPage(1);
                            }}
                            className="btn d-inline-flex align-items-center gap-2"
                            style={{
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '14px',
                                background: onlyDeletedFilter ? '#ef4444' : '#f3f4f6',
                                color: onlyDeletedFilter ? '#ffffff' : '#374151',
                                border: 'none',
                                padding: '10px 16px',
                                boxShadow: onlyDeletedFilter ? '0 4px 10px rgba(239, 68, 68, 0.2)' : 'none',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={e => {
                                if (!onlyDeletedFilter) {
                                    e.currentTarget.style.background = '#e5e7eb';
                                } else {
                                    e.currentTarget.style.background = '#dc2626';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!onlyDeletedFilter) {
                                    e.currentTarget.style.background = '#f3f4f6';
                                } else {
                                    e.currentTarget.style.background = '#ef4444';
                                }
                            }}
                        >
                            <i className={`bi bi-trash3${onlyDeletedFilter ? '-fill' : ''}`} style={{ fontSize: '16px' }}></i>
                            {onlyDeletedFilter ? 'Ver Todos os Certificados' : 'Lixeira'}
                        </button>
                    </If>
                    <If condition={(presenceListUuidFilter || presenceListIdFilter) && items.length > 0}>
                        <button
                            onClick={handleSendBulkEmails}
                            disabled={isSendingBulkEmails}
                            className="btn btn-success d-inline-flex align-items-center gap-2"
                            style={{
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '14px',
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 16px',
                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {isSendingBulkEmails ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                                <i className="bi bi-envelope-paper-fill" style={{ fontSize: '16px' }}></i>
                            )}
                            Enviar Certificados por E-mail
                        </button>
                    </If>
                    <If condition={canCreate}>
                        <Link to="create" className="premium-btn-create">
                            <i className="bx bxs-award"></i>
                            <span>Emitir certificados</span>
                        </Link>
                    </If>
                </div>
            </div>

            {/* Table */}
            <div className="premium-card">
                <div className="premium-card-header" style={{ padding: '16px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                        <span className="premium-card-title">
                            <i className="bx bxs-award" style={{ fontSize: '18px' }}></i>
                            Lista de Certificados
                        </span>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', flex: 1, maxWidth: '800px' }}>
                            <div className="premium-search-wrapper" style={{ maxWidth: '350px', width: '100%' }}>
                                <i className="bx bx-search premium-search-icon"></i>
                                <input
                                    type="text"
                                    className="premium-search-input"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    placeholder="Buscar por aluno ou CPF..."
                                />
                                {search && (
                                    <i
                                        className="bx bx-x premium-clear-icon"
                                        onClick={() => { setSearch(''); setCurrentPage(1); }}
                                        title="Limpar busca"
                                    ></i>
                                )}
                            </div>

                            {hasAnyActiveFilter && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setCourseIds([]);
                                        setCompanyIds([]);
                                        setValidade('');
                                        setDateStart('');
                                        setDateEnd('');
                                        setEventIdFilter('');
                                        setPresenceListIdFilter('');
                                        setPresenceListUuidFilter('');
                                        setOnlyDeletedFilter(false);
                                        setCurrentPage(1);
                                    }}
                                    className="premium-btn-clear-outline"
                                    title="Limpar todos os filtros ativos e voltar para a lista completa"
                                >
                                    <i className="bx bx-trash-alt"></i>
                                    <span>Limpar Filtros</span>
                                </button>
                            )}

                            <button
                                onClick={() => setOpenFilters(v => !v)}
                                className="premium-btn-action"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    height: '40px',
                                    padding: '0 16px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--premium-border)',
                                    background: openFilters ? 'var(--premium-table-hover)' : 'transparent',
                                    color: 'var(--premium-text-primary)',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="bx bx-filter-alt"></i>
                                <span>Filtros</span>
                                <i className={`bx bx-chevron-${openFilters ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {openFilters && (
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--premium-border-light)', background: 'rgba(0, 0, 0, 0.01)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ position: 'relative', zIndex: 59 }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--premium-text-secondary)', marginBottom: '6px', display: 'block' }}>Curso</label>
                                <Select
                                    isMulti
                                    options={courseOptions}
                                    value={courseIds}
                                    onChange={val => { setCourseIds(val as Option[]); setCurrentPage(1); }}
                                    styles={{
                                        control: (base: any) => ({ ...base, background: 'var(--premium-input-bg)', borderColor: 'var(--premium-input-border)', minHeight: '42px', borderRadius: '10px' }),
                                        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                                        multiValue: (base: any) => ({ ...base, background: 'var(--premium-table-hover)', color: 'var(--premium-text-primary)' }),
                                        multiValueLabel: (base: any) => ({ ...base, color: 'var(--premium-text-primary)' }),
                                        menu: (base: any) => ({ ...base, background: 'var(--premium-bg-card)', color: 'var(--premium-text-title)' }),
                                        option: (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? 'var(--premium-table-hover)' : 'transparent', color: 'var(--premium-text-title)' })
                                    }}
                                    menuPortalTarget={document.body}
                                    placeholder="Todos"
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--premium-text-secondary)', marginBottom: '6px', display: 'block' }}>Validade</label>
                                <select className="premium-select-input" value={validade} onChange={e => { setValidade(e.target.value); setCurrentPage(1); }} style={{ height: '42px' }}>
                                    <option value="">Todos</option>
                                    <option value="valid">Em dias</option>
                                    <option value="expired">Vencidos</option>
                                </select>
                            </div>

                            <If condition={showColumnCompany()}>
                                <div style={{ position: 'relative', zIndex: 58 }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--premium-text-secondary)', marginBottom: '6px', display: 'block' }}>Empresa</label>
                                    <Select
                                        isMulti
                                        options={companyOptions}
                                        value={companyIds}
                                        onChange={val => { setCompanyIds(val as Option[]); setCurrentPage(1); }}
                                        styles={{
                                            control: (base: any) => ({ ...base, background: 'var(--premium-input-bg)', borderColor: 'var(--premium-input-border)', minHeight: '42px', borderRadius: '10px' }),
                                            menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                                            multiValue: (base: any) => ({ ...base, background: 'var(--premium-table-hover)', color: 'var(--premium-text-primary)' }),
                                            multiValueLabel: (base: any) => ({ ...base, color: 'var(--premium-text-primary)' }),
                                            menu: (base: any) => ({ ...base, background: 'var(--premium-bg-card)', color: 'var(--premium-text-title)' }),
                                            option: (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? 'var(--premium-table-hover)' : 'transparent', color: 'var(--premium-text-title)' })
                                        }}
                                        menuPortalTarget={document.body}
                                        placeholder="Todas"
                                    />
                                </div>
                            </If>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--premium-text-secondary)', marginBottom: '6px', display: 'block' }}>Válido a partir de</label>
                                <input type="date" className="premium-search-input" value={dateStart} onChange={e => { setDateStart(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: '16px', height: '42px', colorScheme: document.documentElement.getAttribute('data-theme-mode') === 'dark' ? 'dark' : 'light' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--premium-text-secondary)', marginBottom: '6px', display: 'block' }}>Válido até</label>
                                <input type="date" className="premium-search-input" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: '16px', height: '42px', colorScheme: document.documentElement.getAttribute('data-theme-mode') === 'dark' ? 'dark' : 'light' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Certificado</th>
                                <If condition={showColumnCompany()}><th>Empresa</th></If>
                                <th>Visualizar</th>
                                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="premium-empty-state">
                                            <i className="bx bxs-award premium-empty-icon"></i>
                                            <p className="premium-empty-text">Nenhum certificado encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.map((item: any) => (
                                <tr key={item.id}>
                                    <td><span style={{ color: 'var(--premium-text-subtitle)', fontSize: '12px', fontWeight: 600 }}>#{item.id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0' }}>
                                            <span
                                                onClick={() => {
                                                    if (item.employee_name) {
                                                        setSearch(item.employee_name);
                                                        setCurrentPage(1);
                                                    }
                                                }}
                                                className="premium-name-text premium-clickable-student"
                                                style={{ fontSize: '15px', fontWeight: 700 }}
                                                title={`Filtrar certificados de ${item.employee_name}`}
                                            >
                                                {item.employee_name || '—'}
                                            </span>
                                            {item.course_id ? (
                                                <Link
                                                    to={`/courses/edit/${item.course_id}`}
                                                    className="premium-clickable-course"
                                                    style={{ fontSize: '13px', color: 'var(--premium-text-secondary)', fontWeight: 500 }}
                                                    title={`Editar curso: ${item.course}`}
                                                >
                                                    {item.course || '—'}
                                                </Link>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: 'var(--premium-text-secondary)', fontWeight: 500 }}>{item.course || '—'}</span>
                                            )}
                                            <div style={{ marginTop: '4px' }}>
                                                {item?.date_init_validate && item?.date_end_validate ? (
                                                    <span className="premium-badge" style={{ fontSize: '11px', padding: '3px 8px' }}>
                                                        <i className="bx bx-calendar" style={{ marginRight: '4px' }}></i>
                                                        {formatDate(item.date_init_validate, 'd/m/Y')} — {formatDate(item.date_end_validate, 'd/m/Y')}
                                                    </span>
                                                ) : <span className="premium-badge premium-badge-empty" style={{ fontSize: '11px', padding: '3px 8px' }}>N/I</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <If condition={showColumnCompany()}>
                                        <td style={{ color: 'var(--premium-text-subtitle)', fontSize: '13px' }}>{item.company_name || '—'}</td>
                                    </If>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                                            <DocBtn onClick={() => getDocumentPrint(item.id, 'certificate')} disabled={isAnyDownloading} loading={printId === item.id} title="Imprimir Certificado" className="doc-btn-print">
                                                <MdOutlineLocalPrintshop /> Imprimir
                                            </DocBtn>
                                            <DocBtn onClick={() => getDocumentDownload(item.id, 'certificate')} disabled={isAnyDownloading} loading={isDownloading(item.id, 'certificate')} title="Baixar Certificado" className="doc-btn-download">
                                                <MdOutlineCloudDownload /> Baixar
                                            </DocBtn>
                                            {item.have_presence_list && (
                                                <DocBtn onClick={() => getDocumentDownload(item.id, 'presence_list')} disabled={isAnyDownloading} loading={isDownloading(item.id, 'presence_list')} title="Lista de Presença" className="doc-btn-presence">
                                                    Presença
                                                </DocBtn>
                                            )}
                                            {item.have_authorization && (
                                                <DocBtn onClick={() => getDocumentDownload(item.id, 'authorization')} disabled={isAnyDownloading} loading={isDownloading(item.id, 'authorization')} title="Anuência" className="doc-btn-authorization">
                                                    Anuência
                                                </DocBtn>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                            <Link to={`/documents/${item.id}/view`} className="premium-action-btn premium-action-btn-view" title="Visualizar">
                                                <i className="bx bx-show"></i>
                                                Ver
                                            </Link>
                                            <If condition={canCreate}>
                                                {(() => {
                                                    const sentCount = item.email_sent_count ?? (item.email_sent ? 1 : 0);
                                                    const emailDisabled = !checkRole('Master') && (sentCount >= 2 || (creditsTotal === 0 && sentCount >= 1));
                                                    const emailTooltip = sentCount >= 2 
                                                        ? 'Limite de envio por e-mail atingido (máx. 2 envios)' 
                                                        : (creditsTotal === 0 && sentCount >= 1 
                                                            ? 'E-mail Enviado' 
                                                            : (item.email_sent ? 'E-mail Enviado (Reenviar)' : 'Enviar por E-mail'));
                                                    return (
                                                        <button 
                                                            className={`premium-action-btn ${item.email_sent ? 'premium-action-btn-success' : 'premium-action-btn-edit'}`} 
                                                            onClick={() => handleOpenEmailModal(item)} 
                                                            title={emailTooltip} 
                                                            disabled={isAnyDownloading}
                                                            style={{ 
                                                                opacity: emailDisabled ? 0.55 : 1, 
                                                                cursor: emailDisabled ? 'not-allowed' : 'pointer' 
                                                            }}
                                                        >
                                                            <i className="bx bx-envelope"></i>
                                                            {item.email_sent ? 'Enviado' : 'E-mail'}
                                                        </button>
                                                    );
                                                })()}
                                            </If>
                                            <If condition={canDelete}>
                                                {(() => {
                                                    const deletable = isDeletable(item.created_at);
                                                    return (
                                                        <button
                                                            className="premium-action-btn premium-action-btn-delete"
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={!deletable}
                                                            title={deletable ? "Excluir" : "Não pode ser deletado por ter passado 24h"}
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                            Excluir
                                                        </button>
                                                    );
                                                })()}
                                            </If>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="d-block d-md-none">
                    {items.map((item: any) => (
                        <div key={item.id} className="premium-mobile-card">
                            <div className="premium-mobile-inner" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            onClick={() => {
                                                if (item.employee_name) {
                                                    setSearch(item.employee_name);
                                                    setCurrentPage(1);
                                                }
                                            }}
                                            className="premium-name-text premium-clickable-student"
                                            style={{ fontSize: '15px' }}
                                            title={`Filtrar certificados de ${item.employee_name}`}
                                        >
                                            {item.employee_name || '—'}
                                        </div>
                                        {item.course_id ? (
                                            <Link
                                                to={`/courses/edit/${item.course_id}`}
                                                className="premium-clickable-course"
                                                style={{ display: 'block', color: 'var(--premium-text-subtitle)', marginTop: '4px', fontSize: '13px' }}
                                                title={`Editar curso: ${item.course}`}
                                            >
                                                {item.course || '—'}
                                            </Link>
                                        ) : (
                                            <div style={{ color: 'var(--premium-text-subtitle)', marginTop: '4px', fontSize: '13px' }}>{item.course || '—'}</div>
                                        )}
                                        {item.company_name && <div style={{ color: 'var(--premium-text-subtitle)', marginTop: '2px', fontSize: '12px' }}>{item.company_name}</div>}
                                        <div style={{ color: 'var(--premium-text-subtitle)', margin: '6px 0', fontSize: '12px' }}>
                                            <span style={{ fontWeight: 600 }}>#{item.id}</span>
                                            {item?.date_init_validate && item?.date_end_validate ? ` · ${formatDate(item.date_init_validate, 'd/m/Y')} — ${formatDate(item.date_end_validate, 'd/m/Y')}` : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <Link to={`/documents/${item.id}/view`} className="premium-action-btn premium-action-btn-view" style={{ padding: '8px' }} title="Visualizar"><i className="bx bx-show"></i></Link>
                                        <If condition={canCreate}>
                                            {(() => {
                                                const sentCount = item.email_sent_count ?? (item.email_sent ? 1 : 0);
                                                const emailDisabled = !checkRole('Master') && (sentCount >= 2 || (creditsTotal === 0 && sentCount >= 1));
                                                const emailTooltip = sentCount >= 2 
                                                    ? 'Limite de envio por e-mail atingido (máx. 2 envios)' 
                                                    : (creditsTotal === 0 && sentCount >= 1 
                                                        ? 'E-mail Enviado' 
                                                        : (item.email_sent ? 'E-mail Enviado (Reenviar)' : 'E-mail'));
                                                return (
                                                    <button 
                                                        className={`premium-action-btn ${item.email_sent ? 'premium-action-btn-success' : 'premium-action-btn-edit'}`} 
                                                        style={{ 
                                                            padding: '8px',
                                                            opacity: emailDisabled ? 0.55 : 1, 
                                                            cursor: emailDisabled ? 'not-allowed' : 'pointer' 
                                                        }} 
                                                        onClick={() => handleOpenEmailModal(item)} 
                                                        title={emailTooltip} 
                                                        disabled={isAnyDownloading}
                                                    >
                                                        <i className="bx bx-envelope"></i>
                                                    </button>
                                                );
                                            })()}
                                         </If>
                                        <If condition={canDelete}>
                                            {(() => {
                                                const deletable = isDeletable(item.created_at);
                                                return (
                                                    <button
                                                        className="premium-action-btn premium-action-btn-delete"
                                                        style={{ padding: '8px' }}
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={!deletable}
                                                        title={deletable ? "Excluir" : "Não pode ser deletado por ter passado 24h"}
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                    </button>
                                                );
                                            })()}
                                        </If>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '12px' }}>
                                    <DocBtn onClick={() => getDocumentDownload(item.id, 'certificate')} disabled={isAnyDownloading} loading={isDownloading(item.id, 'certificate')} title="Baixar" className="doc-btn-download">
                                        <MdOutlineCloudDownload /> Baixar
                                    </DocBtn>
                                    {item.have_presence_list && (
                                        <DocBtn onClick={() => getDocumentDownload(item.id, 'presence_list')} disabled={isAnyDownloading} loading={isDownloading(item.id, 'presence_list')} title="Presença" className="doc-btn-presence">
                                            Presença
                                        </DocBtn>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="premium-pagination-row">
                        <span className="premium-pagination-info">Página {currentPage} de {totalPages}</span>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination totalPages={totalPages} handlePageChange={p => setCurrentPage(p)} currentPage={currentPage} />
                        </nav>
                    </div>
                )}
            </div>

            {/* Email Modal */}
            <Modal show={showEmailModal} onHide={handleCloseEmailModal} centered>
                <Form onSubmit={handleSendEmail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enviar Certificado por E-mail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>E-mail do Aluno</Form.Label>
                            <Form.Control type="email" name="email" value={emailFormData.email} onChange={handleEmailFormChange} placeholder="nome@exemplo.com" required style={{ borderRadius: '8px' }} />
                        </Form.Group>
                        <Form.Group className="mb-3 d-none">
                            <Form.Label>Documentos para Enviar</Form.Label>
                            <Form.Check type="checkbox" id="send_certificate" name="send_certificate" label="Certificado" checked={emailFormData.send_certificate} onChange={handleEmailFormChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEmailModal} disabled={isSendingEmail}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={isSendingEmail || !emailFormData.email || (!emailFormData.send_certificate && !emailFormData.send_presence_list && !emailFormData.send_authorization)}>
                            {isSendingEmail ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Enviando...
                                </>
                            ) : 'Enviar E-mail'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Missing Emails Modal */}
            <Modal show={showMissingEmailsModal} onHide={() => setShowMissingEmailsModal(false)} centered size="lg">
                <Form onSubmit={handleSubmitMissingEmails}>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <Modal.Title style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="bi bi-envelope-exclamation-fill text-warning" style={{ fontSize: '24px' }}></i>
                            Gerenciar E-mails dos Alunos
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '1.5rem' }}>
                        <div className="alert alert-warning mb-4" style={{ borderRadius: '10px', background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309' }}>
                            <div className="d-flex gap-2">
                                <i className="bi bi-info-circle-fill text-warning" style={{ fontSize: '18px', flexShrink: 0 }}></i>
                                <p className="m-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    Os alunos **sem e-mail cadastrado** estão destacados no topo. Você pode preencher os e-mails (não obrigatório). Alunos marcados como **E-mail Enviado** já receberam e serão ignorados no envio em lote para evitar duplicidade.
                                </p>
                            </div>
                        </div>

                        <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                            {missingEmailsList.map((student, index) => {
                                const hasOriginalEmail = !!(student.employee_email && student.employee_email.trim() !== '');
                                const isAlreadySent = student.email_sent;

                                let borderLeftColor = '#f59e0b'; // Sem E-mail (Yellow)
                                if (isAlreadySent) {
                                    borderLeftColor = '#3b82f6'; // E-mail Enviado (Blue)
                                } else if (hasOriginalEmail) {
                                    borderLeftColor = '#10b981'; // Pronto para Enviar (Green)
                                }

                                return (
                                    <div
                                        key={student.employee_id || index}
                                        className="mb-3 p-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
                                        style={{
                                            background: '#f8fafc',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            borderLeft: `4px solid ${borderLeftColor}`,
                                            opacity: isAlreadySent ? 0.8 : 1
                                        }}
                                    >
                                        <div style={{ flex: '1 1 200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                <h6 className="m-0" style={{ fontWeight: 600, color: '#334155' }}>{student.employee_name}</h6>
                                                {isAlreadySent ? (
                                                    <span className="badge bg-primary text-white" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>E-mail Enviado</span>
                                                ) : hasOriginalEmail ? (
                                                    <span className="badge bg-success text-white" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Pronto para Enviar</span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Sem E-mail</span>
                                                )}
                                            </div>
                                            <small className="text-muted d-block">CPF: {student.employee_cpf || '—'}</small>
                                            {isAlreadySent && (
                                                <small className="text-primary fw-medium" style={{ fontSize: '11px' }}>
                                                    <i className="bi bi-info-circle me-1"></i> Já enviado
                                                </small>
                                            )}
                                        </div>
                                        <div style={{ flex: '1 1 300px' }}>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder={isAlreadySent ? "já enviado para o aluno..." : hasOriginalEmail ? "atualizar e-mail do aluno..." : "digite o e-mail do aluno..."}
                                                value={missingEmailsData[student.employee_id] || ''}
                                                onChange={e => setMissingEmailsData({ ...missingEmailsData, [student.employee_id]: e.target.value })}
                                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                                                disabled={isAlreadySent}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="outline-secondary" style={{ borderRadius: '8px', fontWeight: 600 }} onClick={() => setShowMissingEmailsModal(false)} disabled={isUpdatingMissingEmails}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="success" style={{ borderRadius: '8px', fontWeight: 700, padding: '8px 20px', background: '#10b981', border: 'none' }} disabled={isUpdatingMissingEmails}>
                            {isUpdatingMissingEmails ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send-fill me-2"></i>
                                    Enviar E-mail com Certificados
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <ToastContainer />
        </Fragment>
    );
};

export default Documents;
