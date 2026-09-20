import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { MdWork, MdBusiness, MdOutlineSchool } from 'react-icons/md';
import { FaPlus, FaTimes, FaCalendarAlt, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { FiBookOpen, FiPlusCircle, FiTrash2, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import api from '@/src/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { messageErrorAxios, firstLetterUppercase } from '@/src/lib/helper';
import Swal from 'sweetalert2';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CoursePeriod {
    start_date: string;
    end_date: string;
}

interface CourseOption {
    value: number;
    label: string;
    number_of_hours_studied?: number;
    certificate_template?: string;
}

interface InstructorOption {
    id: number;
    name: string;
    title?: string;
}

interface EventFormData {
    title: string;
    course_id: number | null;
    number_of_hours: string;
    instructor_ids: number[];
    periods: CoursePeriod[];
    date_init_validate: string;
    date_end_validate: string;
    issue_date: string;
    company_name: string;
    company_representative: string;
    city_name: string;

}

// ─── Stepper ─────────────────────────────────────────────────────────────────

interface StepperNavProps {
    step: number;
    label: string;
    currentStep: number;
    onClick: (step: number) => void;
    isStep1Valid: boolean;
    isStep2Valid?: boolean;
}

const StepperNav: FC<StepperNavProps> = ({ step, label, currentStep, onClick, isStep1Valid, isStep2Valid }) => {
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;
    const isClickable = step === 1 || (step === 2 && isStep1Valid) || (step === 3 && isStep1Valid && isStep2Valid);

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isClickable ? 'pointer' : 'default', minWidth: 50 }}
            onClick={() => isClickable && onClick(step)}
        >
            <div
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: isActive ? '#2563eb' : isCompleted ? '#10b981' : '#e2e8f0',
                    color: isActive || isCompleted ? '#fff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.30)' : isCompleted ? '0 2px 8px rgba(16,185,129,0.30)' : 'none',
                }}
            >
                {isCompleted ? '✓' : step}
            </div>
            <div
                className="d-none d-md-block"
                style={{
                    fontSize: 11,
                    color: isActive ? '#2563eb' : isCompleted ? '#10b981' : '#94a3b8',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'center',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                }}
            >
                {step}. {label}
            </div>
        </div>
    );
};

interface StepContentProps {
    children: React.ReactNode;
    stepName: string;
    currentStep: number;
}

const StepContent: FC<StepContentProps> = ({ children, stepName, currentStep }) => (
    <Card className="cg-box-shadow mb-4" style={{ borderRadius: 12, border: "1px solid #ebeef2" }}>
        <Card.Body className="p-4 p-md-5">
            <div className="fw-bold mb-4" style={{ fontSize: 22, color: "#2563eb" }}>
                <span style={{ color: "#0d6efd", marginRight: '10px' }}>Passo {currentStep}:</span> {stepName}
            </div>
            {children}
        </Card.Body>
    </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

const initialForm: EventFormData = {
    title: '',
    course_id: null,
    number_of_hours: '',
    instructor_ids: [],
    periods: [{ start_date: '', end_date: '' }],
    date_init_validate: today,
    date_end_validate: nextYear,
    issue_date: today,
    company_name: '',
    company_representative: '',
    city_name: '',

};

const Event: FC = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<EventFormData>(initialForm);
    const [courses, setCourses] = useState<any[]>([]);
    const [courseSearchTerm, setCourseSearchTerm] = useState('');
    const [courseFrames, setCourseFrames] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [allInstructors, setAllInstructors] = useState<InstructorOption[]>([]);
    const [showInstructorModal, setShowInstructorModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [certificateTemplate, setCertificateTemplate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const filteredCourses = useMemo(() => {
        if (!courseSearchTerm) return courses;
        const term = courseSearchTerm.toLowerCase();
        return courses.filter(c => c.name.toLowerCase().includes(term));
    }, [courses, courseSearchTerm]);

    const selectedCourseFrame = useMemo(() => {
        if (!selectedCourse) return null;
        return courseFrames.find(f => f.id === selectedCourse.certificate_template?.frame_id);
    }, [selectedCourse, courseFrames]);

     const handleCourseSelect = (course: any) => {
        setSelectedCourse(course);
        setCertificateTemplate(course.certificate_template?.latest_version?.template ?? '');
        setForm(f => ({
            ...f,
            course_id: course.id,
            number_of_hours: String(course.number_of_hours_studied ?? ''),
            company_name: '',
            company_representative: '',
            city_name: '',
        }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const isCourseSelected = useMemo(() => !!selectedCourse, [selectedCourse]);
    const isStep1Valid = useMemo(() => {
        return !!selectedCourse && form.instructor_ids.length > 0;
    }, [selectedCourse, form.instructor_ids]);

    const requiresCompanyName = useMemo(() => certificateTemplate.includes('{{nome_empresa}}'), [certificateTemplate]);
    const requiresCompanyRepresentative = useMemo(() => certificateTemplate.includes('{{responsavel_empresarial}}') || certificateTemplate.includes('{responsavel_empresarial}'), [certificateTemplate]);
    const requiresCityName = useMemo(() => certificateTemplate.includes('{{cidade_de_realizacao}}'), [certificateTemplate]);

    const formatDateBR = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    const getValidityText = (start: string | null, end: string | null) => {
        if (!start || !end) return "";
        const s = new Date(start + 'T00:00:00');
        const e = new Date(end + 'T00:00:00');
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";

        const diffTime = e.getTime() - s.getTime();
        if (diffTime < 0) return "";
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return diffDays === 1 ? '1 dia' : `${diffDays} dias`;
        }
        
        if (diffDays < 365) {
            const months = Math.round(diffDays / 30.4375);
            return months <= 1 ? '1 mês' : `${months} meses`;
        }
        
        let years = Math.floor(diffDays / 365.25);
        const remainingDays = diffDays - (years * 365.25);
        let months = Math.round(remainingDays / 30.4375);
        
        if (months >= 12) {
            years += 1;
            months = 0;
        }
        
        if (months === 0) {
            return years === 1 ? 'Aproximadamente 1 ano' : `Aproximadamente ${years} anos`;
        }
        
        const yearsText = years === 1 ? '1 ano' : `${years} anos`;
        const monthsText = months === 1 ? '1 mês' : `${months} meses`;
        return `Aproximadamente ${yearsText} e ${monthsText}`;
    };

    const isStep2Valid = useMemo(() => {
        const titleOk = !!form.title.trim();
        const periodsOk = form.periods.length > 0 && form.periods.every(p => !!p.start_date && !!p.end_date && p.end_date >= p.start_date);
        const validityOk = !!form.date_init_validate && !!form.date_end_validate && form.date_end_validate >= form.date_init_validate;
        const companyOk = !requiresCompanyName || !!form.company_name;
        const companyRepresentativeOk = !requiresCompanyRepresentative || !!form.company_representative;
        const cityOk = !requiresCityName || !!form.city_name;
        return titleOk && periodsOk && validityOk && companyOk && companyRepresentativeOk && cityOk;
    }, [form.title, form.periods, form.date_init_validate, form.date_end_validate, form.company_name, form.company_representative, form.city_name, requiresCompanyName, requiresCompanyRepresentative, requiresCityName]);

    // ── Load data ─────────────────────────────────────────────────────────────

    useEffect(() => {
        setLoadingCourses(true);
        api.get('/courses', { params: { all: 1 } }).then(r => {
            setCourses(r.data);
            setLoadingCourses(false);
        });

        api.get('/document-template-frames', { params: { all: 1 } }).then(async (r) => {
            const processed = await Promise.all(
                r.data.map(async (item: any) => {
                    try {
                        const imageResponse = await api.get(`/image?image=${item.frame}`, { responseType: 'blob' });
                        return { ...item, frame: URL.createObjectURL(imageResponse.data) };
                    } catch {
                        return { ...item, frame: '' };
                    }
                })
            );
            setCourseFrames(processed);
        });

        api.get('/instructors', { params: { all: 1 } }).then(r => {
            setAllInstructors(r.data);
        });

        if (eventId) {
            api.get(`/events/${eventId}`).then(r => {
                const d = r.data;
                setForm({
                    title: d.title || '',
                    course_id: d.course_id,
                    number_of_hours: d.number_of_hours != null ? String(d.number_of_hours) : '',
                    instructor_ids: d.instructors ? d.instructors.map((i: any) => i.id) : [],
                    periods: Array.isArray(d.periods) && d.periods.length > 0
                        ? d.periods
                        : [{ start_date: '', end_date: '' }],
                    date_init_validate: d.date_init_validate || today,
                    date_end_validate: d.date_end_validate || nextYear,
                    issue_date: d.issue_date || today,
                    company_name: d.company_name || '',
                    company_representative: d.company_representative || '',
                    city_name: d.city_name || '',
                });

                if (d.course) {
                    setSelectedCourse(d.course);
                    setCertificateTemplate(d.course.certificate_template?.latest_version?.template ?? '');
                }
            });
        }
    }, [eventId]);

    // ── Existing media blob ───────────────────────────────────────────────────

    const hasAnyMedia = false;

    // ── Period helpers ────────────────────────────────────────────────────────

    const updatePeriod = (idx: number, field: keyof CoursePeriod, value: string) => {
        const next = [...form.periods];
        next[idx] = { ...next[idx], [field]: value };
        setForm(f => ({ ...f, periods: next }));
    };

    const addPeriod = () => setForm(f => ({ ...f, periods: [...f.periods, { start_date: '', end_date: '' }] }));

    const removePeriod = (idx: number) =>
        setForm(f => ({ ...f, periods: f.periods.filter((_, i) => i !== idx) }));

    // ── Instructor toggle ─────────────────────────────────────────────────────

    const toggleInstructor = (id: number, checked: boolean) => {
        setForm(f => ({
            ...f,
            instructor_ids: checked
                ? [...f.instructor_ids, id]
                : f.instructor_ids.filter(i => i !== id),
        }));
    };

    // ── Media handlers ────────────────────────────────────────────────────────



    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!form.title.trim()) { toast.error('Preencha o nome do evento.'); return; }
        if (!form.issue_date) { toast.error('Preencha a data de emissão.'); return; }
        if (requiresCompanyName && !form.company_name.trim()) { toast.error('Preencha o campo Empresa — ele é obrigatório para o modelo de certificado selecionado.'); return; }
        if (requiresCompanyRepresentative && !form.company_representative.trim()) { toast.error('Preencha o campo Responsável Empresarial — ele é obrigatório para o modelo de certificado selecionado.'); return; }
        if (requiresCityName && !form.city_name.trim()) { toast.error('Preencha o campo Cidade cursada — ela é obrigatória para o modelo de certificado selecionado.'); return; }

        setIsSaving(true);
        const formData = new FormData();

        formData.append('title', form.title);
        formData.append('course_id', String(form.course_id));
        if (form.number_of_hours) formData.append('number_of_hours', form.number_of_hours);
        if (form.company_name) formData.append('company_name', form.company_name);
        if (form.company_representative) formData.append('company_representative', form.company_representative);
        if (form.city_name) formData.append('city_name', form.city_name);
        if (form.date_init_validate) formData.append('date_init_validate', form.date_init_validate);
        if (form.date_end_validate) formData.append('date_end_validate', form.date_end_validate);
        if (form.issue_date) formData.append('issue_date', form.issue_date);

        form.instructor_ids.forEach(id => formData.append('instructor_ids[]', String(id)));
        form.periods.forEach((p, i) => {
            formData.append(`periods[${i}][start_date]`, p.start_date);
            formData.append(`periods[${i}][end_date]`, p.end_date);
        });

        try {
            if (eventId) {
                formData.append('_method', 'PUT');
                await api.post(`/events/${eventId}`, formData);
                Swal.fire('Sucesso', 'Evento atualizado com sucesso', 'success').then(() => navigate('/events'));
            } else {
                await api.post('/events', formData);
                Swal.fire({ icon: 'success', title: 'Evento criado com sucesso', confirmButtonText: 'Ok' })
                    .then(() => navigate('/events'));
            }
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            Swal.fire('Erro', messageErrorAxios(errors) || 'Ocorreu um erro ao salvar o evento.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="event-page-wrapper">
            <style>
                {`
          @keyframes pulse-next {
            0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); transform: scale(1); }
            50% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); transform: scale(1); }
          }
          @keyframes pulse-success {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); transform: scale(1); }
            50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); transform: scale(1); }
          }
          .pulse-cta:not(:disabled) {
            animation: pulse-next 2s infinite !important;
            transition: all 0.3s ease;
          }
          .pulse-success:not(:disabled) {
            animation: pulse-success 2s infinite !important;
            transition: all 0.3s ease;
          }
          .cg-select__control {
            border-radius: 10px !important;
            border-color: #e2e8f0 !important;
            padding: 4px !important;
          }
          .cursor-pointer { cursor: pointer; }
          .cursor-not-allowed { cursor: not-allowed; }
          .cg-box-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
          }
        `}
            </style>

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-sm" style={{ borderRadius: 12, border: '1px solid #ebeef2' }}>
                        <Card.Body className="py-3 px-4">
                            <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', gap: '20px' }}>
                                <StepperNav
                                    step={1}
                                    label="Curso e Instrutores"
                                    currentStep={step}
                                    onClick={setStep}
                                    isStep1Valid={isStep1Valid}
                                />
                                <div style={{ flex: 1, maxWidth: 100, height: 2, background: step > 1 ? '#10b981' : (isStep1Valid ? '#2563eb' : '#e2e8f0'), transition: 'background 0.3s' }} />
                                <StepperNav
                                    step={2}
                                    label="Datas e Configurações"
                                    currentStep={step}
                                    onClick={setStep}
                                    isStep1Valid={isStep1Valid}
                                    isStep2Valid={isStep2Valid}
                                />
                                <div style={{ flex: 1, maxWidth: 100, height: 2, background: step > 2 ? '#10b981' : (isStep2Valid ? '#2563eb' : '#e2e8f0'), transition: 'background 0.3s' }} />
                                <StepperNav
                                    step={3}
                                    label="Resumo e Confirmação"
                                    currentStep={step}
                                    onClick={setStep}
                                    isStep1Valid={isStep1Valid}
                                    isStep2Valid={isStep2Valid}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── STEP 1: Selecionar o Curso ── */}
            {step === 1 && (
                <Row className="pb-4">
                    <Col md={12}>
                        <StepContent stepName="Selecionar o Curso" currentStep={1}>
                            <Row>
                                {/* Coluna esquerda: busca + lista de cursos */}
                                <Col md={5} style={{ borderRight: '1px solid #f1f5f9' }}>
                                    <Form.Label className="fw-bold small text-uppercase text-muted mb-2">Selecionar o Curso *</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRight: 'none' }}>
                                            <FaSearch style={{ color: '#94a3b8' }} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Buscar curso..."
                                            value={courseSearchTerm}
                                            onChange={e => setCourseSearchTerm(e.target.value)}
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: 'none' }}
                                        />
                                    </InputGroup>

                                    <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                                        {loadingCourses ? (
                                            <p className="text-muted text-center py-4 small">Carregando cursos...</p>
                                        ) : filteredCourses.length === 0 ? (
                                            <p className="text-muted text-center py-4 small">Nenhum curso encontrado.</p>
                                        ) : (
                                            filteredCourses.map(course => {
                                                const isSelected = selectedCourse?.id === course.id;
                                                const frame = courseFrames.find(f => f.id === course.certificate_template?.frame_id);

                                                return (
                                                    <div
                                                        key={course.id}
                                                        onClick={() => handleCourseSelect(course)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '10px 12px',
                                                            marginBottom: 8,
                                                            borderRadius: 10,
                                                            cursor: 'pointer',
                                                            background: isSelected ? '#eff6ff' : 'transparent',
                                                            border: `1px solid ${isSelected ? '#bfdbfe' : '#f1f5f9'}`,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: 50, height: 35, borderRadius: 4, background: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            marginRight: 12, flexShrink: 0, border: '1px solid #e2e8f0', overflow: 'hidden'
                                                        }}>
                                                            {frame?.frame ? (
                                                                <img src={frame.frame} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <MdOutlineSchool size={18} color="#cbd5e1" />
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#1e40af' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {course.name}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: '#64748b' }}>{course.number_of_hours_studied}h</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </Col>

                                {/* Coluna direita: preview */}
                                <Col md={7} className="d-flex align-items-center justify-content-center ps-4">
                                    {selectedCourse ? (
                                        <div style={{ width: '100%', maxWidth: 460 }}>
                                            <div className="cg-box-shadow" style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', marginBottom: 20 }}>
                                                {selectedCourseFrame?.frame ? (
                                                    <div style={{ width: '100%', aspectRatio: '1.41', background: '#f8fafc', overflow: 'hidden' }}>
                                                        <img
                                                            src={selectedCourseFrame.frame}
                                                            alt="Preview"
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ aspectRatio: '1.41', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                        <MdOutlineSchool size={40} style={{ color: '#cbd5e1' }} />
                                                    </div>
                                                )}
                                                <div style={{ padding: '15px 20px', borderTop: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 4 }}>{selectedCourse.name}</div>
                                                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{selectedCourse.number_of_hours_studied}h</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 24px' }}>
                                            <MdOutlineSchool size={52} style={{ marginBottom: 12, opacity: 0.3 }} />
                                            <p style={{ fontSize: 13, margin: 0 }}>Selecione um curso para visualizar o preview do certificado</p>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </StepContent>
                    </Col>
                    <Col md={12} className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            className={isCourseSelected ? "pulse-cta" : ""}
                            style={{
                                minWidth: 150,
                                fontWeight: 700,
                                borderRadius: 10,
                                background: isCourseSelected ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#e2e8f0',
                                border: 'none',
                                padding: '0.8rem 1.5rem',
                                boxShadow: isCourseSelected ? '0 4px 15px rgba(124, 58, 237, 0.3)' : 'none',
                                color: isCourseSelected ? '#fff' : '#94a3b8'
                            }}
                            disabled={!isCourseSelected}
                            onClick={() => setShowInstructorModal(true)}
                        >
                            Próximo <IoIosArrowForward className="ms-1" />
                        </Button>
                    </Col>
                </Row>
            )}

            {/* Modal de Seleção de Instrutores */}
            <Modal
                show={showInstructorModal}
                onHide={() => setShowInstructorModal(false)}
                size="lg"
                centered
                style={{ backdropFilter: 'blur(4px)' }}
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold" style={{ color: '#1e293b' }}>Selecionar Instrutores</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <p className="text-muted small mb-4">Selecione os instrutores que serão responsáveis por este evento.</p>
                    <Row className="g-3">
                        {allInstructors.map(inst => {
                            const isSelected = form.instructor_ids.includes(inst.id);
                            return (
                                <Col md={6} key={inst.id}>
                                    <div
                                        onClick={() => toggleInstructor(inst.id, !isSelected)}
                                        className="d-flex align-items-center p-3 h-100"
                                        style={{
                                            borderRadius: 12,
                                            background: isSelected ? 'rgba(37, 99, 235, 0.05)' : '#fff',
                                            border: `2px solid ${isSelected ? '#2563eb' : '#f1f5f9'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 6,
                                                border: `2px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                                                background: isSelected ? '#2563eb' : 'transparent',
                                                marginRight: 15,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: 10
                                            }}
                                        >
                                            {isSelected && '✓'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="fw-bold" style={{ color: isSelected ? '#2563eb' : '#334155', fontSize: 14 }}>
                                                {firstLetterUppercase(inst.name)}
                                            </div>
                                            {inst.title && <div className="small text-muted" style={{ fontSize: 12 }}>{inst.title}</div>}
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowInstructorModal(false)} style={{ borderRadius: 10, fontWeight: 600 }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        disabled={form.instructor_ids.length === 0}
                        onClick={() => {
                            setShowInstructorModal(false);
                            setStep(2);
                        }}
                        style={{
                            borderRadius: 10,
                            fontWeight: 600,
                            padding: '10px 25px',
                            background: '#2563eb',
                            border: 'none',
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        Confirmar Seleção
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── STEP 2: Datas e Validade ── */}
            {step === 2 && (
                <Row className="pb-4 g-4">
                    <Col lg={8}>
                        <StepContent stepName="Dados do Evento" currentStep={2}>
                            {/* Dados da Emissão */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <MdWork style={{ color: '#64748b' }} size={20} />
                                    </div>
                                    <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Dados da Emissão</h5>
                                </div>
                                <Row className="g-3">
                                    <Col md={8}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Nome do evento *</Form.Label>
                                            <Form.Control
                                                placeholder="Ex: Treinamento de NR-35 - Trabalho em Altura"
                                                value={form.title}
                                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                                style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Data de Emissão *</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="date"
                                                    value={form.issue_date}
                                                    onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0', paddingLeft: 40 }}
                                                />
                                                <FaCalendarAlt className="position-absolute" style={{ left: 14, top: 16, color: '#94a3b8' }} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Validade do Certificado */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <FaCalendarAlt style={{ color: '#3b82f6' }} size={18} />
                                    </div>
                                    <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Validade do Certificado</h5>
                                </div>

                                <Row className="g-3 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Início da Validade</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="date"
                                                    value={form.date_init_validate}
                                                    onChange={e => setForm(f => ({ ...f, date_init_validate: e.target.value }))}
                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0', paddingLeft: 40 }}
                                                />
                                                <FaCalendarAlt className="position-absolute" style={{ left: 14, top: 16, color: '#94a3b8' }} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Término da Validade</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="date"
                                                    value={form.date_end_validate}
                                                    onChange={e => setForm(f => ({ ...f, date_end_validate: e.target.value }))}
                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0', paddingLeft: 40 }}
                                                />
                                                <FaCalendarAlt className="position-absolute" style={{ left: 14, top: 16, color: '#94a3b8' }} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {form.date_init_validate && form.date_end_validate && (
                                    <div className="mb-4">
                                        <div className="position-relative" style={{ height: 4, background: '#f1f5f9', borderRadius: 2, margin: '30px 10px' }}>
                                            <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: '#2563eb', borderRadius: 2 }}>
                                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '3px solid #2563eb', position: 'absolute', left: -2, top: -4 }}></div>
                                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '3px solid #2563eb', position: 'absolute', right: -2, top: -4 }}></div>

                                                {getValidityText(form.date_init_validate, form.date_end_validate) && (
                                                    <div className="position-absolute" style={{ top: -28, left: '50%', transform: 'translateX(-50%)' }}>
                                                        <span style={{ background: '#2563eb', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                                            {getValidityText(form.date_init_validate, form.date_end_validate)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between px-2 mt-1">
                                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{formatDateBR(form.date_init_validate)}</span>
                                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{formatDateBR(form.date_end_validate)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Informações Complementares */}
                            {(requiresCompanyName || requiresCompanyRepresentative || requiresCityName) && (
                                <div className="mb-5">
                                    <div className="d-flex align-items-center mb-4">
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <MdBusiness style={{ color: '#0ea5e9' }} size={20} />
                                        </div>
                                        <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Informações Complementares</h5>
                                    </div>
                                    <Row className="g-3">
                                        {(() => {
                                            let visibleCount = 0;
                                            if (requiresCompanyName) visibleCount++;
                                            if (requiresCompanyRepresentative) visibleCount++;
                                            if (requiresCityName) visibleCount++;

                                            const colSize = visibleCount === 3 ? 4 : (visibleCount === 2 ? 6 : 12);

                                            return (
                                                <>
                                                    {requiresCompanyName && (
                                                        <Col md={colSize}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Empresa</Form.Label>
                                                                <Form.Control
                                                                    placeholder="Nome da empresa"
                                                                    value={form.company_name}
                                                                    onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    )}
                                                    {requiresCompanyRepresentative && (
                                                        <Col md={colSize}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Responsável Empresarial</Form.Label>
                                                                <Form.Control
                                                                    placeholder="Nome do responsável da empresa"
                                                                    value={form.company_representative}
                                                                    onChange={e => setForm(f => ({ ...f, company_representative: e.target.value }))}
                                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    )}
                                                    {requiresCityName && (
                                                        <Col md={colSize}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Cidade do Evento</Form.Label>
                                                                <Form.Control
                                                                    placeholder="Ex: São Paulo - SP"
                                                                    value={form.city_name}
                                                                    onChange={e => setForm(f => ({ ...f, city_name: e.target.value }))}
                                                                    style={{ height: 48, borderRadius: 10, border: '1.2px solid #e2e8f0' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </Row>
                                </div>
                            )}

                            {/* Períodos Cursados */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <FiBookOpen style={{ color: '#ef4444' }} size={20} />
                                    </div>
                                    <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Períodos Cursados</h5>
                                </div>

                                {form.periods.map((p, idx) => (
                                    <div key={idx} className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                        <Row className="align-items-end g-3">
                                            <Col md={5}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Data de Início</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="date"
                                                            value={p.start_date}
                                                            onChange={e => updatePeriod(idx, 'start_date', e.target.value)}
                                                            style={{ height: 44, borderRadius: 8, border: '1.2px solid #e2e8f0', paddingLeft: 38 }}
                                                        />
                                                        <FaCalendarAlt className="position-absolute" style={{ left: 12, top: 14, color: '#94a3b8' }} />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={5}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold small" style={{ color: '#475569' }}>Data de Término</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="date"
                                                            value={p.end_date}
                                                            onChange={e => updatePeriod(idx, 'end_date', e.target.value)}
                                                            style={{ height: 44, borderRadius: 8, border: '1.2px solid #e2e8f0', paddingLeft: 38 }}
                                                        />
                                                        <FaCalendarAlt className="position-absolute" style={{ left: 12, top: 14, color: '#94a3b8' }} />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={2} className="text-end">
                                                {form.periods.length > 1 && (
                                                    <Button
                                                        variant="link"
                                                        className="p-2 text-danger"
                                                        onClick={() => removePeriod(idx)}
                                                        style={{ background: '#fee2e2', borderRadius: 8 }}
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                ))}

                                <Button
                                    variant="outline-primary"
                                    className="w-100 py-3 mt-2 d-flex align-items-center justify-content-center"
                                    onClick={addPeriod}
                                    style={{ borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, fontWeight: 600, gap: 8 }}
                                >
                                    <FiPlusCircle size={20} /> Adicionar novo período
                                </Button>
                            </div>

                            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                <Button
                                    variant="light"
                                    className="px-4 py-2 d-flex align-items-center"
                                    onClick={() => setStep(1)}
                                    style={{ borderRadius: 10, fontWeight: 600, color: '#64748b', border: '1px solid #e2e8f0' }}
                                >
                                    <FaArrowLeft className="me-2" /> Voltar
                                </Button>
                                <Button
                                    variant="primary"
                                    className={`px-5 py-2 d-flex align-items-center ${isStep2Valid ? "pulse-cta" : ""}`}
                                    onClick={() => setStep(3)}
                                    disabled={!isStep2Valid}
                                    style={{
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        background: isStep2Valid ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#cbd5e1',
                                        border: 'none',
                                        boxShadow: isStep2Valid ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                        minWidth: 200
                                    }}
                                >
                                    Próximo <IoIosArrowForward className="ms-2" />
                                </Button>
                            </div>
                        </StepContent>
                    </Col>

                    {/* Sidebar Resumo */}
                    <Col lg={4}>
                        <div style={{ position: 'sticky', top: 30 }}>
                            <Card className="cg-box-shadow border-0" style={{ borderRadius: 16, overflow: 'hidden' }}>
                                <Card.Body className="p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Resumo</h4>

                                    {/* Preview do Certificado Mini */}
                                    <div className="mb-4" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        {selectedCourseFrame?.frame ? (
                                            <div style={{ width: '100%', aspectRatio: '1.41', overflow: 'hidden' }}>
                                                <img src={selectedCourseFrame.frame} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                                            </div>
                                        ) : (
                                            <div style={{ aspectRatio: '1.41', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MdOutlineSchool size={48} className="text-muted opacity-25" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de Resumo */}
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex align-items-start gap-3">
                                            <FiCheckCircle size={20} style={{ color: selectedCourse ? '#10b981' : '#cbd5e1', marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <div className="small text-muted fw-semibold">Curso:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b', fontSize: 13 }}>{selectedCourse?.name || 'Não selecionado'}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-3">
                                            <FiCheckCircle size={20} style={{ color: form.instructor_ids.length > 0 ? '#10b981' : '#cbd5e1', marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <div className="small text-muted fw-semibold">Instrutores:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b', fontSize: 13 }}>{form.instructor_ids.length} selecionado(s)</div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-3">
                                            <FiCheckCircle size={20} style={{ color: (form.date_init_validate && form.date_end_validate) ? '#10b981' : '#cbd5e1', marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <div className="small text-muted fw-semibold">Validade:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b', fontSize: 13 }}>
                                                    {form.date_init_validate ? formatDateBR(form.date_init_validate) : '--'} - {form.date_end_validate ? formatDateBR(form.date_end_validate) : '--'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-3">
                                            <FiCheckCircle size={20} style={{ color: form.periods.length > 0 ? '#10b981' : '#cbd5e1', marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <div className="small text-muted fw-semibold">Períodos Cursados:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b', fontSize: 13 }}>{form.periods.length} período(s) adicionado(s)</div>
                                            </div>
                                        </div>
                                    </div>

                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            )}

            {/* ── STEP 3: Resumo e Confirmação ── */}
            {step === 3 && (
                <Row className="pb-4 g-4 justify-content-center">
                    <Col lg={10}>
                        <StepContent stepName="Resumo e Confirmação" currentStep={3}>
                            <Row className="g-4">
                                <Col md={5}>
                                    <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Resumo Final</h5>

                                    <div className="d-flex flex-column gap-4 p-4" style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div className="small text-muted fw-semibold mb-1">Nome do Evento:</div>
                                            <div className="fw-bold" style={{ color: '#1e293b', fontSize: 16 }}>{form.title || 'N/A'}</div>
                                            <div className="small text-muted mt-1">Emissão: {formatDateBR(form.issue_date)}</div>
                                        </div>

                                        <div style={{ height: 1, background: '#e2e8f0' }} />

                                        <div>
                                            <div className="small text-muted fw-semibold mb-1">Curso Selecionado:</div>
                                            <div className="fw-bold" style={{ color: '#1e293b' }}>{selectedCourse?.name}</div>
                                            <div className="small text-primary fw-bold mt-1">{selectedCourse?.number_of_hours_studied}h de carga horária</div>
                                        </div>

                                        <div style={{ height: 1, background: '#e2e8f0' }} />

                                        <div>
                                            <div className="small text-muted fw-semibold mb-2">Instrutores:</div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {form.instructor_ids.map(id => {
                                                    const inst = allInstructors.find(i => i.id === id);
                                                    return (
                                                        <Badge key={id} bg="white" text="dark" className="border px-3 py-2" style={{ borderRadius: 20, fontWeight: 600 }}>
                                                            {inst ? firstLetterUppercase(inst.name) : 'Instrutor'}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div style={{ height: 1, background: '#e2e8f0' }} />

                                        <Row>
                                            <Col xs={6}>
                                                <div className="small text-muted fw-semibold mb-1">Início Validade:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b' }}>{formatDateBR(form.date_init_validate)}</div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className="small text-muted fw-semibold mb-1">Término Validade:</div>
                                                <div className="fw-bold" style={{ color: '#1e293b' }}>{formatDateBR(form.date_end_validate)}</div>
                                            </Col>
                                        </Row>

                                        {(form.company_name || form.company_representative || form.city_name) && (
                                            <>
                                                <div style={{ height: 1, background: '#e2e8f0' }} />
                                                <Row>
                                                    {form.company_name && (
                                                        <Col xs={4}>
                                                            <div className="small text-muted fw-semibold mb-1">Empresa:</div>
                                                            <div className="fw-bold" style={{ color: '#1e293b' }}>{form.company_name}</div>
                                                        </Col>
                                                    )}
                                                    {form.company_representative && (
                                                        <Col xs={4}>
                                                            <div className="small text-muted fw-semibold mb-1">Responsável:</div>
                                                            <div className="fw-bold" style={{ color: '#1e293b' }}>{form.company_representative}</div>
                                                        </Col>
                                                    )}
                                                    {form.city_name && (
                                                        <Col xs={4}>
                                                            <div className="small text-muted fw-semibold mb-1">Cidade:</div>
                                                            <div className="fw-bold" style={{ color: '#1e293b' }}>{form.city_name}</div>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </>
                                        )}

                                        <div style={{ height: 1, background: '#e2e8f0' }} />

                                        <div>
                                            <div className="small text-muted fw-semibold mb-2">Períodos do Evento:</div>
                                            {form.periods.map((p, idx) => (
                                                <div key={idx} className="small fw-bold mb-1" style={{ color: '#475569' }}>
                                                    {idx + 1}. {formatDateBR(p.start_date)} até {formatDateBR(p.end_date)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Col>

                                <Col md={7}>
                                    <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Visualização do Certificado</h5>
                                    <div className="cg-box-shadow" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                                        {selectedCourseFrame?.frame ? (
                                            <div style={{ width: '100%', aspectRatio: '1.41', overflow: 'hidden' }}>
                                                <img src={selectedCourseFrame.frame} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                                            </div>
                                        ) : (
                                            <div style={{ aspectRatio: '1.41', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MdOutlineSchool size={64} className="text-muted opacity-25" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 p-3 d-flex align-items-center gap-3" style={{ background: '#ecfdf5', borderRadius: 12, border: '1px solid #d1fae5' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FiCheckCircle size={24} color="#fff" />
                                        </div>
                                        <div>
                                            <div className="fw-bold" style={{ color: '#065f46' }}>Tudo pronto para criar o evento!</div>
                                            <div className="small" style={{ color: '#059669' }}>Confira as informações acima antes de finalizar.</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                <Button
                                    variant="light"
                                    className="px-4 py-2 d-flex align-items-center"
                                    onClick={() => setStep(2)}
                                    style={{ borderRadius: 10, fontWeight: 600, color: '#64748b', border: '1px solid #e2e8f0' }}
                                >
                                    <FaArrowLeft className="me-2" /> Voltar
                                </Button>
                                <Button
                                    variant="success"
                                    className={`px-5 py-2 d-flex align-items-center ${!isSaving ? "pulse-success" : ""}`}
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    style={{
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                        minWidth: 200
                                    }}
                                >
                                    {isSaving ? (
                                        <><Spinner size="sm" animation="border" className="me-2" />Processando...</>
                                    ) : (
                                        <><FiCheckCircle className="me-2" size={20} /> {eventId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR E CRIAR EVENTO'}</>
                                    )}
                                </Button>
                            </div>
                        </StepContent>
                    </Col>
                </Row>
            )}

            <ToastContainer />
        </div>
    );
};

export default Event;
