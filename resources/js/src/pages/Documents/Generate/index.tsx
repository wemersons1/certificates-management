import { FC, useContext, useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Col, Form, Row, InputGroup, Modal, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { MdBusiness, MdGroups, MdOutlineSchool, MdDelete, MdInfoOutline, MdHistory } from "react-icons/md";
import { FaPlus, FaTimes, FaCalendarAlt, FaSearch, FaClock, FaCheckCircle, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoIosArrowForward } from 'react-icons/io';
import { FiCalendar, FiClock, FiCheckCircle, FiTrash2, FiPlusCircle, FiBookOpen, FiAward, FiUsers, FiAlertTriangle } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import api from "@/src/lib/api";
import AppContext from "@/src/AppContext/Context";
import { useNavigate } from "react-router-dom";
import { firstLetterUppercase, clearMask, applyMask } from "@/src/lib/helper";
import Swal from "sweetalert2";
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import * as Papa from 'papaparse';
import ManualEntryModal from "./ManualEntryModal";
import './Generate.css';
import { Input } from "@/src/components/ui/input";
import If from "@/src/components/common/if/if";
import * as XLSX from 'xlsx';

// Interface Definitions (Ajustadas)
interface Course {
  id: number;
  name: string;
  instructors: Instructor[];
  requiresStudentSignature: boolean;
  number_of_hours_studied?: number;
  certificate_template?: {
    frame_id?: number | null;
    frame_type?: string;
    orientation?: string;
    latest_version?: {
      template: string;
    };
  };
}

interface Instructor {
  id: number;
  name: string;
  title?: string;
}

interface Company {
  id: number;
  name: string;
  state_id: number;
  cnpj: string;
}

interface Employee {
  id: number;
  name: string;
  companyId: number;
  cpf?: string;
  rg?: string;
  email?: string;
  cellphone?: string;
  position?: string;
  machines_operated?: string;
}

interface CoursePeriod {
  startDate: string | null;
  endDate: string | null;
}

interface CityData {
  value: number;
  label: string;
}

interface CourseFormData {
  course: Course;
  periods: CoursePeriod[];
  validityStart: string | null;
  validityEnd: string | null;
  requiresStudentSignature: boolean;
  selectedInstructorIds: number[];
  issueDate: string | null;
  selectedEmployeeIds: number[];
  number_of_hours_studied: number;
  certificate_template: string;
  frame_id?: number | null;
  hasValidity?: boolean;
  isIndeterminate?: boolean;
}


// Componente de Navegação Stepper (CORRIGIDO: MOVIDO PARA FORA DO FC)
interface StepperNavProps {
  step: number;
  label: string;
  isValid: boolean;
  currentStep: number;
  onClick: (step: number) => void;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
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

// Componente de Conteúdo do Passo (CORRIGIDO: MOVIDO PARA FORA DO FC)
interface StepContentProps {
  children: React.ReactNode;
  stepName: string;
  currentStep: number;
}

const StepContent: FC<StepContentProps> = ({ children, stepName, currentStep }) => (
  <Card className="cg-box-shadow mb-4" style={{ borderRadius: 12, border: "1px solid #ebeef2" }}>
    <Card.Body>
      <div className="fw-bold mb-4" style={{ fontSize: 22, color: "#2563eb" }}>
        <span style={{ color: "#0d6efd", marginRight: '10px' }}>Passo {currentStep}:</span> {stepName}
      </div>
      {children}
    </Card.Body>
  </Card>
);

// Estados e Configurações (Ajustados)
const CertificateGeneration: FC = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // CompanyEmployees agora guarda TODOS os funcionários, não filtrados.
  const [companyEmployees, setCompanyEmployees] = useState<Employee[]>([]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCourseFormData, setSelectedCourseFormData] = useState<CourseFormData | null>(null);
  // Estado para o nome da empresa em formato string para o payload (Opcional)
  const [companyNameInput, setCompanyNameInput] = useState<string>("");
  const [companyRepresentativeInput, setCompanyRepresentativeInput] = useState<string>("");
  const [cityNameInput, setCityNameInput] = useState<string | null>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showStep2Errors, setShowStep2Errors] = useState<boolean>(false);
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  useEffect(() => {
    api.get('/credits/balance')
      .then(res => {
        setAvailableCredits(res.data.total);
        if (res.data.total === 0) {
          setShowPaywallModal(true);
        }
      })
      .catch(err => console.error("Error fetching credit balance", err));
  }, []);

  // States for Employee Selection
  const [showEmployeeSelectionModal, setShowEmployeeSelectionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [currentCourseEmployeesInModal, setCurrentCourseEmployeesInModal] = useState<number[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Número de itens por página

  // States for the integrated Import Modal
  const [importFiles, setImportFiles] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState<string>("");
  const [showInstructorModal, setShowInstructorModal] = useState<boolean>(false);
  const [courseFrames, setCourseFrames] = useState<{ id: number; frame: string; is_top_only?: boolean }[]>([]);
  const { user } = useContext(AppContext);
  const reduxTheme = useSelector((state: any) => state);
  const isDark = reduxTheme?.dataThemeMode === 'dark';

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const nextYearStr = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split("T")[0];

  const navigate = useNavigate();
  const [manualStudent, setManualStudent] = useState({ name: '', cpf: '', rg: '', email: '', position: '' });

  // Helper Functions for Step 2 & 3 Redesign
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getDurationDays = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return -1;
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return -1; // Also treat reverse dates as invalid
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatFriendlyDuration = (days: number): string => {
    if (days < 30) {
      return days === 1 ? '1 dia' : `${days} dias`;
    }

    if (days < 365) {
      const months = Math.round(days / 30.4375);
      return months <= 1 ? '1 mês' : `${months} meses`;
    }

    let years = Math.floor(days / 365.25);
    const remainingDays = days - (years * 365.25);
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

    const diffYears = e.getFullYear() - s.getFullYear();
    const isExactYear = e.getMonth() === s.getMonth() && e.getDate() === s.getDate();

    if (diffYears === 1 && isExactYear) return "1 ano";
    if (diffYears > 1 && isExactYear) return `${diffYears} anos`;

    return "";
  };

  // Effects (Ajustados)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const estadoIds: number[] = [];
        if (user?.entity?.state_id) {
          estadoIds.push(user.entity.state_id);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Erro ao carregar dados iniciais (cidades).");
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await api.get("/courses?all=1");
        const coursesRaw = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : coursesResponse.data?.data ?? [];
        const coursesData = coursesRaw.map((item: any) => ({
          ...item,
          number_of_hours_studied: item.number_of_hours_studied ?? 0
        }));
        setAllCourses(coursesData);
        setCoursesLoaded(true);

        const instructorsResponse = await api.get("/instructors?all=1");
        setAllInstructors(instructorsResponse.data);

        // REMOVIDO: busca de templates de documentos

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Erro ao carregar dados iniciais.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchEmployees = async () => {
      // Busca TODOS os funcionários, já que não filtramos mais por company_id
      const employeesResponse = await api.get(`/employees?all=1`);
      setCompanyEmployees(employeesResponse.data.map((item: any) => ({
        ...item,
        name: firstLetterUppercase(item.name),
      })));
    };
    fetchEmployees();
  }, [showEmployeeSelectionModal]); // Executa apenas uma vez

  useEffect(() => {
    if (coursesLoaded && !loadingCourses && allCourses.length === 0) {
      localStorage.setItem('welcomeAssistantStatus', '2');
    }
  }, [allCourses.length, coursesLoaded, loadingCourses]);

  useEffect(() => {
    const getTemplateFrames = async () => {
      try {
        const response = await api.get('/document-template-frames?all=1');
        const processed = await Promise.all(
          response.data.map(async (item: any) => {
            try {
              const imageResponse = await api.get(`/image?image=${item.frame}`, { responseType: 'blob' });
              return { ...item, frame: URL.createObjectURL(imageResponse.data) };
            } catch {
              return { ...item, frame: '' };
            }
          })
        );
        setCourseFrames(processed);
      } catch (error) {
        console.error('Erro ao buscar molduras:', error);
      }
    };
    getTemplateFrames();
  }, []);

  // Lógica de Manipulação de Dados
  const handleCourseSelect = (courseData: { value: number, label: string; number_of_hours_studied: number }) => {
    const fullCourse = allCourses.find(c => c.id === courseData.value);
    if (fullCourse) {
      setSelectedCourseFormData({
        course: fullCourse,
        periods: [{ startDate: null, endDate: null }],
        validityStart: todayStr,
        validityEnd: nextYearStr,
        hasValidity: true,
        isIndeterminate: false,
        requiresStudentSignature: fullCourse.requiresStudentSignature ?? false,
        selectedInstructorIds: [],
        issueDate: todayStr,
        selectedEmployeeIds: [],
        number_of_hours_studied: courseData.number_of_hours_studied,
        certificate_template: fullCourse.certificate_template?.latest_version?.template ?? '',
        frame_id: fullCourse.certificate_template?.frame_id ?? null,
      });
    } else {
      setSelectedCourseFormData(null);
    }
  };

  const updateCoursePeriod = (periodIndex: number, field: "startDate" | "endDate", value: string | null) => {
    if (!selectedCourseFormData) return;
    const periods = [...selectedCourseFormData.periods];
    periods[periodIndex] = { ...periods[periodIndex], [field]: value };
    setSelectedCourseFormData({ ...selectedCourseFormData, periods });
  };

  const addPeriod = () => {
    if (!selectedCourseFormData) return;
    setSelectedCourseFormData({ ...selectedCourseFormData, periods: [...selectedCourseFormData.periods, { startDate: null, endDate: null }] });
  };

  const removePeriod = (periodIndex: number) => {
    if (!selectedCourseFormData) return;
    const newPeriods = selectedCourseFormData.periods.filter((_, j) => j !== periodIndex);
    setSelectedCourseFormData({ ...selectedCourseFormData, periods: newPeriods });
  };

  const setValidity = (field: "validityStart" | "validityEnd", value: string | null) => {
    if (!selectedCourseFormData) return;
    setSelectedCourseFormData({ ...selectedCourseFormData, [field]: value });
  };

  const updateCourseConfig = (field: keyof CourseFormData, value: any) => {
    if (!selectedCourseFormData) return;
    setSelectedCourseFormData({ ...selectedCourseFormData, [field]: value });
  };

  const handleEmployeeSelectionInModal = (employeeId: number, isChecked: boolean) => {
    if (isChecked && availableCredits !== null) {
      if (currentCourseEmployeesInModal.length + 1 > availableCredits) {
        toast.error(`Você não tem créditos suficientes. Limite de ${availableCredits} certificados.`);
        return;
      }
    }
    setCurrentCourseEmployeesInModal(prev =>
      isChecked
        ? [...prev, employeeId]
        : prev.filter(id => id !== employeeId)
    );
  };

  const handleConfirmEmployeeSelection = () => {
    if (!selectedCourseFormData) return;
    if (availableCredits !== null && currentCourseEmployeesInModal.length > availableCredits) {
      Swal.fire({
        icon: 'warning',
        title: 'Limite de Certificados Excedido',
        text: `Você possui apenas ${availableCredits} certificados disponíveis, mas selecionou ${currentCourseEmployeesInModal.length} alunos.`,
        confirmButtonText: 'Ajustar Seleção',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    setSelectedCourseFormData({ ...selectedCourseFormData, selectedEmployeeIds: currentCourseEmployeesInModal });
    setShowEmployeeSelectionModal(false);
    setEmployeeSearchTerm("");
  };

  const handleOpenExistingEmployeesModal = () => {
    if (!selectedCourseFormData) {
      toast.error("Por favor, selecione um curso primeiro.");
      return;
    }
    // Não precisa de checagem de empresa, pois a lista é geral
    setCurrentCourseEmployeesInModal(selectedCourseFormData.selectedEmployeeIds);
    setShowEmployeeSelectionModal(true);
  };

  const handleSelectAllEmployees = () => {
    const allIds = filteredCompanyEmployees.map(emp => emp.id);
    if (availableCredits !== null && allIds.length > availableCredits) {
      toast.error(`A lista contém ${allIds.length} alunos, mas você possui apenas ${availableCredits} certificados disponíveis.`);
      setCurrentCourseEmployeesInModal(allIds.slice(0, availableCredits));
      return;
    }
    setCurrentCourseEmployeesInModal(allIds);
  };

  const handleRemoveAllEmployees = () => {
    setCurrentCourseEmployeesInModal([]);
  };

  const handleImportEmployees = (newEmployeeIds: number[]) => {
    if (!selectedCourseFormData) return;
    const currentIds = selectedCourseFormData.selectedEmployeeIds;
    const uniqueNewIds = newEmployeeIds.filter(id => !currentIds.includes(id));

    if (availableCredits !== null) {
      const totalFutureCount = currentIds.length + uniqueNewIds.length;
      if (totalFutureCount > availableCredits) {
        Swal.fire({
          icon: 'warning',
          title: 'Limite de Certificados Excedido',
          text: `Você tem apenas ${availableCredits} certificados disponíveis. Não é possível adicionar ${totalFutureCount} alunos.`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }
    }

    const updatedIds = [...new Set([...currentIds, ...newEmployeeIds])]; // Adiciona IDs únicos
    setSelectedCourseFormData({ ...selectedCourseFormData, selectedEmployeeIds: updatedIds });
  };

  const filteredCompanyEmployees = useMemo(() => companyEmployees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  ), [companyEmployees, employeeSearchTerm]);

  const filteredCourses = useMemo(() =>
    allCourses.filter(course =>
      course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
    ), [allCourses, courseSearchTerm]);

  const selectedCourseFrame = useMemo(() => {
    if (!selectedCourseFormData?.frame_id) return null;
    return courseFrames.find(f => f.id === selectedCourseFormData.frame_id) ?? null;
  }, [selectedCourseFormData?.frame_id, courseFrames]);

  // Paginação
  const totalPages = Math.ceil(filteredCompanyEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanyEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanyEmployees, currentPage, itemsPerPage]);


  // Resetar página ao abrir/fechar modal
  useEffect(() => {
    if (showEmployeeSelectionModal) {
      setCurrentPage(1);
      setEmployeeSearchTerm("");
    }
  }, [showEmployeeSelectionModal]);

  // Resetar página quando o filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [employeeSearchTerm]);

  // Validações dos Passos
  const isStep1Valid = useMemo(() => {
    return selectedCourseFormData !== null;
  }, [selectedCourseFormData]);

  const isStep2Valid = useMemo(() => {
    if (!selectedCourseFormData) return false;
    const { validityStart, validityEnd, periods, certificate_template, isIndeterminate } = selectedCourseFormData;
    const isPeriodsValid = periods.length > 0 && periods.every(p => p.startDate && p.endDate && new Date(p.endDate) >= new Date(p.startDate));

    let isValidityValid = true;
    if (!isIndeterminate) {
      isValidityValid = !!validityStart && !!validityEnd && new Date(validityEnd) >= new Date(validityStart);
    }

    // Validação de campos de máscara (opcionais no schema, mas exigidos se na máscara)
    const isCompanyNameValid = certificate_template.includes('{{nome_empresa}}') ? companyNameInput.length > 0 : true;
    const isCityNameValid = certificate_template.includes('{{cidade_de_realizacao}}') ? (cityNameInput?.length ?? 0) > 0 : true;
    const isCompanyRepresentativeValid = (certificate_template.includes('{{responsavel_empresarial}}') || certificate_template.includes('{responsavel_empresarial}')) ? companyRepresentativeInput.length > 0 : true;

    return isPeriodsValid && isValidityValid && isCompanyNameValid && isCityNameValid && isCompanyRepresentativeValid;
  }, [selectedCourseFormData, companyNameInput, cityNameInput, companyRepresentativeInput]);

  // isStep3Valid: Alunos e Data de Emissão são obrigatórios. Nome da empresa/cidade são opcionais.
  const isStep3Valid = useMemo(() => {
    if (!selectedCourseFormData) return false;
    // Validação de Alunos: IDs selecionados OU um nome preenchido manualmente
    const hasSelectedStudents = selectedCourseFormData.selectedEmployeeIds.length > 0;
    const hasManualStudent = manualStudent.name.trim().length > 0;

    if (!hasSelectedStudents && !hasManualStudent) return false;

    // Configurações de Emissão
    return selectedCourseFormData.issueDate !== null;
  }, [selectedCourseFormData, manualStudent.name]);

  const handleStep2Next = () => {
    if (!selectedCourseFormData) return;

    const { periods, validityStart, validityEnd, isIndeterminate } = selectedCourseFormData;

    // Validate Periods
    let hasPeriodError = false;
    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      if (!p.startDate || !p.endDate || new Date(p.endDate) < new Date(p.startDate)) {
        hasPeriodError = true;
      }
    }
    if (hasPeriodError) {
      setShowStep2Errors(true);
      return;
    }

    // Validate Validity if not indeterminate
    if (!isIndeterminate) {
      if (!validityStart || !validityEnd || new Date(validityEnd) < new Date(validityStart)) {
        setShowStep2Errors(true);
        return;
      }
    }

    // Validate Mask Fields
    const { certificate_template } = selectedCourseFormData;
    if (certificate_template.includes('{{nome_empresa}}') && !companyNameInput.trim()) {
      toast.warning("Por favor, preencha o nome da empresa.");
      setShowStep2Errors(true);
      setTimeout(() => {
        const compInput = document.getElementById('company-name-input');
        if (compInput) compInput.focus();
      }, 50);
      return;
    }
    if ((certificate_template.includes('{{responsavel_empresarial}}') || certificate_template.includes('{responsavel_empresarial}')) && !companyRepresentativeInput.trim()) {
      toast.warning("Por favor, preencha o responsável empresarial.");
      setShowStep2Errors(true);
      setTimeout(() => {
        const reprInput = document.getElementById('company-representative-input');
        if (reprInput) reprInput.focus();
      }, 50);
      return;
    }
    if (certificate_template.includes('{{cidade_de_realizacao}}') && !cityNameInput?.trim()) {
      toast.warning("Por favor, preencha a cidade de realização.");
      setShowStep2Errors(true);
      return;
    }

    setShowStep2Errors(false);
    setCurrentStep(3);
  };

  // Keyboard shortcut to advance to next step on Enter keypress in Step 2 if valid
  useEffect(() => {
    const handleEnterPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const isInteractiveElement = activeEl && (
          activeEl.tagName === 'BUTTON' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('role') === 'button'
        );

        if (currentStep === 2 && isStep2Valid && !isInteractiveElement) {
          e.preventDefault();
          handleStep2Next();
        }
      }
    };

    window.addEventListener('keydown', handleEnterPress);
    return () => {
      window.removeEventListener('keydown', handleEnterPress);
    };
  }, [currentStep, isStep2Valid]);

  // Submissão
  const handleSubmit = async () => {
    if (!selectedCourseFormData) return;

    if (manualStudent.name.trim()) {
      const hasCpfMask = selectedCourseFormData.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{cpf_aluno}}') || selectedCourseFormData.certificate_template.includes('{cpf_aluno}')) : true;
      const hasRgMask = selectedCourseFormData.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{rg_aluno}}') || selectedCourseFormData.certificate_template.includes('{rg_aluno}')) : true;
      const hasPositionMask = selectedCourseFormData.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{funcao_aluno}}') || selectedCourseFormData.certificate_template.includes('{funcao_aluno}')) : true;

      if (hasCpfMask && (!manualStudent.cpf || clearMask(manualStudent.cpf).length !== 11)) {
        toast.error("O campo CPF do aluno manual é obrigatório e deve conter 11 dígitos para este curso.");
        return;
      }
      if (hasRgMask && !manualStudent.rg?.trim()) {
        toast.error("O campo RG do aluno manual é obrigatório para este curso.");
        return;
      }
      if (hasPositionMask && !manualStudent.position?.trim()) {
        toast.error("O campo Função do aluno manual é obrigatório para este curso.");
        return;
      }
    }

    if (!isStep3Valid) {
      toast.error("Por favor, preencha todos os campos obrigatórios (Alunos e Data de Emissão).");
      return;
    }

    if (selectedCourseFormData.certificate_template.includes('{{cidade_de_realizacao}}') && !cityNameInput?.length) {
      toast.error("Por favor, preencha o campo de cidade cursada.");
      return;
    }

    setIsProcessing(true);

    try {
      let finalEmployeeIds = [...selectedCourseFormData.selectedEmployeeIds];

      // Se houver um aluno preenchido manualmente mas não adicionado (clicado no +), adiciona agora
      if (manualStudent.name.trim()) {
        try {
          const payloadBatch = {
            employees: [{
              ...manualStudent,
              cpf: manualStudent.cpf ? clearMask(manualStudent.cpf) : null,
              rg: manualStudent.rg ? clearMask(manualStudent.rg) : null,
              company_name: companyNameInput || null,
            }]
          };
          const response = await api.post('/employees/batch', payloadBatch);
          const newId = response.data[0].id;
          finalEmployeeIds.push(newId);

          // Limpa para evitar duplicidade ou confusão se ele voltar
          setManualStudent({ name: '', cpf: '', rg: '', email: '', position: '' });
        } catch (error) {
          console.error("Erro ao adicionar aluno manual na submissão:", error);
          toast.error("Erro ao salvar o aluno preenchido manualmente.");
          setIsProcessing(false);
          return;
        }
      }

      const payload = {
        // company_name: string|nullable
        company_name: companyNameInput || null,
        company_representative: companyRepresentativeInput || null,
        // city_id: ['nullable', 'exists:cities,id']
        city_name: cityNameInput || null,

        courses: [
          {
            course_id: selectedCourseFormData.course.id,
            number_of_hours_studied: selectedCourseFormData.number_of_hours_studied,
            have_employee_signature: !!selectedCourseFormData?.requiresStudentSignature,
            periods: selectedCourseFormData.periods.map(p => ({
              start_date: p.startDate,
              end_date: p.endDate,
            })),
            date_init_validate: !selectedCourseFormData.isIndeterminate ? selectedCourseFormData.validityStart : null,
            date_end_validate: !selectedCourseFormData.isIndeterminate ? selectedCourseFormData.validityEnd : null,
            issue_date: selectedCourseFormData.issueDate,
            // REMOVIDO: authorization_template_id, certificate_template_id, presence_list_template_id
            instructors: selectedCourseFormData.selectedInstructorIds.map(instructorId => ({ id: instructorId })),
            employees: finalEmployeeIds.map(employeeId => ({ id: employeeId })),
          }
        ]
      };

      window.dispatchEvent(new CustomEvent('certificate-generation-started'));

      api.post("/documents", payload).then(response => {
        window.dispatchEvent(new CustomEvent('credits-updated'));
        Swal.fire({
          icon: "success",
          title: 'Sucesso',
          text: "Solicitação registrada! Certificados sendo gerados. Deseja enviá-los por e-mail dos alunos?",
          showDenyButton: false,
          showCancelButton: true,
          cancelButtonText: "Agora não",
          showConfirmButton: true,
          confirmButtonText: '<i class="fa fa-envelope"></i> Enviar E-mails para alunos',
          confirmButtonColor: '#6c757d',
          cancelButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            api.post("/documents/send-email-batch", { presence_list_id: response.data.id })
              .then(emailResponse => {
                Swal.fire({
                  icon: "success",
                  title: 'E-mails enviados!',
                  text: "Os e-mails foram enviados com sucesso para os alunos com cadastro de e-mail.",
                  confirmButtonText: "Ok",
                }).then(() => {
                  navigate('/documents');
                });
              })
              .catch(error => {
                Swal.fire({
                  icon: "error",
                  title: 'Erro ao enviar e-mails',
                  text: "Não foi possível enviar os e-mails. Tente novamente mais tarde.",
                  confirmButtonText: "Ok",
                }).then(() => {
                  navigate('/documents');
                });
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate('/documents');
          }
        });
      })
        .catch(error => {
          console.error("Error generating certificates:", error.response?.data?.errors || error);
          toast.error("Erro ao Emitir certificados. Verifique os dados e tente novamente.");
        })
        .finally(() => {
          setIsProcessing(false);
        });
    } catch (error) {
      console.error("Error generating certificates:", error);
      toast.error("Erro ao Emitir certificados.");
    }
  };

  // Implementação de cadastro manual e importação (Ajustadas para company_name)
  const handleManualEntrySubmit = async (employees: Omit<Employee, 'id' | 'companyId'>[]) => {

    // Não precisamos checar selectedCompany, usamos o companyNameInput
    const companyName = companyNameInput || null;

    try {
      setIsProcessing(true);
      const payload = {
        employees: employees.map(emp => ({
          ...emp,
          cpf: clearMask(emp.cpf || ''),
          company_name: companyName, // Novo campo de nome da empresa
        }))
      };
      const response = await api.post('/employees/batch', payload);
      const newEmployees = response.data.map((emp: any) => ({
        ...emp,
        name: firstLetterUppercase(emp.name || ''),
      }));
      setCompanyEmployees(prev => [...newEmployees, ...prev]);
      const newEmployeeIds = newEmployees.map((emp: any) => emp.id);
      handleImportEmployees(newEmployeeIds);
      setShowManualEntryModal(false);
      toast.success("Alunos cadastrados com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar alunos manualmente:", error);
      toast.error("Erro ao cadastrar alunos.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportSuccess = (newEmployees: Employee[]) => {
    const formatted = newEmployees.map(emp => ({
      ...emp,
      name: firstLetterUppercase(emp.name || ''),
    }));
    setCompanyEmployees(prev => [...formatted, ...prev]);
    const newEmployeeIds = formatted.map(emp => emp.id);
    handleImportEmployees(newEmployeeIds);
    setShowImportModal(false);
    toast.success("Alunos adicionados com sucesso!");
  };

  const handleAddManualStudent = async () => {
    if (!selectedCourseFormData) return;

    if (availableCredits !== null) {
      const currentCount = selectedCourseFormData.selectedEmployeeIds.length;
      if (currentCount + 1 > availableCredits) {
        Swal.fire({
          icon: 'warning',
          title: 'Limite de Certificados Excedido',
          text: `Você tem apenas ${availableCredits} certificados disponíveis. Não é possível adicionar mais alunos.`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }
    }

    if (!manualStudent.name.trim()) {
      toast.error("Por favor, preencha pelo menos o nome do aluno.");
      return;
    }

    if (manualStudent.email && manualStudent.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualStudent.email.trim())) {
        toast.error("Por favor, insira um e-mail válido.");
        return;
      }
    }

    const hasCpfMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{cpf_aluno}}') || selectedCourseFormData.certificate_template.includes('{cpf_aluno}')) : true;
    const hasRgMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{rg_aluno}}') || selectedCourseFormData.certificate_template.includes('{rg_aluno}')) : true;
    const hasPositionMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{funcao_aluno}}') || selectedCourseFormData.certificate_template.includes('{funcao_aluno}')) : true;

    if (hasCpfMask && (!manualStudent.cpf || clearMask(manualStudent.cpf).length !== 11)) {
      toast.error("O campo CPF é obrigatório e deve conter 11 dígitos para este curso.");
      return;
    }
    if (hasRgMask && !manualStudent.rg?.trim()) {
      toast.error("O campo RG é obrigatório para este curso.");
      return;
    }
    if (hasPositionMask && !manualStudent.position?.trim()) {
      toast.error("O campo Função é obrigatório para este curso.");
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        employees: [{
          ...manualStudent,
          cpf: manualStudent.cpf ? clearMask(manualStudent.cpf) : null,
          rg: manualStudent.rg ? clearMask(manualStudent.rg) : null,
          company_name: companyNameInput || null,
        }]
      };
      const response = await api.post('/employees/batch', payload);
      const newId = response.data[0].id;

      // Atualiza a lista local de funcionários para garantir que o novo apareça no "Resumo" e nos cards
      const newEmp = { ...response.data[0], name: firstLetterUppercase(response.data[0].name) };
      setCompanyEmployees(prev => [newEmp, ...prev]);

      if (selectedCourseFormData.selectedEmployeeIds.includes(newId)) {
        toast.warning("Este aluno já foi adicionado à lista!");
      } else {
        handleImportEmployees([newId]);
        toast.success("Aluno adicionado!");
      }
      setManualStudent({ name: '', cpf: '', rg: '', email: '', position: '' });
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      toast.error("Erro ao adicionar aluno.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  };

  const handleImport = async () => {
    if (!importFiles.length) {
      toast.error("Erro: Arquivo não anexado.");
      return;
    }

    const file = importFiles[0].file;
    const fileName = file.name.toLowerCase();
    setIsImporting(true);

    // Função comum para enviar os dados (evita duplicação)
    const processAndSubmitData = async (parsedData: any[]) => {
      let dataToSubmit = [...parsedData];
      if (availableCredits !== null && selectedCourseFormData) {
        const currentCount = selectedCourseFormData.selectedEmployeeIds.length;
        const totalFutureCount = currentCount + dataToSubmit.length;
        if (totalFutureCount > availableCredits) {
          const maxToImport = availableCredits - currentCount;
          if (maxToImport <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Limite de Certificados Excedido',
              text: `Você já atingiu o limite de ${availableCredits} certificados (${currentCount} já adicionados). Não é possível adicionar novos alunos.`,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3b82f6'
            });
            setIsImporting(false);
            setImportFiles([]);
            return;
          }

          const result = await Swal.fire({
            icon: 'warning',
            title: 'Limite de Certificados Excedido',
            text: `Você tem apenas ${availableCredits} certificados disponíveis. Tentar importar mais ${dataToSubmit.length} aluno(s) excede o seu limite atual (${currentCount} já adicionados). Serão importados apenas os primeiros ${maxToImport} alunos da lista e os outros serão descartados.`,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6',
            allowOutsideClick: false
          });

          if (!result.isConfirmed) {
            setIsImporting(false);
            setImportFiles([]);
            return;
          }

          dataToSubmit = dataToSubmit.slice(0, maxToImport);
        }
      }
      const companyName = companyNameInput || null;

      const employees = dataToSubmit.map((row: any) => ({
        // Garante acesso às chaves em MAIÚSCULO (para compatibilidade entre CSV e Excel)
        name: row['NOME'],
        email: row['EMAIL'] || null,
        cpf: row['CPF'] ? clearMask(row['CPF']) : null,
        rg: row['RG'] ? clearMask(row['RG']) : null,
        cellphone: row['CELULAR'] || null,
        position: row['FUNCAO'] || null,
        machines_operated: row['MAQUINAS_OPERADAS'] || null,
        company_name: companyName,
      }));

      try {
        const response = await api.post('/employees/batch', { employees: employees });
        handleImportSuccess(response.data);
        Swal.fire({
          icon: response.data.length ? "success" : 'error',
          title: 'Sucesso',
          text: response.data.length ? "Alunos importados com sucesso!" : 'Verifique se o arquivo submetido está no formato correto e contém dados válidos.',
          confirmButtonText: "Ok",
        });
      } catch (e) {
        console.error("Erro ao importar alunos:", e);
        Swal.fire({
          icon: "error",
          title: 'Erro',
          text: "Ocorreu um erro ao processar a importação. Verifique os dados no arquivo.",
          confirmButtonText: "Ok",
        });
      } finally {
        setIsImporting(false);
        setShowImportModal(false);
        setImportFiles([]);
      }
    };

    // --- LÓGICA PARA EXCEL (.xlsx, .xls) ---
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Converte para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          // Normaliza as chaves para UPPERCASE (igual o transformHeader do PapaParse)
          const normalizedData = jsonData.map((row: any) => {
            const newRow: any = {};
            Object.keys(row).forEach(key => {
              newRow[key.toUpperCase().trim()] = row[key];
            });
            return newRow;
          });

          processAndSubmitData(normalizedData);
        } catch (error) {
          console.error("Erro ao ler Excel:", error);
          toast.error("Erro ao ler o arquivo Excel.");
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo.");
        setIsImporting(false);
      };

      reader.readAsBinaryString(file);
    }

    // --- LÓGICA PARA CSV ---
    else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toUpperCase().trim(),
        complete: (results) => {
          processAndSubmitData(results.data);
        },
        error: (error) => {
          console.error("Erro ao parsear CSV:", error);
          toast.error("Erro ao ler CSV.");
          setIsImporting(false);
        }
      });
    }
  };

  const handleDownloadExample = () => {
    const headers = 'NOME,CPF,RG,UFRG,EMAIL,FUNCAO';
    const requiredLine = '(OBRIGATORIO),(OPCIONAL),(OPCIONAL),(OPCIONAL),(OPCIONAL),(OPCIONAL)';
    const content = `${headers}\n${requiredLine}`;
    const fileName = 'layout_alunos.csv';

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const themeMode = isDark ? 'dark' : 'light';

  return (
    <div style={{
      width: '100%',
      padding: '0',
      fontFamily: "'Inter', sans-serif",
      color: themeMode === 'dark' ? '#f8fafc' : '#0f172a',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
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
          @keyframes circleSpinner {
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse-sidebar-step {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
              border-color: rgba(59, 130, 246, 0.4);
              background: ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.02)'};
            }
            50% {
              box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
              border-color: rgba(59, 130, 246, 0.8);
              background: ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)'};
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
              border-color: rgba(59, 130, 246, 0.4);
              background: ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.02)'};
            }
          }
          @keyframes pulse-badge {
            0% { transform: scale(0.92); opacity: 0.85; }
            100% { transform: scale(1.05); opacity: 1; }
          }
          .pulse-sidebar-step {
            animation: pulse-sidebar-step 1.8s infinite ease-in-out !important;
            opacity: 1 !important;
          }
          .pulse-cta:not(:disabled) {
            animation: pulse-next 2s infinite !important;
            transition: all 0.3s ease;
          }
          .pulse-success:not(:disabled) {
            animation: pulse-success 2s infinite !important;
            transition: all 0.3s ease;
          }
          .cg-custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .cg-custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 10px;
          }
          .cg-custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${themeMode === 'dark' ? '#3b82f6' : '#94a3b8'};
            border-radius: 10px;
          }
          .instructor-premium-card {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .instructor-premium-card:hover {
            transform: translateY(-2px);
          }
          .theme-dark-instructor-card:hover {
            box-shadow: 0 4px 20px rgba(168, 85, 247, 0.2) !important;
            border-color: rgba(168, 85, 247, 0.6) !important;
          }
          .theme-light-instructor-card:hover {
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1) !important;
            border-color: #a5b4fc !important;
          }
          .theme-dark-instructor-card .form-check-input {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
          .theme-dark-instructor-card .form-check-input:checked {
            background-color: #a855f7 !important;
            border-color: #a855f7 !important;
          }
          .theme-light-instructor-card .form-check-input:checked {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
        `}
      </style>

      <div style={{
        width: '100%',
        maxWidth: '1440px',
        background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: '32px',
        border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: themeMode === 'dark'
          ? '0 30px 70px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 30px 70px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
        minHeight: '720px',
        animation: 'fadeIn 0.5s ease-in-out'
      }}>
        {/* Left Column: Vertical Stepper Navigation */}
        <div style={{
          width: '300px',
          background: themeMode === 'dark' ? 'rgba(9, 13, 22, 0.25)' : 'rgba(0, 0, 0, 0.015)',
          borderRight: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '32px',
          flexShrink: 0
        }}>
          {/* Circular Badge Widget */}
          <div style={{ alignSelf: 'center', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#3b82f6',
              position: 'relative'
            }}>
              <FiAward />
              <div style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#3b82f6',
                borderBottomColor: '#a855f7',
                animation: 'circleSpinner 8s linear infinite',
                opacity: 0.7
              }} />
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: themeMode === 'dark' ? '#a855f7' : '#8b5cf6',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginTop: '16px'
            }}>
              Emitir Certificados
            </span>
          </div>

          {/* Navigation Steps */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 1, label: 'Seleção do Curso', icon: <FiBookOpen /> },
              { id: 2, label: 'Datas e Validade', icon: <FiCalendar /> },
              { id: 3, label: 'Adicionar Alunos', icon: <FiUsers /> }
            ].map(s => {
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;
              const isClickable = s.id === 1 || (s.id === 2 && isStep1Valid) || (s.id === 3 && isStep1Valid && isStep2Valid);
              const shouldPulse = (currentStep === 1 && s.id === 2 && isStep1Valid) ||
                (currentStep === 2 && s.id === 3 && isStep2Valid);

              return (
                <button
                  key={s.id}
                  disabled={!isClickable}
                  onClick={() => {
                    if (!isClickable) return;
                    if (s.id === 2 && selectedCourseFormData && selectedCourseFormData.selectedInstructorIds.length === 0) {
                      setShowInstructorModal(true);
                    } else {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={shouldPulse ? "pulse-sidebar-step" : ""}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: isActive
                      ? '1.5px solid #3b82f6'
                      : (shouldPulse ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid transparent'),
                    background: isActive
                      ? (themeMode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.95)')
                      : 'transparent',
                    boxShadow: isActive
                      ? '0 0 15px rgba(59, 130, 246, 0.25)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: isClickable ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    opacity: isClickable ? 1 : 0.45
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    color: isActive ? '#3b82f6' : (isCompleted ? '#10b981' : (shouldPulse ? '#3b82f6' : (themeMode === 'dark' ? '#cbd5e1' : '#64748b')))
                  }}>
                    {isCompleted ? <FaCheckCircle color="#10b981" /> : s.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isActive ? (themeMode === 'dark' ? '#ffffff' : '#0f172a') : (shouldPulse ? (themeMode === 'dark' ? '#60a5fa' : '#2563eb') : (themeMode === 'dark' ? '#cbd5e1' : '#475569'))
                      }}>
                        {s.label}
                      </span>

                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isCompleted ? '#10b981' : (isActive ? '#3b82f6' : (shouldPulse ? (themeMode === 'dark' ? '#c084fc' : '#7c3aed') : (themeMode === 'dark' ? '#64748b' : '#94a3b8')))
                    }}>
                      {isCompleted ? 'Preenchido' : (isActive ? 'Ativo' : (shouldPulse ? 'Pronto! Clique para preencher' : 'Aguardando'))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step Content Form & Actions */}
        <div style={{
          flex: 1,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: '320px',
          gap: '32px'
        }}>
          <div>
            {/* STEP 1: SELEÇÃO DO CURSO */}
            {currentStep === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ color: themeMode === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  Selecionar o Curso
                </h3>
                <p style={{ color: themeMode === 'dark' ? '#cbd5e1' : '#475569', fontSize: '15px', marginBottom: '32px' }}>
                  Selecione o curso para o qual deseja gerar os certificados abaixo.
                </p>

                <Row className="g-4">
                  {/* Left list */}
                  <Col md={5} style={{ borderRight: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)', paddingRight: '20px' }}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text style={{
                        background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                        border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                        borderRight: 'none',
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px'
                      }}>
                        <FaSearch style={{ color: themeMode === 'dark' ? '#6b7280' : '#94a3b8' }} />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Buscar curso..."
                        value={courseSearchTerm}
                        onChange={e => setCourseSearchTerm(e.target.value)}
                        style={{
                          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                          border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                          borderLeft: 'none',
                          borderTopRightRadius: '12px',
                          borderBottomRightRadius: '12px',
                          color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                          height: '46px'
                        }}
                      />
                    </InputGroup>

                    <div className="cg-custom-scrollbar" style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                      {filteredCourses.length === 0 ? (
                        <p className="text-muted text-center py-4" style={{ fontSize: 13 }}>
                          {loadingCourses ? 'Carregando cursos...' : 'Nenhum curso encontrado.'}
                        </p>
                      ) : (
                        filteredCourses.map(course => {
                          const isSelected = selectedCourseFormData?.course.id === course.id;
                          const courseFrame = courseFrames.find(f => f.id === course.certificate_template?.frame_id);

                          return (
                            <div
                              key={course.id}
                              onClick={() => handleCourseSelect({
                                value: course.id,
                                label: course.name,
                                number_of_hours_studied: course.number_of_hours_studied ?? 0,
                              })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                marginBottom: 8,
                                borderRadius: 12,
                                cursor: 'pointer',
                                background: isSelected
                                  ? (themeMode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : '#eff6ff')
                                  : 'transparent',
                                border: `1px solid ${isSelected ? '#3b82f6' : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9')}`,
                                borderLeft: `4px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              {/* Preview Mini */}
                              <div style={{
                                width: 70,
                                height: 48,
                                borderRadius: 6,
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                flexShrink: 0,
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden'
                              }}>
                                {courseFrame?.frame ? (
                                  <img
                                    src={courseFrame.frame}
                                    alt=""
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  <MdOutlineSchool size={20} style={{ color: '#cbd5e1' }} />
                                )}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontWeight: 800,
                                  fontSize: 15,
                                  color: isSelected ? (themeMode === 'dark' ? '#3b82f6' : '#1e40af') : (themeMode === 'dark' ? '#ffffff' : '#1e293b'),
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  lineHeight: 1.2
                                }}>
                                  {course.name}
                                </div>
                                {course.instructors?.[0] && (
                                  <div style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginTop: 2
                                  }}>
                                    {firstLetterUppercase(course.instructors[0].name)}
                                  </div>
                                )}
                              </div>

                              <div style={{
                                background: isSelected ? '#3b82f6' : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                                color: isSelected ? '#ffffff' : (themeMode === 'dark' ? '#9ca3af' : '#64748b'),
                                borderRadius: 8,
                                padding: '4px 8px',
                                fontSize: 12,
                                fontWeight: 800,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}>
                                {course.number_of_hours_studied ?? 0}h
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Col>

                  {/* Right Preview */}
                  <Col md={7} className="d-flex align-items-center justify-content-center ps-md-4">
                    {selectedCourseFormData ? (
                      <div style={{ width: '100%', maxWidth: 420 }}>
                        <div style={{
                          borderRadius: '20px',
                          overflow: 'hidden',
                          boxShadow: themeMode === 'dark' ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.06)',
                          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : '#ffffff',
                          border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'
                        }}>
                          {selectedCourseFrame?.frame ? (
                            <img
                              src={selectedCourseFrame.frame}
                              alt="Preview do Certificado"
                              style={{
                                width: '100%',
                                height: 220,
                                objectFit: selectedCourseFrame.is_top_only ? 'contain' : 'fill',
                                objectPosition: selectedCourseFrame.is_top_only ? 'top center' : 'center',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div style={{ height: 220, background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                              <MdOutlineSchool size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
                              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Preview da moldura não disponível</span>
                            </div>
                          )}
                          <div style={{ padding: '16px 20px', borderTop: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: themeMode === 'dark' ? '#ffffff' : '#1e293b', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedCourseFormData.course.name}
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
                              {selectedCourseFormData.course.instructors?.[0] && (
                                <span>Instrutor: {firstLetterUppercase(selectedCourseFormData.course.instructors[0].name)}</span>
                              )}
                              <span>{selectedCourseFormData.number_of_hours_studied}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: themeMode === 'dark' ? '#6b7280' : '#94a3b8', padding: '48px 24px' }}>
                        <MdOutlineSchool size={52} style={{ marginBottom: 12, opacity: 0.25 }} />
                        <p style={{ fontSize: 13, margin: 0 }}>Selecione um curso para ver o preview do certificado</p>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            )}

            {/* STEP 2: DATAS E VALIDADE */}
            {currentStep === 2 && selectedCourseFormData && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ color: themeMode === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  Datas e Validade
                </h3>
                <p style={{ color: themeMode === 'dark' ? '#cbd5e1' : '#475569', fontSize: '15px', marginBottom: '32px' }}>
                  Defina o período do curso e a validade deste certificado.
                </p>

                <Form>
                  {/* Validade */}
                  <div className="mb-4">
                    <h5 style={{ color: themeMode === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 800, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiCalendar style={{ color: '#3b82f6', strokeWidth: '3' }} /> Validade do Certificado
                    </h5>

                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: '12px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '4px' }}>
                            Data de Início da Validade
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="date"
                              disabled={selectedCourseFormData.isIndeterminate}
                              value={selectedCourseFormData.validityStart || ""}
                              onChange={e => setValidity("validityStart", e.target.value)}
                              isInvalid={!!(!selectedCourseFormData.isIndeterminate && ((showStep2Errors && !selectedCourseFormData.validityStart) || (selectedCourseFormData.validityStart && selectedCourseFormData.validityEnd && new Date(selectedCourseFormData.validityEnd) < new Date(selectedCourseFormData.validityStart))))}
                              style={{
                                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8',
                                borderRadius: '10px',
                                color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                height: '40px',
                                paddingLeft: '34px',
                                fontSize: '13px',
                                fontWeight: 700,
                                opacity: selectedCourseFormData.isIndeterminate ? 0.5 : 1
                              }}
                            />
                            <FaCalendarAlt className="position-absolute" style={{ left: 12, top: 12, color: '#94a3b8' }} />
                            <Form.Control.Feedback type="invalid">
                              {!selectedCourseFormData.validityStart ? "A data de início é obrigatória." : "A data de início não pode ser posterior ao término."}
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: '12px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '4px' }}>
                            Data de Término da Validade
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="date"
                              disabled={selectedCourseFormData.isIndeterminate}
                              value={selectedCourseFormData.validityEnd || ""}
                              onChange={e => setValidity("validityEnd", e.target.value)}
                              isInvalid={!!(!selectedCourseFormData.isIndeterminate && ((showStep2Errors && !selectedCourseFormData.validityEnd) || (selectedCourseFormData.validityStart && selectedCourseFormData.validityEnd && new Date(selectedCourseFormData.validityEnd) < new Date(selectedCourseFormData.validityStart))))}
                              style={{
                                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8',
                                borderRadius: '10px',
                                color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                height: '40px',
                                paddingLeft: '34px',
                                fontSize: '13px',
                                fontWeight: 700,
                                opacity: selectedCourseFormData.isIndeterminate ? 0.5 : 1
                              }}
                            />
                            <FaCalendarAlt className="position-absolute" style={{ left: 12, top: 12, color: '#94a3b8' }} />
                            <Form.Control.Feedback type="invalid">
                              {!selectedCourseFormData.validityEnd ? "A data de término é obrigatória." : "A data de término deve ser posterior ao início."}
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div
                      className={`validity-toggle-card ${selectedCourseFormData.isIndeterminate ? 'active' : ''}`}
                      style={{
                        padding: '16px 20px',
                        background: themeMode === 'dark'
                          ? (selectedCourseFormData.isIndeterminate ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)')
                          : (selectedCourseFormData.isIndeterminate ? '#eff6ff' : '#ffffff'),
                        border: `2px solid ${selectedCourseFormData.isIndeterminate ? '#2563eb' : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1')}`,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        const newIndeterminate = !selectedCourseFormData.isIndeterminate;
                        setSelectedCourseFormData({
                          ...selectedCourseFormData,
                          isIndeterminate: newIndeterminate,
                          validityStart: newIndeterminate ? null : (selectedCourseFormData.validityStart || todayStr),
                          validityEnd: newIndeterminate ? null : (selectedCourseFormData.validityEnd || nextYearStr)
                        });
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          border: `1px solid ${selectedCourseFormData.isIndeterminate ? '#2563eb' : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1')}`,
                          background: selectedCourseFormData.isIndeterminate ? '#2563eb' : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: selectedCourseFormData.isIndeterminate ? '#ffffff' : (themeMode === 'dark' ? '#94a3b8' : '#1e293b')
                        }}>
                          <FiCheckCircle size={20} />
                        </div>
                        <div>
                          <h6 style={{ margin: '0 0 2px 0', fontWeight: 800, fontSize: '15px', color: selectedCourseFormData.isIndeterminate ? '#2563eb' : (themeMode === 'dark' ? '#ffffff' : '#1e293b') }}>
                            Tempo Indeterminado
                          </h6>
                          <small style={{ fontSize: '12px', fontWeight: 600, color: selectedCourseFormData.isIndeterminate ? (themeMode === 'dark' ? '#cbd5e1' : '#1e40af') : (themeMode === 'dark' ? '#94a3b8' : '#475569') }}>
                            Marque se o certificado não tiver data de expiração
                          </small>
                        </div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="indeterminate-switch-generate"
                        className="custom-switch-premium"
                        checked={selectedCourseFormData.isIndeterminate}
                        onChange={() => { }}
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Complementary fields */}
                  {(selectedCourseFormData.certificate_template.includes('{{nome_empresa}}') ||
                    selectedCourseFormData.certificate_template.includes('{{cidade_de_realizacao}}') ||
                    selectedCourseFormData.certificate_template.includes('{{responsavel_empresarial}}') ||
                    selectedCourseFormData.certificate_template.includes('{responsavel_empresarial}')) && (
                      <div className="mb-4">
                        <h5 style={{ color: themeMode === 'dark' ? '#ffffff' : '#334155', fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MdBusiness style={{ color: '#0ea5e9' }} /> Informações Complementares
                        </h5>

                        <Row className="g-3">
                          {(() => {
                            const template = selectedCourseFormData.certificate_template;
                            const showCompany = template.includes('{{nome_empresa}}');
                            const showCity = template.includes('{{cidade_de_realizacao}}');
                            const showRep = template.includes('{{responsavel_empresarial}}') || template.includes('{responsavel_empresarial}');

                            let visibleCount = 0;
                            if (showCompany) visibleCount++;
                            if (showCity) visibleCount++;
                            if (showRep) visibleCount++;

                            const colSize = visibleCount === 3 ? 4 : (visibleCount === 2 ? 6 : 12);

                            return (
                              <>
                                {showCompany && (
                                  <Col md={colSize}>
                                    <Form.Group>
                                      <Form.Label style={{ fontSize: '13px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '6px' }}>
                                        Empresa (onde o aluno trabalha)
                                      </Form.Label>
                                      <Form.Control
                                        id="company-name-input"
                                        placeholder="Digite o nome da empresa do aluno"
                                        value={companyNameInput}
                                        onChange={e => {
                                          setCompanyNameInput(e.target.value);
                                          if (e.target.value.trim()) {
                                            setShowStep2Errors(false);
                                          }
                                        }}
                                        style={{
                                          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                          border: (showStep2Errors && !companyNameInput.trim())
                                            ? '2px solid #dc3545'
                                            : (themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8'),
                                          borderRadius: '12px',
                                          color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                          height: '46px',
                                          fontSize: '14px',
                                          fontWeight: 700
                                        }}
                                        isInvalid={showStep2Errors && !companyNameInput.trim()}
                                      />
                                      {showStep2Errors && !companyNameInput.trim() && (
                                        <Form.Control.Feedback type="invalid" style={{ display: 'block', fontSize: '11px', marginTop: '4px' }}>
                                          A empresa é obrigatória para este modelo de certificado.
                                        </Form.Control.Feedback>
                                      )}
                                    </Form.Group>
                                  </Col>
                                )}

                                {showRep && (
                                  <Col md={colSize}>
                                    <Form.Group>
                                      <Form.Label style={{ fontSize: '13px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '6px' }}>
                                        Responsável Empresarial
                                      </Form.Label>
                                      <Form.Control
                                        id="company-representative-input"
                                        placeholder="Nome do responsável da empresa"
                                        value={companyRepresentativeInput}
                                        onChange={e => {
                                          setCompanyRepresentativeInput(e.target.value);
                                          if (e.target.value.trim()) {
                                            setShowStep2Errors(false);
                                          }
                                        }}
                                        style={{
                                          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                          border: (showStep2Errors && !companyRepresentativeInput.trim())
                                            ? '2px solid #dc3545'
                                            : (themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8'),
                                          borderRadius: '12px',
                                          color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                          height: '46px',
                                          fontSize: '14px',
                                          fontWeight: 700
                                        }}
                                        isInvalid={showStep2Errors && !companyRepresentativeInput.trim()}
                                      />
                                      {showStep2Errors && !companyRepresentativeInput.trim() && (
                                        <Form.Control.Feedback type="invalid" style={{ display: 'block', fontSize: '11px', marginTop: '4px' }}>
                                          O responsável empresarial é obrigatório para este modelo de certificado.
                                        </Form.Control.Feedback>
                                      )}
                                    </Form.Group>
                                  </Col>
                                )}

                                {showCity && (
                                  <Col md={colSize}>
                                    <Form.Group>
                                      <Form.Label style={{ fontSize: '13px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '6px' }}>
                                        Cidade de Realização
                                      </Form.Label>
                                      <Form.Control
                                        placeholder="Ex: São Paulo - SP"
                                        value={cityNameInput || ""}
                                        onChange={e => setCityNameInput(e.target.value)}
                                        style={{
                                          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                          border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8',
                                          borderRadius: '12px',
                                          color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                          height: '46px',
                                          fontSize: '14px',
                                          fontWeight: 700
                                        }}
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

                  {/* Períodos */}
                  <div className="mb-2">
                    <h5 style={{ color: themeMode === 'dark' ? '#ffffff' : '#334155', fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiBookOpen style={{ color: '#ef4444' }} /> Períodos Cursados
                    </h5>

                    {selectedCourseFormData.periods.map((p, pidx) => {
                      const duration = getDurationDays(p.startDate, p.endDate);
                      return (
                        <div key={pidx} style={{
                          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                          borderRadius: '14px',
                          border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid #e2e8f0',
                          padding: '16px',
                          marginBottom: '12px'
                        }}>
                          <Row className="g-3 align-items-end">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label style={{ fontSize: '12px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '4px' }}>Data de Início</Form.Label>
                                <div className="position-relative">
                                  <Form.Control
                                    type="date"
                                    value={p.startDate || ""}
                                    onChange={e => updateCoursePeriod(pidx, "startDate", e.target.value)}
                                    isInvalid={!!((showStep2Errors && !p.startDate) || (p.startDate && p.endDate && new Date(p.endDate) < new Date(p.startDate)))}
                                    style={{
                                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8',
                                      borderRadius: '8px',
                                      color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                      height: '38px',
                                      paddingLeft: '32px',
                                      fontSize: '12px',
                                      fontWeight: 700
                                    }}
                                  />
                                  <FaCalendarAlt className="position-absolute" style={{ left: 10, top: 11, color: '#94a3b8' }} />
                                </div>
                              </Form.Group>
                            </Col>

                            <Col md={4}>
                              <Form.Group>
                                <Form.Label style={{ fontSize: '12px', fontWeight: 800, color: themeMode === 'dark' ? '#cbd5e1' : '#1e293b', marginBottom: '4px' }}>Data de Término</Form.Label>
                                <div className="position-relative">
                                  <Form.Control
                                    type="date"
                                    value={p.endDate || ""}
                                    onChange={e => updateCoursePeriod(pidx, "endDate", e.target.value)}
                                    isInvalid={!!((showStep2Errors && !p.endDate) || (p.startDate && p.endDate && new Date(p.endDate) < new Date(p.startDate)))}
                                    style={{
                                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #94a3b8',
                                      borderRadius: '8px',
                                      color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                      height: '38px',
                                      paddingLeft: '32px',
                                      fontSize: '12px',
                                      fontWeight: 700
                                    }}
                                  />
                                  <FaCalendarAlt className="position-absolute" style={{ left: 10, top: 11, color: '#94a3b8' }} />
                                </div>
                              </Form.Group>
                            </Col>

                            <Col md={3} className="text-center">
                              {duration !== null && (
                                duration === -1 ? (
                                  <div style={{ background: themeMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', color: themeMode === 'dark' ? '#ef4444' : '#b91c1c', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'inline-block' }}>
                                    Data inválida
                                  </div>
                                ) : (
                                  <div style={{ background: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#dcfce7', color: themeMode === 'dark' ? '#10b981' : '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'inline-block' }}>
                                    {formatFriendlyDuration(duration)}
                                  </div>
                                )
                              )}
                            </Col>

                            <Col md={1} className="text-end">
                              {selectedCourseFormData.periods.length > 1 && (
                                <Button
                                  variant="link"
                                  className="p-2 text-danger"
                                  onClick={() => removePeriod(pidx)}
                                  style={{ background: themeMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', borderRadius: '8px', border: 'none' }}
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              )}
                            </Col>
                          </Row>
                        </div>
                      );
                    })}

                    <Button
                      variant="outline-primary"
                      className="w-100 py-2 border-dashed d-flex align-items-center justify-content-center"
                      onClick={addPeriod}
                      style={{
                        borderRadius: '12px',
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        fontWeight: 600,
                        gap: '8px',
                        color: '#3b82f6',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        background: 'transparent'
                      }}
                    >
                      <FiPlusCircle size={18} /> Adicionar novo período
                    </Button>
                  </div>
                </Form>
              </div>
            )}

            {/* STEP 3: ADICIONAR ALUNOS */}
            {currentStep === 3 && selectedCourseFormData && (() => {
              const currentSelectedCount = selectedCourseFormData.selectedEmployeeIds.length;
              const isLimitReached = availableCredits !== null && currentSelectedCount >= availableCredits;

              return (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
                    <div>
                      <h3 style={{ color: themeMode === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Adicionar Alunos
                      </h3>
                      <p style={{ color: themeMode === 'dark' ? '#cbd5e1' : '#475569', fontSize: '15px', margin: 0 }}>
                        Anexe a planilha com os alunos ou cadastre-os manualmente abaixo.
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2 px-3 py-2" style={{
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      borderRadius: '12px',
                      border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                    }}>
                      <FiCalendar style={{ color: '#3b82f6' }} />
                      <span className="small fw-bold text-secondary me-2" style={{ fontSize: '12px' }}>Data de Emissão:</span>
                      <Form.Control
                        type="date"
                        value={selectedCourseFormData.issueDate || ""}
                        onChange={e => updateCourseConfig("issueDate", e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: 0, width: 110, fontSize: '13px', fontWeight: 600, color: themeMode === 'dark' ? '#ffffff' : '#1e293b' }}
                      />
                    </div>
                  </div>


                  {!isLimitReached && (
                    <>
                      {/* Import Box */}
                      <div style={{
                        border: themeMode === 'dark' ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed #cbd5e1',
                        borderRadius: '16px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        background: themeMode === 'dark' ? 'rgba(255,255,255,0.01)' : '#f8fafc',
                        marginBottom: '24px'
                      }}>
                        <FilePond
                          disabled={isLimitReached}
                          files={importFiles}
                          allowMultiple={false}
                          onupdatefiles={setImportFiles}
                          labelIdle={isLimitReached
                            ? `<div class="d-flex flex-column align-items-center"><span style="font-size: 15px; font-weight: 700; color: #ef4444; margin-bottom: 4px;">Limite de Certificados Atingido</span><span style="color: #64748b; font-size: 12px; display: block;">Você já selecionou o número máximo de alunos permitido pelo seu saldo de créditos.</span></div>`
                            : `<div class="d-flex flex-column align-items-center"><svg width="32" height="32" class="mb-2" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span style="font-size: 15px; font-weight: 700; color: ${themeMode === 'dark' ? '#ffffff' : '#1e293b'}; margin-bottom: 4px;">Arraste sua planilha CSV aqui</span><span style="color: #64748b; font-size: 12px; display: block;">ou clique para selecionar</span></div>`
                          }
                        />

                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-3">
                          <div
                            className="small fw-bold cursor-pointer d-inline-flex align-items-center gap-2"
                            onClick={isLimitReached ? undefined : handleDownloadExample}
                            style={{
                              cursor: isLimitReached ? 'not-allowed' : 'pointer',
                              padding: '8px 16px',
                              background: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                              color: isLimitReached ? '#64748b' : '#3b82f6',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              opacity: isLimitReached ? 0.6 : 1
                            }}
                          >
                            <FaPlus size={10} /> Baixar modelo de planilha CSV
                          </div>

                          {importFiles.length > 0 && (
                            <Button variant="primary" className="px-4 py-2" onClick={handleImport} disabled={isImporting || isLimitReached} style={{ borderRadius: '10px', fontWeight: 600 }}>
                              {isProcessing ? <><Spinner size="sm" className="me-2" />Processando...</> : "Confirmar Importação"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Divisor */}
                      <div className="position-relative text-center my-4">
                        <hr style={{ borderTop: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1.5px solid #e2e8f0', margin: 0 }} />
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: themeMode === 'dark' ? '#181c2f' : '#ffffff',
                          padding: '0 15px',
                          color: '#6b7280',
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          OU ADICIONE MANUALMENTE
                        </span>
                      </div>

                      {/* Manual entry */}
                      {(() => {
                        const hasCpfMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{cpf_aluno}}') || selectedCourseFormData.certificate_template.includes('{cpf_aluno}')) : true;
                        const hasRgMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{rg_aluno}}') || selectedCourseFormData.certificate_template.includes('{rg_aluno}')) : true;
                        const hasPositionMask = selectedCourseFormData?.certificate_template ? (selectedCourseFormData.certificate_template.includes('{{funcao_aluno}}') || selectedCourseFormData.certificate_template.includes('{funcao_aluno}')) : true;

                        let visibleCount = 2; // Nome and Email are always visible
                        if (hasCpfMask) visibleCount++;
                        if (hasRgMask) visibleCount++;
                        if (hasPositionMask) visibleCount++;

                        let nameColSize = 3;
                        let emailColSize = 3;
                        let cpfColSize = 2;
                        let rgColSize = 2;
                        let positionColSize = 2;

                        if (visibleCount === 5) {
                          nameColSize = 2;
                          cpfColSize = 2;
                          rgColSize = 2;
                          positionColSize = 2;
                          emailColSize = 3;
                        } else if (visibleCount === 4) {
                          // Two optional fields are visible
                          nameColSize = 3;
                          emailColSize = 3;
                          if (hasCpfMask && hasRgMask) {
                            cpfColSize = 3;
                            rgColSize = 2;
                          } else if (hasCpfMask && hasPositionMask) {
                            cpfColSize = 3;
                            positionColSize = 2;
                          } else if (hasRgMask && hasPositionMask) {
                            rgColSize = 3;
                            positionColSize = 2;
                          }
                        } else if (visibleCount === 3) {
                          // Only one optional field is visible
                          nameColSize = 4;
                          emailColSize = 4;
                          if (hasCpfMask) cpfColSize = 3;
                          if (hasRgMask) rgColSize = 3;
                          if (hasPositionMask) positionColSize = 3;
                        } else {
                          // No optional fields are visible
                          nameColSize = 6;
                          emailColSize = 5;
                        }

                        return (
                          <Row className="g-2 mb-4 align-items-end">
                            <Col md={nameColSize}>
                              <Form.Group>
                                <Form.Label style={{ fontSize: '11px', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>Nome</Form.Label>
                                <Form.Control
                                  ref={nameInputRef}
                                  placeholder={isLimitReached ? "Limite atingido" : "Carlos Silva"}
                                  disabled={isLimitReached}
                                  value={manualStudent.name}
                                  onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      emailInputRef.current?.focus();
                                    }
                                  }}
                                  style={{
                                    background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                    border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                    borderRadius: '10px',
                                    color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                    height: '42px'
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <If condition={hasCpfMask}>
                              <Col md={cpfColSize}>
                                <Form.Group>
                                  <Form.Label style={{ fontSize: '11px', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>CPF <span className="text-danger fw-bold">(Obrigatório)</span></Form.Label>
                                  <Form.Control
                                    placeholder="123.456.789-00"
                                    disabled={isLimitReached}
                                    value={manualStudent.cpf}
                                    onChange={e => {
                                      let value = e.target.value.replace(/\D/g, "");
                                      if (value.length > 11) value = value.slice(0, 11);
                                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                      setManualStudent({ ...manualStudent, cpf: value });
                                    }}
                                    style={{
                                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                      borderRadius: '10px',
                                      color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                      height: '42px'
                                    }}
                                  />
                                </Form.Group>
                              </Col>
                            </If>

                            <If condition={hasRgMask}>
                              <Col md={rgColSize}>
                                <Form.Group>
                                  <Form.Label style={{ fontSize: '11px', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>RG <span className="text-danger fw-bold">(Obrigatório)</span></Form.Label>
                                  <Form.Control
                                    placeholder="00.000.000-0"
                                    disabled={isLimitReached}
                                    value={manualStudent.rg}
                                    onChange={e => {
                                      setManualStudent({ ...manualStudent, rg: applyMask(e.target.value, '99.999.999-9') });
                                    }}
                                    style={{
                                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                      borderRadius: '10px',
                                      color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                      height: '42px'
                                    }}
                                  />
                                </Form.Group>
                              </Col>
                            </If>

                            <If condition={hasPositionMask}>
                              <Col md={positionColSize}>
                                <Form.Group>
                                  <Form.Label style={{ fontSize: '11px', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>Função <span className="text-danger fw-bold">(Obrigatório)</span></Form.Label>
                                  <Form.Control
                                    placeholder="Eletricista, Operador"
                                    disabled={isLimitReached}
                                    value={manualStudent.position}
                                    onChange={e => setManualStudent({ ...manualStudent, position: e.target.value })}
                                    style={{
                                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                      borderRadius: '10px',
                                      color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                      height: '42px'
                                    }}
                                  />
                                </Form.Group>
                              </Col>
                            </If>

                            <Col md={emailColSize}>
                              <Form.Group>
                                <Form.Label style={{ fontSize: '11px', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>Email</Form.Label>
                                <Form.Control
                                  ref={emailInputRef}
                                  placeholder="carlos@email.com"
                                  disabled={isLimitReached}
                                  value={manualStudent.email}
                                  onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddManualStudent();
                                    }
                                  }}
                                  style={{
                                    background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                    border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                                    borderRadius: '10px',
                                    color: themeMode === 'dark' ? '#ffffff' : '#0f172a',
                                    height: '42px'
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col md={1}>
                              <Button
                                onClick={handleAddManualStudent}
                                disabled={isLimitReached}
                                style={{
                                  height: '42px',
                                  width: '100%',
                                  borderRadius: '10px',
                                  background: isLimitReached ? '#94a3b8' : '#3b82f6',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FaPlus color="#fff" size={16} />
                              </Button>
                            </Col>
                          </Row>
                        );
                      })()}
                    </>
                  )}

                  {isLimitReached && (
                    <div className="p-3 mb-4 d-flex align-items-center gap-3" style={{
                      background: themeMode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
                      border: '1px solid #ef4444',
                      borderRadius: '12px',
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        flexShrink: 0
                      }}>
                        <FiAlertTriangle size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ fontSize: '14px', fontWeight: 700, color: themeMode === 'dark' ? '#fca5a5' : '#991b1b', margin: '0 0 4px 0' }}>
                          Limite de Certificados Atingido ({currentSelectedCount} / {availableCredits})
                        </h6>
                        <p style={{ fontSize: '12px', color: themeMode === 'dark' ? '#cbd5e1' : '#7f1d1d', margin: 0 }}>
                          Você selecionou o número máximo de alunos permitido pelo seu saldo de créditos disponível ({availableCredits} certificados). Para emitir mais certificados, remova alunos da lista ou compre créditos adicionais.
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => navigate('/checkout?mode=credits&package=avulso')}
                        style={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Adquirir créditos
                      </Button>
                    </div>
                  )}


                  {/* Added students grid */}
                  <div style={{ marginTop: '24px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 style={{ color: themeMode === 'dark' ? '#ffffff' : '#1e293b', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                        Alunos adicionados
                      </h5>
                      <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px' }}>
                        {selectedCourseFormData.selectedEmployeeIds.length + (manualStudent.name.trim() && !isLimitReached ? 1 : 0)} alunos
                      </span>
                    </div>

                    <Row className="g-3 cg-custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {selectedCourseFormData.selectedEmployeeIds.length === 0 && (!manualStudent.name.trim() || isLimitReached) ? (
                        <Col xs={12}>
                          <div className="text-center py-4" style={{ background: themeMode === 'dark' ? 'rgba(255,255,255,0.01)' : '#f8fafc', borderRadius: '12px', border: themeMode === 'dark' ? '1px dashed rgba(255,255,255,0.06)' : '1px dashed #e2e8f0' }}>
                            <MdGroups size={36} className="text-muted opacity-25 mb-2" />
                            <p className="text-muted m-0" style={{ fontSize: '12px' }}>Nenhum aluno adicionado ainda.</p>
                          </div>
                        </Col>
                      ) : (
                        <>
                          {manualStudent.name.trim() && !isLimitReached && (
                            <Col md={4}>
                              <div className="p-2 position-relative" style={{
                                background: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : '#f0f9ff',
                                borderRadius: '10px',
                                border: `1.2px solid ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#bae6fd'}`
                              }}>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '11px'
                                  }}>
                                    {getInitials(manualStudent.name)}
                                  </div>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div className="fw-bold text-truncate" style={{ fontSize: '12px', color: themeMode === 'dark' ? '#ffffff' : '#0f172a' }}>{manualStudent.name}</div>
                                    <span style={{ fontSize: '9px', color: '#f59e0b' }}>Aguardando...</span>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          )}

                          {selectedCourseFormData.selectedEmployeeIds.map(id => {
                            const employee = companyEmployees.find(e => e.id === id);
                            if (!employee) return null;
                            return (
                              <Col key={id} md={4}>
                                <div className="p-2 position-relative" style={{
                                  background: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
                                  borderRadius: '10px',
                                  border: `1.2px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`
                                }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      background: '#3b82f6',
                                      color: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 700,
                                      fontSize: '11px',
                                      flexShrink: 0
                                    }}>
                                      {getInitials(employee.name)}
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                      <div className="fw-bold text-truncate" style={{ fontSize: '12px', color: themeMode === 'dark' ? '#ffffff' : '#0f172a' }}>{employee.name}</div>
                                      <div style={{ fontSize: '10px', color: '#6b7280' }} className="text-truncate">{employee.cpf || ''}</div>
                                    </div>
                                  </div>
                                  <button
                                    className="btn btn-link p-0 position-absolute"
                                    style={{ top: 8, right: 8, color: '#94a3b8' }}
                                    onClick={() => updateCourseConfig("selectedEmployeeIds", selectedCourseFormData.selectedEmployeeIds.filter(eid => eid !== id))}
                                  >
                                    <FaTimes size={12} />
                                  </button>
                                </div>
                              </Col>
                            );
                          })}
                        </>
                      )}
                    </Row>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* CAPSULE ACTIONS FOOTER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
            paddingTop: '20px',
            marginTop: '12px'
          }}>
            {currentStep > 1 ? (
              <Button
                variant="link"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '30px',
                  border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                  color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                  background: 'transparent',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaArrowLeft size={12} /> Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                variant="primary"
                className={isStep1Valid ? "pulse-cta" : ""}
                disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
                onClick={() => {
                  if (currentStep === 1) {
                    setShowInstructorModal(true);
                  } else {
                    handleStep2Next();
                  }
                }}
                style={{
                  padding: '10px 28px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Próximo <FaArrowRight size={12} />
              </Button>
            ) : (
              <Button
                variant="success"
                className={isStep3Valid && availableCredits !== 0 ? "pulse-success" : ""}
                disabled={isProcessing || !isStep3Valid || availableCredits === 0}
                onClick={handleSubmit}
                style={{
                  padding: '10px 32px',
                  borderRadius: '30px',
                  background: availableCredits === 0 ? '#6c757d' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  boxShadow: availableCredits === 0 ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaCheckCircle size={14} /> {availableCredits === 0 ? "Saldo Insuficiente (0)" : (isProcessing ? "Emitindo..." : "Emitir Certificados")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Selection Modal (Existing functionality) */}
      <Modal show={showEmployeeSelectionModal} onHide={() => setShowEmployeeSelectionModal(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Selecionar Alunos ({filteredCompanyEmployees.length} encontrados)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Buscar aluno por nome"
              value={employeeSearchTerm}
              onChange={e => setEmployeeSearchTerm(e.target.value)}
            />
          </InputGroup>

          <div className="d-flex justify-content-between mb-3">
            <Button variant="outline-primary" size="sm" onClick={handleSelectAllEmployees}>
              Selecionar todos ({filteredCompanyEmployees.length})
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleRemoveAllEmployees}>
              Remover todos
            </Button>
          </div>

          <div className="employee-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map(employee => (
                <Form.Check
                  key={employee.id}
                  type="checkbox"
                  id={`employee-${employee.id}`}
                  label={employee.name}
                  checked={currentCourseEmployeesInModal.includes(employee.id)}
                  onChange={e => handleEmployeeSelectionInModal(employee.id, e.target.checked)}
                  className="mb-2"
                />
              ))
            ) : (
              <p className="text-muted text-center">Nenhum aluno encontrado.</p>
            )}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <span>Página {currentPage} de {totalPages}</span>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmployeeSelectionModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmEmployeeSelection}>
            Confirmar Seleção ({currentCourseEmployeesInModal.length})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Employees Modal (Integrated) */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Importar Alunos</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            <b>Baixe o layout de exemplo, clicando </b>
            <b
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={handleDownloadExample}
            >
              aqui
            </b>
          </p>
          <Form>
            <div className="mb-3">
              <FilePond
                files={importFiles}
                allowMultiple={false}
                onupdatefiles={setImportFiles}
                labelIdle='Arraste e solte o arquivo CSV ou <span class="filepond--label-action">clique aqui</span>'
              />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)} disabled={isImporting}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={!importFiles.length || isImporting}>
            {(isImporting ? <><Spinner size="sm" animation="border" /> Estamos processando, por favor aguarde...</> : 'Importar')}
          </Button>
        </Modal.Footer>
      </Modal>

      <ManualEntryModal
        selectedCourseTemplate={selectedCourseFormData?.certificate_template}
        showPosition={selectedCourseFormData?.certificate_template?.includes('{{funcao_aluno}}') || selectedCourseFormData?.certificate_template?.includes('{funcao_aluno}')}
        show={showManualEntryModal}
        onClose={() => setShowManualEntryModal(false)}
        onSubmit={handleManualEntrySubmit}
        companyName={companyNameInput} // Passando o nome da empresa em texto
      />

      {/* Instructor Selection Modal */}
      <Modal
        show={showInstructorModal}
        onHide={() => setShowInstructorModal(false)}
        centered
        contentClassName={themeMode === 'dark' ? 'border-0' : ''}
      >
        <Modal.Header
          closeButton
          closeVariant={themeMode === 'dark' ? 'white' : undefined}
          style={{
            borderBottom: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
            background: themeMode === 'dark' ? '#181c2f' : '#ffffff',
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
          }}
        >
          <Modal.Title style={{ fontWeight: 800, fontSize: 18 }}>Selecionar Instrutores</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="py-3 px-4"
          style={{
            background: themeMode === 'dark' ? '#181c2f' : '#ffffff',
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
          }}
        >
          <p
            className={themeMode === 'dark' ? 'text-light mb-3' : 'text-muted mb-3'}
            style={{ fontSize: 13, color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280' }}
          >
            Selecione os instrutores responsáveis pelo curso:
          </p>
          {allInstructors.length === 0 ? (
            <div>
              <p className="text-danger mb-2">Nenhum instrutor cadastrado.</p>
              <Button variant="outline-primary" size="sm" onClick={() => { setShowInstructorModal(false); navigate('/instructors/create'); }}>
                <FaPlus className="me-1" /> Cadastrar Novo Instrutor
              </Button>
            </div>
          ) : (
            <>
              {allInstructors.map(instructor => {
                const isChecked = selectedCourseFormData?.selectedInstructorIds.includes(instructor.id) ?? false;
                return (
                  <div
                    key={instructor.id}
                    className={`instructor-premium-card ${themeMode === 'dark' ? 'theme-dark-instructor-card' : 'theme-light-instructor-card'}`}
                    style={{
                      padding: '12px 16px',
                      marginBottom: 10,
                      borderRadius: '12px',
                      background: themeMode === 'dark'
                        ? (isChecked
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
                          : 'rgba(255, 255, 255, 0.03)')
                        : (isChecked
                          ? 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)'
                          : '#f8fafc'),
                      border: `1px solid ${themeMode === 'dark'
                        ? (isChecked ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.08)')
                        : (isChecked ? '#c7d2fe' : '#e2e8f0')
                        }`,
                      boxShadow: isChecked
                        ? (themeMode === 'dark'
                          ? '0 0 12px rgba(168, 85, 247, 0.15)'
                          : '0 2px 8px rgba(99, 102, 241, 0.08)')
                        : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (!selectedCourseFormData) return;
                      const newSelected = isChecked
                        ? selectedCourseFormData.selectedInstructorIds.filter(id => id !== instructor.id)
                        : [...selectedCourseFormData.selectedInstructorIds, instructor.id];
                      updateCourseConfig("selectedInstructorIds", newSelected);
                    }}
                  >
                    <Form.Check
                      type="checkbox"
                      id={`instructor_modal_${instructor.id}`}
                      checked={isChecked}
                      onChange={() => { }}
                      style={{ pointerEvents: 'none' }}
                      label={
                        <span>
                          <span style={{
                            fontWeight: 700,
                            color: isChecked
                              ? (themeMode === 'dark' ? '#60a5fa' : '#1d4ed8')
                              : (themeMode === 'dark' ? '#cbd5e1' : '#1e293b')
                          }}>
                            {firstLetterUppercase(instructor.name)}
                          </span>
                          {instructor.title && (
                            <span style={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b', marginLeft: 6, fontSize: 13 }}>— {instructor.title}</span>
                          )}
                        </span>
                      }
                    />
                  </div>
                );
              })}
              {(selectedCourseFormData?.selectedInstructorIds.length ?? 0) === 0 && (
                <p className="text-danger mt-2 mb-0" style={{ fontSize: 12 }}>Selecione ao menos um instrutor para continuar.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Header
          style={{
            display: 'none' // Hidden header to balance styling, standard footer border below
          }}
        />
        <Modal.Footer
          style={{
            borderTop: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
            background: themeMode === 'dark' ? '#181c2f' : '#ffffff'
          }}
        >
          <Button
            variant="light"
            onClick={() => setShowInstructorModal(false)}
            style={themeMode === 'dark' ? {
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '6px 18px',
              fontWeight: 600
            } : {
              borderRadius: '20px',
              padding: '6px 18px',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!selectedCourseFormData || selectedCourseFormData.selectedInstructorIds.length === 0}
            onClick={() => {
              setShowInstructorModal(false);
              setCurrentStep(2);
            }}
            style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 20px',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)'
            }}
          >
            Confirmar e Avançar <IoIosArrowForward className="ms-1" />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Processing Modal */}
      <Modal show={isProcessing} onHide={() => { }} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Processando...</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Os certificados estão sendo processados, por favor aguarde...</p>
        </Modal.Body>
      </Modal>

      {/* Paywall Limit Modal */}
      <Modal show={showPaywallModal} onHide={() => navigate('/dashboard')} centered backdrop="static" keyboard={false}>
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
              style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', border: 'none' }}
              onClick={() => window.location.href = '/checkout?mode=credits&package=avulso'}
            >
              Comprar Créditos / Upgrade <FaArrowRight className="ms-1" />
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

      <ToastContainer />
    </div>
  );
};

export default CertificateGeneration;
