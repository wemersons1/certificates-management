import React, { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';
import api from '@/src/lib/api';
import Editor from '@/src/components/common/Editor/Editor';
import CourseCadastrar from '@/src/pages/Courses/Cadastrar';
import AppContext from '@/src/AppContext/Context';
import { optimizeImage } from '@/src/lib/helper';
import {
  FiInfo, FiLayout, FiFileText, FiBookOpen,
  FiEye, FiCheck, FiX, FiPlus, FiTrash2, FiMaximize2, FiMinimize2, FiArrowLeft, FiArrowRight, FiCode, FiAward
} from 'react-icons/fi';

interface TemplateData {
  name: string;
  number_of_hours_studied: number;
  template: string;
  type_id: number | null;
  frame_color?: string;
  frame_type?: 'color' | 'custom';
  orientation?: 'landscape' | 'portrait';
  frame_id?: null | number;
  back_document?: null | string;
  certificate_id: number;
}

const A4_PORTRAIT_WIDTH_IN_PX = 794;
const A4_PORTRAIT_HEIGHT_IN_PX = 1123;
const A4_LANDSCAPE_WIDTH_IN_PX = 1123;
const A4_LANDSCAPE_HEIGHT_IN_PX = 794;

const QRCODE_PLACEHOLDER_HTML = `
  <div class="mceNonEditable" style="
      width: 100px;
      height: 100px;
      border: 1px solid #ccc;
      font-size: 10px;
      color: #555;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
  " data-mask-key="qrcode_validacao" contenteditable="false">
      <span>[QR Code]<br/>Validação</span>
  </div>
`;

const CourseEdit: FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { theme, checkRole } = useContext(AppContext);
  const reduxTheme = useSelector((state: any) => state);
  const themeMode = reduxTheme?.dataThemeMode === 'dark' ? 'dark' : 'light';

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
      .catch(err => console.error("Error fetching credit balance in CourseEdit:", err));
  }, [checkRole]);

  // States
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'certificate_model'>('general');
  const [loading, setLoading] = useState(true);
  const [disabledSubmit, setDisabledSubmit] = useState(false);

  const [item, setItem] = useState<TemplateData>({
    name: '',
    template: '',
    type_id: 1,
    orientation: 'landscape',
    frame_type: 'custom',
    frame_id: null,
    back_document: '',
    number_of_hours_studied: 0,
    certificate_id: 0
  });

  const [selectedPalette, setSelectedPalette] = useState('#29638d');
  const [selectedBorder, setSelectedBorder] = useState<number | null>(null);
  const [selectedBackBorderId, setSelectedBackBorderId] = useState<number | string | null>(null);
  const [borders, setBorders] = useState<{ id: number; frame: string; back_frame?: string; is_top_only?: boolean; back_is_top_only?: boolean }[]>([]);
  const [customFrame, setCustomFrame] = useState<string | null>(null);
  const [customBackFrame, setCustomBackFrame] = useState<string | null>(null);
  const [customIsTopOnly, setCustomIsTopOnly] = useState<boolean | null>(null);
  const [customBackIsTopOnly, setCustomBackIsTopOnly] = useState<boolean | null>(null);

  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  const editorRefFront = useRef<any>(null);
  const editorRefBack = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const [editorPage, setEditorPage] = useState<number>(1);
  const [editorHasVerso, setEditorHasVerso] = useState<boolean>(false);
  const [activeFrameTab, setActiveFrameTab] = useState<'front' | 'back'>('front');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showFrameModal, setShowFrameModal] = useState<boolean>(false);
  const [showHTMLModal, setShowHTMLModal] = useState<boolean>(false);
  const [htmlModalPage, setHtmlModalPage] = useState<number>(1);
  const [htmlValue, setHtmlValue] = useState<string>('');
  const [htmlModalActiveTab, setHtmlModalActiveTab] = useState<'preview' | 'code'>('preview');
  const [iframeSrc, setIframeSrc] = useState<string>('');

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

  const quickFrontInputRef = useRef<HTMLInputElement>(null);
  const quickBackInputRef = useRef<HTMLInputElement>(null);

  // Masks
  const masks = [
    { key: 'nome_aluno', label: 'Nome Aluno' },
    { key: 'cpf_aluno', label: 'CPF Aluno' },
    { key: 'rg_aluno', label: 'RG Aluno' },
    { key: 'funcao_aluno', label: 'Função Aluno' },
    { key: 'nome_curso', label: 'Nome Curso' },
    { key: 'carga_horaria', label: 'Carga Horária' },
    { key: 'periodo_curso', label: 'Período Curso' },
    { key: 'data_de_emissao', label: 'Data Emissão' },
    { key: 'nome_empresa', label: 'Nome Empresa' },
    { key: 'nome_instrutor', label: 'Nome instrutor' },
    { key: 'formacao_instrutor', label: 'Formação Instrutor' },
    { key: 'crea_instrutor', label: 'CREA Instrutor' },
    { key: 'qrcode_validacao', label: 'QR Code Validação' },
    { key: 'assinatura(s)_instrutores', label: 'Assinaturas' }
  ];

  // Fetch Frames and Course Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedBorders = await getTemplateFrames();
        if (courseId) {
          const res = await api.get(`/courses/${courseId}`);
          const data = res.data;

          let templateContent = substituirMascaraPorAssinaturaInstrutores(data.certificate_template?.template);
          templateContent = substituirMascaraQRCodePorPlaceholder(templateContent);

          let backDocumentContent = substituirMascaraPorAssinaturaInstrutores(data.certificate_template?.back_document ?? '');
          backDocumentContent = substituirMascaraQRCodePorPlaceholder(backDocumentContent);

          setItem({
            ...data.certificate_template,
            name: data.name,
            number_of_hours_studied: data.number_of_hours_studied,
            template: data.certificate_template?.template,
            back_document: data.certificate_template?.back_document,
            certificate_id: data.certificate_id
          });

          if (data.certificate_template?.frame_type === 'custom') {
            const frameId = data.certificate_template.frame_id;
            setSelectedBorder(frameId);

            // Check if this database border has a distinct back frame
            if (frameId && loadedBorders) {
              const match = loadedBorders.find((b: any) => b.id === frameId);
              if (match && match.original_back_frame && match.original_back_frame !== match.original_frame) {
                setSelectedBackBorderId(frameId);
              }
            }
          }
          if (data.certificate_template?.frame_color) {
            setSelectedPalette(data.certificate_template.frame_color);
          }
          const hasBackDoc = data.certificate_template?.back_document ? true : false;
          setEditorHasVerso(hasBackDoc);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do curso:', err);
        toast.error('Erro ao carregar os dados do curso.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const getTemplateFrames = async () => {
    try {
      const response = await api.get('/document-template-frames?all=1');
      const processedBorders = await Promise.all(
        response.data.map(async (item: any) => {
          try {
            const imageResponse = await api.get(`/image?image=${item.frame}`, {
              responseType: 'blob',
            });
            const imageUrl = URL.createObjectURL(imageResponse.data);

            const imgDims = await new Promise<{ width: number; height: number }>((resolve) => {
              const img = new Image();
              img.onload = () => resolve({ width: img.width, height: img.height });
              img.onerror = () => resolve({ width: 0, height: 0 });
              img.src = imageUrl;
            });
            const computedIsTopOnly = imgDims.height > 0 && (imgDims.height < 300 || (imgDims.width / imgDims.height) >= 1.8);

            let backImageUrl = '';
            let backIsTopOnly = computedIsTopOnly;
            if (item.back_frame) {
              try {
                const backImageResponse = await api.get(`/image?image=${item.back_frame}`, {
                  responseType: 'blob',
                });
                backImageUrl = URL.createObjectURL(backImageResponse.data);
                const backImgDims = await new Promise<{ width: number; height: number }>((resolve) => {
                  const img = new Image();
                  img.onload = () => resolve({ width: img.width, height: img.height });
                  img.onerror = () => resolve({ width: 0, height: 0 });
                  img.src = backImageUrl;
                });
                backIsTopOnly = backImgDims.height > 0 && (backImgDims.height < 300 || (backImgDims.width / backImgDims.height) >= 1.8);
              } catch (err) {
                console.error('Erro ao carregar verso da moldura:', err);
              }
            }

            return {
              ...item,
              frame: imageUrl,
              back_frame: backImageUrl,
              is_top_only: computedIsTopOnly,
              back_is_top_only: backIsTopOnly,
              original_frame: item.frame,
              original_back_frame: item.back_frame || item.frame,
            };
          } catch (error) {
            console.error('Erro ao carregar imagem da moldura:', error);
            return {
              ...item,
              frame: '',
              back_frame: '',
              original_frame: item.frame,
              original_back_frame: item.back_frame || item.frame,
            };
          }
        })
      );
      setBorders(processedBorders);
      return processedBorders;
    } catch (error) {
      console.error('Erro ao buscar molduras:', error);
      return [];
    }
  };

  // Substitution functions
  function substituirPlaceholderQRCodePorMascara(html: string | null): string {
    if (!html) return '';
    const regex = /<div[^>]*class="mceNonEditable"[^>]*data-mask-key="qrcode_validacao"[^>]*>.*?<\/div>/gs;
    return html.replace(regex, '{{qrcode_validacao}}');
  }

  function substituirMascaraQRCodePorPlaceholder(html: string | null): string {
    if (!html) return '';
    return html.replace(/\{\{qrcode_validacao\}\}/g, QRCODE_PLACEHOLDER_HTML);
  }

  // Signature substitutions
  function substituirAssinaturaInstrutoresPorMascara(html: string | null): string {
    if (!html) return '';
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
  }

  function substituirMascaraPorAssinaturaInstrutores(html: string | null): string {
    if (!html) return '';
    const signatureTemplate = `
      <div style="margin-top: 40px; width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
        <div>
          <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
          <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
          <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
          <div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
            <div style="width: 150px; height: 70px; color: #0000ff; font-size: 12px; line-height: 1.1; text-align: center; padding: 1px; box-sizing: border-box; font-family: Arial, sans-serif;">
              <div>
                <strong>{{CARIMBO}}</strong><br />
                Nome do Instrutor<br />
                Instrutor SST<br />
                CNPJ: 12.345.678/0001-90
              </div>
            </div>
          </div>
        </div>
      </div>
    `.trim();
    return html.replace('{{assinatura(s)_instrutores}}', signatureTemplate);
  }

  // Insert Mask in Editor
  const handleInsertMask = (variableKey: string) => {
    const editor = activeTab === 'front_content' ? editorRefFront.current : editorRefBack.current;
    if (!editor) {
      toast.warn('Por favor, certifique-se de que o editor está focado antes de inserir a máscara.');
      return;
    }

    const htmlMap: Record<string, string> = {
      'qrcode_validacao': QRCODE_PLACEHOLDER_HTML,
      'assinatura(s)_instrutores': `
        <div style="margin-top: 40px; width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
          <div>
            <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
            <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
          </div>
        </div>
      `
    };

    editor.focus();
    editor.insertContent(htmlMap[variableKey] || `{{${variableKey}}}`);
  };

  // Background Upload
  const handleQuickChangeBackground = async (file: File, side: 'front' | 'back') => {
    const fileBase64 = await optimizeImage(file, 1200, 1);
    const img = new Image();
    img.src = fileBase64;
    img.onload = () => {
      const isTopOnly = img.height < 450 || (img.width / img.height) >= 1.8;
      if (side === 'front') {
        setCustomFrame(fileBase64);
        setCustomIsTopOnly(isTopOnly);
        setItem(prev => ({ ...prev, frame_type: 'custom' }));
        setSelectedBorder(null);
      } else {
        setCustomBackFrame(fileBase64);
        setCustomBackIsTopOnly(isTopOnly);
        setSelectedBackBorderId(null);
      }
      toast.success(`Fundo da ${side === 'front' ? 'Frente' : 'Verso'} alterado temporariamente.`);
    };
  };

  const handleDeleteBorder = (id: number) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta moldura será deletada permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      background: '#151d30',
      color: '#fff'
    }).then(result => {
      if (result.isConfirmed) {
        setBorders(prev => prev.filter(b => b.id !== id));
        if (selectedBorder === id) {
          setSelectedBorder(null);
          setCustomFrame(null);
        }
        if (selectedBackBorderId === id) {
          setSelectedBackBorderId(null);
          setCustomBackFrame(null);
        }
        api.delete(`/document-template-frames/${id}`);
        toast.success('Moldura removida!');
      }
    });
  };

  const handleViewHTML = () => {
    if (editorRef.current && typeof editorRef.current.getPageHTML === 'function') {
      const pageToLoad = editorPage;
      const currentHtml = editorRef.current.getPageHTML(pageToLoad) || '';
      setHtmlModalPage(pageToLoad);
      setHtmlValue(currentHtml);
      setHtmlModalActiveTab('code'); // Define a aba de edição de código ativa por padrão!
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
      // Fecha o modal após a atualização ser disparada
      setTimeout(() => {
        setShowHTMLModal(false);
        toast.success(`HTML da ${htmlModalPage === 1 ? 'Frente' : 'Verso'} sincronizado no editor!`);
      }, 50);
    } else {
      toast.error('Não foi possível sincronizar o HTML com o componente de certificado.');
    }
  };

  // Submit Logic
  const handleSubmit = async () => {
    if (!item.name || !item.name.trim()) {
      toast.error('Preencha o nome do curso!');
      return;
    }

    setDisabledSubmit(true);

    let currentTemplate = item.template;
    let currentBackDocument = item.back_document;
    let currentOrientation = item.orientation;
    let currentFrameType = item.frame_type;
    let currentFrameColor = selectedPalette;
    let currentFrameId = selectedBorder;
    let currentCustomFrame = customFrame;
    let currentCustomBackFrame = customBackFrame;

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

    let templateTreated = substituirPlaceholderQRCodePorMascara(currentTemplate);
    templateTreated = substituirAssinaturaInstrutoresPorMascara(templateTreated);

    let backDocumentTreated: string | null = null;
    if (editorHasVerso) {
      backDocumentTreated = substituirPlaceholderQRCodePorMascara(currentBackDocument ?? '');
      backDocumentTreated = substituirAssinaturaInstrutoresPorMascara(backDocumentTreated);
    }

    let finalBorderId = currentFrameId;

    const activeBorder = borders.find(b => b.id === currentFrameId);
    const activeBackBorder = borders.find(b => b.id === (selectedBackBorderId ?? currentFrameId));

    const isFrameBase64 = currentCustomFrame?.startsWith('data:image/');
    const isBackFrameBase64 = currentCustomBackFrame?.startsWith('data:image/');

    const resolvedFront = currentCustomFrame || (activeBorder as any)?.original_frame || null;
    const resolvedBack = currentCustomBackFrame || (activeBackBorder as any)?.original_back_frame || null;
    const isHybrid = resolvedFront !== null && resolvedBack !== null && resolvedFront !== resolvedBack && activeBorder?.id !== activeBackBorder?.id;

    if (isFrameBase64 || isBackFrameBase64 || isHybrid) {
      const data = {
        frame: resolvedFront,
        back_frame: resolvedBack,
        is_top_only: customIsTopOnly !== null
          ? customIsTopOnly
          : (customBackIsTopOnly !== null
            ? customBackIsTopOnly
            : (activeBorder?.is_top_only || false)),
      };

      try {
        const response = await api.post('/document-template-frames', data);
        finalBorderId = response.data.id;
      } catch (error) {
        toast.error('Erro ao salvar as imagens de fundo customizadas');
        setDisabledSubmit(false);
        return;
      }
    }

    const payload = {
      name: item.name,
      template: templateTreated,
      back_document: backDocumentTreated,
      orientation: currentOrientation,
      frame_type: currentFrameType,
      frame_color: currentFrameType === 'color' ? currentFrameColor : null,
      frame_id: currentFrameType === 'custom' ? finalBorderId : null,
      type_id: 1,
      skip_gemini_mask_job: true
    };

    try {
      // Upload logo and signatures to S3 (only fires on save, not on upload)
      if (editorRef.current && typeof editorRef.current.saveCourseAssets === 'function' && courseId) {
        await editorRef.current.saveCourseAssets(Number(courseId));
      }

      console.log('Enviando payload atualizado para document-templates:', {
        url: `/document-templates/${item.certificate_id}`,
        payload
      });
      await api.put(`/document-templates/${item.certificate_id}`, payload);
      await api.put(`/courses/${courseId}`, {
        name: item.name,
        number_of_hours_studied: item.number_of_hours_studied || '0',
      });

      setItem(prev => ({
        ...prev,
        template: currentTemplate,
        back_document: currentBackDocument,
        orientation: currentOrientation,
        frame_type: currentFrameType
      }));
      setSelectedPalette(currentFrameColor);
      setSelectedBorder(finalBorderId);
      setCustomFrame(currentCustomFrame);
      setCustomBackFrame(currentCustomBackFrame);

      const instructorsResponse = await api.get('/instructors?all=1').catch(() => null);
      const hasInstructors = instructorsResponse && Array.isArray(instructorsResponse.data) && instructorsResponse.data.length > 0;

      if (hasInstructors) {
        const result = await Swal.fire({
          icon: 'success',
          title: 'Curso Atualizado com Sucesso!',
          text: 'Todas as modificações foram gravadas com segurança. O que deseja fazer a seguir?',
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
          title: 'Curso Atualizado com Sucesso!',
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
      toast.error('Erro ao salvar as alterações do curso.');
    } finally {
      setDisabledSubmit(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        background: themeMode === 'dark' ? '#090b0f' : '#f8fafc',
        color: themeMode === 'dark' ? '#3b82f6' : '#2563eb',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${themeMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'}`,
          borderTopColor: themeMode === 'dark' ? '#3b82f6' : '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ marginLeft: '12px' }}>Carregando Gerenciador de Curso...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isDarkMode = document.documentElement.getAttribute('data-theme-mode') === 'dark';

  return (
    <div className="premium-course-edit" style={{
      background: activeTab === 'certificate_model' ? '#1a1a1e' : 'var(--bg-page)',
      minHeight: '100vh',
      padding: activeTab === 'certificate_model' ? '0px' : '40px 24px',
      color: 'var(--text-subtitle)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        .premium-course-edit {
          --bg-page: #f8fafc;
          --bg-card: rgba(255, 255, 255, 0.75);
          --border-card: rgba(0, 0, 0, 0.08);
          --bg-sidebar: rgba(255, 255, 255, 0.85);
          --border-sidebar: rgba(0, 0, 0, 0.05);
          --text-title: #0f172a;
          --text-subtitle: #475569;
          --text-label: #64748b;
          --text-value: #1e293b;
          --bg-input: #ffffff;
          --border-input: #e2e8f0;
          --shadow-card: 0 10px 40px rgba(0, 0, 0, 0.04);
          --bg-tab-active: rgba(37, 99, 235, 0.08);
          --border-tab-active: #2563eb;
          --text-tab-active: #2563eb;
          --bg-btn-cancel: rgba(0, 0, 0, 0.04);
          --border-btn-cancel: rgba(0, 0, 0, 0.08);
          --text-btn-cancel: #475569;
        }
        [data-theme-mode="dark"] .premium-course-edit {
          --bg-page: #090b0f;
          --bg-card: rgba(15, 23, 42, 0.55);
          --border-card: rgba(255, 255, 255, 0.08);
          --bg-sidebar: rgba(9, 12, 22, 0.8);
          --border-sidebar: rgba(255, 255, 255, 0.06);
          --text-title: #ffffff;
          --text-subtitle: #cbd5e1;
          --text-label: #94a3b8;
          --text-value: #ffffff;
          --bg-input: rgba(15, 23, 42, 0.4);
          --border-input: rgba(255, 255, 255, 0.1);
          --shadow-card: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          --bg-tab-active: rgba(59, 130, 246, 0.12);
          --border-tab-active: #3b82f6;
          --text-tab-active: #60a5fa;
          --bg-btn-cancel: rgba(255, 255, 255, 0.05);
          --border-btn-cancel: rgba(255, 255, 255, 0.08);
          --text-btn-cancel: #cbd5e1;
        }
      `}</style>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} />

      {activeTab === 'certificate_model' && (
        <style>{`
          /* Force app layout containers to have dark theme in light mode */
          body, 
          html, 
          .app-content, 
          .main-content, 
          .container-fluid, 
          .premium-course-edit, 
          .content-wrapper {
            background-color: #1a1a1e !important;
            background: #1a1a1e !important;
            padding: 0px !important;
            margin: 0px !important;
          }
          
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
        `}</style>
      )}

      {/* Main Glass Container */}
      <div style={{
        maxWidth: activeTab === 'certificate_model' ? '100%' : '1280px',
        margin: '0 auto',
        background: activeTab === 'certificate_model' ? '#1a1a1e' : 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: activeTab === 'certificate_model' ? 'none' : '1px solid var(--border-card)',
        borderRadius: activeTab === 'certificate_model' ? '0px' : '24px',
        overflow: 'hidden',
        boxShadow: activeTab === 'certificate_model' ? 'none' : 'var(--shadow-card)',
        display: 'grid',
        gridTemplateColumns: activeTab === 'certificate_model' ? '1fr' : '280px 1fr',
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: activeTab === 'certificate_model' ? '100vh' : '680px'
      }}>

        {/* Left Sidebar */}
        {activeTab !== 'certificate_model' && (
          <div style={{
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-sidebar)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }}>
            <div>
              <div style={{ marginBottom: '32px' }}>
                <span style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'var(--text-label)',
                  fontWeight: 700
                }}>
                  Gerenciador de Curso
                </span>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--text-title)',
                  marginTop: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name || 'Nome do Curso'}
                </h2>
              </div>

              {/* Sidebar Navigation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: activeTab === 'general' ? 'var(--bg-tab-active)' : 'transparent',
                    border: activeTab === 'general' ? '1.5px solid var(--border-tab-active)' : '1.5px solid transparent',
                    color: activeTab === 'general' ? 'var(--text-tab-active)' : 'var(--text-label)',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: activeTab === 'general' ? '0 0 15px var(--bg-tab-active)' : 'none'
                  }}
                >
                  <FiInfo size={18} /> Informações Gerais
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('layout')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: activeTab === 'layout' ? 'var(--bg-tab-active)' : 'transparent',
                    border: activeTab === 'layout' ? '1.5px solid var(--border-tab-active)' : '1.5px solid transparent',
                    color: activeTab === 'layout' ? 'var(--text-tab-active)' : 'var(--text-label)',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: activeTab === 'layout' ? '0 0 15px var(--bg-tab-active)' : 'none'
                  }}
                >
                  <FiLayout size={18} /> Layout & Moldura
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('certificate_model')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: activeTab === 'certificate_model' ? 'var(--bg-tab-active)' : 'transparent',
                    border: activeTab === 'certificate_model' ? '1.5px solid var(--border-tab-active)' : '1.5px solid transparent',
                    color: activeTab === 'certificate_model' ? 'var(--text-tab-active)' : 'var(--text-label)',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: activeTab === 'certificate_model' ? '0 0 15px var(--bg-tab-active)' : 'none'
                  }}
                >
                  <FiFileText size={18} /> Design de Certificado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Content Panel */}
        <div style={{
          padding: activeTab === 'certificate_model' ? '0px' : '40px',
          overflowY: 'auto',
          maxHeight: activeTab === 'certificate_model' ? 'none' : '820px'
        }}>

          {/* TAB 1: GENERAL INFORMATION */}
          {activeTab === 'general' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-title)' }}>
                Detalhes Básicos do Curso
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Nome do Curso
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => setItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome completo do curso"
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      color: 'var(--text-value)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Carga Horária (Horas)
                  </label>
                  <input
                    type="number"
                    value={item.number_of_hours_studied}
                    onChange={(e) => setItem(prev => ({ ...prev, number_of_hours_studied: parseInt(e.target.value) ?? '' }))}
                    placeholder="Ex: 40"
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      color: 'var(--text-value)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                maxWidth: '350px'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.color = '#f87171';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  <FiX size={15} /> Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('layout');
                  }}
                  style={{
                    flex: 1.6,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  Próximo <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT & BORDERS */}
          {activeTab === 'layout' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-title)' }}>
                Orientação & Molduras de Fundo
              </h3>

              {/* O certificado terá verso? */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '12px', textTransform: 'uppercase' }}>
                  O certificado terá verso?
                </label>
                <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-input)', width: 'fit-content' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditorHasVerso(false);
                      if (editorRef.current && typeof editorRef.current.setEnableVerso === 'function') {
                        editorRef.current.setEnableVerso(false);
                      }
                      setActiveFrameTab('front');
                    }}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      background: !editorHasVerso ? 'var(--bg-tab-active)' : 'transparent',
                      color: !editorHasVerso ? 'var(--text-tab-active)' : 'var(--text-label)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditorHasVerso(true);
                      if (editorRef.current && typeof editorRef.current.setEnableVerso === 'function') {
                        editorRef.current.setEnableVerso(true);
                      }
                    }}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      background: editorHasVerso ? 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)' : 'transparent',
                      color: editorHasVerso ? '#ffffff' : 'var(--text-label)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      boxShadow: editorHasVerso ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                  >
                    Sim
                  </button>
                </div>
              </div>

              {/* Orientation Pick */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Orientação da Página A4
                </label>
                <div style={{ display: 'flex', gap: '12px', maxWidth: '350px' }}>
                  <button
                    onClick={() => setItem(prev => ({ ...prev, orientation: 'landscape' }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      background: item.orientation === 'landscape' ? 'var(--bg-tab-active)' : 'var(--bg-btn-cancel)',
                      border: item.orientation === 'landscape' ? '1.5px solid var(--border-tab-active)' : '1.5px solid var(--border-input)',
                      color: item.orientation === 'landscape' ? 'var(--text-tab-active)' : 'var(--text-label)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Paisagem
                  </button>
                  <button
                    onClick={() => setItem(prev => ({ ...prev, orientation: 'portrait' }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      background: item.orientation === 'portrait' ? 'var(--bg-tab-active)' : 'var(--bg-btn-cancel)',
                      border: item.orientation === 'portrait' ? '1.5px solid var(--border-tab-active)' : '1.5px solid var(--border-input)',
                      color: item.orientation === 'portrait' ? 'var(--text-tab-active)' : 'var(--text-label)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Retrato
                  </button>
                </div>
              </div>

              {/* Sub-tabs for Front/Back Frame editing if verso is active */}
              {editorHasVerso && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-input)', maxWidth: '350px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveFrameTab('front')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeFrameTab === 'front' ? 'var(--bg-tab-active)' : 'transparent',
                      color: activeFrameTab === 'front' ? 'var(--text-tab-active)' : 'var(--text-label)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Moldura da Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFrameTab('back')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeFrameTab === 'back' ? 'var(--bg-tab-active)' : 'transparent',
                      color: activeFrameTab === 'back' ? 'var(--text-tab-active)' : 'var(--text-label)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Moldura do Verso
                  </button>
                </div>
              )}

              {/* Hidden file inputs for programmatic trigger */}
              <input
                type="file"
                ref={quickFrontInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleQuickChangeBackground(e.target.files[0], 'front')}
              />
              <input
                type="file"
                ref={quickBackInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleQuickChangeBackground(e.target.files[0], 'back')}
              />

              {/* Selected Frame View & Alterar Button */}
              {item.frame_type === 'custom' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    {activeFrameTab === 'front' ? 'Moldura da Frente Selecionada' : 'Moldura do Verso Selecionada'}
                  </label>

                  {/* Selected Card Wrapper */}
                  <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '260px',
                      aspectRatio: item.orientation === 'portrait' ? '1/1.4' : '1.4/1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setShowFrameModal(true)}
                  >
                    {/* Render Image or Placeholder */}
                    {(() => {
                      if (activeFrameTab === 'front') {
                        if (customFrame) {
                          return <img src={customFrame} alt="Frente Customizada" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />;
                        }
                        const frontBorder = borders.find(b => b.id === selectedBorder);
                        if (frontBorder?.frame) {
                          return <img src={frontBorder.frame} alt="Frente Selecionada" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />;
                        }
                        return <span style={{ color: 'var(--text-label)', fontSize: '13px' }}>Sem Moldura</span>;
                      } else {
                        // Back page
                        if (customBackFrame) {
                          return <img src={customBackFrame} alt="Verso Customizado" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />;
                        }
                        if (selectedBackBorderId === 'same' || !selectedBackBorderId) {
                          // Display front frame image with a label
                          if (customFrame) {
                            return (
                              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <img src={customFrame} alt="Mesma da Frente" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain', opacity: 0.6 }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  Mesma da Frente
                                </div>
                              </div>
                            );
                          }
                          const frontBorder = borders.find(b => b.id === selectedBorder);
                          if (frontBorder?.frame) {
                            return (
                              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <img src={frontBorder.frame} alt="Mesma da Frente" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain', opacity: 0.6 }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  Mesma da Frente
                                </div>
                              </div>
                            );
                          }
                          return <span style={{ color: 'var(--text-label)', fontSize: '13px' }}>Mesma da Frente</span>;
                        }
                        const backBorder = borders.find(b => b.id === selectedBackBorderId);
                        if (backBorder?.back_frame || backBorder?.frame) {
                          return <img src={backBorder.back_frame || backBorder.frame} alt="Verso Selecionado" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />;
                        }
                        return <span style={{ color: 'var(--text-label)', fontSize: '13px' }}>Sem Moldura</span>;
                      }
                    })()}

                    {/* Premium Bold Outline Edit Button - Always Visible in the Top-Left */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFrameModal(true);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 15,
                        background: 'rgba(24, 24, 27, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '2px solid #fa3f7a',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fa3f7a';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(250, 63, 122, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(24, 24, 27, 0.7)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
                      }}
                    >
                      <FiLayout size={12} style={{ strokeWidth: 3 }} />
                      Editar
                    </button>
                  </div>
                </div>
              )}

              {/* Premium Dark Studio Frame Selection Modal */}
              <Modal
                show={showFrameModal}
                onHide={() => setShowFrameModal(false)}
                size="lg"
                centered
                contentClassName="bg-transparent border-0"
                style={{ zIndex: 1060 }}
              >
                <div style={{
                  background: 'rgba(24, 24, 27, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {activeFrameTab === 'front' ? 'Selecionar Moldura da Frente' : 'Selecionar Moldura do Verso'}
                    </h3>
                    <button
                      onClick={() => setShowFrameModal(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-label)',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-label)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                    >
                      <FiX size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-label)' }}>
                        Escolha uma moldura do banco de imagens ou faça upload de um arquivo personalizado.
                      </span>
                      <div>
                        {activeFrameTab === 'front' ? (
                          <button
                            onClick={() => {
                              quickFrontInputRef.current?.click();
                              setShowFrameModal(false);
                            }}
                            style={{
                              padding: '8px 16px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              color: '#60a5fa',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                          >
                            + Upload Frente
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              quickBackInputRef.current?.click();
                              setShowFrameModal(false);
                            }}
                            style={{
                              padding: '8px 16px',
                              background: 'rgba(168, 85, 247, 0.15)',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                              color: '#c084fc',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'}
                          >
                            + Upload Verso
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '16px'
                    }}>
                      {/* Custom uploaded background card for Front */}
                      {activeFrameTab === 'front' && customFrame && (
                        <div
                          onClick={() => {
                            setSelectedBorder(null);
                            setShowFrameModal(false);
                          }}
                          style={{
                            position: 'relative',
                            aspectRatio: item.orientation === 'portrait' ? '1/1.4' : '1.4/1',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: selectedBorder === null ? '2px solid #3b82f6' : '1px solid var(--border-input)',
                            boxShadow: selectedBorder === null ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none',
                            cursor: 'pointer',
                            background: 'var(--bg-page)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <img src={customFrame} alt="Customizado Frente" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(59, 130, 246, 0.95)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '6px 4px',
                            textAlign: 'center'
                          }}>
                            Fundo Customizado
                          </div>
                        </div>
                      )}

                      {/* Custom uploaded background card for Back */}
                      {activeFrameTab === 'back' && customBackFrame && (
                        <div
                          onClick={() => {
                            setSelectedBackBorderId(null);
                            setShowFrameModal(false);
                          }}
                          style={{
                            position: 'relative',
                            aspectRatio: item.orientation === 'portrait' ? '1/1.4' : '1.4/1',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: selectedBackBorderId === null ? '2px solid #3b82f6' : '1px solid var(--border-input)',
                            boxShadow: selectedBackBorderId === null ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none',
                            cursor: 'pointer',
                            background: 'var(--bg-page)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <img src={customBackFrame} alt="Customizado Verso" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }} />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(168, 85, 247, 0.95)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '6px 4px',
                            textAlign: 'center'
                          }}>
                            Verso Customizado
                          </div>
                        </div>
                      )}

                      {/* For Back Frame: Special card to inherit front frame */}
                      {activeFrameTab === 'back' && (
                        <div
                          onClick={() => {
                            setSelectedBackBorderId('same');
                            setCustomBackFrame(null);
                            setShowFrameModal(false);
                          }}
                          style={{
                            position: 'relative',
                            aspectRatio: item.orientation === 'portrait' ? '1/1.4' : '1.4/1',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: (selectedBackBorderId === 'same' || !selectedBackBorderId) ? '2px solid #3b82f6' : '1px solid var(--border-input)',
                            boxShadow: (selectedBackBorderId === 'same' || !selectedBackBorderId) ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none',
                            cursor: 'pointer',
                            background: 'var(--bg-page)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {(() => {
                            const frontBorder = borders.find(b => b.id === selectedBorder);
                            return customFrame ? (
                              <img src={customFrame} alt="Mesma da Frente" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain', opacity: 0.6 }} />
                            ) : frontBorder?.frame ? (
                              <img src={frontBorder.frame} alt="Mesma da Frente" style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain', opacity: 0.6 }} />
                            ) : (
                              <span style={{ color: 'var(--text-label)', fontSize: '11px', textAlign: 'center' }}>Mesma da Frente</span>
                            );
                          })()}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.85)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '6px 4px',
                            textAlign: 'center'
                          }}>
                            Manter mesma da frente
                          </div>
                        </div>
                      )}

                      {borders.map(b => {
                        const isSelected = activeFrameTab === 'front'
                          ? selectedBorder === b.id
                          : selectedBackBorderId === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => {
                              if (activeFrameTab === 'front') {
                                setSelectedBorder(b.id);
                                setCustomFrame(null);
                              } else {
                                setSelectedBackBorderId(b.id);
                                setCustomBackFrame(null);
                              }
                              setShowFrameModal(false);
                            }}
                            style={{
                              position: 'relative',
                              aspectRatio: item.orientation === 'portrait' ? '1/1.4' : '1.4/1',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-input)',
                              boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none',
                              cursor: 'pointer',
                              background: 'var(--bg-page)',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <img
                              src={activeFrameTab === 'front' ? b.frame : (b.back_frame || b.frame)}
                              alt="Moldura"
                              style={{ width: '100%', height: '100%', objectFit: item.orientation === 'portrait' ? 'cover' : 'contain' }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBorder(b.id);
                              }}
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: 'rgba(239, 68, 68, 0.95)',
                                border: 'none',
                                color: '#fff',
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#ef4444'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.95)'}
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Modal>

              {/* Color Palette Choice */}
              {item.frame_type === 'color' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-label)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Escolha a Cor da Borda/Fundo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      type="color"
                      value={selectedPalette}
                      onChange={(e) => setSelectedPalette(e.target.value)}
                      style={{
                        width: '60px',
                        height: '60px',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: 'transparent'
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-title)' }}>{selectedPalette}</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-label)', margin: '4px 0 0 0' }}>Escolha a cor de preenchimento para as bordas do certificado</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                maxWidth: '350px'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.color = '#f87171';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  <FiX size={15} /> Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('certificate_model');
                  }}
                  style={{
                    flex: 1.6,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  Próximo <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATE MODEL */}
          {activeTab === 'certificate_model' && (
            <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>

              {/* Immersive Toolbar Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background: '#1a1a1e',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setActiveTab('general')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '8px 20px',
                      borderRadius: '30px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                      animation: 'floatBounce 3s ease-in-out infinite',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
                      e.currentTarget.style.animationPlayState = 'paused';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.animationPlayState = 'running';
                    }}
                  >
                    <FiArrowLeft size={16} /> Voltar
                  </button>
                  <div style={{
                    width: '1px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.08)'
                  }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Design de Certificado
                  </h3>
                </div>

                <button
                  onClick={handleViewHTML}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(250, 63, 122, 0.15)',
                    border: '1px solid rgba(250, 63, 122, 0.3)',
                    color: '#fa3f7a',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 12px rgba(250, 63, 122, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(250, 63, 122, 0.25)';
                    e.currentTarget.style.border = '1px solid rgba(250, 63, 122, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(250, 63, 122, 0.15)';
                    e.currentTarget.style.border = '1px solid rgba(250, 63, 122, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FiEye size={15} />
                  Ver HTML
                </button>
              </div>

              {/* Embedded drag & drop editor component */}
              <div style={{
                borderRadius: '0px',
                overflow: 'hidden',
                background: '#1a1a1e',
                border: 'none',
                minHeight: 'calc(100vh - 68px)'
              }}>
                <CourseCadastrar
                  ref={editorRef}
                  initialOrientation={item.orientation}
                  initialFrameId={selectedBorder}
                  initialBgTheme={item.frame_type === 'custom' ? 'custom-image' : undefined}
                  initialCustomBgUrl={customFrame || undefined}
                  embedded={true}
                  initialEnableVerso={editorHasVerso}
                  initialBackFrameId={selectedBackBorderId === 'same' || !selectedBackBorderId ? selectedBorder : selectedBackBorderId}
                  initialCustomBgUrlPage2={customBackFrame || undefined}
                  initialCourseName={item.name}
                  initialHours={item.number_of_hours_studied?.toString()}
                  initialInstructorName=""
                  initialTemplate={item.template || undefined}
                  initialBackDocument={item.back_document || undefined}
                  courseId={courseId ? Number(courseId) : null}
                  onPageChange={setEditorPage}
                  onVersoChange={setEditorHasVerso}
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Action Button (FAB) for Premium Save */}
      {activeTab === 'certificate_model' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(26, 26, 30, 0.85)',
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
                    onClick={() => navigate('/courses')}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.55)';
                      e.currentTarget.style.color = '#fca5a5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                      e.currentTarget.style.color = '#f87171';
                    }}
                  >
                    <FiX size={15} /> Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={disabledSubmit}
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
                    {disabledSubmit ? 'Salvando...' : (
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
                onClick={() => navigate('/courses')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.55)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                  e.currentTarget.style.color = '#f87171';
                }}
              >
                <FiX size={15} /> Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={disabledSubmit}
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
                {disabledSubmit ? 'Salvando...' : (
                  <>
                    <FiCheck size={16} /> Salvar modelo
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Premium Dark Studio HTML Live Editor Modal - Rendered at root level to stay mounted across tab switches */}
      <Modal
        show={showHTMLModal}
        onHide={() => setShowHTMLModal(false)}
        size="xl"
        centered
        contentClassName="bg-transparent border-0"
        style={{ zIndex: 1060 }}
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
              <FiCode size={20} style={{ color: '#fa3f7a' }} />
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
                color: htmlModalActiveTab === 'preview' ? '#fa3f7a' : '#94a3b8',
                border: 'none',
                borderBottom: htmlModalActiveTab === 'preview' ? '2px solid #fa3f7a' : '2px solid transparent',
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
                color: htmlModalActiveTab === 'code' ? '#fa3f7a' : '#94a3b8',
                border: 'none',
                borderBottom: htmlModalActiveTab === 'code' ? '2px solid #fa3f7a' : '2px solid transparent',
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
                    background: htmlModalPage === 1 ? 'rgba(250, 63, 122, 0.15)' : 'transparent',
                    color: htmlModalPage === 1 ? '#fa3f7a' : '#64748b',
                    border: htmlModalPage === 1 ? '1px solid rgba(250, 63, 122, 0.3)' : '1px solid rgba(255,255,255,0.06)',
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
                    background: htmlModalPage === 2 ? 'rgba(250, 63, 122, 0.15)' : 'transparent',
                    color: htmlModalPage === 2 ? '#fa3f7a' : '#64748b',
                    border: htmlModalPage === 2 ? '1px solid rgba(250, 63, 122, 0.3)' : '1px solid rgba(255,255,255,0.06)',
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
                  <span style={{ color: '#fa3f7a', fontWeight: 'bold' }}>LIVE-SYNC</span>
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
                  background: '#fa3f7a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(250, 63, 122, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e62e67';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 63, 122, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fa3f7a';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(250, 63, 122, 0.3)';
                }}
              >
                <FiCheck size={16} /> Aplicar e Sincronizar
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Embedded Animations & General Styling */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        input:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.25) !important;
        }
      `}</style>
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
    </div>
  );
};

export default CourseEdit;
