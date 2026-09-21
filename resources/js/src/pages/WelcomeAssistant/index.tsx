import { FC, useState, useEffect, useContext } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import If from '@/src/components/common/if/if';
import AppContext from '@/src/AppContext/Context';

// Importe os ícones que você definiu
const iconCourses = <i className="bx bxs-graduation"></i>;
const iconinstructors = <i className="bx bx-chalkboard"></i>;
const iconCertificates = <i className="bx bxs-award"></i>;
const iconDocuments = <i className="bx bx-file"></i>;

// Chave para armazenar o estado no localStorage
const ASSISTANT_STORAGE_KEY = 'welcomeAssistantStatus';
const ASSISTANT_SHOWN_KEY = 'welcomeAssistantShown';
const ASSISTANT_LAST_STEP = 3;

// Estrutura das etapas
const steps = [
    {
        id: 1,
        title: "Seja Bem-Vindo(a) ao Seu Painel!",
        message: "Que ótimo ter você aqui! Vamos configurar rapidamente sua conta para que você possa começar a Emitir certificados incríveis em poucos minutos.",
        actionText: "Começar Guia",
        path: null,
        icon: <i className="bi bi-award-fill"></i>,
    },
    {
        id: 2,
        title: "Passo 1 de 2: Defina Seus Cursos",
        message: "Para emitir qualquer certificado, precisamos saber o que está sendo ensinado! Configure o nome, carga horária e demais detalhes de cada curso.",
        actionText: "Cadastrar Curso",
        path: "/courses/create",
        icon: <i className="bi bi-journal-text"></i>,
    },
    {
        id: 3,
        title: "Passo 2 de 2: Inclua Seus Instrutores",
        message: "Se seus certificados precisam de assinaturas oficiais, registre seus instrutores. É um cadastro rápido que agiliza a emissão de todos os documentos futuros.",
        actionText: "Cadastrar Instrutor",
        path: "/instructors/create",
        icon: <i className="bi bi-person-badge-fill"></i>,
    },
    {
        id: ASSISTANT_LAST_STEP,
        title: "Tudo Pronto Para Decolar!",
        message: "Parabéns! Com o básico configurado, você está liberado para emitir seus certificados de forma massiva e profissional.",
        actionText: "Emitir certificados",
        path: "/documents/create",
        icon: <i className="bi bi-rocket-takeoff-fill"></i>,
    }
];

interface WelcomeAssistantProps {
    show?: boolean; // O '?' indica que a prop é opcional
    blocked?: boolean;
}

const WelcomeAssistantModern: FC<WelcomeAssistantProps> = ({ show = false, blocked = false }) => {
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const currentStepData = steps[currentStep - 1];

    // Verifica se o usuário precisa completar o cadastro
    const needsCompletion = () => {
        if (!user) return true;
        const phone = typeof user.phone === 'string' ? user.phone.trim() : '';
        const missingPhone = !phone;
        const missingBusinessSegment = !user?.entity?.business_segment_id;
        return user?.role?.name === 'Entity' && (missingPhone || missingBusinessSegment);
    };

    useEffect(() => {
        // Prioridade 1: Se está bloqueado OU precisa completar cadastro, não mostra o Welcome Assistant
        if (blocked || needsCompletion()) {
            setShowModal(false);
            setCurrentStep(0);
            return;
        }

        const hasBeenShown = localStorage.getItem(ASSISTANT_SHOWN_KEY) === 'true';

        if (hasBeenShown) {
            setShowModal(false);
            setCurrentStep(0);
            return;
        }

        const storedStatus = localStorage.getItem(ASSISTANT_STORAGE_KEY);
        const shouldForceShow = Boolean(show);
        const shouldShow =
            shouldForceShow ||
            !storedStatus ||
            parseInt(storedStatus) < ASSISTANT_LAST_STEP;

        // Verifica se já foi concluído antes
        if (shouldShow) {
            const step = storedStatus ? parseInt(storedStatus) : 1;

            if (step > 0 && step <= ASSISTANT_LAST_STEP) {
                localStorage.setItem(ASSISTANT_SHOWN_KEY, 'true');
                setCurrentStep(step);
                setShowModal(true);
            } else {
                localStorage.setItem(ASSISTANT_SHOWN_KEY, 'true');
                setCurrentStep(1);
                setShowModal(true);
            }
        }
    }, [blocked, user, show]);

    const saveProgress = (step: number) => {
        setCurrentStep(step);
        localStorage.setItem(ASSISTANT_STORAGE_KEY, step.toString());
    };

    const handleNext = () => {
        if (currentStep < ASSISTANT_LAST_STEP) {
            saveProgress(currentStep + 1);
        } else {
            handleClose(true);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            saveProgress(currentStep - 1);
        }
    };

    const handleAction = () => {
        if (currentStepData.path) {
            // Navega e fecha o modal para que o usuário interaja com a tela
            setShowModal(false);
            navigate(currentStepData.path);
        } else {
            handleNext();
        }
    };

    const handleClose = (shouldNavigate: boolean = false) => {
        // Marca como concluído
        localStorage.setItem(ASSISTANT_STORAGE_KEY, ASSISTANT_LAST_STEP.toString());
        setShowModal(false);
        setCurrentStep(ASSISTANT_LAST_STEP);

        if (shouldNavigate && currentStepData.path && currentStep === ASSISTANT_LAST_STEP) {
            navigate('/courses/create');
        }
    };

    // NOVA FUNÇÃO para fechar via X, ESC ou backdrop E forçar a navegação
    const handleModalClose = () => {
        // 1. Executa a lógica de fechamento padrão (salva progresso, esconde modal)
        handleClose();

        // 2. Força a navegação para o destino solicitado.
        navigate('/courses/create');
    }

    if (currentStep === 0 || currentStep > ASSISTANT_LAST_STEP || !currentStepData) {
        return null;
    }

    return (
        <Modal
            show={showModal}
            onHide={handleModalClose}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            className="modern-guide-modal"
        >
            <div className="modern-guide-header">
                <button className="modern-guide-close" onClick={handleModalClose}>
                    <i className="bi bi-x-lg"></i>
                </button>
                <div className="modern-guide-icon-container">
                    {currentStepData.icon}
                </div>
                <h2 className="modern-guide-title">{currentStepData.title}</h2>
            </div>

            <Modal.Body className="modern-guide-body">
                <p className="modern-guide-message">{currentStepData.message}</p>

                <div className="modern-guide-step-dots">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`modern-guide-dot ${currentStep === step.id ? 'active' : ''}`}
                        ></div>
                    ))}
                </div>
            </Modal.Body>

            <Modal.Footer className="modern-guide-footer justify-content-center gap-3">
                <If condition={currentStep > 1}>
                    <button className="modern-guide-btn-outline" onClick={handlePrevious}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                    </button>
                </If>

                <button className="modern-guide-btn-primary shadow" onClick={handleAction}>
                    {currentStepData.actionText}
                    <i className="bi bi-arrow-right ms-2"></i>
                </button>

                <If condition={currentStep < ASSISTANT_LAST_STEP}>
                    <button className="modern-guide-btn-outline" onClick={handleNext}>
                        Pular Passo
                    </button>
                </If>
            </Modal.Footer>
        </Modal>
    );
};

export default WelcomeAssistantModern;
