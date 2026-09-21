import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '@/src/lib/api';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';
import AppContext from '@/src/AppContext/Context';
import {
    FiBookOpen,
    FiClock,
    FiCompass,
    FiAward,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiX,
    FiHelpCircle,
    FiMonitor,
    FiSmartphone,
    FiUploadCloud,
    FiFileText,
    FiEdit3,
    FiUpload,
    FiArrowLeft,
    FiArrowRight,
    FiEye,
    FiCode
} from 'react-icons/fi';
import styles from './index.module.css';

// Lazy-load the full certificate editor
const CourseCadastrar = React.lazy(() => import('../Cadastrar'));

interface FrameItem {
    id: number;
    name: string;
    frame: string;
    back_frame?: string;
}

const CourseV4: FC = () => {
    const navigate = useNavigate();
    const { checkRole } = useContext(AppContext);
    const [step, setStep] = useState<number>(0);
    const [showStep5Hint, setShowStep5Hint] = useState<boolean>(true);

    // HTML Modal States
    const [showHTMLModal, setShowHTMLModal] = useState<boolean>(false);
    const [htmlModalPage, setHtmlModalPage] = useState<number>(1);
    const [htmlValue, setHtmlValue] = useState<string>('');
    const [htmlModalActiveTab, setHtmlModalActiveTab] = useState<'preview' | 'code'>('preview');
    const [iframeSrc, setIframeSrc] = useState<string>('');
    const [importedTemplate, setImportedTemplate] = useState<string>('');
    const [importedBackDocument, setImportedBackDocument] = useState<string>('');

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
            .catch(err => console.error("Error fetching credit balance in CourseV4:", err));
    }, [checkRole]);

    // Generates preview HTML with proper global rules and styling for rendering inside the iframe sandbox
    const generatePreviewHtml = (htmlContent: string) => {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualização do Certificado</title>
    <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Architects+Daughter&family=Bad+Script&family=Berkshire+Swash&family=Cinzel+Decorative&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Inter:wght@300;400;500;600;700&family=Italianno&family=Kaushan+Script&family=La+Belle+Aurore&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Marck+Script&family=Montserrat+Alternates:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Mr+De+Haviland&family=Niconne&family=Oswald:wght@300;400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quintessential&family=Roboto:wght@300;400;500;700&family=Sacramento&family=Satisfy&family=Tangerine:wght@700&family=Yellowtail&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Baskervville&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Prata&family=DM+Serif+Display&family=Playfair+Display+SC:wght@400;700&family=Cormorant+Unicase:wght@400;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Rochester&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&family=Qwigley&family=WindSong&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background-color: #0f172a;
            color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            min-height: 100vh;
            overflow: auto;
            font-family: 'Inter', sans-serif;
        }
        .cert-container {
            margin: 20px auto;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
        }
        @media print {
            body {
                background: none;
                padding: 0;
            }
            .cert-container {
                box-shadow: none !important;
                margin: 0 !important;
            }
        }
    </style>
</head>
<body>
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%; align-items: center; justify-content: center;">
        ${htmlContent}
    </div>
</body>
</html>`;
    };

    const handleViewHTML = () => {
        if (editorRef.current && typeof editorRef.current.getPageHTML === 'function') {
            const pageToLoad = editorPage;
            const currentHtml = editorRef.current.getPageHTML(pageToLoad) || '';
            setHtmlModalPage(pageToLoad);
            setHtmlValue(currentHtml);
            setHtmlModalActiveTab('code'); // code view as default
            setShowHTMLModal(true);
        } else {
            toast.error('O editor visual ainda não terminou de inicializar.');
        }
    };

    const handleSwitchHTMLPage = (pageNum: number) => {
        if (editorRef.current && typeof editorRef.current.getPageHTML === 'function') {
            const currentHtml = editorRef.current.getPageHTML(pageNum) || '';
            setHtmlModalPage(pageNum);
            setHtmlValue(currentHtml);
        } else {
            toast.error('O editor visual ainda não terminou de inicializar.');
        }
    };

    const handleSaveHTMLChanges = () => {
        if (editorRef.current && typeof editorRef.current.updatePageHTML === 'function') {
            editorRef.current.updatePageHTML(htmlModalPage, htmlValue);
            setTimeout(() => {
                setShowHTMLModal(false);
                toast.success(`HTML da ${htmlModalPage === 1 ? 'Frente' : 'Verso'} sincronizado no editor!`);
            }, 50);
        } else {
            toast.error('Não foi possível sincronizar o HTML com o componente de certificado.');
        }
    };

    useEffect(() => {
        if (showHTMLModal && htmlValue) {
            const full = generatePreviewHtml(htmlValue);
            const blob = new Blob([full], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setIframeSrc(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [htmlValue, showHTMLModal, htmlModalPage]);

    // Form States
    const [courseName, setCourseName] = useState<string>('');
    const [courseHours, setCourseHours] = useState<string>('');
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
    const [selectedFrameId, setSelectedFrameId] = useState<number | string | null>(null);
    const [customFrameUrl, setCustomFrameUrl] = useState<string | null>(null);
    const [customBackFrameUrl, setCustomBackFrameUrl] = useState<string | null>(null);
    const [instructorName, setInstructorName] = useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const uploadTemplateInputRef = React.useRef<HTMLInputElement>(null);
    const editorRef = React.useRef<any>(null);
    const [editorPage, setEditorPage] = useState<number>(1);
    const [editorHasVerso, setEditorHasVerso] = useState<boolean>(false);
    const [inputError, setInputError] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isUploadingTemplate, setIsUploadingTemplate] = useState<boolean>(false);
    const [hasVerso, setHasVerso] = useState<boolean>(false);
    const [selectedBackFrameId, setSelectedBackFrameId] = useState<number | string>('same');
    const [subStep, setSubStep] = useState<'front' | 'back'>('front');
    const [customFrameError, setCustomFrameError] = useState<string>('');

    const handleOpenUploadTemplateDialog = () => {
        if (uploadTemplateInputRef.current) {
            uploadTemplateInputRef.current.click();
        }
    };

    const handleUploadTemplateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        e.target.value = '';

        if (!file) {
            return;
        }

        const allowedExtensions = ['.pdf', '.docx'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            Swal.fire({
                icon: 'error',
                title: 'Formato de arquivo não suportado',
                text: 'Para importar o modelo pronto do certificado, por favor envie um arquivo no formato PDF (.pdf) ou Word (.docx).',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444',
            });
            return;
        }

        const simulatedSteps = [
            'Validando arquivo enviado...',
            'Extraindo estrutura do certificado...',
            'Identificando campos e máscaras...',
            'Cadastrando nome do curso...',
            'Configurando orientação e moldura...',
            'Finalizando cadastro do template...',
        ];

        let currentStepIndex = 0;
        let stepTimer: number | null = null;
        let uploadDone = false;
        let uploadResolve: (() => void) | null = null;

        const isDarkMode = document.documentElement.getAttribute('data-theme-mode') === 'dark';

        const renderChecklist = (activeIndex: number) => {
            const htmlContainer = Swal.getHtmlContainer();
            if (!htmlContainer) return;
            const list = htmlContainer.querySelector('#upload-checklist');
            if (!list) return;
            list.innerHTML = simulatedSteps.map((label, i) => {
                if (i < activeIndex) {
                    return `<li style="display:flex;align-items:center;gap:10px;padding:6px 0;opacity:1;">
                        <span style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#fa3f7a);display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:checkPop 0.3s ease;">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span style="font-size:13px;color:#94a3b8;text-decoration:line-through;">${label}</span>
                    </li>`;
                } else if (i === activeIndex) {
                    const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
                    return `<li style="display:flex;align-items:center;gap:10px;padding:6px 0;opacity:1;">
                        <span style="width:22px;height:22px;border-radius:50%;border:2px solid #a855f7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span style="width:8px;height:8px;border-radius:50%;border:2px solid #a855f7;border-top-color:transparent;animation:spin 0.7s linear infinite;display:block;"></span>
                        </span>
                        <span style="font-size:13px;color:${textColor};font-weight:600;">${label}</span>
                    </li>`;
                } else {
                    const textColor = isDarkMode ? '#64748b' : '#94a3b8';
                    const circleBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
                    const circleBg = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                    return `<li style="display:flex;align-items:center;gap:10px;padding:6px 0;opacity:0.4;">
                        <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${circleBorder};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span style="width:6px;height:6px;border-radius:50%;background:${circleBg};display:block;"></span>
                        </span>
                        <span style="font-size:13px;color:${textColor};">${label}</span>
                    </li>`;
                }
            }).join('');
        };

        const jumpToLastAndClose = async () => {
            renderChecklist(simulatedSteps.length - 1);
            await new Promise(r => setTimeout(r, 500));
            Swal.close();
        };

        try {
            setIsUploadingTemplate(true);

            // Run upload in the background; track result via closured vars
            let apiResponse: any = null;
            let apiError: any = null;
            uploadDone = false;

            const formData = new FormData();
            formData.append('template_file', file);
            void api
                .post('/courses/import-template', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(res => { apiResponse = res; })
                .catch(err => { apiError = err; })
                .finally(() => { uploadDone = true; });

            await new Promise<void>((resolve, reject) => {
                Swal.fire({
                    title: 'Processando certificado',
                    html: `
                        <style>
                            @keyframes spin { to { transform: rotate(360deg); } }
                            @keyframes checkPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
                            #upload-checklist { list-style:none; padding:0; margin:8px 0 0 0; text-align:left; }
                        </style>
                        <ul id="upload-checklist"></ul>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    background: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    didOpen: () => {
                        renderChecklist(0);

                        stepTimer = window.setInterval(async () => {
                            if (uploadDone) {
                                // Upload finished — jump to last step, wait 500ms, then close
                                if (stepTimer !== null) window.clearInterval(stepTimer);
                                await jumpToLastAndClose();
                                if (apiError) reject(apiError);
                                else resolve();
                                return;
                            }

                            if (currentStepIndex < simulatedSteps.length - 2) {
                                // Still have steps before the last — advance normally
                                currentStepIndex += 1;
                                renderChecklist(currentStepIndex);
                            } else if (currentStepIndex < simulatedSteps.length - 1) {
                                // Reached the second-to-last — hold here until upload finishes
                                currentStepIndex = simulatedSteps.length - 2;
                                renderChecklist(currentStepIndex);
                            }
                            // If already at last step, just wait for upload
                        }, 2000);
                    },
                });
            });


            const data = apiResponse?.data;
            const extractedCourse = data?.extracted?.course || data?.course;
            const extractedInstructor = data?.extracted?.instructor || data?.instructor;
            const certificateTemplate = extractedCourse?.certificate_template
                || data?.certificate_template
                || data?.document_template
                || {};
            const latestVersion = certificateTemplate?.latest_version || {};
            const importedFrameIdValue = latestVersion?.frame_id
                ?? certificateTemplate?.frame_id
                ?? extractedCourse?.frame_id
                ?? data?.frame_id;
            const importedFrameIdNumber = importedFrameIdValue === null || importedFrameIdValue === undefined
                ? NaN
                : Number(importedFrameIdValue);
            const importedFrameId = Number.isInteger(importedFrameIdNumber) && importedFrameIdNumber > 0
                ? importedFrameIdNumber
                : null;
            const importedTemplateHtml = latestVersion?.template
                || certificateTemplate?.template
                || extractedCourse?.template
                || data?.template
                || '';
            const importedBackDocumentHtml = latestVersion?.back_document
                || certificateTemplate?.back_document
                || extractedCourse?.back_document
                || data?.back_document
                || '';

            console.info('[Template Trace] import-template response', {
                topLevelKeys: Object.keys(data || {}),
                courseKeys: Object.keys(extractedCourse || {}),
                certificateTemplateKeys: Object.keys(certificateTemplate || {}),
                templateSource: latestVersion?.template
                    ? 'course.certificate_template.latest_version.template'
                    : certificateTemplate?.template
                        ? 'course.certificate_template.template'
                        : extractedCourse?.template
                            ? 'course.template'
                            : data?.template ? 'template' : 'none',
                templateBytes: importedTemplateHtml.length,
                hasCertContainer: importedTemplateHtml.includes('cert-container'),
                hasContentSide: importedTemplateHtml.includes('content-side'),
                paragraphCount: (importedTemplateHtml.match(/<p\b/gi) || []).length,
                frameId: importedFrameId,
            });

            const name = extractedCourse?.name || '';
            const hours = extractedCourse?.number_of_hours_studied || '';
            const extractedOrientation = extractedCourse?.orientation === 'portrait' ? 'portrait' : 'landscape';
            const instName = extractedInstructor?.name || '';

            setCourseName(name);
            setCourseHours(hours);
            setOrientation(extractedOrientation);
            setImportedTemplate(importedTemplateHtml);
            setImportedBackDocument(importedBackDocumentHtml);
            if (instName) {
                setInstructorName(instName);
            }

            // Prefer S3 URL (frame_url) when available — avoids base64 pollution in getPageHTML/Ver HTML.
            // Fall back to frame_base64 only when running locally without S3.
            if (data?.frame_url || data?.frame_base64) {
                setCustomFrameUrl(data.frame_url || data.frame_base64);
                setSelectedFrameId(importedFrameId ?? 'custom');
            }

            if (data?.back_frame_url || data?.back_frame_base64) {
                setCustomBackFrameUrl(data.back_frame_url || data.back_frame_base64);
                setSelectedBackFrameId(importedFrameId ?? 'custom_back');
                setHasVerso(true);
            } else {
                setHasVerso(false);
            }

            setSubStep('front');
            setStep(5);
        } catch (err: any) {
            if (stepTimer !== null) {
                window.clearInterval(stepTimer);
            }
            Swal.close();
            console.error('Erro na importacao:', err);
            toast.error(err?.response?.data?.error || 'Erro ao processar o certificado. Verifique o arquivo.');
        } finally {
            setIsUploadingTemplate(false);
        }
    };


    // Frame list state
    const [frames, setFrames] = useState<FrameItem[]>([]);
    const [loadingFrames, setLoadingFrames] = useState<boolean>(false);

    // Fetch frame list from Backend
    const getTemplateFrames = async () => {
        setLoadingFrames(true);
        try {
            const response = await api.get('/document-template-frames?all=1');
            const sortedData = (response.data || []).sort((a: any, b: any) => b.id - a.id).slice(0, 12);
            const processedBorders = await Promise.all(
                sortedData.map(async (frameItem: any) => {
                    try {
                        const imageResponse = await api.get(`/image?image=${frameItem.frame}`, {
                            responseType: 'blob',
                        });
                        const imageUrl = URL.createObjectURL(imageResponse.data);

                        let backImageUrl = '';
                        if (frameItem.back_frame) {
                            try {
                                const backImageResponse = await api.get(`/image?image=${frameItem.back_frame}`, {
                                    responseType: 'blob',
                                });
                                backImageUrl = URL.createObjectURL(backImageResponse.data);
                            } catch (err) {
                                console.error('Erro ao carregar verso da moldura:', err);
                            }
                        }

                        return {
                            id: frameItem.id,
                            name: frameItem.name || 'Moldura Personalizada',
                            frame: imageUrl,
                            back_frame: backImageUrl,
                        };
                    } catch {
                        return {
                            id: frameItem.id,
                            name: frameItem.name || 'Moldura Personalizada',
                            frame: '',
                            back_frame: '',
                        };
                    }
                })
            );
            setFrames(processedBorders);
            if (processedBorders.length > 0) {
                setSelectedFrameId(processedBorders[0].id);
            }
        } catch {
            toast.error('Erro ao carregar molduras do backend.');
        } finally {
            setLoadingFrames(false);
        }
    };

    useEffect(() => {
        getTemplateFrames();
    }, []);

    const [showFrameGuide, setShowFrameGuide] = useState<boolean>(false);
    const hasRunFrameGuideRef = React.useRef<boolean>(false);

    useEffect(() => {
        if (step === 4 && subStep === 'front') {
            if (!hasRunFrameGuideRef.current) {
                setShowFrameGuide(true);
                hasRunFrameGuideRef.current = true;
                const timer = setTimeout(() => {
                    setShowFrameGuide(false);
                }, 4000);
                return () => clearTimeout(timer);
            }
        } else {
            setShowFrameGuide(false);
        }
    }, [step, subStep]);

    // Global keyboard listener to navigate on Enter
    useEffect(() => {
        if (step === 5) return; // Disable Enter navigation on editor step
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (step < 4) {
                    handleNext();
                } else if (step === 4) {
                    if (subStep === 'front') {
                        setSubStep('back');
                    } else {
                        handleFinalize();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [step, subStep, courseName, selectedFrameId, courseHours, orientation, isSubmitting]);

    // Automatic Navigation on Orientation selection
    const handleSelectOrientation = (orient: 'landscape' | 'portrait') => {
        setOrientation(orient);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!courseName.trim()) {
                setInputError(true);
                setTimeout(() => setInputError(false), 500);
                toast.error('Por favor, digite o nome do curso.');
                return;
            }
            setInputError(false);
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        }
    };

    const handlePrev = () => {
        if (step === 4 && subStep === 'back') {
            setSubStep('front');
        } else if (step > 1) {
            setStep(step - 1);
            setSubStep('front');
        } else if (step === 1) {
            setStep(0);
        }
    };

    const handleFinalize = () => {
        if (!selectedFrameId) {
            toast.error('Por favor, selecione uma moldura.');
            return;
        }

        if (selectedFrameId === 'custom' && !customFrameUrl) {
            toast.error('Por favor, faça o upload de uma moldura personalizada.');
            return;
        }

        // Transition to step 5 — the embedded full editor
        setStep(5);
    };

    const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                setCustomFrameError('Tipo de arquivo inválido.');
                setCustomFrameUrl(null);
                setSelectedFrameId(null);
                return;
            }

            // Validate file size (max 5MB = 5242880 bytes)
            const maxSizeBytes = 5242880;
            if (file.size > maxSizeBytes) {
                setCustomFrameError('Arquivo muito grande. O limite é 5MB.');
                setCustomFrameUrl(null);
                setSelectedFrameId(null);
                return;
            }

            // File is valid
            setCustomFrameError('');
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCustomFrameUrl(event.target.result as string);
                    setSelectedFrameId('custom');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getProgressInfo = () => {
        switch (step) {
            case 0: return { pct: 0, label: 'Como cadastrar' };
            case 1: return { pct: 20, label: 'Configurando seu curso' };
            case 2: return { pct: 40, label: 'Carga Horária (Opcional)' };
            case 3: return { pct: 60, label: 'Escolha de Orientação' };
            case 4: return { pct: 80, label: 'Escolha de Moldura' };
            case 5: return { pct: 100, label: 'Editor do Certificado' };
            default: return { pct: 0, label: 'Em progresso' };
        }
    };

    const handleSaveCourse = async () => {
        if (!courseName.trim()) {
            toast.error('Por favor, defina o nome do curso.');
            return;
        }

        setIsSubmitting(true);

        let currentTemplate = '';
        let currentBackDocument = null;
        let currentOrientation = orientation;
        let currentFrameType = 'color';
        let currentFrameColor = '#2563eb';
        let currentFrameId = selectedFrameId;
        let currentCustomFrame = customFrameUrl;
        let currentCustomBackFrame = customBackFrameUrl;

        if (editorRef.current && typeof editorRef.current.getTemplateData === 'function') {
            const data = editorRef.current.getTemplateData();
            currentTemplate = data.template;
            currentBackDocument = data.back_document;
            currentOrientation = data.orientation;
            currentFrameType = data.frame_type;
            if (data.frame_color) {
                currentFrameColor = data.frame_color;
            }
            if (data.frame_id) {
                currentFrameId = data.frame_id;
            }
            if (data.customFrame) {
                currentCustomFrame = data.customFrame;
            }
            if (data.customBackFrame) {
                currentCustomBackFrame = data.customBackFrame;
            }
        }

        const substituirPlaceholderQRCodePorMascara = (html: string) => {
            const regex = /<div[^>]*class="mceNonEditable"[^>]*data-mask-key="qrcode_validacao"[^>]*>.*?<\/div>/gs;
            return html.replace(regex, '{{qrcode_validacao}}');
        };

        const substituirAssinaturaInstrutoresPorMascara = (html: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const allDivs = Array.from(doc.querySelectorAll('div'));
            for (const div of allDivs) {
                if (div.innerHTML.includes('{{assinatura(s)_instrutores}}') && div.innerHTML.includes('{{nome_instrutor}}')) {
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = `<div style="text-align: center;">{{assinatura(s)_instrutores}}</div>`;
                    div.replaceWith(placeholder);
                }
            }
            return doc.body.innerHTML;
        };

        let templateTreated = substituirPlaceholderQRCodePorMascara(currentTemplate);
        templateTreated = substituirAssinaturaInstrutoresPorMascara(templateTreated);

        let backDocumentTreated = substituirPlaceholderQRCodePorMascara(currentBackDocument ?? '');
        backDocumentTreated = substituirAssinaturaInstrutoresPorMascara(backDocumentTreated);

        const numericFrameIdValue = currentFrameId === null || currentFrameId === undefined || currentFrameId === ''
            ? NaN
            : Number(currentFrameId);
        const numericFrameId = Number.isInteger(numericFrameIdValue) && numericFrameIdValue > 0
            ? numericFrameIdValue
            : null;
        let finalBorderId: number | null = numericFrameId;

        // Custom borders handling (saving image files to Backend)
        const isFrameBase64 = currentCustomFrame?.startsWith('data:image/');
        const isBackFrameBase64 = currentCustomBackFrame?.startsWith('data:image/');

        if (isFrameBase64 || isBackFrameBase64) {
            try {
                const data = {
                    frame: currentCustomFrame?.startsWith('data:image/') ? currentCustomFrame : null,
                    back_frame: currentCustomBackFrame?.startsWith('data:image/') ? currentCustomBackFrame : null,
                    is_top_only: false
                };
                const response = await api.post('/document-template-frames', data);
                finalBorderId = response.data.id;
            } catch (error) {
                toast.error('Erro ao salvar as imagens de fundo customizadas');
                setIsSubmitting(false);
                return;
            }
        }

        const safeFrameType = currentFrameType === 'custom' && finalBorderId === null
            ? 'color'
            : currentFrameType;

        const payload = {
            name: courseName,
            template: templateTreated,
            back_document: backDocumentTreated || null,
            orientation: currentOrientation,
            frame_type: safeFrameType,
            frame_color: safeFrameType === 'color' ? currentFrameColor : null,
            frame_id: safeFrameType === 'custom' ? finalBorderId : null,
            type_id: 1,
            skip_gemini_mask_job: true
        };

        try {
            const templateResponse = await api.post('/document-templates', payload);
            const courseResponse = await api.post('/courses', {
                name: courseName,
                number_of_hours_studied: courseHours || '0',
                certificate_id: templateResponse.data?.id,
                new_version: true
            });

            // Save course assets (logo/signatures) using the newly created course ID
            const newCourseId = courseResponse.data?.id;
            if (editorRef.current && typeof editorRef.current.saveCourseAssets === 'function' && newCourseId) {
                await editorRef.current.saveCourseAssets(Number(newCourseId));
            }

            const instructorsResponse = await api.get('/instructors?all=1').catch(() => null);
            const hasInstructors = instructorsResponse && Array.isArray(instructorsResponse.data) && instructorsResponse.data.length > 0;

            if (hasInstructors) {
                const result = await Swal.fire({
                    icon: 'success',
                    title: 'Curso Criado com Sucesso!',
                    text: 'Todas as configurações do curso e do certificado foram gravadas. O que deseja fazer a seguir?',
                    showCancelButton: true,
                    confirmButtonText: 'Ir para cursos',
                    cancelButtonText: 'Cadastrar instrutor',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#3b82f6',
                    background: '#151d30',
                    color: '#fff'
                });

                if (result.dismiss === Swal.DismissReason.cancel) {
                    navigate('/instructors/create');
                } else {
                    navigate('/courses');
                }
            } else {
                const result = await Swal.fire({
                    icon: 'info',
                    title: 'Curso Criado com Sucesso!',
                    text: 'Não encontramos instrutores cadastrados. Cadastre um instrutor para continuar.',
                    showCancelButton: true,
                    confirmButtonText: 'Cadastrar instrutor',
                    cancelButtonText: 'Ir para cursos',
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#6b7280',
                    background: '#151d30',
                    color: '#fff'
                });

                if (result.isConfirmed) {
                    navigate('/instructors/create');
                } else {
                    navigate('/courses');
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar as configurações do curso.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = getProgressInfo();

    // Step 5: Render the full embedded editor
    if (step === 5) {
        return (
            <Fragment>
                <style>{`
                  /* Hide main app header and sidebar completely when in certificate design mode */
                  .app-header, 
                  header, 
                  .app-sidebar, 
                  aside {
                    display: none !important;
                  }
                  
                  /* Reset margins left from responsive sidebar templates */
                  .main-content {
                    margin-left: 0px !important;
                    margin-inline-start: 0px !important;
                    padding-top: 0px !important;
                  }
                  
                  /* Force container to fill the screen */
                  .app-content {
                    padding: 0px !important;
                    margin: 0px !important;
                  }

                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                  }
                `}</style>

                {showStep5Hint && (
                    <div
                        onClick={() => setShowStep5Hint(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 9999999,
                            background: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.3s ease-out',
                            cursor: 'pointer'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '24px',
                                padding: '32px',
                                maxWidth: '460px',
                                width: '90%',
                                textAlign: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.15)',
                                animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                position: 'relative',
                                cursor: 'default'
                            }}
                        >
                            {/* Glowing orb behind icon */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
                                zIndex: 0
                            }} />

                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a855f7 0%, #fa3f7a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#fff',
                                boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <FiEdit3 size={24} />
                            </div>

                            <h3 style={{
                                color: '#ffffff',
                                fontSize: '20px',
                                fontWeight: 800,
                                margin: '0 0 12px 0',
                                fontFamily: 'Outfit, sans-serif'
                            }}>
                                Pronto para Personalizar! 🚀
                            </h3>

                            <p style={{
                                color: '#94a3b8',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                margin: '0 0 24px 0',
                                fontWeight: 500
                            }}>
                                O design original do seu certificado foi importado como imagem de fundo. Para começar a customizar, <strong>clique em qualquer área do certificado para adicionar um texto</strong> e configurar os seus campos!
                            </p>

                            <button
                                onClick={() => setShowStep5Hint(false)}
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #fa3f7a 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.35)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.25)';
                                }}
                            >
                                Entendi, vamos lá!
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles['v4-container']} style={{ padding: '0', margin: '0', alignItems: 'flex-start', background: 'transparent', minHeight: 'auto' }}>
                    <div className={styles['v4-glowing-sphere-blue']} />
                    <div className={styles['v4-glowing-sphere-purple']} />


                    <div className={styles['v4-editor-wrapper']}>
                        {/* Header bar with step indicator and close */}
                        <div className={styles['v4-editor-header']}>
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    onClick={() => setStep(4)}
                                    type="button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        background: 'var(--v4-bg-circle-nav-hover)',
                                        border: '1px solid var(--v4-border-circle-nav)',
                                        color: 'var(--v4-text-title)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'var(--v4-bg-circle-nav-hover)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <FiChevronLeft size={16} /> Voltar
                                </button>
                                <div>
                                    <span style={{ color: 'var(--v4-text-subtitle)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Passo 5 de 5
                                    </span>
                                    <h4 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                                        Editor do Certificado
                                    </h4>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <button
                                    onClick={handleViewHTML}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(168, 85, 247, 0.15)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        color: '#c084fc',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)',
                                        marginRight: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)';
                                        e.currentTarget.style.border = '1px solid rgba(168, 85, 247, 0.5)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                                        e.currentTarget.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <FiEye size={14} />
                                    Ver HTML
                                </button>

                                {/* Progress dots */}
                                <div className="d-flex align-items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span
                                            key={i}
                                            style={{
                                                width: i === 5 ? '20px' : '6px',
                                                height: '6px',
                                                borderRadius: '3px',
                                                background: i <= step ? '#a855f7' : 'var(--v4-border-choice-card)',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/courses')}
                                    className="btn p-0 text-white opacity-40 border-0"
                                    style={{ background: 'transparent' }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Embedded Cadastrar editor */}
                        <div className={styles['v4-editor-content']}>
                            <React.Suspense fallback={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--v4-text-subtitle)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div className={styles['v4-skeleton-card']} style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 16px' }} />
                                        <p>Carregando editor...</p>
                                    </div>
                                </div>
                            }>
                                <CourseCadastrar
                                    ref={editorRef}
                                    initialOrientation={orientation}
                                    initialFrameId={selectedFrameId}
                                    initialBgTheme={selectedFrameId === 'custom' ? 'custom-image' : undefined}
                                    initialCustomBgUrl={selectedFrameId === 'custom' && customFrameUrl ? customFrameUrl : undefined}
                                    embedded={true}
                                    initialEnableVerso={hasVerso}
                                    initialBackFrameId={selectedBackFrameId === 'same' ? selectedFrameId : selectedBackFrameId}
                                    initialCustomBgUrlPage2={selectedBackFrameId === 'custom_back' && customBackFrameUrl ? customBackFrameUrl : undefined}
                                    initialCourseName={courseName}
                                    initialHours={courseHours}
                                    initialInstructorName={instructorName}
                                    initialTemplate={importedTemplate || undefined}
                                    initialBackDocument={importedBackDocument || undefined}
                                    onPageChange={setEditorPage}
                                    onVersoChange={setEditorHasVerso}
                                />
                            </React.Suspense>
                        </div>
                    </div>
                </div>

                {/* Floating premium action bar */}
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    animation: 'fadeIn 0.3s ease',
                    minWidth: editorHasVerso && editorPage === 2 ? '420px' : 'auto'
                }}>
                    {editorHasVerso ? (
                        editorPage === 1 ? (
                            // Page 1 with verso active: show ONLY one button "Avançar para o Verso"
                            <button
                                onClick={() => editorRef.current?.setCurrentPage(2)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #fa3f7a 100%)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                Avançar para o Verso <FiArrowRight size={15} />
                            </button>
                        ) : (
                            // Page 2: show "Voltar para Frente" on the left, and cancel/save on the right!
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', width: '100%' }}>
                                {/* Left side button: Voltar para Frente */}
                                <button
                                    onClick={() => editorRef.current?.setCurrentPage(1)}
                                    style={{
                                        padding: '9px 18px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#e2e8f0',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FiArrowLeft size={15} /> Voltar para Frente
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => setStep(4)}
                                        style={{
                                            padding: '9px 18px',
                                            borderRadius: '10px',
                                            background: 'var(--bg-btn-cancel)',
                                            border: '1px solid var(--border-btn-cancel)',
                                            color: 'var(--text-btn-cancel)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FiX size={15} /> Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveCourse}
                                        disabled={isSubmitting}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #fa3f7a 100%)',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {isSubmitting ? 'Salvando...' : (
                                            <>
                                                <FiCheck size={16} /> Salvar modelo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        // Only front page (verso disabled): keep it exactly as it currently is!
                        <>
                            <button
                                onClick={() => setStep(4)}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-btn-cancel)',
                                    border: '1px solid var(--border-btn-cancel)',
                                    color: 'var(--text-btn-cancel)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiX size={15} /> Cancelar
                            </button>
                            <button
                                onClick={handleSaveCourse}
                                disabled={isSubmitting}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #fa3f7a 100%)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {isSubmitting ? 'Salvando...' : (
                                    <>
                                        <FiCheck size={16} /> Salvar modelo
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {/* Premium Dark Studio HTML Live Editor Modal */}
                <Modal
                    show={showHTMLModal}
                    onHide={() => setShowHTMLModal(false)}
                    size="xl"
                    centered
                    contentClassName="bg-transparent border-0"
                    style={{ zIndex: 1000002 }}
                >
                    <div style={{
                        background: 'rgba(20, 20, 23, 0.98)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiCode size={20} style={{ color: '#a855f7' }} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Editar HTML do Certificado
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                        {htmlModalPage === 1 ? 'Frente — Página 1' : 'Verso — Página 2'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHTMLModal(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Tabs: Preview vs Code */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0 24px'
                        }}>
                            <button
                                type="button"
                                onClick={() => setHtmlModalActiveTab('preview')}
                                style={{
                                    background: 'transparent',
                                    color: htmlModalActiveTab === 'preview' ? '#a855f7' : '#94a3b8',
                                    border: 'none',
                                    borderBottom: htmlModalActiveTab === 'preview' ? '2px solid #a855f7' : '2px solid transparent',
                                    padding: '14px 20px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiEye size={15} /> Preview Visual
                            </button>
                            <button
                                type="button"
                                onClick={() => setHtmlModalActiveTab('code')}
                                style={{
                                    background: 'transparent',
                                    color: htmlModalActiveTab === 'code' ? '#a855f7' : '#94a3b8',
                                    border: 'none',
                                    borderBottom: htmlModalActiveTab === 'code' ? '2px solid #a855f7' : '2px solid transparent',
                                    padding: '14px 20px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiCode size={15} /> Editar Código HTML
                            </button>
                            {editorHasVerso && (
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 0' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchHTMLPage(1)}
                                        style={{
                                            background: htmlModalPage === 1 ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                            color: htmlModalPage === 1 ? '#a855f7' : '#64748b',
                                            border: htmlModalPage === 1 ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Frente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchHTMLPage(2)}
                                        style={{
                                            background: htmlModalPage === 2 ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                            color: htmlModalPage === 2 ? '#a855f7' : '#64748b',
                                            border: htmlModalPage === 2 ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Verso
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            {htmlModalActiveTab === 'preview' ? (
                                /* Live Visual Preview inside Sandbox Iframe */
                                <div style={{
                                    background: '#09090b',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    overflow: 'hidden',
                                    minHeight: '480px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        padding: '8px 16px',
                                        fontSize: '11px',
                                        color: '#64748b',
                                        fontFamily: 'monospace'
                                    }}>
                                        <span>PREVIEW — {htmlModalPage === 1 ? 'FRENTE' : 'VERSO'}</span>
                                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>● LIVE</span>
                                    </div>
                                    {iframeSrc ? (
                                        <iframe
                                            src={iframeSrc}
                                            title="Certificate Live Preview Sandbox"
                                            style={{
                                                width: '100%',
                                                height: '520px',
                                                border: 'none',
                                                background: '#0f172a'
                                            }}
                                        />
                                    ) : (
                                        <div style={{ color: '#64748b', fontSize: '13px', padding: '40px', textAlign: 'center' }}>Carregando visualização...</div>
                                    )}
                                </div>
                            ) : (
                                /* Textarea Code Editor */
                                <div style={{
                                    position: 'relative',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: '#0d0d0f'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        padding: '8px 16px',
                                        fontSize: '11px',
                                        color: '#64748b',
                                        fontFamily: 'monospace'
                                    }}>
                                        <span>PAGE_{htmlModalPage}_{htmlModalPage === 1 ? 'FRENTE' : 'VERSO'}.html</span>
                                        <span style={{ color: '#a855f7', fontWeight: 'bold' }}>LIVE-SYNC</span>
                                    </div>
                                    <textarea
                                        value={htmlValue}
                                        onChange={(e) => setHtmlValue(e.target.value)}
                                        spellCheck={false}
                                        style={{
                                            width: '100%',
                                            height: '420px',
                                            background: 'transparent',
                                            color: '#e2e8f0',
                                            border: 'none',
                                            padding: '16px',
                                            fontFamily: "'Courier New', Courier, monospace",
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            resize: 'none',
                                            outline: 'none',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            padding: '16px 24px',
                            background: 'rgba(0, 0, 0, 0.15)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <button
                                onClick={() => setShowHTMLModal(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#cbd5e1',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                            >
                                Fechar
                            </button>
                            {htmlModalActiveTab === 'code' && (
                                <button
                                    onClick={handleSaveHTMLChanges}
                                    style={{
                                        background: '#a855f7',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#9333ea';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#a855f7';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.3)';
                                    }}
                                >
                                    <FiCheck size={16} /> Aplicar e Sincronizar
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div className={styles['v4-container']}>
                <div className={styles['v4-glowing-sphere-blue']} />
                <div className={styles['v4-glowing-sphere-purple']} />

                <div className={styles['v4-3d-wrapper']}>
                    {/* Immersive 3D depth stack carousel rendering left & right behind the main card */}
                    <div className={styles['v4-bg-card-left-2']} />
                    <div className={styles['v4-bg-card-left-1']} />
                    <div className={styles['v4-bg-card-right-1']} />
                    <div className={styles['v4-bg-card-right-2']} />

                    {/* Central Interactive Glassmorphic Card Container */}
                    <div
                        className={styles['v4-main-card']}
                        style={
                            step === 0
                                ? { width: '800px', maxWidth: '95%', transition: 'all 0.5s ease' }
                                : step === 4 && subStep === 'back' && hasVerso
                                    ? { height: 'auto', minHeight: '720px' }
                                    : {}
                        }
                    >

                        {/* Upper Header Layout */}
                        <div className="w-100 d-flex align-items-center justify-content-between mb-4">
                            {step > 0 ? (
                                <span style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', fontWeight: 500, background: 'var(--v4-bg-choice-card)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--v4-border-choice-card)' }}>
                                    Passo {step} de 5
                                </span>
                            ) : (
                                <span style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', fontWeight: 500, background: 'var(--v4-bg-choice-card)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--v4-border-choice-card)' }}>
                                    Método de Cadastro
                                </span>
                            )}
                            <button
                                onClick={() => !isSubmitting && navigate('/courses')}
                                className="btn p-0 border-0 outline-none"
                                style={{ background: 'transparent', color: 'var(--v4-text-title)', opacity: 0.5 }}
                                disabled={isSubmitting}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Hidden File Input for Template Upload */}
                        <input
                            ref={uploadTemplateInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            className="d-none"
                            onChange={handleUploadTemplateFile}
                        />

                        {/* STEP 0: SELEÇÃO DE MÉTODO */}
                        {step === 0 && (
                            <div className={styles['v4-step-wrapper']} style={{ width: '100%' }}>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px', textAlign: 'center' }}>
                                    Como deseja cadastrar o curso?
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '500px', lineHeight: '1.5' }}>
                                    Template é o modelo pronto do certificado para cadastrar o curso. Escolha como deseja continuar.
                                </p>

                                <div className={styles['v4-choice-grid']}>
                                    {/* Option A: Upload */}
                                    <div
                                        onClick={handleOpenUploadTemplateDialog}
                                        className={`${styles['v4-choice-card']} ${styles['v4-choice-card-blue']}`}
                                    >
                                        <div className={styles['v4-orientation-icon-box']} style={{ color: '#3b82f6', fontSize: '36px', marginBottom: '16px' }}>
                                            <FiUploadCloud />
                                        </div>
                                        <h4 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                                            Enviar modelo pronto do certificado
                                        </h4>
                                        <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                            Use esta opção se você já tem o certificado/modelo pronto. Formatos: <strong>.pdf</strong> ou <strong>.docx</strong>.
                                        </p>
                                    </div>

                                    {/* Option B: Manual */}
                                    <div
                                        onClick={() => setStep(1)}
                                        className={`${styles['v4-choice-card']} ${styles['v4-choice-card-purple']}`}
                                    >
                                        <div className={styles['v4-orientation-icon-box']} style={{ color: '#a855f7', fontSize: '36px', marginBottom: '16px' }}>
                                            <FiEdit3 />
                                        </div>
                                        <h4 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                                            Configurar manualmente
                                        </h4>
                                        <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                            Ideal para quem não tem modelo pronto: você monta o certificado em etapas guiadas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: NOME DO CURSO */}
                        {step === 1 && (
                            <div className={styles['v4-step-wrapper']}>
                                <div className={styles['v4-icon-circle']}>
                                    <FiBookOpen />
                                </div>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    Nome do Curso
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '340px', lineHeight: '1.5' }}>
                                    Vamos começar! Como deseja chamar seu curso?
                                </p>
                                <div className={styles['v4-input-container']}>
                                    <input
                                        type="text"
                                        className={`${styles['v4-glass-input']} ${inputError ? styles.error : ''}`}
                                        placeholder="Digite o nome do curso"
                                        value={courseName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                            setCourseName(capitalized);
                                            if (val.trim()) setInputError(false);
                                        }}
                                        autoFocus
                                    />
                                    <span className={styles['v4-input-icon']}><FiBookOpen /></span>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CARGA HORÁRIA */}
                        {step === 2 && (
                            <div className={styles['v4-step-wrapper']}>
                                <div className={`${styles['v4-icon-circle']} ${styles['v4-icon-circle-purple']}`}>
                                    <FiClock />
                                </div>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    Carga Horária
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '340px', lineHeight: '1.5' }}>
                                    Qual a duração total do curso? (Opcional)
                                </p>
                                <div className={styles['v4-input-container']}>
                                    <input
                                        type="number"
                                        className={styles['v4-glass-input']}
                                        placeholder="Ex.: 40 (Opcional)"
                                        value={courseHours}
                                        onChange={(e) => setCourseHours(e.target.value)}
                                        min="1"
                                        autoFocus
                                    />
                                    <span className={styles['v4-input-icon']}><FiClock /></span>
                                </div>
                                <small style={{ color: 'var(--v4-text-white-muted)', display: 'block', marginTop: '-16px', marginBottom: '30px', fontSize: '12px' }}>
                                    Deixe em branco se preferir não exibir.
                                </small>
                            </div>
                        )}

                        {/* STEP 3: ESCOLHA A ORIENTAÇÃO */}
                        {step === 3 && (
                            <div className={styles['v4-step-wrapper']}>
                                <div className={styles['v4-icon-circle']}>
                                    <FiCompass />
                                </div>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '26px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    Escolha a Orientação
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '340px', lineHeight: '1.5' }}>
                                    Selecione como você deseja visualizar o conteúdo
                                </p>
                                <div className={styles['v4-orientation-grid']}>
                                    <div
                                        onClick={() => handleSelectOrientation('landscape')}
                                        className={`${styles['v4-orientation-card']} ${orientation === 'landscape' ? styles['active-blue'] : ''}`}
                                    >
                                        <div className={styles['v4-orientation-icon-box']}><FiMonitor /></div>
                                        <h5 style={{ color: 'var(--v4-text-title)', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Paisagem</h5>
                                        <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>Certificado deitado (Horizontal)</p>
                                    </div>
                                    <div
                                        onClick={() => handleSelectOrientation('portrait')}
                                        className={`${styles['v4-orientation-card']} ${orientation === 'portrait' ? styles['active-purple'] : ''}`}
                                    >
                                        <div className={styles['v4-orientation-icon-box']}><FiSmartphone /></div>
                                        <h5 style={{ color: 'var(--v4-text-title)', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Retrato</h5>
                                        <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>Certificado em pé (Vertical)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: ESCOLHA A MOLDURA (FRENTE) */}
                        {step === 4 && subStep === 'front' && (
                            <div className={styles['v4-step-wrapper']}>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '20px', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                                    Escolha a Moldura
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', marginBottom: '16px', textAlign: 'center', maxWidth: '440px', lineHeight: '1.4' }}>
                                    Selecione a moldura que melhor combina com o estilo do seu certificado
                                </p>

                                {/* Absolute Floating Tooltip Container (unclipped) */}
                                <div style={{ position: 'relative', width: '100%', height: 0, overflow: 'visible', zIndex: 99999999 }}>
                                    {showFrameGuide && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '16px',
                                            left: '25%',
                                            transform: 'translateX(-50%)',
                                            background: 'rgba(20, 20, 25, 0.98)',
                                            border: '2px solid #fa3f7a',
                                            borderRadius: '12px',
                                            padding: '14px 22px',
                                            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(250, 63, 122, 0.45)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            width: '260px',
                                            pointerEvents: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            animation: 'tourFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                        }}>
                                            <style dangerouslySetInnerHTML={{
                                                __html: `
                                                @keyframes tourFadeIn {
                                                    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                                                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                                                }
                                            `}} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#fa3f7a',
                                                    display: 'inline-block'
                                                }} />
                                                <span style={{ color: '#fa3f7a', fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                                    MOLDURA PRÓPRIA
                                                </span>
                                            </div>
                                            <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left' }}>
                                                Se você já possui um modelo ou design pronto, clique aqui para enviar o arquivo PNG ou JPG do seu certificado!
                                            </span>
                                            {/* Downward pointing arrow */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-7px',
                                                left: '50%',
                                                transform: 'translateX(-50%) rotate(45deg)',
                                                width: '12px',
                                                height: '12px',
                                                background: 'rgba(20, 20, 25, 0.98)',
                                                borderRight: '2px solid #fa3f7a',
                                                borderBottom: '2px solid #fa3f7a',
                                            }} />
                                        </div>
                                    )}
                                </div>

                                {/* Frame options grid fetched directly from Backend */}
                                <div className={styles['v4-frames-grid']} style={{ height: '348px' }}>
                                    {/* Custom Upload Card */}
                                    <div
                                        onClick={() => {
                                            if (!customFrameUrl) {
                                                fileInputRef.current?.click();
                                            } else {
                                                setSelectedFrameId('custom');
                                            }
                                        }}
                                        className={`${styles['v4-frame-select-card']} ${selectedFrameId === 'custom' ? styles.selected : ''}`}
                                        style={{ border: customFrameUrl ? '1px solid var(--v4-border-input)' : '2px dashed var(--v4-placeholder-input)', background: 'var(--v4-bg-choice-card)' }}
                                    >
                                        <div className={styles['v4-frame-image-wrapper']} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: customFrameUrl ? '0' : '16px', position: 'relative' }}>
                                            {customFrameUrl ? (
                                                <Fragment>
                                                    <img src={customFrameUrl} alt="Moldura Personalizada" className={styles['v4-frame-preview-img']} />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fileInputRef.current?.click();
                                                        }}
                                                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', backdropFilter: 'blur(4px)', cursor: 'pointer', opacity: selectedFrameId === 'custom' ? 1 : 0, transition: 'opacity 0.2s' }}
                                                    >
                                                        Trocar Imagem
                                                    </button>
                                                </Fragment>
                                            ) : (
                                                <Fragment>
                                                    <FiUploadCloud size={28} style={{ color: 'var(--v4-text-subtitle)', marginBottom: '8px' }} />
                                                    <span style={{ color: 'var(--v4-text-title)', fontSize: '16px', textAlign: 'center', fontWeight: 700 }}>Subir moldura própria</span>
                                                    <span style={{ color: 'var(--v4-text-muted)', fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>PNG, JPG até 5MB</span>
                                                    {customFrameError && (
                                                        <span style={{ color: '#ef4444', fontSize: '11px', textAlign: 'center', marginTop: '6px', fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
                                                            {customFrameError}
                                                        </span>
                                                    )}
                                                </Fragment>
                                            )}
                                            {selectedFrameId === 'custom' && (
                                                <span className={styles['v4-frame-badge']}>
                                                    <FiCheck />
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            hidden
                                            onChange={handleCustomFrameUpload}
                                        />
                                    </div>

                                    {loadingFrames ? (
                                        <Fragment>
                                            <div className={styles['v4-skeleton-card']} />
                                            <div className={styles['v4-skeleton-card']} />
                                            <div className={styles['v4-skeleton-card']} />
                                        </Fragment>
                                    ) : (
                                        frames.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedFrameId(item.id)}
                                                className={`${styles['v4-frame-select-card']} ${selectedFrameId === item.id ? styles.selected : ''}`}
                                            >
                                                <div className={styles['v4-frame-image-wrapper']}>
                                                    {item.frame ? (
                                                        <img src={item.frame} alt={item.name} className={styles['v4-frame-preview-img']} />
                                                    ) : (
                                                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>Sem Moldura</span>
                                                    )}
                                                    {selectedFrameId === item.id && (
                                                        <span className={styles['v4-frame-badge']}>
                                                            <FiCheck />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: PERGUNTA DO VERSO + MOLDURA DO VERSO */}
                        {step === 4 && subStep === 'back' && (
                            <div className={styles['v4-step-wrapper']}>
                                <h3 style={{ color: 'var(--v4-text-title)', fontWeight: 700, fontSize: '20px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    O certificado terá verso?
                                </h3>
                                <p style={{ color: 'var(--v4-text-subtitle)', fontSize: '13px', marginBottom: '24px', textAlign: 'center', maxWidth: '440px', lineHeight: '1.4' }}>
                                    Determine se o certificado terá uma segunda página no verso
                                </p>

                                <div style={{ display: 'flex', background: 'var(--v4-bg-input)', padding: '6px', borderRadius: '16px', border: '1px solid var(--v4-border-input)', marginBottom: '32px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasVerso(false);
                                        }}
                                        style={{
                                            padding: '12px 32px',
                                            borderRadius: '12px',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            border: 'none',
                                            background: !hasVerso ? 'var(--v4-bg-circle-nav-hover)' : 'transparent',
                                            color: !hasVerso ? 'var(--v4-text-title)' : 'var(--v4-placeholder-input)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Não
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasVerso(true);
                                        }}
                                        style={{
                                            padding: '12px 32px',
                                            borderRadius: '12px',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            border: 'none',
                                            background: hasVerso ? 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)' : 'transparent',
                                            color: hasVerso ? '#ffffff' : 'var(--v4-placeholder-input)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            boxShadow: hasVerso ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
                                        }}
                                    >
                                        Sim
                                    </button>
                                </div>

                                {hasVerso ? (
                                    <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
                                        <span style={{ color: 'var(--v4-text-subtitle)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px', textAlign: 'center', width: '100%' }}>
                                            Escolha a Moldura do Verso
                                        </span>
                                        <div
                                            className={styles['v4-frames-grid']}
                                            style={{ height: '180px', minHeight: '180px', margin: 0 }}
                                        >
                                            {/* Smart Default Card: Same as Front */}
                                            <div
                                                onClick={() => setSelectedBackFrameId('same')}
                                                className={`${styles['v4-frame-select-card']} ${selectedBackFrameId === 'same' ? styles.selected : ''}`}
                                            >
                                                <div className={styles['v4-frame-image-wrapper']}>
                                                    {selectedFrameId === 'custom' && customFrameUrl ? (
                                                        <img src={customFrameUrl} alt="Mesma da Frente (Upload)" className={styles['v4-frame-preview-img']} />
                                                    ) : (
                                                        (() => {
                                                            const frontFrame = frames.find(f => f.id === selectedFrameId);
                                                            return frontFrame?.frame ? (
                                                                <img src={frontFrame.frame} alt="Mesma da Frente" className={styles['v4-frame-preview-img']} />
                                                            ) : (
                                                                <span style={{ color: 'var(--v4-text-subtitle)', fontSize: '11px', textAlign: 'center', padding: '4px' }}>Mesma da Frente</span>
                                                            );
                                                        })()
                                                    )}
                                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.85)', color: '#ffffff', fontSize: '9px', fontWeight: 600, padding: '4px', textAlign: 'center' }}>
                                                        Manter mesma da frente
                                                    </div>
                                                    {selectedBackFrameId === 'same' && (
                                                        <span className={styles['v4-frame-badge']}>
                                                            <FiCheck />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Other database frames */}
                                            {frames.map(item => (
                                                <div
                                                    key={`back-${item.id}`}
                                                    onClick={() => setSelectedBackFrameId(item.id)}
                                                    className={`${styles['v4-frame-select-card']} ${selectedBackFrameId === item.id ? styles.selected : ''}`}
                                                >
                                                    <div className={styles['v4-frame-image-wrapper']}>
                                                        {item.frame ? (
                                                            <img src={item.back_frame || item.frame} alt={item.name} className={styles['v4-frame-preview-img']} />
                                                        ) : (
                                                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>Sem Moldura</span>
                                                        )}
                                                        {selectedBackFrameId === item.id && (
                                                            <span className={styles['v4-frame-badge']}>
                                                                <FiCheck />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--v4-text-muted)', animation: 'fadeIn 0.3s ease' }}>
                                        <FiAward size={48} style={{ marginBottom: '12px', opacity: 0.6 }} />
                                        <span style={{ fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>Certificado em página única (apenas frente)</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Circular Progress Ring matching standard layout */}
                        {step > 0 && (
                            <div className={styles['v4-progress-ring-container']}>
                                <svg className={styles['v4-progress-svg']} width="60" height="60">
                                    <defs>
                                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                    <circle className={styles['v4-progress-circle-bg']} cx="30" cy="30" r="26" />
                                    <circle
                                        className={styles['v4-progress-circle-bar']}
                                        cx="30"
                                        cy="30"
                                        r="26"
                                        strokeDasharray={`${2 * Math.PI * 26}`}
                                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress.pct / 100)}`}
                                    />
                                </svg>
                                <span style={{ color: 'var(--v4-text-title)', fontSize: '13px', fontWeight: '700', marginTop: '-41px', marginBottom: '22px' }}>
                                    {progress.pct}%
                                </span>
                                <span style={{ color: 'var(--v4-text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    {progress.label}
                                </span>
                            </div>
                        )}

                        {/* Footer Controls Row */}
                        {step > 0 && (
                            <div className={styles['v4-controls-row']}>
                                <button
                                    onClick={handlePrev}
                                    disabled={isSubmitting}
                                    className={styles['v4-btn-circle-nav']}
                                    type="button"
                                    title="Anterior"
                                >
                                    <FiChevronLeft />
                                </button>

                                <div className="d-flex align-items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span
                                            key={i}
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: step === i ? '#3b82f6' : 'var(--v4-border-choice-card)',
                                            }}
                                        />
                                    ))}
                                </div>

                                {step < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        className={`${styles['v4-btn-circle-nav']} ${styles['v4-btn-circle-next']}`}
                                        type="button"
                                        title="Próximo"
                                    >
                                        <FiChevronRight />
                                    </button>
                                ) : subStep === 'front' ? (
                                    <button
                                        onClick={() => setSubStep('back')}
                                        className={styles['v4-btn-finalize']}
                                        type="button"
                                    >
                                        Próximo
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFinalize}
                                        className={styles['v4-btn-finalize']}
                                        type="button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Abrindo...' : 'Configurar'}
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </div>
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

export default CourseV4;
