import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { addMaskCpf, clearMask, firstLetterUppercase, formatDate } from '@/src/lib/helper';
import { Link, useParams } from 'react-router-dom';
import api from '@/src/lib/api';
import Pagination from '@/src/components/common/pagination';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Select from 'react-select';
import ImportModal from '../Companies/components/ImportModal';
import { BiImport } from 'react-icons/bi';

interface EmployesProps { }

interface Company { id: number; name: string; }
interface Employee {
    id: number;
    name: string;
    email: string;
    cpf: string;
    created_at: Date;
    active: boolean;
    company: Company;
}
interface Option { value: number; label: string; }

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];
function getAvatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

const Employees: FC<EmployesProps> = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [items, setItems] = useState<Employee[]>([]);
    const [name, setName] = useState<string>('');
    const [cpf, setCpf] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const companyId = useParams()?.companyId;
    const [getEmployees, setGetEmployees] = useState(false);
    const { checkRole, hasPermission } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [getCompanies, setGetcompanies] = useState(false);
    const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<Option | null>(null);

    useEffect(() => {
        api.get('/companies?all=1').then(({ data }) => {
            setCompanyOptions(data.map((item: any) => ({ value: item.id, label: item.name })));
        });
    }, []);

    useEffect(() => {
        const params: any = { page: currentPage };
        if (companyId) params.company_id = +companyId;
        else if (selectedCompanyId) params.company_id = selectedCompanyId.value;
        if (name.length) params.name = name;
        if (email.length) params.email = email;
        if (clearMask(cpf).length) params.cpf = clearMask(cpf);

        api.get('/employees', { params }).then(response => {
            const { data, current_page, last_page } = response.data;
            setItems(data);
            setCurrentPage(current_page);
            setTotalPages(last_page);
        });
    }, [currentPage, name, email, cpf, getEmployees, companyId, selectedCompanyId]);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este aluno?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
        }).then(result => {
            if (result.isConfirmed) {
                api.delete(`/employees/${id}`)
                    .then(() => {
                        Swal.fire('Excluído!', 'Aluno excluído com sucesso.', 'success');
                        setGetEmployees(prev => !prev);
                    })
                    .catch(() => toast.error('Erro ao excluir aluno'));
            }
        });
    };

    const canEdit = checkRole('Entity') && hasPermission('Atualizar');
    const canDelete = checkRole('Entity') && hasPermission('Excluir');
    const canCreate = checkRole('Entity') && hasPermission('Cadastrar');

    return (
        <Fragment>
            {/* Page header */}
            <div className="modern-page-header">
                <div>
                    <h1 className="page-title">Alunos</h1>
                    <p className="page-subtitle">Gerencie os alunos cadastrados na plataforma</p>
                </div>
                <div className="page-actions">
                    <If condition={canCreate}>
                        <button className="btn btn-outline-secondary d-flex align-items-center gap-1" style={{ borderRadius: '8px', fontSize: '0.875rem' }} onClick={() => setShow(true)}>
                            <BiImport size={16} /> Importar
                        </button>
                    </If>
                    <If condition={canCreate}>
                        <Link to="create" className="btn-primary-custom">
                            <i className="bx bx-plus"></i>
                            Novo Aluno
                        </Link>
                    </If>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="content-card-header">
                    <span className="content-card-title">Filtros</span>
                </div>
                <div className="content-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="bx bx-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem', pointerEvents: 'none' }}></i>
                            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do aluno..." style={{ paddingLeft: '2.25rem', borderRadius: '8px', fontSize: '0.875rem' }} />
                        </div>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail..." style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                        <input type="text" className="form-control" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="CPF..." style={{ borderRadius: '8px', fontSize: '0.875rem' }} />
                        <Select
                            options={companyOptions}
                            value={selectedCompanyId}
                            onChange={val => { setSelectedCompanyId(val as Option | null); setCurrentPage(1); }}
                            isClearable
                            placeholder="Empresa..."
                            styles={{ control: (base) => ({ ...base, borderRadius: '8px', fontSize: '0.875rem', minHeight: '38px' }) }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="content-card">
                <div className="content-card-header">
                    <span className="content-card-title">Alunos</span>
                </div>

                {/* Desktop */}
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Aluno</th>
                                <th>Empresa</th>
                                <th>E-mail</th>
                                <th>CPF</th>
                                <th>Cadastro</th>
                                <If condition={canEdit || canDelete}>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </If>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                        <i className="bx bx-user-pin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                        Nenhum aluno encontrado
                                    </td>
                                </tr>
                            ) : items.map(item => (
                                <tr key={item.id}>
                                    <td><span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>#{item.id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span className="avatar-initials" style={{ background: getAvatarColor(item.id) }}>{getInitials(item.name || '?')}</span>
                                            <span style={{ fontWeight: 500, color: '#111827' }}>{firstLetterUppercase(item.name)}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#6b7280' }}>{item.company?.name ? firstLetterUppercase(item.company.name) : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{item.email || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                                    <td style={{ color: '#6b7280', fontSize: '0.8125rem', fontFamily: 'monospace' }}>{item.cpf ? addMaskCpf(item.cpf) : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{formatDate(item.created_at)}</td>
                                    <If condition={canEdit || canDelete}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                                <If condition={canEdit}>
                                                    <Link to={`${item.id}`} className="action-btn action-btn-edit" title="Editar">
                                                        <i className="bi bi-pencil"></i>
                                                        Editar
                                                    </Link>
                                                </If>
                                                <If condition={canDelete}>
                                                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(item.id)} title="Excluir">
                                                        <i className="bi bi-trash"></i>
                                                        Excluir
                                                    </button>
                                                </If>
                                            </div>
                                        </td>
                                    </If>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="d-grid gap-3 d-md-none" style={{ padding: '1rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                    <span className="avatar-initials" style={{ background: getAvatarColor(item.id), flexShrink: 0 }}>{getInitials(item.name || '?')}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '0.9rem' }}>{firstLetterUppercase(item.name)}</p>
                                        <p style={{ color: '#6b7280', margin: '0.125rem 0 0', fontSize: '0.8rem' }}>{item.email || '—'}</p>
                                        <p style={{ color: '#9ca3af', margin: '0.125rem 0 0', fontSize: '0.75rem' }}>#{item.id} · {item.company?.name || '—'} · {formatDate(item.created_at)}</p>
                                        {item.cpf && <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.75rem', fontFamily: 'monospace' }}>{addMaskCpf(item.cpf)}</p>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                    <If condition={canEdit}><Link to={`${item.id}`} className="action-btn action-btn-edit" title="Editar"><i className="bi bi-pencil"></i></Link></If>
                                    <If condition={canDelete}><button className="action-btn action-btn-delete" onClick={() => handleDelete(item.id)} title="Excluir"><i className="bi bi-trash"></i></button></If>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                        <nav aria-label="Page navigation" className="pagination-style-1">
                            <Pagination totalPages={totalPages} handlePageChange={handlePageChange} currentPage={currentPage} />
                        </nav>
                    </div>
                )}
            </div>

            <ImportModal setShow={setShow} show={show} type="alunos" getCompanies={getCompanies} setGetcompanies={setGetcompanies} onClose={() => setShow(false)} />
        </Fragment>
    );
};

export default Employees;
