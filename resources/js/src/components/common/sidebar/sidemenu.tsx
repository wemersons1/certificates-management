import {
	FiPieChart, FiUsers, FiBriefcase, FiFileText,
	FiBookOpen, FiAward, FiSettings, FiMail,
	FiLayers, FiCheckSquare, FiClock, FiCalendar,
	FiDollarSign
} from 'react-icons/fi';

const iconDashboard = <FiPieChart />;
const iconUsers = <FiUsers />;
const iconCompany = <FiBriefcase />;
const iconDocuments = <FiFileText />;
const iconEmployees = <FiUsers />;
const iconPartner = <FiBriefcase />;
const iconinstructors = <FiUsers />;
const iconCourses = <FiBookOpen />;
const iconPositions = <FiSettings />;
const iconTemplates = <FiFileText />;
const iconNotificationsEmail = <FiMail />;
const iconPlans = <FiLayers />;
const iconTerms = <FiCheckSquare />;
const iconStudents = <FiUsers />;
const iconSentEmails = <FiMail />;
const iconAuditLogs = <FiClock />;
const iconEvents = <FiCalendar />;
const iconCertificates = <FiAward />;
const iconCreditPackages = <FiDollarSign />;

const getMenuItemsMaster = () => [
	{ path: `/dashboard`, icon: iconDashboard, type: "link", active: false, selected: false, dirchange: false, title: "Resumo" },
	{ path: `/entities`, icon: iconPartner, type: "link", active: false, selected: false, dirchange: false, title: "Entidades" },
	{ path: `/courses`, icon: iconCourses, type: "link", active: false, selected: false, dirchange: false, title: "Cursos", name: "Courses" },
	{ path: `/courses/cadastrar`, icon: iconCourses, type: "link", active: false, selected: false, dirchange: false, title: "Cadastro de Curso" },
	{ path: `/plans`, icon: iconPlans, type: "link", active: false, selected: false, dirchange: false, title: "Planos" },
	{ path: `/credit-packages`, icon: iconCreditPackages, type: "link", active: false, selected: false, dirchange: false, title: "Preços de Crédito" },
	{ path: `/terms-and-conditions`, icon: iconTerms, type: "link", active: false, selected: false, dirchange: false, title: "Termos e condições" },
	//{ path: `/events`, icon: iconEvents, type: "link", active: false, selected: false, dirchange: false, title: "Eventos", name: "Events" },
	{ path: `/users`, icon: iconUsers, type: "link", active: false, selected: false, dirchange: false, title: "Usuários" },
	{ path: `/notification-sends`, icon: iconSentEmails, type: "link", active: false, selected: false, dirchange: false, title: "Emails Enviados" },
	{ path: `/audit-logs`, icon: iconAuditLogs, type: "link", active: false, selected: false, dirchange: false, title: "Logs de Auditoria" },
];

const getMenuItemsEntity = () => [
	{ path: `/documents/create`, icon: iconCertificates, type: "link", active: false, selected: false, dirchange: false, title: "Emitir certificados", name: "Emitir certificados" },
	{ path: `/documents`, icon: iconDocuments, type: "link", active: false, selected: false, dirchange: false, title: "Meus certificados", name: "Certificates" },
	{ path: `/courses`, icon: iconCourses, type: "link", active: false, selected: false, dirchange: false, title: "Cursos", name: "Courses" },
	//{ path: `/courses/create4`, icon: iconCourses, type: "link", active: false, selected: false, dirchange: false, title: "Cadastro de Curso V4", name: "CoursesCreate4" },
	{ path: `/instructors`, icon: iconinstructors, type: "link", active: false, selected: false, dirchange: false, title: "Instrutores", name: "Instructors" },
	//{ path: `/events`, icon: iconEvents, type: "link", active: false, selected: false, dirchange: false, title: "Eventos", name: "Events" },
	{ path: `/dashboard`, icon: iconDashboard, type: "link", active: false, selected: false, dirchange: false, title: "Resumo", name: "Resumo" },
	//{ path: `/users`, icon: iconUsers, type: "link", active: false, selected: false, dirchange: false, title: "Usuários", name: "Users" },
];

const getMenuItemsCompany = () => [
	{ path: `/documents`, icon: iconDocuments, type: "link", active: false, selected: false, dirchange: false, title: "Certificados" },
	{ path: `/events`, icon: iconEvents, type: "link", active: false, selected: false, dirchange: false, title: "Eventos", name: "Events" }, // for company
	{ path: `/employees`, icon: iconEmployees, type: "link", active: false, selected: false, dirchange: false, title: "Alunos" },
	{ path: `/users`, icon: iconUsers, type: "link", active: false, selected: false, dirchange: false, title: "Usuários" },
];

export { getMenuItemsMaster, getMenuItemsEntity, getMenuItemsCompany };