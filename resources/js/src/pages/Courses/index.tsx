import { FC, Fragment, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { FiAward, FiArrowRight } from 'react-icons/fi';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import { formatDate } from '@/src/lib/helper';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Select2 from '@/src/components/common/select2';

interface CoursesProps { }

interface Course {
    id: number;
    name: string;
    number_of_hours_studied: string;
    created_at: string;
    entity?: {
        id: number;
        name: string;
    };
    course_files?: Array<{
        id: number;
        name: string;
        path: string;
        url: string;
    }>;
}

const AVATAR_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#0ea5e9', '#f59e0b', '#ef4444',
];

function getAvatarColor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

const Courses: FC<CoursesProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Course[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [getCourses, setGetCourses] = useState(true);
    const { checkRole, hasPermission } = useContext(AppContext);
    const [firstTimeInPage, setFirstTimeInPage] = useState(true);
    const navigate = useNavigate();

    const [creditsBalance, setCreditsBalance] = useState<{ total: number } | null>(null);
    const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

    useEffect(() => {
        api.get('/credits/balance')
            .then(res => setCreditsBalance(res.data))
            .catch(err => console.error("Error fetching credit balance in Courses index:", err));
    }, []);

    const [entities, setEntities] = useState<{ id: number; name: string }[]>([]);
    const [selectedEntityId, setSelectedEntityId] = useState<string>('');
    const [hasFilesFilter, setHasFilesFilter] = useState<string>('');
    const [onlyDeletedFilter, setOnlyDeletedFilter] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [activePreviewFile, setActivePreviewFile] = useState<{ id: number; name: string; url: string; course_id?: number } | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

    useEffect(() => {
        if (checkRole('Master')) {
            api.get('/entities', { params: { all: 1 } }).then((response) => {
                setEntities(response.data || []);
            });
        }
    }, [checkRole]);

    useEffect(() => {
        const params: { page: number; name?: string; entity_id?: string; has_files?: string; only_deleted?: number } = { page: currentPage };
        if (name.length) params.name = name;
        if (selectedEntityId) params.entity_id = selectedEntityId;
        if (hasFilesFilter) params.has_files = hasFilesFilter;
        if (onlyDeletedFilter) params.only_deleted = 1;

        api.get('/courses', { params }).then((response) => {
            const { data, current_page, last_page, total } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
            setTotalItems(total ?? data.length);
            if (data.length === 0 && firstTimeInPage && !checkRole('Master')) {
                navigate('/courses/create');
            }
            setFirstTimeInPage(false);
        });
    }, [currentPage, name, getCourses, selectedEntityId, hasFilesFilter, onlyDeletedFilter]);

    useEffect(() => {
        let activeUrl: string | null = null;

        if (isPreviewModalOpen && activePreviewFile) {
            const courseId = activePreviewFile.course_id || selectedCourse?.id;
            if (!courseId || !activePreviewFile.id) {
                setPreviewError('Erro ao identificar o arquivo para visualização.');
                return;
            }

            setLoadingPreview(true);
            setPreviewError(null);

            // Limpar URL anterior
            if (previewBlobUrl) {
                window.URL.revokeObjectURL(previewBlobUrl);
                setPreviewBlobUrl(null);
            }

            api.get(`/courses/${courseId}/files/${activePreviewFile.id}/download`, {
                params: { inline: 1 },
                responseType: 'blob'
            })
                .then((response) => {
                    const isPdf = activePreviewFile.name.toLowerCase().endsWith('.pdf');
                    const blob = response.data instanceof Blob
                        ? response.data
                        : new Blob([response.data], { type: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                    const localUrl = window.URL.createObjectURL(blob);
                    activeUrl = localUrl;
                    setPreviewBlobUrl(localUrl);
                    setLoadingPreview(false);
                })
                .catch((err) => {
                    console.error('Error fetching file for preview', err);
                    setPreviewError('Erro ao carregar o arquivo do servidor. Verifique se o mesmo existe no storage.');
                    setLoadingPreview(false);
                });
        }

        // Cleanup
        return () => {
            if (activeUrl) {
                window.URL.revokeObjectURL(activeUrl);
            }
        };
    }, [isPreviewModalOpen, activePreviewFile]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este curso?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/courses/${id}`)
                    .then(() => {
                        Swal.fire('Excluído!', 'Curso excluído com sucesso.', 'success');
                        setGetCourses((prev) => !prev);
                    })
                    .catch(() => {
                        toast.error('Erro ao excluir curso');
                    });
            }
        });
    };

    const handleOpenFilesModal = (course: Course) => {
        setSelectedCourse(course);
        setIsFilesModalOpen(true);
    };

    const handlePreviewFile = (file: any) => {
        setActivePreviewFile({
            id: file.id,
            name: file.name,
            url: file.url,
            course_id: file.course_id || selectedCourse?.id
        });
        setIsPreviewModalOpen(true);
    };

    const handleDownloadFile = (file: { id: number; name: string; course_id?: number }) => {
        const courseId = file.course_id || selectedCourse?.id;
        if (!courseId || !file.id) {
            toast.error("Erro ao identificar o arquivo para download.");
            return;
        }

        setDownloadingFileId(file.id);

        api.get(`/courses/${courseId}/files/${file.id}/download`, { responseType: 'blob' })
            .then((response) => {
                const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', file.name);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                toast.success("Download concluído com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao baixar o arquivo", error);
                toast.error("Erro ao baixar o arquivo. Verifique se o mesmo existe no servidor.");
            })
            .finally(() => {
                setDownloadingFileId(null);
            });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isPreviewModalOpen) {
                    setIsPreviewModalOpen(false);
                } else if (isFilesModalOpen) {
                    setIsFilesModalOpen(false);
                }
            }
        };

        if (isPreviewModalOpen || isFilesModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPreviewModalOpen, isFilesModalOpen]);

    const canEdit = checkRole('Entity') && hasPermission('Atualizar');
    const canDelete = checkRole('Entity') && hasPermission('Excluir');
    const canCreate = checkRole('Entity') && hasPermission('Cadastrar');
    const canView = (checkRole('Entity') && hasPermission('Atualizar')) || checkRole('Master');
    const hasActions = canEdit || canDelete || canView;

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
                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(59,130,246,0.1);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.2);
                }
                .premium-badge-empty {
                    background: rgba(100,116,139,0.1);
                    color: var(--premium-text-subtitle);
                    border-color: rgba(100,116,139,0.15);
                }
                .premium-action-btn {
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
            `}} />

            {/* Page header */}
            <div className="premium-page-header">
                <div>
                    <h1 className="premium-page-title">Cursos</h1>
                    <p className="premium-page-subtitle">Gerencie os cursos cadastrados na plataforma</p>
                </div>
                <div className="page-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                            {onlyDeletedFilter ? 'Ver Todos os Cursos' : 'Lixeira'}
                        </button>
                    </If>
                    <If condition={canCreate}>
                        <Link 
                            to="create" 
                            className="premium-btn-create"
                            onClick={(e) => {
                                if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                    e.preventDefault();
                                    setShowPaywallModal(true);
                                }
                            }}
                        >
                            <i className="bx bx-plus"></i>
                            <span>Novo Curso</span>
                        </Link>
                    </If>
                </div>
            </div>

            {/* Table card */}
            <div className="premium-card">
                <div className="premium-card-header" style={{ padding: '16px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                        <span className="premium-card-title">
                            <i className="bx bxs-graduation" style={{ fontSize: '18px' }}></i>
                            Lista de Cursos
                            {totalItems > 0 && (
                                <span className="premium-badge" style={{ marginLeft: '8px' }}>{totalItems}</span>
                            )}
                        </span>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', flex: 1, maxWidth: '800px' }}>
                            <div className="premium-search-wrapper" style={{ maxWidth: '300px', width: '100%' }}>
                                <i className="bx bx-search premium-search-icon"></i>
                                <input
                                    type="text"
                                    className="premium-search-input"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setCurrentPage(1); }}
                                    placeholder="Buscar por nome do curso..."
                                />
                            </div>

                            <If condition={checkRole('Master')}>
                                <div style={{ minWidth: '220px', position: 'relative', zIndex: 50 }}>
                                    <Select2
                                        id="option-entity"
                                        label=""
                                        options={[{ value: '', label: 'Todas as Entidades' }, ...entities.map((ent) => ({ value: ent.id.toString(), label: ent.name }))]}
                                        value={selectedEntityId ? { value: selectedEntityId, label: entities.find(e => e.id.toString() === selectedEntityId)?.name || '' } : { value: '', label: 'Todas as Entidades' }}
                                        onChange={(option: any) => {
                                            setSelectedEntityId(option ? option.value : '');
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Pesquisar entidade..."
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), control: (base: any) => ({ ...base, background: 'var(--premium-input-bg)', borderColor: 'var(--premium-input-border)', color: 'var(--premium-text-title)', minHeight: '40px' }), singleValue: (base: any) => ({ ...base, color: 'var(--premium-text-title)' }), menu: (base: any) => ({ ...base, background: 'var(--premium-bg-card)', color: 'var(--premium-text-title)' }), option: (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? 'var(--premium-table-hover)' : 'transparent', color: 'var(--premium-text-title)' }) }}
                                    />
                                </div>

                                <div style={{ minWidth: '180px' }}>
                                    <select
                                        className="premium-select-input"
                                        value={hasFilesFilter}
                                        onChange={(e) => {
                                            setHasFilesFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">Filtrar por arquivos...</option>
                                        <option value="yes">Com arquivos de upload</option>
                                        <option value="no">Sem arquivos de upload</option>
                                    </select>
                                </div>
                            </If>
                        </div>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <If condition={!checkRole('Master')}>
                                    <th style={{ width: '60px' }}>#</th>
                                </If>
                                <th>Nome</th>
                                <If condition={checkRole('Master')}>
                                    <th>Entidade</th>
                                </If>
                                <If condition={!checkRole('Master')}>
                                    <th>Qtd. Horas</th>
                                    <th>Data de Cadastro</th>
                                </If>
                                <If condition={hasActions}>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </If>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={hasActions ? (checkRole('Master') ? 3 : 5) : (checkRole('Master') ? 2 : 4)}>
                                        <div className="premium-empty-state">
                                            <i className="bx bxs-graduation premium-empty-icon"></i>
                                            <p className="premium-empty-text">Nenhum curso encontrado</p>
                                            <p className="premium-empty-sub">Ajuste os filtros ou cadastre um novo curso.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id}>
                                        <If condition={!checkRole('Master')}>
                                            <td style={{ width: '60px' }}>
                                                <span style={{ color: 'var(--premium-text-subtitle)', fontSize: '12px', fontWeight: 600 }}>#{item.id}</span>
                                            </td>
                                        </If>
                                        <td>
                                            <div className="premium-name-cell">
                                                <span
                                                    className="premium-avatar"
                                                    style={{ background: getAvatarColor(item.id) }}
                                                >
                                                    {getInitials(item.name || '?')}
                                                </span>
                                                <span className="premium-name-text">{item.name}</span>
                                            </div>
                                        </td>
                                        <If condition={checkRole('Master')}>
                                            <td>
                                                <span className="premium-badge">
                                                    {item.entity?.name || '—'}
                                                </span>
                                            </td>
                                        </If>
                                        <If condition={!checkRole('Master')}>
                                            <td>
                                                {item.number_of_hours_studied ? (
                                                    <span className="premium-badge">
                                                        {item.number_of_hours_studied}h
                                                    </span>
                                                ) : (
                                                    <span className="premium-badge premium-badge-empty">N/I</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--premium-text-subtitle)', fontSize: '13px' }}>
                                                {formatDate(item.created_at)}
                                            </td>
                                        </If>
                                        <If condition={hasActions}>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {(() => {
                                                        const files = item.course_files || (item as any).courseFiles || [];
                                                        if (checkRole('Master')) {
                                                            if (files.length > 0) {
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        className="premium-action-btn premium-action-btn-view"
                                                                        onClick={() => handleOpenFilesModal(item)}
                                                                        title="Visualizar arquivos de upload do curso"
                                                                    >
                                                                        <i className="bx bxs-folder"></i>
                                                                        Arquivos ({files.length})
                                                                    </button>
                                                                );
                                                            } else {
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        className="premium-action-btn premium-badge-empty"
                                                                        disabled
                                                                        title="Este curso não possui arquivos de upload"
                                                                    >
                                                                        <i className="bx bx-folder"></i>
                                                                        Arquivos (0)
                                                                    </button>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    })()}

                                                    <If condition={canEdit}>
                                                        <Link 
                                                            to={`edit/${item.id}`} 
                                                            className="premium-action-btn premium-action-btn-edit" 
                                                            title="Editar"
                                                            onClick={(e) => {
                                                                if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                                                    e.preventDefault();
                                                                    setShowPaywallModal(true);
                                                                }
                                                            }}
                                                        >
                                                            <i className="bx bx-pencil"></i>
                                                            Editar
                                                        </Link>
                                                    </If>
                                                    <If condition={canDelete}>
                                                        <button
                                                            className="premium-action-btn premium-action-btn-delete"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Excluir"
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                            Excluir
                                                        </button>
                                                    </If>
                                                </div>
                                            </td>
                                        </If>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="d-block d-md-none">
                    {items.map((item) => (
                        <div key={item.id} className="premium-mobile-card">
                            <div className="premium-mobile-inner">
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                    <span
                                        className="premium-avatar"
                                        style={{ background: getAvatarColor(item.id) }}
                                    >
                                        {getInitials(item.name || '?')}
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="premium-name-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name || 'Sem nome'}
                                        </div>
                                        {checkRole('Master') && item.entity?.name && (
                                            <div style={{ fontSize: '12px', color: 'var(--premium-text-subtitle)', marginTop: '2px' }}>
                                                Entidade: {item.entity.name}
                                            </div>
                                        )}
                                        <If condition={!checkRole('Master')}>
                                            <div style={{ fontSize: '12px', color: 'var(--premium-text-subtitle)', marginTop: '2px' }}>
                                                #{item.id} · {formatDate(item.created_at)}
                                            </div>
                                            {item.number_of_hours_studied && (
                                                <span className="premium-badge" style={{ marginTop: '4px', display: 'inline-flex' }}>
                                                    {item.number_of_hours_studied}h
                                                </span>
                                            )}
                                        </If>
                                    </div>
                                </div>

                                <If condition={hasActions}>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        {(() => {
                                            const files = item.course_files || (item as any).courseFiles || [];
                                            if (checkRole('Master')) {
                                                if (files.length > 0) {
                                                    return (
                                                        <button
                                                            type="button"
                                                            className="premium-action-btn premium-action-btn-view"
                                                            style={{ padding: '8px' }}
                                                            onClick={() => handleOpenFilesModal(item)}
                                                        >
                                                            <i className="bx bxs-folder"></i>
                                                        </button>
                                                    );
                                                } else {
                                                    return (
                                                        <button
                                                            type="button"
                                                            className="premium-action-btn premium-badge-empty"
                                                            style={{ padding: '8px', cursor: 'not-allowed' }}
                                                            disabled
                                                        >
                                                            <i className="bx bx-folder"></i>
                                                        </button>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}
                                        <If condition={canView}>
                                            <Link to={`${item.id}/view`} className="premium-action-btn premium-action-btn-view" style={{ padding: '8px' }} title="Visualizar">
                                                <i className="bx bx-show"></i>
                                            </Link>
                                        </If>
                                        <If condition={canEdit}>
                                            <Link 
                                                to={`${item.id}`} 
                                                className="premium-action-btn premium-action-btn-edit" 
                                                style={{ padding: '8px' }} 
                                                title="Editar"
                                                onClick={(e) => {
                                                    if (!checkRole('Master') && creditsBalance !== null && creditsBalance.total === 0) {
                                                        e.preventDefault();
                                                        setShowPaywallModal(true);
                                                    }
                                                }}
                                            >
                                                <i className="bx bx-pencil"></i>
                                            </Link>
                                        </If>
                                        <If condition={canDelete}>
                                            <button
                                                className="premium-action-btn premium-action-btn-delete"
                                                style={{ padding: '8px' }}
                                                onClick={() => handleDelete(item.id)}
                                                title="Excluir"
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        </If>
                                    </div>
                                </If>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="premium-pagination-row">
                        <span className="premium-pagination-info">Página {currentPage} de {totalPages}</span>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination
                                totalPages={totalPages}
                                handlePageChange={handlePageChange}
                                currentPage={currentPage}
                            />
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal de Lista de Arquivos */}
            {isFilesModalOpen && selectedCourse && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
                                <h5 className="modal-title" style={{ fontWeight: 700, color: '#1e293b' }}>
                                    <i className="bi bi-folder-fill text-primary me-2"></i>
                                    Arquivos de Upload - {selectedCourse.name}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsFilesModalOpen(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem' }}>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                                                <th style={{ padding: '0.75rem 1rem', border: 'none', borderRadius: '8px 0 0 8px', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Nome do Arquivo</th>
                                                <th style={{ padding: '0.75rem 1rem', border: 'none', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Tipo</th>
                                                <th style={{ padding: '0.75rem 1rem', border: 'none', borderRadius: '0 8px 8px 0', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const files = selectedCourse.course_files || (selectedCourse as any).courseFiles || [];
                                                if (files.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={3} className="text-center text-muted py-4">Nenhum arquivo de upload encontrado para este curso.</td>
                                                        </tr>
                                                    );
                                                }
                                                return files.map((file: any) => {
                                                    const isPreviewable = /\.pdf$/i.test(file.name);
                                                    const extension = file.name.split('.').pop()?.toUpperCase() || 'ARQUIVO';

                                                    return (
                                                        <tr key={file.id} style={{ background: '#f8fafc' }}>
                                                            <td style={{ padding: '1rem', borderRadius: '8px 0 0 8px', border: 'none', fontWeight: 500, color: '#334155' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <i className={`bi ${extension === 'PDF' ? 'bi-file-pdf-fill text-danger' : 'bi-file-word-fill text-primary'} fs-5`}></i>
                                                                    <span>{file.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1rem', border: 'none', color: '#64748b', fontSize: '0.85rem' }}>
                                                                <span className="badge bg-secondary bg-opacity-10 text-secondary px-2.5 py-1.5" style={{ borderRadius: '6px' }}>{extension}</span>
                                                            </td>
                                                            <td style={{ padding: '1rem', borderRadius: '0 8px 8px 0', border: 'none', textAlign: 'right' }}>
                                                                <div className="d-inline-flex gap-2">
                                                                    {isPreviewable && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                            style={{ borderRadius: '8px', fontWeight: 600 }}
                                                                            onClick={() => handlePreviewFile(file)}
                                                                        >
                                                                            <i className="bi bi-eye-fill"></i> Visualizar
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                                        style={{ borderRadius: '8px', fontWeight: 600 }}
                                                                        onClick={() => handleDownloadFile(file)}
                                                                        disabled={downloadingFileId === file.id}
                                                                        title="Download seguro"
                                                                    >
                                                                        {downloadingFileId === file.id ? (
                                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        ) : (
                                                                            <i className="bi bi-download"></i>
                                                                        )}
                                                                        {downloadingFileId === file.id ? 'Baixando...' : 'Baixar'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ borderRadius: '8px', fontWeight: 600 }} onClick={() => setIsFilesModalOpen(false)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visualização (Preview) */}
            {isPreviewModalOpen && activePreviewFile && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '90%', height: '90%', margin: '1.75rem auto' }}>
                        <div className="modal-content" style={{ borderRadius: '15px', border: 'none', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
                                <h5 className="modal-title" style={{ fontWeight: 700, color: '#1e293b' }}>
                                    <i className="bi bi-file-earmark-text-fill text-primary me-2"></i>
                                    Visualizando: {activePreviewFile.name}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsPreviewModalOpen(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body p-0" style={{ flex: 1, background: '#f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {loadingPreview && (
                                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(241, 245, 249, 0.8)', zIndex: 10, minHeight: '300px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="mt-2 text-muted" style={{ fontWeight: 600 }}>Carregando visualização do arquivo...</p>
                                    </div>
                                )}

                                {previewError && (
                                    <div className="alert alert-danger m-3" role="alert" style={{ zIndex: 11 }}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {previewError}
                                    </div>
                                )}

                                {!loadingPreview && !previewError && activePreviewFile && previewBlobUrl && (
                                    <iframe
                                        src={previewBlobUrl}
                                        style={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
                                        title="Visualização do PDF"
                                    ></iframe>
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    Problemas ao visualizar?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadFile(activePreviewFile)}
                                        disabled={downloadingFileId === activePreviewFile.id}
                                        className="btn btn-link p-0 text-primary"
                                        style={{ fontWeight: 600, textDecoration: 'none', verticalAlign: 'baseline' }}
                                    >
                                        {downloadingFileId === activePreviewFile.id ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Baixando...
                                            </>
                                        ) : (
                                            'Baixe o arquivo diretamente'
                                        )}
                                    </button>
                                </span>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-secondary" style={{ borderRadius: '8px', fontWeight: 600 }} onClick={() => setIsPreviewModalOpen(false)}>Fechar Visualização</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default Courses;
