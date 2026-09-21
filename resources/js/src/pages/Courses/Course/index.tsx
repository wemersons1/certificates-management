import React, { FC, Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Modal, Nav, Pagination, Row } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
import Editor from '@/src/components/common/Editor/Editor';
import AppContext from '@/src/AppContext/Context';
import { optimizeImage } from '@/src/lib/helper';

interface TemplateData {
  name: string;
  number_of_hours_studied: 0;
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
const EDITOR_SCALE = 1.12;

const createTemplateTraceId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `template-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const summarizeTemplateForTrace = (html: string) => ({
  bytes: html.length,
  paragraphs: (html.match(/<p\b/gi) || []).length,
  divs: (html.match(/<div\b/gi) || []).length,
  hasCertContainer: html.includes('cert-container'),
  hasContentSide: html.includes('content-side'),
  hasPositionedText: /position:\s*absolute/i.test(html),
  hasJessica: html.includes('Jessica'),
});

const getNormalizedTemplateValue = (htmlValue: string, orientation: string) => {
  if (!htmlValue) return '';
  return htmlValue.replace(/<div([^>]*id="page\d+-div"[^>]*style="([^"]*)")[^>]*>/gi, (match, fullAttr, styleAttr) => {
    let newStyle = styleAttr;
    const zoomMatch = styleAttr.match(/\bzoom:\s*([\d.]+)/i);
    const zoom = zoomMatch ? parseFloat(zoomMatch[1]) : 1.0;
    if (zoom > 0 && zoom < 1.0) {
      const targetW = orientation === 'landscape' ? 1123.0 : 794.0;
      const targetH = orientation === 'landscape' ? 794.0 : 1123.0;
      const wMatch = styleAttr.match(/\bwidth:\s*([\d.]+)px/i);
      if (wMatch) {
        const w = parseFloat(wMatch[1]);
        if (Math.abs(w - targetW) <= 5.0) {
          const newW = (targetW / zoom).toFixed(1);
          newStyle = newStyle.replace(/\bwidth:\s*[\d.]+px/i, `width:${newW}px`);
        }
      }
      const hMatch = styleAttr.match(/\bheight:\s*([\d.]+)px/i);
      if (hMatch) {
        const h = parseFloat(hMatch[1]);
        if (Math.abs(h - targetH) <= 5.0) {
          const newH = (targetH / zoom).toFixed(1);
          newStyle = newStyle.replace(/\bheight:\s*[\d.]+px/i, `height:${newH}px`);
        }
      }
      const newAttr = fullAttr.replace(`style="${styleAttr}"`, `style="${newStyle}"`);
      return `<div${newAttr}>`;
    }
    return match;
  });
};

const DocumentTemplateForm: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams<{ courseId?: string }>();
  const isEdit = Boolean(courseId);
  const isUploadTemplateFlow = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('source') === 'upload';
  }, [location.search]);

  // Detect if coming from V4 wizard with pre-filled data
  const isFromV4 = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('source') === 'v4';
  }, [location.search]);
  const v4State = (location.state as any) || {};
  const { theme } = useContext(AppContext);

  const [item, setItem] = useState<TemplateData>({
    name: '',
    template: '',
    type_id: null,
    orientation: 'landscape',
    frame_type: 'custom',
    frame_id: null,
    back_document: '',
    number_of_hours_studied: 0,
    certificate_id: 0
  });

  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(isEdit ? 3 : 1);
  const [tabSelectedCertificate, setTabSelectedCertificate] = useState<string>('/front');
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [createMode, setCreateMode] = useState<'manual' | null>(null);

  // New states for custom borders
  const [selectedPalette, setSelectedPalette] = useState('#29638d');
  const [selectedBorder, setSelectedBorder] = useState<number | null>(null);
  const [borders, setBorders] = useState<{ id: number; frame: string; back_frame?: string; is_top_only?: boolean; back_is_top_only?: boolean }[]>([]);
  const [loadingAddBorder, setLoadingAddBorder] = useState(false);
  const [showModalList, setShowModalList] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [newBorderPreview, setNewBorderPreview] = useState<string | null>(null);
  const [newBackBorderPreview, setNewBackBorderPreview] = useState<string | null>(null);
  const [applyEditorZoom, setApplyEditorZoom] = useState(false);
  const [editorUnlocked, setEditorUnlocked] = useState(true);
  const [showTabHint, setShowTabHint] = useState(true);
  const [blockMasks, setBlockMasks] = useState(true);
  const [showEditorHint, setShowEditorHint] = useState(false);
  const [showBackHint, setShowBackHint] = useState(true);
  const [showToolbarHint, setShowToolbarHint] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [customFrame, setCustomFrame] = useState<string | null>(null);
  const [customBackFrame, setCustomBackFrame] = useState<string | null>(null);
  const [selectedBackBorderId, setSelectedBackBorderId] = useState<number | null>(null);
  const [customIsTopOnly, setCustomIsTopOnly] = useState<boolean | null>(null);
  const [customBackIsTopOnly, setCustomBackIsTopOnly] = useState<boolean | null>(null);
  const quickFrontInputRef = useRef<HTMLInputElement>(null);
  const quickBackInputRef = useRef<HTMLInputElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const hasSeenToolbarHintRef = useRef(false);
  const newBorderInputRef = useRef<HTMLInputElement>(null);
  const newBackBorderInputRef = useRef<HTMLInputElement>(null);
  const uploadTemplateInputRef = useRef<HTMLInputElement>(null);
  const [showBorderGuidanceModal, setShowBorderGuidanceModal] = useState(false);
  const [currentPageList, setCurrentPageList] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editorSize = useMemo(() => {
    if (item.orientation === 'portrait') {
      return {
        width: Math.round(A4_PORTRAIT_WIDTH_IN_PX * EDITOR_SCALE),
        height: Math.round(A4_PORTRAIT_HEIGHT_IN_PX * EDITOR_SCALE),
      };
    }

    return {
      width: Math.round(A4_LANDSCAPE_WIDTH_IN_PX * EDITOR_SCALE),
      height: Math.round(A4_LANDSCAPE_HEIGHT_IN_PX * EDITOR_SCALE),
    };
  }, [item.orientation]);

  const selectedBorderData = borders.find(border => border.id === selectedBorder) || null;

  const previewSize = useMemo(() => {
    if (item.orientation === 'portrait') {
      return { width: 220, height: 320 };
    }

    return { width: 320, height: 220 };
  }, [item.orientation]);

  const steps = [
    { id: 1, label: 'Dados do Curso', icon: 'bi bi-file-earmark-text' },
    { id: 2, label: 'Layout & Moldura', icon: 'bi bi-layout-text-window' },
    { id: 3, label: 'Conteúdo', icon: 'bi bi-pencil' },
  ];

  useEffect(() => {
    if (currentStep === 3 && editorRef.current) {
      const editor = editorRef.current;
      editor.focus();

      const body = editor.getBody();
      if (!body) return;

      const allNodes = body.querySelectorAll('p, span, strong');
      let targetNode = null;
      for (let node of allNodes) {
        if (node.textContent?.includes('Conteúdo programático')) {
          targetNode = node;
          break;
        }
      }

      if (targetNode) {
        const nextP = targetNode.closest('p')?.nextElementSibling;
        if (nextP) {
          editor.selection.select(nextP, true);
          editor.selection.collapse(true);
        }
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 2) {
      const editor = editorRef.current;
      let timeout = 4000;
      if (editor && item?.orientation) {
        timeout = 150;
      }

      setTimeout(() => {
        applyEditorFrame();
      }, timeout);
    }
  }, [selectedBorder, selectedBackBorderId, currentStep, tabSelectedCertificate, borders]);

  useEffect(() => {
    if (!showModalAdd) {
      return;
    }

    const timer = window.setTimeout(() => {
      newBorderInputRef.current?.click();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showModalAdd]);

  useEffect(() => {
    if (currentStep !== 3) {
      setApplyEditorZoom(false);
      return;
    }

    const updateZoomState = () => {
      const container = editorContainerRef.current;
      const availableWidth = container?.parentElement?.clientWidth ?? 0;
      if (!availableWidth) {
        return;
      }

      setApplyEditorZoom(editorSize.width > availableWidth);
    };

    updateZoomState();

    const parent = editorContainerRef.current?.parentElement;
    const observer = parent ? new ResizeObserver(updateZoomState) : null;

    if (parent && observer) {
      observer.observe(parent);
    }

    window.addEventListener('resize', updateZoomState);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateZoomState);
    };
  }, [currentStep, editorSize.width, tabSelectedCertificate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bgPickerRef.current &&
        !bgPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.bg-picker-toggle')
      ) {
        setShowBgPicker(false);
      }
    }
    if (showBgPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBgPicker]);

  useEffect(() => {
    applyEditorFrame();
  }, [selectedBorder, selectedBackBorderId, tabSelectedCertificate, customFrame, customBackFrame, borders]);

  const applyEditorFrame = () => {
    const editor = editorRef.current;
    if (!editor || !item.orientation) return;

    let backgroundCSS = '';
    let pageCSS = '';

    const selected = borders.find(b => b.id === selectedBorder);
    const selectedBack = borders.find(b => b.id === (selectedBackBorderId ?? selectedBorder));
    let frameUrl = null;
    let isTopOnly = false;

    if (tabSelectedCertificate === '/front') {
      if (customFrame) {
        frameUrl = customFrame;
      } else if (selected) {
        frameUrl = selected.frame;
      }
      isTopOnly = customIsTopOnly !== null ? customIsTopOnly : (selected ? Boolean(selected.is_top_only) : false);
    } else {
      if (customBackFrame) {
        frameUrl = customBackFrame;
      } else if (selectedBack) {
        frameUrl = selectedBack.back_frame || selectedBack.frame;
      }
      const hasOwnBackFrame = !!(selectedBack?.back_frame);
      const backIsTopOnly = hasOwnBackFrame ? Boolean(selectedBack?.back_is_top_only) : Boolean(selectedBack?.is_top_only);
      isTopOnly = customBackIsTopOnly !== null ? customBackIsTopOnly : backIsTopOnly;
    }

    if (frameUrl) {
      backgroundCSS = `
        background-image: url(${frameUrl});
        background-repeat: no-repeat;
        background-position: ${isTopOnly ? 'top center' : 'center center'};
        background-size: ${isTopOnly ? '100% auto' : '100% 100%'};
        position: relative;
      `;
    } else {
      backgroundCSS = `
        background-color: transparent;
      `;
    }

    pageCSS = item.orientation === 'portrait'
      ? `
      width: ${A4_PORTRAIT_WIDTH_IN_PX}px;
      height: ${A4_PORTRAIT_HEIGHT_IN_PX}px;
    `
      : `
      width: ${A4_LANDSCAPE_WIDTH_IN_PX}px;
      height: ${A4_LANDSCAPE_HEIGHT_IN_PX}px;
    `;

    applyStyle(editor, backgroundCSS, pageCSS);

    // Clona as tags <style> contendo fontes customizadas (@font-face) para o head do iframe do editor
    try {
      const doc = editor.getDoc();
      if (doc) {
        const head = doc.head;
        const body = doc.body;
        const styles = body.querySelectorAll('style');
        styles.forEach((style: HTMLStyleElement) => {
          const textContent = style.textContent || '';
          if (textContent.includes('@font-face')) {
            const exists = Array.from(head.querySelectorAll('style')).some(
              (existing: any) => existing.textContent === textContent
            );
            if (!exists) {
              head.appendChild(style.cloneNode(true));
            }
          }
        });
      }
    } catch (err) {
      console.error('Erro ao clonar estilos de fonte no editor:', err);
    }
  };

  const applyStyle = (editor: any, backgroundCSS: string, pageCSS: string) => {
    const isPortrait = item.orientation === 'portrait';
    const w = isPortrait ? A4_PORTRAIT_WIDTH_IN_PX : A4_LANDSCAPE_WIDTH_IN_PX;
    const h = isPortrait ? A4_PORTRAIT_HEIGHT_IN_PX : A4_LANDSCAPE_HEIGHT_IN_PX;

    const css = `
      html {
        width: 100%;
        height: 100%;
        overflow: auto !important;
        background-color: #f8fafc;
        display: flex;
        justify-content: center;
        align-items: ${isPortrait ? 'flex-start' : 'center'};
        padding: ${isPortrait ? '20px 0' : '0'};
        box-sizing: border-box;
      }
     
      body {
        ${backgroundCSS}
        padding: 0;
        margin: ${isPortrait ? '0 auto' : 'auto'} !important;
        width: ${w}px !important;
        height: ${h}px !important;
        font-size: 14px;
        box-sizing: border-box;
        overflow: hidden !important;
        background-color: #fff;
        position: relative;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.05) !important;
        border-radius: 4px !important;
      }

      p {
        max-width: 90%;
        margin: 0 auto;
        padding: 0;
        font-size: 19px;
        line-height: 1.2;
        color: #34495e;
        text-align: center;
      }

      p:empty {
        min-height: 1.2em;
      }

      p:empty::before {
        content: '\\00a0';
      }

      div[id^="page"][id$="-div"] p,
      div[id*="-div"] p,
      div[class*="-div"] p {
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: inherit;
        line-height: inherit;
        color: inherit;
        text-align: inherit;
      }

      /* Corrige o alinhamento da coluna da direita do verso */
      div[id$="page2-div"] p[style*="width: 100%"],
      div[id$="page2-div"] p[style*="width:100%"] {
        left: 45% !important;
        width: 50% !important;
      }

      @media print {
        @page {
          size: A4 ${item.orientation};
          margin: 0;
        }
        html, body {
          padding: 0 !important;
          margin: 0 !important;
          ${pageCSS}
          ${backgroundCSS}
          overflow: hidden;
          background-color: #fff;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
        * {
          box-shadow: none !important;
        }
      }

      /* Custom Caret (Cursor) */
      body {
        caret-color: rgb(var(--primary-rgb)) !important;
      }
    `;

    const head = editor.getDoc()?.head;
    if (!head) return;
    const existingStyle = head.querySelector('style[data-custom-style]');
    if (existingStyle) {
      existingStyle.remove();
    }
    const styleEl = editor.dom.create('style', { 'data-custom-style': true }, css);
    head.appendChild(styleEl);
  };

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
      if (!courseId && processedBorders.length > 0 && !selectedBorder) {
        setTimeout(() => {
          setSelectedBorder(processedBorders[0].id);
          applyEditorFrame();
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao buscar molduras:', error);
    }
  };

  const handleSelectBorder = (border: number | null) => {
    setSelectedBorder(border);
    setSelectedBackBorderId(null);
    setCustomFrame(null);
    setCustomBackFrame(null);
    setCustomIsTopOnly(null);
    setCustomBackIsTopOnly(null);
  };

  const handleOpenAddBorderModal = () => {
    setShowModalList(false);
    setShowModalAdd(true);
  };

  const handleNewBorderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileBase64 = await optimizeImage(file, 1200, 1);
      setNewBorderPreview(fileBase64);
    } else {
      setNewBorderPreview(null);
    }
  };

  const handleNewBackBorderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileBase64 = await optimizeImage(file, 1200, 1);
      setNewBackBorderPreview(fileBase64);
    } else {
      setNewBackBorderPreview(null);
    }
  };

  const handleAddNewBorder = () => {
    if (newBorderPreview) {
      setLoadingAddBorder(true);
      const img = new Image();
      img.src = newBorderPreview;
      img.onload = () => {
        const isTopOnly = img.height < 450 || (img.width / img.height) >= 1.8;
        const data = {
          frame: newBorderPreview,
          back_frame: newBackBorderPreview,
          is_top_only: isTopOnly,
        };

        api.post('/document-template-frames', data).then((response) => {
          setBorders([...borders, response.data]);
          getTemplateFrames();
          setShowModalAdd(false);
          setNewBorderPreview(null);
          setNewBackBorderPreview(null);
          toast.success('Moldura adicionada com sucesso!');
          setTimeout(() => {
            handleSelectBorder(response?.data?.id);
          }, 1000);

        }).catch(() => {
          toast.error('Erro ao adicionar moldura');
        }).finally(() => {
          setLoadingAddBorder(false);
        });
      };
    }
  };

  const handleQuickChangeBackground = async (file: File, side: 'front' | 'back') => {
    const fileBase64 = await optimizeImage(file, 1200, 1);

    const img = new Image();
    img.src = fileBase64;
    img.onload = () => {
      const isTopOnly = img.height < 450 || (img.width / img.height) >= 1.8;
      if (side === 'front') {
        setCustomFrame(fileBase64);
        setCustomIsTopOnly(isTopOnly);
      } else {
        setCustomBackFrame(fileBase64);
        setCustomBackIsTopOnly(isTopOnly);
      }
    };
  };

  const handleSelectPickerBorder = (b: any) => {
    if (tabSelectedCertificate === '/front') {
      setSelectedBorder(b.id);
      setCustomFrame(null);
      setCustomIsTopOnly(null);
    } else {
      setSelectedBackBorderId(b.id);
      setCustomBackFrame(null);
      setCustomBackIsTopOnly(null);
    }
  };

  const handleDeleteBorder = (id: number) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta moldura será deletada permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        setBorders(prev => prev.filter(b => b.id !== id));
        if (selectedBorder === id) {
          setSelectedBorder(null);
          setCustomFrame(null);
          setCustomIsTopOnly(null);
        }
        if (selectedBackBorderId === id) {
          setSelectedBackBorderId(null);
          setCustomBackFrame(null);
          setCustomBackIsTopOnly(null);
        }
        api.delete(`/document-template-frames/${id}`);
      }
    });
  };

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string, target_name: string) => {
    setItem(prev => ({ ...prev, [target_name]: content }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPalette(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let templateTreated = substituirPlaceholderQRCodePorMascara(item.template);
    templateTreated = substituirAssinaturaInstrutoresPorMascara(templateTreated);

    let backDocumentTreated = substituirPlaceholderQRCodePorMascara(item.back_document ?? '');
    backDocumentTreated = substituirAssinaturaInstrutoresPorMascara(backDocumentTreated);


    if (!selectedBorder) {
      toast.error('Selecione uma moldura personalizada');
      return;
    }

    if (!item.name || !item.template) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setDisabledSubmit(true);

    let finalBorderId = selectedBorder;

    const activeBorder = borders.find(b => b.id === selectedBorder);
    const activeBackBorder = borders.find(b => b.id === (selectedBackBorderId ?? selectedBorder));

    const isFrameBase64 = customFrame?.startsWith('data:image/');
    const isBackFrameBase64 = customBackFrame?.startsWith('data:image/');

    const resolvedFront = customFrame || (activeBorder as any)?.original_frame || null;
    const resolvedBack = customBackFrame || (activeBackBorder as any)?.original_back_frame || null;

    // We only need a new custom border record if a base64 file was uploaded OR if this is a new hybrid combination
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
      orientation: item.orientation,
      frame_type: item.frame_type,
      frame_color: item.frame_type === 'color' ? selectedPalette : null,
      frame_id: item.frame_type === 'custom' ? finalBorderId : null,
      type_id: 1,
      ...(isUploadTemplateFlow ? { skip_gemini_mask_job: true } : {})
    };

    try {
      if (isEdit) {
        await api.put(`/document-templates/${item.certificate_id}`, payload);
        await api.put(`/courses/${courseId}`, {
          name: item.name,
          number_of_hours_studied: item.number_of_hours_studied || '0',
        });
      } else {
        const template = await api.post('/document-templates', payload);
        await api.post('/courses', {
          name: item.name,
          number_of_hours_studied: item.number_of_hours_studied || '0',
          certificate_id: template.data?.id,
        });
      }

      const instructorsResponse = await api.get('/instructors?all=1');
      const hasInstructors = Array.isArray(instructorsResponse?.data) && instructorsResponse.data.length > 0;

      if (hasInstructors) {
        const result = await Swal.fire({
          icon: 'success',
          title: isEdit ? 'Curso atualizado!' : 'Curso criado!',
          text: 'Dados salvos com sucesso. Deseja emitir certificados ou cadastrar um novo instrutor?',
          showCancelButton: true,
          confirmButtonText: 'Emitir certificados',
          cancelButtonText: 'Cadastrar instrutor',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#3b82f6',
        });

        if (result.isConfirmed) {
          navigate('/documents/create');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate('/instructors/create');
        }
      } else {
        const result = await Swal.fire({
          icon: 'info',
          title: isEdit ? 'Curso atualizado!' : 'Curso criado!',
          text: 'Não encontramos instrutores cadastrados. Cadastre um instrutor para continuar.',
          showCancelButton: true,
          confirmButtonText: 'Cadastrar instrutor',
          cancelButtonText: 'Voltar',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280',
        });

        if (result.isConfirmed) {
          navigate('/instructors/create');
        } else {
          navigate('/courses');
        }
      }
    } catch {
      toast.error('Erro ao salvar template');
    } finally {
      setDisabledSubmit(false);
    }
  };

  // --- Masks ---
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
    { key: 'data_validade', label: 'Data de validade' },

    { key: 'cidade_de_realizacao', label: 'Cidade de Realização' }
  ];

  const maskRows = [
    masks.slice(0, Math.ceil(masks.length / 2)),
    masks.slice(Math.ceil(masks.length / 2)),
  ];

  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return !!item.name?.trim() && !!item.orientation;
    }

    if (step === 2) {
      return !!selectedBorder;
    }

    if (step === 3) {
      return !!item.template?.trim();
    }

    return false;
  };

  const canAccessStep = (targetStep: number) => {
    if (targetStep <= currentStep) return true;

    for (let step = 1; step < targetStep; step++) {
      if (!isStepValid(step)) return false;
    }

    return true;
  };

  const goNextStep = () => {
    if (!isStepValid(currentStep)) {
      toast.error('Preencha os campos obrigatórios desta etapa para continuar.');
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleOpenUploadTemplateDialog = async () => {
    if (isUploadingTemplate) {
      return;
    }

    const result = await Swal.fire({
      icon: 'info',
      title: 'O sistema configura o curso automaticamente para você.',
      html: 'Envie um arquivo <strong>.pdf</strong> ou <strong>.docx</strong> que seja um certificado pronto ou um modelo/template de certificado.',
      confirmButtonText: 'OK, entendi',
      showCancelButton: true,
      cancelButtonText: 'Prefiro manual',
      reverseButtons: false,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });

    if (result.isConfirmed) {
      uploadTemplateInputRef.current?.click();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      setCreateMode('manual');
      setCurrentStep(isEdit ? 3 : 1);
    }
  };

  const handleUploadTemplateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = '';

    if (!file) {
      return;
    }

    const simulatedSteps = [
      'Validando arquivo enviado...',
      'Extraindo estrutura do certificado...',
      'Identificando campos e mascaras...',
      'Cadastrando nome do curso...',
      'Configurando orientacao e moldura...',
      'Finalizando cadastro do template...',
    ];

    let currentStepIndex = 0;
    let stepTimer: number | null = null;
    let uploadDone = false;

    const isDarkMode = document.documentElement.getAttribute('data-theme-mode') === 'dark';

    const renderChecklist = (activeIndex: number) => {
      const htmlContainer = Swal.getHtmlContainer();
      if (!htmlContainer) return;
      const list = htmlContainer.querySelector('#upload-checklist');
      if (!list) return;
      list.innerHTML = simulatedSteps.map((label, i) => {
        if (i < activeIndex) {
          return `<li style="display:flex;align-items:center;gap:10px;padding:5px 0;opacity:1;">
            <span style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#fa3f7a);display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:checkPop 0.3s ease;">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span style="font-size:13px;color:#94a3b8;text-decoration:line-through;">${label}</span>
          </li>`;
        } else if (i === activeIndex) {
          const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
          return `<li style="display:flex;align-items:center;gap:10px;padding:5px 0;opacity:1;">
            <span style="width:20px;height:20px;border-radius:50%;border:2px solid #a855f7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="width:7px;height:7px;border-radius:50%;border:2px solid #a855f7;border-top-color:transparent;animation:spin 0.7s linear infinite;display:block;"></span>
            </span>
            <span style="font-size:13px;color:${textColor};font-weight:600;">${label}</span>
          </li>`;
        } else {
          const textColor = isDarkMode ? '#64748b' : '#94a3b8';
          const circleBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
          const circleBg = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
          return `<li style="display:flex;align-items:center;gap:10px;padding:5px 0;opacity:0.4;">
            <span style="width:20px;height:20px;border-radius:50%;border:2px solid ${circleBorder};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="width:5px;height:5px;border-radius:50%;background:${circleBg};display:block;"></span>
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

      let apiResponse: any = null;
      let apiError: any = null;
      uploadDone = false;

      const formData = new FormData();
      formData.append('template_file', file);
      if (isEdit && courseId) {
        formData.append('course_id', String(courseId));
      }

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
                if (stepTimer !== null) window.clearInterval(stepTimer);
                await jumpToLastAndClose();
                if (apiError) reject(apiError);
                else resolve();
                return;
              }

              if (currentStepIndex < simulatedSteps.length - 2) {
                currentStepIndex += 1;
                renderChecklist(currentStepIndex);
              }
              // Hold at second-to-last step until upload finishes
            }, 2000);
          },
        });
      });


      const createdCourseId = apiResponse?.data?.course?.id;

      await Swal.fire({
        icon: 'success',
        title: 'Template importado',
        text: 'Arquivo processado e cadastro criado com sucesso.',
        confirmButtonText: 'Ok',
      });

      if (isEdit && courseId) {
        await getTemplateFrames();
        setCustomFrame(null);
        setCustomBackFrame(null);

        const updatedRes = await api.get(`/courses/${courseId}`);
        const updatedData = updatedRes.data;
        let updatedTemplate = substituirMascaraPorAssinaturaInstrutores(updatedData.certificate_template?.template);
        updatedTemplate = substituirMascaraQRCodePorPlaceholder(updatedTemplate);
        setItem({
          name: updatedData.name,
          number_of_hours_studied: updatedData.number_of_hours_studied,
          template: updatedTemplate,
          certificate_id: updatedData.certificate_id,
          ...updatedData.certificate_template,
        });
        if (updatedData.certificate_template?.frame_type === 'custom') {
          setTimeout(() => {
            setSelectedBorder(updatedData.certificate_template.frame_id);
          }, 2000);
        }
        setCreateMode('manual');
        setCurrentStep(3);
      } else if (createdCourseId) {
        navigate(`/courses/${createdCourseId}?mode=manual&step=3&source=upload`);
      } else {
        navigate('/courses');
      }
    } catch (error: any) {
      if (stepTimer !== null) {
        window.clearInterval(stepTimer);
      }
      Swal.close();
      const errorMessage = error?.response?.data?.message || 'Nao foi possivel processar o arquivo enviado.';
      toast.error(errorMessage);
    } finally {
      if (stepTimer !== null) {
        window.clearInterval(stepTimer);
      }
      setIsUploadingTemplate(false);
    }
  };


  const handleChooseManualMode = () => {
    setCreateMode('manual');
    setCurrentStep(isEdit ? 3 : 1);
  };

  const handleBackToUploadFlow = () => {
    setCreateMode(null);
    setCurrentStep(1);

    window.setTimeout(() => {
      void handleOpenUploadTemplateDialog();
    }, 0);
  };

  const uploadTemplateButtonHint = 'Envie um arquivo .pdf ou .docx com certificado pronto ou modelo/template. O sistema configura o curso automaticamente.';

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

  const insertVariable = (variableKey: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const htmlMap: Record<string, string> = {
      'assinatura(s)_instrutores': `
        <div style="width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
          <div>
            <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
            <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
            <div style="
                display: flex;
                justify-content-center;
                flex-direction: column;
                align-items: center;
            ">
               <div style="
                width: 150px;
                height: 100px;
                color: #0000ff;
                font-size: 12px;
                line-height: 1.1;
                text-align: center;
                padding: 1px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
              ">
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
      `,
      'assinatura_contratante': `
        <div style="margin-top: 40px; width: 100%; display: flex; justify-content: flex-start; gap: 100px;">
          <div style="text-align: left;">
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px 0;" />
            <div style="font-size: 14px; font-weight: bold;">Assinatura do aluno</div>
          </div>
          <div style="text-align: left;">
            <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px 0;" />
            <div style="font-size: 14px; font-weight: bold;">Assinatura do contratante</div>
          </div>
        </div>
      `,
      'local_e_data': `
        <div style="margin-top: 30px; width: 100%; text-align: center; font-size: 13px;">
          <div>
            <span style="font-size: 16px;">📍</span>
            ____________________, ____ de ______________ de ________<br />
            <span style="font-size: 12px; color: #666;">(Identificação do local e data)</span>
          </div>
        </div>
      `,
      'qrcode_validacao': QRCODE_PLACEHOLDER_HTML,
    };

    editor.insertContent(htmlMap[variableKey] || `{{${variableKey}}}`);
  };

  function substituirPlaceholderQRCodePorMascara(html: string | null): string {
    if (!html) return '';
    const regex = /<div[^>]*class="mceNonEditable"[^>]*data-mask-key="qrcode_validacao"[^>]*>.*?<\/div>/gs;
    return html.replace(regex, '{{qrcode_validacao}}');
  }

  function substituirMascaraQRCodePorPlaceholder(html: string | null): string {
    if (!html) return '';
    return html.replace(/\{\{qrcode_validacao\}\}/g, QRCODE_PLACEHOLDER_HTML);
  }

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
    const assinaturaHtml = `
      <div style="margin-top: 40px; width: 100%; display: flex; justify-content: center; gap: 100px; text-align: center;">
        <div>
          <div style="font-family: cursive; font-size: 18px;">{{assinatura(s)_instrutores}}</div>
          <hr style="border: none; border-top: 2px solid #000; width: 300px; margin: 6px auto;" />
          <div style="font-size: 14px; font-weight: bold;">Ass. {{nome_instrutor}}</div>
          <div style="
              display: flex;
              justify-content-center;
              flex-direction: column;
              align-items: center;
          ">
            <div style="
              width: 150px;
              height: 70px;
              color: #0000ff;
              font-size: 12px;
              line-height: 1.1;
              text-align: center;
              padding: 1px;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            ">
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
    return html.replace('{{assinatura(s)_instrutores}}', assinaturaHtml);
  }

  // --- Effects ---
  useEffect(() => {
    getTemplateFrames();

    if (isEdit && courseId) {
      const traceId = createTemplateTraceId();
      api.get(`/courses/${courseId}`, {
        headers: { 'X-Template-Trace-ID': traceId },
      }).then(res => {
        const data = res.data;
        console.group('[Template Trace] API response');
        console.info({
          traceId,
          responseTraceId: res.headers?.['x-template-trace-id'],
          topLevelKeys: Object.keys(data || {}),
          courseKeys: Object.keys(data?.course || {}),
          certificateTemplateKeys: Object.keys(data?.course?.certificate_template || data?.certificate_template || {}),
          directTemplate: summarizeTemplateForTrace(String(data?.template || '')),
          courseTemplate: summarizeTemplateForTrace(String(data?.course?.template || '')),
          certificateTemplate: summarizeTemplateForTrace(String(data?.course?.certificate_template?.template || data?.certificate_template?.template || '')),
        });
        console.groupEnd();
        // The API may return the course directly or wrapped in `course` (as the
        // import-template response does). Normalize both shapes before reading
        // the template so the editor never falls back to an empty/default value.
        const courseData = data?.course ?? data;
        const certificateTemplate = courseData?.certificate_template
          ?? data?.certificate_template
          ?? data?.document_template
          ?? {};
        const latestVersion = certificateTemplate?.latest_version ?? {};
        const templateHtml = certificateTemplate?.template
          ?? latestVersion?.template
          ?? courseData?.template
          ?? data?.template
          ?? '';
        const backDocumentHtml = certificateTemplate?.back_document
          ?? latestVersion?.back_document
          ?? courseData?.back_document
          ?? data?.back_document
          ?? '';

        console.group('[Template Trace] selected template');
        console.info({
          traceId,
          source: certificateTemplate?.template !== undefined
            ? 'certificate_template.template'
            : latestVersion?.template !== undefined
              ? 'certificate_template.latest_version.template'
              : courseData?.template !== undefined
                ? 'course.template'
                : data?.template !== undefined ? 'template' : 'none',
          ...summarizeTemplateForTrace(String(templateHtml)),
          backDocumentBytes: String(backDocumentHtml).length,
        });
        console.groupEnd();

        let templateContent = substituirMascaraPorAssinaturaInstrutores(templateHtml);
        templateContent = substituirMascaraQRCodePorPlaceholder(templateContent);

        let backDocumentContent = substituirMascaraPorAssinaturaInstrutores(backDocumentHtml);
        backDocumentContent = substituirMascaraQRCodePorPlaceholder(backDocumentContent);

        setItem({
          ...certificateTemplate,
          name: courseData?.name ?? data?.name ?? '',
          number_of_hours_studied: courseData?.number_of_hours_studied ?? data?.number_of_hours_studied ?? 0,
          template: templateContent,
          back_document: backDocumentContent,
          certificate_id: courseData?.certificate_id ?? data?.certificate_id ?? 0,
        });

        if (certificateTemplate?.frame_type === 'custom') {
          setTimeout(() => {
            setSelectedBorder(certificateTemplate.frame_id);
          }, 2000);

        }
      });
    } else {
      setSelectedPalette(theme?.primary_color || '#29638d');
      const templateDefault = `
        <h1 class="custom-h1-class" style="font-size: 55px; padding: 0px; margin: 0px; text-align: center;">&nbsp;</h1>
        <h1 class="custom-h1-class" style="font-size: 55px; padding: 0px; margin: 0px; text-align: center;"><span style="color: #34495e;"><strong>CERTIFICADO</strong></span></h1>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p style="text-align: center;"><span style="color: #34495e;">Certifica que {{nome_aluno}}, participou do curso {{nome_curso}} no<br>per&iacute;odo {{periodo_curso}} com carga hor&aacute;ria de {{carga_horaria}}.</span></p>
        <p>&nbsp;</p>
        <p style="text-align: center;"><span style="color: #34495e;">Conte&uacute;do program&aacute;tico</span></p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      `;

      // If coming from V4 wizard, pre-fill the form with wizard selections
      if (isFromV4 && v4State.fromV4) {
        const v4Orientation = v4State.orientation || 'landscape';
        setItem(prev => ({
          ...prev,
          name: v4State.courseName || '',
          number_of_hours_studied: v4State.courseHours || 0,
          orientation: v4Orientation,
          frame_type: 'custom',
          template: templateDefault,
        }));
        // Auto-select the frame after frames are loaded
        if (v4State.frameId) {
          setTimeout(() => {
            setSelectedBorder(v4State.frameId);
          }, 2500);
        }
        setCreateMode('manual');
      } else {
        setItem(prev => ({ ...prev, orientation: 'landscape', template: templateDefault }));
      }
    }
  }, [isEdit, courseId, theme?.primary_color]);

  useEffect(() => {
    if (editorRef.current) {
      applyEditorFrame();
    }
  }, [selectedBorder, selectedBackBorderId, theme?.primary_color, item.frame_type, tabSelectedCertificate, item.orientation, borders]);

  useEffect(() => {
    if (currentStep === 3 && editorRef.current) {
      applyEditorFrame();
    }
  }, [currentStep, item.orientation, borders]);

  const scrollToEditor = () => {
    const element = editorContainerRef.current;
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;
      const scrollPosition = absoluteElementTop - 135;
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      setShowTabHint(true);
      setBlockMasks(true);

      const timer = setTimeout(() => {
        setShowTabHint(false);
        setBlockMasks(false);
        setShowEditorHint(true);
        scrollToEditor();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const step = Number(params.get('step') || '1');

    if (mode === 'manual') {
      setCreateMode('manual');
      setCurrentStep([1, 2, 3].includes(step) ? step : 1);
    }
  }, [location.search]);

  const handleProceedToUploadBorder = () => {
    setShowBorderGuidanceModal(false);
    handleOpenAddBorderModal();
  };

  return (
    <>
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
          .btn-primary-custom {
             background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
             color: white;
             border: none;
             padding: 0.6rem 2rem;
             border-radius: 10px;
             font-weight: 700;
             transition: all 0.3s ease;
             display: flex;
             align-items: center;
          }
          .btn-primary-custom:hover {
             transform: translateY(-1px);
             box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          }
        `}
      </style>
      {/* Modal de Orientação para Moldura Customizada */}
      <Modal
        show={showBorderGuidanceModal}
        onHide={() => setShowBorderGuidanceModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
          <Modal.Title style={{ fontWeight: 800, color: 'rgb(var(--primary-rgb))' }}>
            Moldura Personalizada ✨
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-2">
          <div className="d-flex flex-column align-items-center text-center">
            <div className="bg-warning bg-opacity-10 p-4 rounded-circle mb-4">
              <i className="bi bi-info-circle-fill text-warning fs-1"></i>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Atenção à Assinatura</h4>

            <div className="alert alert-info border-0 rounded-4 p-3 w-100" style={{ background: '#f0f9ff' }}>
              <div className="d-flex align-items-start text-start gap-2">
                <i className="bi bi-lightbulb-fill text-info fs-4"></i>
                <span style={{ color: '#0369a1', fontWeight: 500 }}>
                  Para que seu certificado fique perfeito, lembre-se: se o seu modelo possuir <strong>assinaturas</strong>, elas devem estar <strong>diretamente na imagem da moldura</strong> que você irá subir.
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', paddingTop: 0 }} className="justify-content-center pb-4">
          <Button
            variant="light"
            onClick={() => setShowBorderGuidanceModal(false)}
            style={{ borderRadius: 10, fontWeight: 600, padding: '0.6rem 1.5rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleProceedToUploadBorder}
            style={{ borderRadius: 10, fontWeight: 700, padding: '0.6rem 2rem', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)' }}
          >
            Entendi, quero subir!
          </Button>
        </Modal.Footer>
      </Modal>
      <style>{`
        .course-mode-btn {
          min-height: 170px;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
        }
        .course-mode-btn-upload {
          background: linear-gradient(90deg, #eef2fc 0%, #f2f7ff 100%) !important;
          border-color: #d0e1f9 !important;
        }
        .course-mode-btn-manual {
          background: linear-gradient(90deg, #f5f9ff 0%, #faffff 100%) !important;
          border-color: #dee9f7 !important;
        }
        .course-mode-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          border-color: #a8cdff !important;
          background: linear-gradient(90deg, #e8f4ff 0%, #f3f9ff 100%) !important;
        }
        [data-theme-mode="dark"] .course-mode-btn-upload {
          background: linear-gradient(90deg, #0d1b2e 0%, #112240 100%) !important;
          border-color: #1e3a5f !important;
        }
        [data-theme-mode="dark"] .course-mode-btn-manual {
          background: linear-gradient(90deg, #0f1f35 0%, #152b4a 100%) !important;
          border-color: #1e3a5f !important;
        }
        [data-theme-mode="dark"] .course-mode-btn:hover:not(:disabled) {
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
          border-color: #3562a6 !important;
          background: linear-gradient(90deg, #162d50 0%, #1e3d6e 100%) !important;
        }
      `}</style>

      {/* Page header */}
      <div className={`modern-page-header ${!createMode ? 'justify-content-center text-center' : ''}`}>
        <div className={!createMode ? 'd-flex flex-column align-items-center' : ''}>
          <h1 className="page-title">{isEdit ? 'Editar Curso' : 'Cadastrar Curso'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Atualize os dados e o template do certificado' : 'Configure os dados e o template do certificado'}
          </p>
        </div>
      </div>

      {!createMode && (
        <div className="content-card" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="content-card-header">
            <span className="content-card-title">
              {isEdit ? 'Como deseja atualizar o curso?' : 'Como deseja cadastrar o curso?'}
            </span>
          </div>
          <div className="content-card-body">
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {isEdit
                ? 'Template é o modelo pronto do certificado. Você pode enviar um arquivo pronto ou preencher manualmente.'
                : 'Template é o modelo pronto do certificado para cadastrar o curso. Escolha como deseja continuar.'}
            </p>

            <input
              ref={uploadTemplateInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="d-none"
              onChange={handleUploadTemplateFile}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleOpenUploadTemplateDialog}
                disabled={isUploadingTemplate}
                className="btn w-100 h-100 p-4 text-start course-mode-btn course-mode-btn-upload"
                style={{ border: '2px solid #dbe4f0', borderRadius: 14 }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <i className={`bi ${isUploadingTemplate ? 'bi-hourglass-split' : 'bi-file-earmark-arrow-up'} fs-2 text-primary`} />
                  <h4 className="h5 mb-0 fw-bold">
                    {isEdit ? 'Enviar novo modelo pronto do certificado' : 'Enviar modelo pronto do certificado'}
                  </h4>
                </div>
                <p className="mb-0 text-muted">Use esta opção se você já tem o certificado/modelo pronto. Formatos: <strong>.pdf</strong> ou <strong>.docx</strong>.</p>
                {isUploadingTemplate && <p className="mb-0 mt-2 text-primary">Processando arquivo...</p>}
              </button>

              <button
                type="button"
                onClick={handleChooseManualMode}
                disabled={isUploadingTemplate}
                className="btn w-100 h-100 p-4 text-start course-mode-btn course-mode-btn-manual"
                style={{ border: '2px solid #dbe4f0', borderRadius: 14 }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <i className="bi bi-pencil-square fs-2 text-primary" />
                  <h4 className="h5 mb-0 fw-bold">{isEdit ? 'Atualizar manualmente' : 'Configurar manualmente'}</h4>
                </div>
                <p className="mb-0 text-muted">Ideal para quem não tem modelo pronto: você monta o certificado em etapas guiadas.</p>
                {isUploadingTemplate && <p className="mb-0 mt-2 text-secondary">Aguarde o término do upload para habilitar esta opcao.</p>}
              </button>
            </div>
          </div>
        </div>
      )}

      {createMode === 'manual' && (
        <form onSubmit={handleSubmit}>
          {/* Card de Passos (Stepper) */}
          <div className="content-card mb-4">
            <div className="content-card-body p-3">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isDone = isStepValid(step.id) && currentStep > step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <button
                          type="button"
                          className={`btn rounded-pill px-3 py-1 ${isDone ? 'btn-success' : isActive ? 'btn-primary' : 'btn-light'}`}
                          style={{
                            fontSize: '0.85rem',
                            border: isActive ? 'none' : '1px solid #d8dee8',
                            fontWeight: isActive ? 600 : 400,
                            boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.25)' : 'none'
                          }}
                          onClick={() => canAccessStep(step.id) && setCurrentStep(step.id)}
                        >
                          <i className={`${isDone ? 'bi bi-check-circle' : step.icon} me-1`} />
                          {step.label}
                        </button>
                        {index < steps.length - 1 && <div style={{ width: 24, height: 1, background: '#cbd5e1' }} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center"
                  onClick={handleBackToUploadFlow}
                  disabled={isUploadingTemplate}
                  title={uploadTemplateButtonHint}
                  style={{ borderRadius: 8 }}
                >
                  <i className="bi bi-upload me-2" />
                  Subir template pronto
                </button>
              </div>
            </div>
          </div>

          {/* Card de Conteúdo do Formulário */}
          <div className="content-card">
            <div className="content-card-body">
              {currentStep === 1 && (
                <div className="content-card-body p-4" style={{ background: 'transparent', border: 'none' }}>
                  <Row>
                    <Col md={9}>
                      <div className="mb-3">
                        <label className="modern-table-date mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nome do Curso *</label>
                        <input
                          className="form-control"
                          name="name"
                          value={item.name}
                          onChange={handleChange}
                          type="text"
                          required
                          placeholder="Nome do curso"
                          style={{ borderRadius: 8, fontSize: '0.875rem' }}
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <label className="modern-table-date mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Quantidade de Horas</label>
                        <input
                          className="form-control"
                          name="number_of_hours_studied"
                          value={item.number_of_hours_studied}
                          onChange={handleChange}
                          type="number"
                          min="0"
                          placeholder="Ex.: 40"
                          style={{ borderRadius: 8, fontSize: '0.875rem' }}
                        />
                      </div>
                    </Col>
                  </Row>
                  {/* Attachments section removed per user request */}
                </div>
              )}

              {currentStep === 2 && (
                <div className="content-card-body p-4" style={{ background: 'transparent', border: 'none' }}>
                  {/* Orientation Selection */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                        <i className="bi bi-aspect-ratio fs-5"></i>
                      </div>
                      <label className="modern-table-date" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 700 }}>Orientação do Certificado</label>
                    </div>

                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className={`modern-guide-btn-outline d-flex align-items-center justify-content-center flex-fill ${item.orientation === 'landscape' ? 'active shadow-sm' : ''}`}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 12,
                          border: item.orientation === 'landscape' ? '2px solid rgb(var(--primary-rgb))' : '1px solid #e2e8f0',
                          background: item.orientation === 'landscape' ? 'rgba(var(--primary-rgb), 0.05)' : '#ffffff',
                          color: item.orientation === 'landscape' ? 'rgb(var(--primary-rgb))' : '#64748b',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setItem(prev => ({ ...prev, orientation: 'landscape' }))}
                      >
                        <div className="text-center">
                          <i className="bi bi-display fs-4 d-block mb-1" />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Paisagem</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`modern-guide-btn-outline d-flex align-items-center justify-content-center flex-fill ${item.orientation === 'portrait' ? 'active shadow-sm' : ''}`}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 12,
                          border: item.orientation === 'portrait' ? '2px solid rgb(var(--primary-rgb))' : '1px solid #e2e8f0',
                          background: item.orientation === 'portrait' ? 'rgba(var(--primary-rgb), 0.05)' : '#ffffff',
                          color: item.orientation === 'portrait' ? 'rgb(var(--primary-rgb))' : '#64748b',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setItem(prev => ({ ...prev, orientation: 'portrait' }))}
                      >
                        <div className="text-center">
                          <i className="bi bi-phone-landscape fs-4 d-block mb-1" style={{ transform: 'rotate(90deg)' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Retrato</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Border Selection */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                          <i className="bi bi-layout-text-window fs-5"></i>
                        </div>
                        <label className="modern-table-date" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 700 }}>Selecione a Moldura</label>
                      </div>
                      <div className="d-flex gap-2">
                        <Button variant="light" size="sm" onClick={() => setShowModalList(true)} style={{ borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>
                          <i className="bi bi-grid-3x3-gap me-1"></i> Ver Todas
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => setShowBorderGuidanceModal(true)}
                          style={{
                            borderRadius: 8,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            border: '1.5px dashed rgba(var(--primary-rgb), 0.5)',
                            background: 'rgba(var(--primary-rgb), 0.03)',
                            color: 'rgb(var(--primary-rgb))',
                            padding: '0.4rem 0.8rem',
                            transition: 'all 0.2s ease'
                          }}
                          className="modern-hover-scale"
                        >
                          <i className="bi bi-cloud-arrow-up-fill me-1"></i> Adicionar moldura personalizada
                        </Button>
                      </div>
                    </div>

                    <div className="modern-carousel px-1" style={{ paddingBottom: '1.5rem' }}>
                      {borders.map(border => (
                        <div key={border.id} className="modern-carousel-item">
                          <div
                            className={`modern-border-thumb ${selectedBorder === border.id ? 'active' : ''}`}
                            onClick={() => handleSelectBorder(border.id)}
                          >
                            <img src={border.frame} alt={`Moldura ${border.id}`} />
                            {selectedBorder === border.id && (
                              <div className="position-absolute top-0 end-0 p-1">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 20, height: 20 }}>
                                  <i className="bi bi-check-lg" style={{ fontSize: '0.7rem' }}></i>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="d-inline-block p-2 bg-light rounded-pill mb-3">
                      <small className="modern-table-date px-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <i className="bi bi-eye me-1"></i> Preview do Certificado
                      </small>
                    </div>
                    <div className="d-flex justify-content-center">
                      <div
                        className="content-card d-flex align-items-center justify-content-center text-muted overflow-hidden shadow-lg"
                        style={{
                          width: previewSize.width,
                          height: previewSize.height,
                          padding: 0,
                          border: '4px solid #fff',
                          borderRadius: 16
                        }}
                      >
                        {selectedBorderData?.frame ? (
                          <img
                            src={selectedBorderData.frame}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: selectedBorderData.is_top_only ? 'contain' : 'fill',
                              objectPosition: selectedBorderData.is_top_only ? 'top center' : 'center',
                            }}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <i className="bi bi-image fs-1 d-block mb-2 opacity-25"></i>
                            <span style={{ fontSize: '0.8rem' }}>Nenhuma moldura selecionada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="content-card-body p-4" style={{ background: 'transparent', border: 'none' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                      <i className="bi bi-magic fs-5"></i>
                    </div>
                    <label className="modern-table-date" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 700 }}>Máscaras rápidas</label>
                  </div>
                  <div className="mt-1 mb-4">
                    {maskRows.map((row, index) => (
                      <div key={index} className={`d-flex flex-wrap gap-2 ${index === 0 ? 'mb-2' : ''}`}>
                        {row.map(m => (
                          <Button
                            key={m.key}
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              if (blockMasks) return;
                              insertVariable(m.key);
                            }}
                            disabled={blockMasks}
                            style={{
                              whiteSpace: 'nowrap',
                              fontSize: '0.85rem',
                              pointerEvents: blockMasks ? 'none' : 'auto',
                              opacity: blockMasks ? 0.55 : 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            <span>{m.label}</span>
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                        <i className="bi bi-file-earmark-richtext fs-5"></i>
                      </div>
                      <label className="modern-table-date" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 700 }}>Corpo do certificado e conteúdo programático</label>
                    </div>
                  </div>

                  <div className="position-relative mb-2 d-flex align-items-center" style={{ minHeight: '34px' }}>
                    <Nav
                      variant="pills"
                      activeKey={tabSelectedCertificate}
                      onSelect={(selected) => {
                        if (!selected) return;

                        // Se for para o verso e estiver vazio, adiciona linhas em branco
                        if (selected === '/back' && !item.back_document?.trim()) {
                          const emptyVerso = '<p>&nbsp;</p>'.repeat(8);
                          setItem(prev => ({ ...prev, back_document: emptyVerso }));
                        }

                        setTabSelectedCertificate(selected);
                        setShowBgPicker(false);

                        // Hide tab hint and show editor hint
                        setShowTabHint(false);
                        setShowEditorHint(true);

                        // Ajusta o foco após a troca de aba
                        if (editorUnlocked) {
                          setTimeout(() => {
                            if (editorRef.current) {
                              const editor = editorRef.current;
                              editor.focus();

                              if (selected === '/back') {
                                // No verso, tenta focar no meio (parágrafo 4 de 8)
                                const body = editor.getBody();
                                if (!body) return;

                                const ps = body.querySelectorAll('p');
                                if (ps.length >= 4) {
                                  editor.selection.select(ps[3], true);
                                  editor.selection.collapse(true);
                                }
                              } else {
                                // Na frente, tenta focar após "Conteúdo programático"
                                const body = editor.getBody();
                                if (!body) return;

                                const allNodes = body.querySelectorAll('p, span, strong');
                                let targetNode = null;
                                for (let node of allNodes) {
                                  if (node.textContent?.includes('Conteúdo programático')) {
                                    targetNode = node;
                                    break;
                                  }
                                }
                                if (targetNode) {
                                  const nextP = targetNode.closest('p')?.nextElementSibling;
                                  if (nextP) {
                                    editor.selection.select(nextP, true);
                                    editor.selection.collapse(true);
                                  }
                                }
                              }
                            }
                          }, 300);
                        }
                      }}
                      style={{ gap: '8px' }}
                    >
                      <Nav.Item>
                        <Nav.Link
                          eventKey="/front"
                          style={{
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            background: tabSelectedCertificate === '/front' ? 'rgb(var(--primary-rgb))' : 'rgba(var(--primary-rgb), 0.08)',
                            color: tabSelectedCertificate === '/front' ? '#fff' : 'rgb(var(--primary-rgb))',
                            border: '1.2px solid rgb(var(--primary-rgb))',
                            transition: 'all 0.2s',
                            boxShadow: tabSelectedCertificate === '/front' ? '0 2px 4px rgba(var(--primary-rgb), 0.2)' : 'none'
                          }}
                        >
                          Frente
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="/back"
                          style={{
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            background: tabSelectedCertificate === '/back' ? 'rgb(var(--primary-rgb))' : 'rgba(var(--primary-rgb), 0.08)',
                            color: tabSelectedCertificate === '/back' ? '#fff' : 'rgb(var(--primary-rgb))',
                            border: '1.2px solid rgb(var(--primary-rgb))',
                            transition: 'all 0.2s',
                            boxShadow: tabSelectedCertificate === '/back' ? '0 2px 4px rgba(var(--primary-rgb), 0.2)' : 'none'
                          }}
                        >
                          Verso (Opcional)
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>

                    {showTabHint && (
                      <div className="modern-tab-hint" style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '0px',
                        transform: 'translateX(0)',
                        zIndex: 105,
                        background: '#ffffff',
                        border: '2px solid rgb(var(--primary-rgb))',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        animation: 'modern-tab-float 1.5s ease-in-out infinite'
                      }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setShowTabHint(false);
                          setBlockMasks(false);
                          setShowEditorHint(true);
                          scrollToEditor();
                        }}
                      >
                        <strong style={{ display: 'block', color: 'rgb(var(--primary-rgb))', fontSize: '0.88rem', fontWeight: 800 }}>
                          Alterne entre Frente e Verso! ✨
                        </strong>
                        <i className="bi bi-hand-index-thumb-fill" style={{
                          fontSize: '1.3rem',
                          color: 'rgb(var(--primary-rgb))',
                          transform: 'rotate(180deg)',
                          filter: 'drop-shadow(0 0 6px rgba(var(--primary-rgb), 0.35))',
                          marginTop: '2px'
                        }}></i>
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <div>
                      <div
                        ref={editorContainerRef}
                        style={{
                          position: 'relative',
                          width: `min(100%, ${editorSize.width}px)`,
                          margin: 0,
                          zoom: applyEditorZoom ? 0.85 : 1,
                          transformOrigin: 'top left',
                        }}
                      >
                        <style>{`
                                .btn-editor-unlock {
                                  position: absolute;
                                  top: 6px;
                                  right: 6px;
                                  z-index: 10;
                                  border-radius: 8px !important;
                                  font-size: 0.79rem !important;
                                  background-color: rgba(255,255,255,0.88) !important;
                                  backdrop-filter: blur(4px);
                                  color: ${editorUnlocked ? '#0d6efd' : '#495057'} !important;
                                }
                                .btn-editor-unlock:hover,
                                .btn-editor-unlock:focus,
                                .btn-editor-unlock:active {
                                  background-color: rgba(255,255,255,0.98) !important;
                                  color: ${editorUnlocked ? '#0a58ca' : '#343a40'} !important;
                                }
                                @keyframes modern-tab-float {
                                  0%, 100% { transform: translateY(0); }
                                  50% { transform: translateY(-6px); }
                                }
                              `}</style>
                        {/* Hidden File Inputs for quick background switching */}
                        <input
                          ref={quickFrontInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQuickChangeBackground(file, 'front');
                          }}
                        />
                        <input
                          ref={quickBackInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQuickChangeBackground(file, 'back');
                          }}
                        />

                        {/* Premium "Trocar Fundo" Floating Button */}
                        <button
                          type="button"
                          className="bg-picker-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowBgPicker(prev => !prev);
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 102,
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: 'rgb(var(--primary-rgb))',
                            border: '1.8px solid rgb(var(--primary-rgb))',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgb(var(--primary-rgb))';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(var(--primary-rgb), 0.25)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.color = 'rgb(var(--primary-rgb))';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }}
                        >
                          <i className="bi bi-image-fill" style={{ fontSize: '0.9rem' }}></i>
                          {tabSelectedCertificate === '/front' ? 'Alterar moldura da Frente' : 'Alterar moldura do Verso'}
                        </button>

                        {/* Floating Background Grid Picker Popover */}
                        {showBgPicker && (
                          <div
                            ref={bgPickerRef}
                            className="bg-picker-popover"
                            style={{
                              position: 'absolute',
                              top: '52px',
                              right: '12px',
                              zIndex: 105,
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '12px',
                              width: '320px',
                              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              animation: 'fadeIn 0.2s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#374151' }}>
                                Escolher Imagem de Fundo 🖼️
                              </span>
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1rem', cursor: 'pointer', padding: 0 }}
                                onClick={() => setShowBgPicker(false)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>

                            {/* Grid list of existing borders */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                maxHeight: '180px',
                                overflowY: 'auto',
                                paddingRight: '4px'
                              }}
                            >
                              {borders.map((b) => {
                                const previewImg = tabSelectedCertificate === '/back'
                                  ? (b.back_frame || b.frame)
                                  : b.frame;
                                const isSelected = tabSelectedCertificate === '/front'
                                  ? (!customFrame && b.id === selectedBorder)
                                  : (!customBackFrame && b.id === (selectedBackBorderId ?? selectedBorder));
                                return (
                                  <div
                                    key={b.id}
                                    style={{
                                      position: 'relative',
                                      borderRadius: '8px',
                                      border: isSelected ? '2px solid rgb(var(--primary-rgb))' : '1.5px solid #e5e7eb',
                                      padding: '3px',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease-in-out',
                                      aspectRatio: '4/3',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: '#f9fafb',
                                      boxShadow: isSelected ? '0 0 0 3px rgba(var(--primary-rgb), 0.15)' : 'none'
                                    }}
                                    onClick={() => {
                                      handleSelectPickerBorder(b);
                                    }}
                                    onMouseOver={(e) => {
                                      if (!isSelected) e.currentTarget.style.borderColor = 'rgb(var(--primary-rgb))';
                                    }}
                                    onMouseOut={(e) => {
                                      if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                  >
                                    <img
                                      src={previewImg}
                                      alt="Border option"
                                      style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                      }}
                                    />
                                    {isSelected && (
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '2px',
                                          right: '2px',
                                          background: 'rgb(var(--primary-rgb))',
                                          color: '#ffffff',
                                          borderRadius: '50%',
                                          width: '14px',
                                          height: '14px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '8px'
                                        }}
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Add Border Button */}
                            <button
                              type="button"
                              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                              style={{
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                padding: '8px 12px',
                                border: '1.8px dashed rgb(var(--primary-rgb))',
                                background: 'rgba(var(--primary-rgb), 0.04)',
                                color: 'rgb(var(--primary-rgb))',
                                transition: 'all 0.18s ease-in-out'
                              }}
                              onClick={() => {
                                setShowBgPicker(false);
                                if (tabSelectedCertificate === '/front') {
                                  quickFrontInputRef.current?.click();
                                } else {
                                  quickBackInputRef.current?.click();
                                }
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgb(var(--primary-rgb))';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgb(var(--primary-rgb))';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.04)';
                                e.currentTarget.style.color = 'rgb(var(--primary-rgb))';
                                e.currentTarget.style.borderColor = 'rgb(var(--primary-rgb))';
                              }}
                            >
                              <i className="bi bi-plus-circle-fill" style={{ fontSize: '0.9rem' }}></i>
                              Adicionar Nova Moldura
                            </button>
                          </div>
                        )}
                        <div
                          className={editorUnlocked ? 'modern-pulse-border' : ''}
                          style={{
                            borderRadius: 10,
                            border: editorUnlocked ? '2.5px solid rgb(var(--primary-rgb))' : '2.5px solid transparent',
                            boxShadow: editorUnlocked ? '0 0 0 5px rgba(var(--primary-rgb),0.13)' : 'none',
                            opacity: editorUnlocked ? 1 : 0.72,
                            transition: 'border 0.25s, box-shadow 0.25s, opacity 0.25s',
                            cursor: editorUnlocked ? 'text' : 'not-allowed',
                            pointerEvents: editorUnlocked ? 'auto' : 'none',
                          }}
                        >
                          <Editor
                            key={`editor-${item.orientation}`}
                            height={editorSize.height}
                            width={editorSize.width}
                            maxWidth={'100%'}
                            disabled={!editorUnlocked}
                            value={getNormalizedTemplateValue(
                              tabSelectedCertificate === '/front' ? (item.template || '') : (item.back_document || ''),
                              item.orientation || 'landscape'
                            )}
                            onEditorChange={e => handleEditorChange(e, tabSelectedCertificate === '/front' ? 'template' : 'back_document')}
                            onInit={(_evt, editor) => {
                              editorRef.current = editor;

                              const cloneStyles = () => {
                                try {
                                  const doc = editor.getDoc();
                                  if (doc) {
                                    const head = doc.head;
                                    const body = doc.body;
                                    const styles = body.querySelectorAll('style');
                                    styles.forEach((style: HTMLStyleElement) => {
                                      const textContent = style.textContent || '';
                                      if (textContent.includes('@font-face')) {
                                        const exists = Array.from(head.querySelectorAll('style')).some(
                                          (existing: any) => existing.textContent === textContent
                                        );
                                        if (!exists) {
                                          head.appendChild(style.cloneNode(true));
                                        }
                                      }
                                    });
                                  }
                                } catch (err) {
                                  console.error('Erro ao clonar estilos de fonte no editor:', err);
                                }
                              };

                              editor.on('SetContent', cloneStyles);
                              editor.on('NodeChange', cloneStyles);

                              editor.on('click', () => {
                                setShowBgPicker(false);
                                setShowEditorHint(false);
                                setShowBackHint(false);
                                if (!hasSeenToolbarHintRef.current) {
                                  setShowToolbarHint(true);
                                  hasSeenToolbarHintRef.current = true;
                                  setTimeout(() => setShowToolbarHint(false), 5000);
                                }
                              });
                              setTimeout(() => {
                                applyEditorFrame();
                                cloneStyles();
                              }, 50);
                            }}
                          />
                        </div>

                        {showEditorHint && editorUnlocked && (
                          <div className="modern-editor-hint">
                            <i className="bi bi-hand-index-thumb-fill"></i>
                            <span style={{ whiteSpace: 'nowrap' }}>
                              {tabSelectedCertificate === '/front'
                                ? 'Clique aqui para editar'
                                : 'Clique aqui para editar'}
                            </span>
                          </div>
                        )}

                        {showToolbarHint && editorUnlocked && (
                          <div className="modern-toolbar-hint">
                            <div className="hint-box">
                              <strong>Personalize o Estilo! ✨</strong>
                              <p>Use a barra acima para trocar fontes, tamanhos e o layout do seu certificado.</p>
                            </div>
                            <i className="bi bi-hand-index-thumb-fill"></i>
                          </div>
                        )}

                        {tabSelectedCertificate === '/back' && showBackHint && editorUnlocked && (
                          <div className="modern-toolbar-hint" style={{
                            position: 'absolute',
                            top: '-110px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 101,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            animation: 'modern-float-reverse 2s ease-in-out infinite',
                            pointerEvents: 'auto',
                            cursor: 'pointer'
                          }}
                            onClick={() => setShowBackHint(false)}
                          >
                            <div className="hint-box" style={{
                              background: '#ffffff',
                              border: '2px solid rgb(var(--primary-rgb))',
                              padding: '10px 16px',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              textAlign: 'center',
                              marginBottom: '8px',
                              maxWidth: '280px'
                            }}>
                              <strong style={{ display: 'block', color: 'rgb(var(--primary-rgb))', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 800 }}>
                                Verso do Certificado! ✨
                              </strong>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.4 }}>
                                Clique no editor para adicionar o conteúdo programático do curso.
                              </p>
                            </div>
                            <i className="bi bi-hand-index-thumb-fill" style={{
                              fontSize: '2.5rem',
                              color: 'rgb(var(--primary-rgb))',
                              transform: 'rotate(180deg)',
                              filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.4))'
                            }}></i>
                          </div>
                        )}

                        <div className="d-flex align-items-center mt-3 pt-3" style={{ borderTop: '1px solid #e2e8f0', width: '100%' }}>
                          <Button
                            variant="light"
                            onClick={goPrevStep}
                          >
                            Voltar
                          </Button>

                          <div className="ms-auto">
                            <Button
                              className={`d-inline-flex align-items-center ${!disabledSubmit && isStepValid(3) ? 'pulse-cta' : ''}`}
                              variant="primary"
                              type="submit"
                              disabled={disabledSubmit}
                              style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: 10,
                                background: !disabledSubmit && isStepValid(3) ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : undefined,
                                border: 'none',
                                fontWeight: 700,
                                boxShadow: !disabledSubmit && isStepValid(3) ? '0 6px 16px rgba(79, 70, 229, 0.3)' : '0 6px 16px rgba(37, 99, 235, 0.2)',
                              }}
                            >
                              <i className={`bi ${disabledSubmit ? 'bi-hourglass-split' : isEdit ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`} />
                              {disabledSubmit ? 'Salvando...' : isEdit ? 'Salvar template' : 'Cadastrar template'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep < 3 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        goPrevStep();
                      }}
                    >
                      <i className="bi bi-arrow-left me-1" />
                      Voltar
                    </button>
                  )}
                  <button
                    type="button"
                    className={`btn-primary-custom ${isStepValid(currentStep) ? 'pulse-cta' : ''}`}
                    onClick={goNextStep}
                  >
                    Próximo
                    <i className="bi bi-arrow-right ms-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Modals for Custom Borders */}
      <Modal show={showModalList} onHide={() => setShowModalList(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 700, color: '#1e293b' }}>Todas as Molduras</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {borders.slice((currentPageList - 1) * 6, currentPageList * 6).map(border => (
              <Col key={border.id} md={4}>
                <div
                  onClick={() => handleSelectBorder(border.id)}
                  className={`position-relative p-2 border rounded-3 text-center cursor-pointer modern-hover-scale ${selectedBorder === border.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <img
                    src={border.frame}
                    alt=""
                    style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: 8 }}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    className="position-absolute top-0 end-0 m-2 shadow-sm rounded-circle"
                    style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBorder(border.id);
                    }}
                  >
                    <i className="bi bi-trash" style={{ fontSize: '0.8rem' }} />
                  </Button>
                  {selectedBorder === border.id && (
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-primary rounded-pill">Ativo</span>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {borders.length > 6 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPageList === 1}
                  onClick={() => setCurrentPageList(prev => prev - 1)}
                />
                {(() => {
                  const totalPages = Math.ceil(borders.length / 6);
                  const items = [];

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      items.push(
                        <Pagination.Item
                          key={i}
                          active={i === currentPageList}
                          onClick={() => setCurrentPageList(i)}
                        >
                          {i}
                        </Pagination.Item>
                      );
                    }
                    return items;
                  }

                  // Always render page 1
                  items.push(
                    <Pagination.Item
                      key={1}
                      active={currentPageList === 1}
                      onClick={() => setCurrentPageList(1)}
                    >
                      {1}
                    </Pagination.Item>
                  );

                  // Render left ellipsis
                  if (currentPageList > 3) {
                    items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
                  }

                  // Render center range
                  const startPage = Math.max(2, currentPageList - 1);
                  const endPage = Math.min(totalPages - 1, currentPageList + 1);

                  for (let i = startPage; i <= endPage; i++) {
                    items.push(
                      <Pagination.Item
                        key={i}
                        active={i === currentPageList}
                        onClick={() => setCurrentPageList(i)}
                      >
                        {i}
                      </Pagination.Item>
                    );
                  }

                  // Render right ellipsis
                  if (currentPageList < totalPages - 2) {
                    items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
                  }

                  // Always render last page
                  items.push(
                    <Pagination.Item
                      key={totalPages}
                      active={currentPageList === totalPages}
                      onClick={() => setCurrentPageList(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  );

                  return items;
                })()}
                <Pagination.Next
                  disabled={currentPageList === Math.ceil(borders.length / 6)}
                  onClick={() => setCurrentPageList(prev => prev + 1)}
                />
              </Pagination>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            size="sm"
            onClick={() => { setShowModalList(false); setShowBorderGuidanceModal(true); }}
            style={{
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1.5px dashed rgba(var(--primary-rgb), 0.5)',
              background: 'rgba(var(--primary-rgb), 0.03)',
              color: 'rgb(var(--primary-rgb))',
              padding: '0.5rem 1rem'
            }}
          >
            <i className="bi bi-cloud-arrow-up-fill me-1"></i> Adicionar moldura personalizada
          </Button>
          <Button variant="secondary" onClick={() => setShowModalList(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAdd} onHide={() => setShowModalAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nova Moldura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Imagem de Fundo (Frente)</Form.Label>
            <Form.Control ref={newBorderInputRef} type="file" accept="image/*" onChange={handleNewBorderChange} />
          </Form.Group>
          {newBorderPreview && (
            <div className="mt-2 mb-3">
              <small>Preview Frente:</small>
              <img src={newBorderPreview} alt="Preview" style={{ width: '100%', borderRadius: 8, maxHeight: 150, objectFit: 'contain' }} />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Imagem de Fundo (Verso - Opcional)</Form.Label>
            <Form.Control ref={newBackBorderInputRef} type="file" accept="image/*" onChange={handleNewBackBorderChange} />
          </Form.Group>
          {newBackBorderPreview && (
            <div className="mt-2">
              <small>Preview Verso:</small>
              <img src={newBackBorderPreview} alt="Preview Verso" style={{ width: '100%', borderRadius: 8, maxHeight: 150, objectFit: 'contain' }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAdd(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewBorder}
            disabled={!newBorderPreview || loadingAddBorder}
          >
            {loadingAddBorder ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default DocumentTemplateForm;
