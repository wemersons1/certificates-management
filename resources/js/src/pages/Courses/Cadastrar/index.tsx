import { FC, useState, useEffect, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeChanger } from '@/src/redux/action';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '@/src/lib/api';
import {
    FiSearch, FiPlus, FiType, FiUpload, FiSliders, FiFolder, FiChevronDown,
    FiAward, FiHeart, FiLayers, FiGrid, FiExternalLink,
    FiCheckCircle, FiCheck, FiBold, FiItalic, FiUnderline, FiAlignLeft, FiMinus,
    FiAlignCenter, FiAlignRight, FiAlignJustify, FiTrash2, FiRotateCw, FiMove, FiEdit2,
    FiMinimize2, FiMaximize2, FiImage, FiGrid as FiGridIcon, FiUploadCloud,
    FiMonitor, FiSmartphone
} from 'react-icons/fi';

const GoogleFontsLoader = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Architects+Daughter&family=Bad+Script&family=Berkshire+Swash&family=Cinzel+Decorative&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Inter:wght@300;400;500;600;700&family=Italianno&family=Kaushan+Script&family=La+Belle+Aurore&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Marck+Script&family=Montserrat+Alternates:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Mr+De+Haviland&family=Niconne&family=Oswald:wght@300;400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quintessential&family=Roboto:wght@300;400;500;700&family=Sacramento&family=Satisfy&family=Tangerine:wght@700&family=Yellowtail&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Baskervville&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Prata&family=DM+Serif+Display&family=Playfair+Display+SC:wght@400;700&family=Cormorant+Unicase:wght@400;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Rochester&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&family=Qwigley&family=WindSong&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);
    return null;
};

interface TextElement {
    id: string;
    text: string;
    html?: string;  // rich text HTML content
    x: number; // percentage
    y: number; // percentage
    fontSize: number; // px
    color: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    width: number; // px
    height?: number; // px
    lineHeight?: string | number;
    pdfPositioned?: boolean;
    page?: number;
    type?: 'text' | 'line';
}

interface SignatureItem {
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    page?: number;    // 1 or 2 (certificate page)
    dbId?: number;   // database record ID (course_signatures.id)
}

const DEFAULT_TEXT_ELEMENTS: TextElement[] = [
];

const AVAILABLE_FONTS = [
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Oswald', family: 'Oswald, sans-serif' },
    { name: 'Montserrat Alternates', family: "'Montserrat Alternates', sans-serif" },
    { name: 'Architects Daughter', family: "'Architects Daughter', sans-serif" },
    { name: 'Cinzel', family: 'Cinzel, sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display, sans-serif' },
    { name: 'Lora', family: 'Lora, sans-serif' },
    { name: 'Cormorant Garamond', family: 'Cormorant Garamond, sans-serif' },
    { name: 'Cormorant', family: 'Cormorant, sans-serif' },
    { name: 'EB Garamond', family: "'EB Garamond', serif" },
    { name: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
    { name: 'Cinzel Decorative', family: "'Cinzel Decorative', serif" },
    { name: 'Berkshire Swash', family: "'Berkshire Swash', serif" },
    { name: 'Alex Brush', family: "'Alex Brush', cursive" },
    { name: 'Great Vibes', family: "'Great Vibes', cursive" },
    { name: 'Dancing Script', family: "'Dancing Script', cursive" },
    { name: 'Pinyon Script', family: "'Pinyon Script', cursive" },
    { name: 'Allura', family: "'Allura', cursive" },
    { name: 'Sacramento', family: "'Sacramento', cursive" },
    { name: 'Parisienne', family: "'Parisienne', cursive" },
    { name: 'Tangerine', family: "'Tangerine', cursive" },
    { name: 'Marck Script', family: "'Marck Script', cursive" },
    { name: 'Italianno', family: "'Italianno', cursive" },
    { name: 'Niconne', family: "'Niconne', cursive" },
    { name: 'Bad Script', family: "'Bad Script', cursive" },
    { name: 'Kaushan Script', family: "'Kaushan Script', cursive" },
    { name: 'Satisfy', family: "'Satisfy', cursive" },
    { name: 'Yellowtail', family: "'Yellowtail', cursive" },
    { name: 'Petit Formal Script', family: "'Petit Formal Script', cursive" },
    { name: 'La Belle Aurore', family: "'La Belle Aurore', cursive" },
    { name: 'Quintessential', family: "'Quintessential', cursive" },
    { name: 'Herr Von Muellerhoff', family: "'Herr Von Muellerhoff', cursive" },
    { name: 'Mr De Haviland', family: "'Mr De Haviland', cursive" },
    { name: 'Times New Roman', family: "'Times New Roman', Times, serif" },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Raleway', family: 'Raleway, sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Open Sans', family: "'Open Sans', sans-serif" },
    { name: 'Georgia', family: 'Georgia, serif' },
    { name: 'Baskervville', family: 'Baskervville, serif' },
    { name: 'Crimson Text', family: "'Crimson Text', serif" },
    { name: 'Cardo', family: 'Cardo, serif' },
    { name: 'Prata', family: 'Prata, serif' },
    { name: 'DM Serif Display', family: "'DM Serif Display', serif" },
    { name: 'Playfair Display SC', family: "'Playfair Display SC', serif" },
    { name: 'Cormorant Unicase', family: "'Cormorant Unicase', serif" },
    { name: 'Fraunces', family: 'Fraunces, serif' },
    { name: 'Bodoni Moda', family: "'Bodoni Moda', serif" },
    { name: 'Rochester', family: 'Rochester, cursive' },
    { name: 'Mrs Saint Delafield', family: "'Mrs Saint Delafield', cursive" },
    { name: 'Monsieur La Doulaise', family: "'Monsieur La Doulaise', cursive" },
    { name: 'Qwigley', family: 'Qwigley, cursive' },
    { name: 'WindSong', family: 'WindSong, cursive' }
];

const VerticalFixedFontSelect = ({
    value,
    onChange
}: {
    value: string;
    onChange: (val: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        const cleaned = name.replace(/sans-serif|serif|monospace/gi, '').trim();
        const parts = cleaned.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return cleaned.substring(0, 2).toUpperCase();
    };

    const filteredFonts = AVAILABLE_FONTS.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '36px', height: '36px', userSelect: 'none' }}>
            <button
                ref={triggerRef}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearch('');
                }}
                title={value}
                style={{
                    background: isOpen ? '#fa3f7a' : '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#ffffff',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    boxShadow: isOpen ? '0 0 10px rgba(250, 63, 122, 0.4)' : 'none'
                }}
            >
                {getInitials(value)}
            </button>

            {isOpen && (
                <div
                    className="portal-font-dropdown"
                    style={{
                        position: 'absolute',
                        left: 'calc(100% + 12px)',
                        top: '-120px',
                        width: '240px',
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(250, 63, 122, 0.1)',
                        zIndex: 9999999,
                        padding: '8px',
                        animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    <div style={{ padding: '4px', marginBottom: '6px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiSearch size={14} style={{ color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Buscar fonte..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#ffffff',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                    <div className="scrollbar-hidden" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredFonts.map((f) => {
                            const isSelected = f.name === value;
                            return (
                                <div
                                    key={f.name}
                                    onClick={() => {
                                        onChange(f.name);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: isSelected ? '#ffffff' : '#a1a1aa',
                                        background: isSelected ? '#fa3f7a' : 'transparent',
                                        cursor: 'pointer',
                                        fontFamily: `'${f.name}', sans-serif`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    <span>{f.name}</span>
                                    {isSelected && <FiCheck size={12} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchableFontSelect = ({
    value,
    onChange,
    width = '160px',
    direction = 'up'
}: {
    value: string;
    onChange: (val: string) => void;
    width?: string;
    direction?: 'up' | 'down';
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [calculatedDirection, setCalculatedDirection] = useState<'up' | 'down'>('down');
    const [calculatedMaxHeight, setCalculatedMaxHeight] = useState(260);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });

            // Calcular melhor direção baseado no espaço disponível
            const spaceBelow = window.innerHeight - rect.bottom - 10; // 10px de margem
            const spaceAbove = rect.top - 60; // 60px para a barra do topo
            const dropdownHeight = 260 + 8 + 32; // maxHeight + padding + search input

            let newDirection: 'up' | 'down' = 'down';
            let newMaxHeight = 260;

            // Se não cabe para baixo, tentar para cima
            if (spaceBelow < dropdownHeight) {
                if (spaceAbove >= dropdownHeight) {
                    newDirection = 'up';
                } else {
                    // Não cabe em nenhum lugar, usar a direção com mais espaço
                    newDirection = spaceAbove > spaceBelow ? 'up' : 'down';
                    // Ajustar maxHeight para caber na tela
                    const availableSpace = newDirection === 'up' ? spaceAbove - 8 : spaceBelow - 8;
                    newMaxHeight = Math.max(120, availableSpace - 50); // Mínimo 120px, menos 50px para busca + padding
                }
            }

            setCalculatedDirection(newDirection);
            setCalculatedMaxHeight(newMaxHeight);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                const portalDropdown = document.querySelector('.portal-font-dropdown');
                if (portalDropdown && portalDropdown.contains(e.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    useEffect(() => {
        setIsOpen(false);
    }, [value]);

    const filteredFonts = AVAILABLE_FONTS.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width, userSelect: 'none' }}>
            <div
                ref={triggerRef}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearch('');
                }}
                style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: `'${value}', sans-serif`,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    height: '32px'
                }}
            >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {value}
                </span>
                <FiChevronDown size={14} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {isOpen && createPortal(
                <div
                    className="portal-font-dropdown"
                    data-toolbar-portal="true"
                    onMouseDown={(e) => {
                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            e.preventDefault();
                        }
                    }}
                    style={{
                        position: 'fixed',
                        bottom: calculatedDirection === 'up' ? `${window.innerHeight - coords.top + 6}px` : 'auto',
                        top: calculatedDirection === 'down' ? `${coords.top + coords.height + 6}px` : 'auto',
                        left: `${coords.left}px`,
                        width: '240px',
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                        zIndex: 9999999,
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}
                >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Pesquisar fonte..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#27272a',
                                border: '1px solid #3f3f46',
                                borderRadius: '6px',
                                color: '#f4f4f5',
                                fontSize: '12px',
                                padding: '6px 8px 6px 28px',
                                outline: 'none',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        />
                        <FiSearch size={12} style={{ position: 'absolute', left: '10px', color: '#a1a1aa' }} />
                    </div>

                    <div style={{
                        maxHeight: `${calculatedMaxHeight}px`,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        paddingRight: '2px'
                    }} className="custom-font-scrollbar">
                        <style>{`
                            .custom-font-scrollbar::-webkit-scrollbar {
                                width: 5px;
                            }
                            .custom-font-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-font-scrollbar::-webkit-scrollbar-thumb {
                                background: #3f3f46;
                                borderRadius: 4px;
                            }
                            .custom-font-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #52525b;
                            }
                        `}</style>
                        {filteredFonts.length > 0 ? (
                            filteredFonts.map(f => {
                                const isSelected = f.name === value;
                                return (
                                    <div
                                        key={f.name}
                                        onClick={() => {
                                            onChange(f.name);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            background: isSelected ? '#fa3f7a' : 'transparent',
                                            color: isSelected ? '#ffffff' : '#cbd5e1',
                                            fontFamily: f.family,
                                            fontSize: '16px',
                                            lineHeight: '1.5',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'background 0.15s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            minHeight: '40px'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = '#27272a';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {f.name}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '8px', color: '#71717a', fontSize: '12px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                                Nenhuma fonte encontrada
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

interface MasterCourseCreateProps {
    initialOrientation?: 'landscape' | 'portrait';
    initialFrameId?: number | string | null;
    initialBgTheme?: string;
    initialCustomBgUrl?: string;
    embedded?: boolean;
    initialEnableVerso?: boolean;
    initialBackFrameId?: number | string | null;
    initialCustomBgUrlPage2?: string;
    initialCourseName?: string;
    initialHours?: string;
    initialInstructorName?: string;
    initialTemplate?: string;
    initialBackDocument?: string;
    courseId?: number | string | null;  // ID of the course being edited (enables DB-backed logo/signatures)
    onChange?: (data: {
        template: string;
        back_document: string | null;
        orientation: 'landscape' | 'portrait';
        frame_type: 'color' | 'custom';
        frame_color: string | null;
        frame_id: number | string | null;
        customFrame: string | null;
        customBackFrame: string | null;
    }) => void;
    onPageChange?: (page: number) => void;
    onVersoChange?: (enabled: boolean) => void;
}

const MasterCourseCreate = forwardRef<any, MasterCourseCreateProps>((
    {
        initialOrientation,
        initialFrameId,
        initialBgTheme,
        initialCustomBgUrl,
        embedded = false,
        initialEnableVerso = false,
        initialBackFrameId,
        initialCustomBgUrlPage2,
        initialCourseName,
        initialHours,
        initialInstructorName,
        initialTemplate,
        initialBackDocument,
        courseId,
        onChange,
        onPageChange,
        onVersoChange,
    }, ref) => {
    const normalizeHtmlPayload = (value: string): string => {
        let normalized = String(value ?? '').trim();

        // Some API paths return the template as a JSON-encoded string,
        // including surrounding quotes and escaped newlines.
        for (let attempt = 0; attempt < 2; attempt += 1) {
            const looksLikeJsonString = normalized.length >= 2
                && normalized.startsWith('"')
                && normalized.endsWith('"');
            if (!looksLikeJsonString) break;

            try {
                const decoded = JSON.parse(normalized);
                if (typeof decoded !== 'string') break;
                normalized = decoded.trim();
            } catch {
                break;
            }
        }

        if (/\\n|\\r|\\"/.test(normalized)) {
            normalized = normalized
                .replace(/\\r\\n/g, '\n')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\n')
                .replace(/\\"/g, '"');
        }

        return normalized;
    };

    const dispatch = useDispatch();
    const templateTraceIdRef = useRef(
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `editor-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    const reduxTheme = useSelector((state: any) => state);
    const initialThemeRef = useRef(reduxTheme);

    const location = useLocation();
    const v4State = (location.state as any) || {};
    const isFromV4 = Boolean(v4State.fromV4) || Boolean(initialFrameId) || embedded;

    const effectiveOrientation = initialOrientation || v4State.orientation || 'landscape';
    const effectiveFrameId = initialFrameId || v4State.frameId || null;

    const [selectedId, setSelectedId] = useState<string>(() => {
        return initialCustomBgUrl ? '' : 'title';
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toolbarFontSize, setToolbarFontSize] = useState<number | string>(16);
    const [tooltipPlacement, setTooltipPlacement] = useState<'right' | 'left' | 'top' | 'bottom'>('right');


    const updateTooltipPlacement = useCallback((elementId: string) => {
        const elDom = document.getElementById(`canvas-el-${elementId}`);
        const canvasEl = canvasRef.current;
        if (!elDom || !canvasEl) return;

        const elRect = elDom.getBoundingClientRect();
        const canvasRect = canvasEl.getBoundingClientRect();

        const spaceRight = canvasRect.right - elRect.right;
        const spaceLeft = elRect.left - canvasRect.left;
        const spaceTop = elRect.top - canvasRect.top;

        if (spaceRight >= 130) {
            setTooltipPlacement('right');
        } else if (spaceLeft >= 130) {
            setTooltipPlacement('left');
        } else if (spaceTop >= 45) {
            setTooltipPlacement('top');
        } else {
            setTooltipPlacement('bottom');
        }
    }, []);

    useEffect(() => {
        if (selectedId) {
            const handleResize = () => {
                updateTooltipPlacement(selectedId);
            };
            requestAnimationFrame(handleResize);
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [selectedId, updateTooltipPlacement]);

    useEffect(() => {
        if (selectedId) {
            const el = elements.find(item => item.id === selectedId);
            if (el) {
                setToolbarFontSize(el.fontSize);
            }
        }
    }, [selectedId]);

    const [hasClickedEditMe, setHasClickedEditMe] = useState(false);
    const [tourStep, setTourStep] = useState<number>(0);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [showResizeHintId, setShowResizeHintId] = useState<string | null>(null);
    const [showResizeHintText, setShowResizeHintText] = useState<boolean>(false);
    const [isPasteWarning, setIsPasteWarning] = useState<boolean>(false);
    const pasteTimerRef = useRef<any>(null);

    const [dragEndHintId, setDragEndHintId] = useState<string | null>(null);
    const dragEndTimerRef = useRef<any>(null);

    // Helper to parse HTML template back into TextElements
    const parseTemplateHtml = (html: string, pageNum: number): TextElement[] => {
        html = normalizeHtmlPayload(html);
        if (!html || !html.trim()) {
            console.warn('[Template Trace] parser received empty HTML', {
                traceId: templateTraceIdRef.current,
                pageNum,
            });
            return [];
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Manual templates use direct divs, while imported PDF templates use direct
            // paragraphs. Parsing only divs drops every imported text block and produces
            // an empty content-side on the next export.
            const divs = doc.querySelectorAll('.cert-container > .content-side > div, .cert-container > .content-side > p');
            const pageRoot = doc.querySelector('.cert-container');
            const pageStyle = pageRoot?.getAttribute('style') || '';
            const pageWidthMatch = pageStyle.match(/width\s*:\s*([\d.]+)px/i);
            const pageHeightMatch = pageStyle.match(/height\s*:\s*([\d.]+)px/i);
            const pageWidth = pageWidthMatch ? parseFloat(pageWidthMatch[1]) : (latestAssetStateRef.current?.orientation === 'portrait' ? 794 : 1123);
            const pageHeight = pageHeightMatch ? parseFloat(pageHeightMatch[1]) : (latestAssetStateRef.current?.orientation === 'portrait' ? 1123 : 794);

            console.info('[Template Trace] parser input', {
                traceId: templateTraceIdRef.current,
                pageNum,
                htmlBytes: html.length,
                directDivs: doc.querySelectorAll('.cert-container > .content-side > div').length,
                directParagraphs: doc.querySelectorAll('.cert-container > .content-side > p').length,
                pageWidth,
                pageHeight,
            });

            const classStyles = new Map<string, string>();
            doc.querySelectorAll('style').forEach(styleNode => {
                const css = styleNode.textContent || '';
                css.replace(/\.([\w-]+)\s*\{([^}]+)\}/g, (_match, className, declarations) => {
                    classStyles.set(className, declarations);
                    return _match;
                });
            });

            const parsedElements: TextElement[] = [];
            divs.forEach((div, idx) => {
                const styleAttr = div.getAttribute('style') || '';
                const classStyle = Array.from(div.classList)
                    .map(className => classStyles.get(className) || '')
                    .filter(Boolean)
                    .join(';');
                // Inline declarations have precedence over .ftXX class rules in the
                // browser. Keep the same precedence here so scaled PDF typography
                // remains effective even for templates saved before the fix.
                const effectiveStyle = `${styleAttr};${classStyle}`;
                const isImportedParagraph = div.tagName.toLowerCase() === 'p';
                const isPersistedPdfElement = div.getAttribute('data-pdf-positioned') === 'true'
                    || (/transform\s*:\s*none/i.test(styleAttr) && /white-space\s*:\s*pre(?:;|\s|$)/i.test(styleAttr));

                // Skip logo elements or signature elements, as well as structural wrapper containers
                if (div.querySelector('img') || styleAttr.includes('z-index: 30') || styleAttr.includes('z-index: 31') || div.classList.contains('pattern-shape-1') || div.classList.contains('pattern-shape-2') || div.classList.contains('content-side') || div.classList.contains('pattern-side')) {
                    return;
                }

                // Determine element type: line blocks have background-color style attributes
                const isLine = styleAttr.includes('background-color:');
                const type = isLine ? 'line' : 'text';

                const text = div.textContent?.trim() || (isLine ? '—' : '');
                // Preserve the full innerHTML so nested tags (e.g. <div>Subitem</div>, <strong>, <br>) render correctly
                const innerHtml = !isLine ? (div.innerHTML?.trim() || '') : '';
                const hasNestedTags = innerHtml !== text;
                // pdftohtml emits a trailing <br> for many single-line PDF paragraphs.
                // Ignore that trailing marker when deciding whether the paragraph is a
                // real multi-line column/list.
                const contentWithoutTrailingBreak = innerHtml
                    .replace(/(?:<br\s*\/?>|&nbsp;|\u00a0|\s)+$/i, '')
                    .trim();
                const hasMeaningfulLineBreak = /<br\s*\/?>/i.test(contentWithoutTrailingBreak);

                if (!isLine && text === undefined) return;

                // Parse positions, fonts, colors, etc. from style attribute
                let x = 50;
                let y = 50;
                let fontSize = isLine ? 4 : 16;
                let color = '#000000';
                let fontFamily = 'Open Sans';
                let fontWeight = '400';
                let fontStyle = 'normal';
                let textDecoration = 'none';
                let textAlign: 'left' | 'center' | 'right' | 'justify' = isImportedParagraph ? 'left' : 'center';
                let width = isLine ? 150 : 600;
                let lineHeight: string | number = 1.45;
                let pdfPositioned = false;

                const leftMatch = styleAttr.match(/left:\s*([\d.]+)%/);
                const topMatch = styleAttr.match(/top:\s*([\d.]+)%/);
                const topPxMatch = styleAttr.match(/top:\s*([\d.]+)px/i);
                if ((!leftMatch || !topMatch) && (!isImportedParagraph || !topPxMatch)) {
                    return; // Skip structural, phantom, or legacy corrupted containers lacking exact coordinates
                }
                const leftPxMatch = styleAttr.match(/left:\s*([\d.]+)px/i);
                if (isImportedParagraph && topPxMatch && leftPxMatch) {
                    const leftPx = parseFloat(leftPxMatch[1]);
                    x = (leftPx / pageWidth) * 100;
                    y = (parseFloat(topPxMatch[1]) / pageHeight) * 100;
                    if (!hasMeaningfulLineBreak) {
                        // A single-line PDF paragraph is positioned by its left edge,
                        // not by a CSS text box. Create a symmetric box so replacements
                        // (for example a user-name mask) remain centered on the same axis.
                        width = Math.max(1, Math.round(pageWidth - (leftPx * 2)));
                        textAlign = 'center';
                    } else {
                        width = Math.max(1, Math.round(pageWidth - leftPx));
                    }
                    pdfPositioned = true;
                } else if (isPersistedPdfElement && leftMatch && topMatch) {
                    // Exported templates are stored as divs with percentage positions.
                    // The marker keeps their original PDF anchoring across reloads.
                    x = parseFloat(leftMatch[1]);
                    y = parseFloat(topMatch[1]);
                    pdfPositioned = true;
                } else {
                    x = parseFloat(leftMatch![1]);
                    y = parseFloat(topMatch![1]);
                }

                if (isLine) {
                    const heightMatch = styleAttr.match(/height:\s*(\d+)px/);
                    if (heightMatch) fontSize = parseInt(heightMatch[1]);

                    const bgColorMatch = styleAttr.match(/background-color:\s*(#[0-9a-fA-F]+|rgba?\([^)]+\)|[a-zA-Z]+)/);
                    if (bgColorMatch) color = bgColorMatch[1];
                } else {
                    const sizeMatch = effectiveStyle.match(/font-size:\s*([\d.]+)px/i);
                    if (sizeMatch) fontSize = parseFloat(sizeMatch[1]);

                    const colorMatch = effectiveStyle.match(/color:\s*(#[0-9a-fA-F]+|rgba?\([^)]+\)|[a-zA-Z]+)/i);
                    if (colorMatch) color = colorMatch[1];

                    const familyMatch = effectiveStyle.match(/font-family:\s*(?:'([^']+)'|([^;,]+))/i);
                    if (familyMatch) {
                        fontFamily = (familyMatch[1] || familyMatch[2]).trim()
                            .replace(/^[A-Z]{6}\+/i, '')
                            .replace(/^LiberationSans$/i, 'Liberation Sans');
                    }

                    const weightMatch = effectiveStyle.match(/font-weight:\s*(\w+)/i);
                    if (weightMatch) {
                        const parsedWeight = weightMatch[1].toLowerCase();
                        fontWeight = parsedWeight === 'bold' ? '700' : parsedWeight;
                    }

                    if (effectiveStyle.includes('font-style: italic')) fontStyle = 'italic';
                    if (effectiveStyle.includes('text-decoration: underline')) textDecoration = 'underline';

                    const alignMatch = effectiveStyle.match(/text-align:\s*(\w+)/i);
                    if (alignMatch) {
                        const alignVal = alignMatch[1];
                        if (alignVal === 'left' || alignVal === 'center' || alignVal === 'right' || alignVal === 'justify') {
                            textAlign = alignVal;
                        }
                    }

                    const lineHeightMatch = effectiveStyle.match(/line-height:\s*([\d.]+px)/i);
                    if (lineHeightMatch) lineHeight = lineHeightMatch[1];
                }

                if (!isImportedParagraph) {
                    const widthMatch = styleAttr.match(/width:\s*([\d.]+)px/);
                    if (widthMatch) width = Math.round(parseFloat(widthMatch[1]));
                    if (isPersistedPdfElement && !hasMeaningfulLineBreak) {
                        const leftPx = (x / 100) * pageWidth;
                        width = Math.max(1, Math.round(pageWidth - (leftPx * 2)));
                        textAlign = 'center';
                    }
                }

                let height: number | undefined = undefined;
                const heightMatch = styleAttr.match(/height:\s*([\d.]+)px/);
                if (heightMatch && !isLine) height = Math.round(parseFloat(heightMatch[1]));

                if (isImportedParagraph && div.querySelector('b, strong')) {
                    fontWeight = '700';
                }

                if (pdfPositioned && !hasMeaningfulLineBreak) {
                    // A single PDF line has no explicit CSS width. Its left coordinate
                    // is the actual glyph start, so using the remaining page width made
                    // adjacent runs such as "Ministrante:" and the instructor name
                    // overlap. Measure the original run with the same typography and
                    // keep only its natural width as the editable anchor box.
                    let measuredWidth = 0;
                    if (typeof document !== 'undefined') {
                        const measureCanvas = document.createElement('canvas');
                        const measureContext = measureCanvas.getContext('2d');
                        if (measureContext) {
                            measureContext.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
                            measuredWidth = measureContext.measureText(text).width;
                        }
                    }
                    if (measuredWidth > 0) {
                        width = Math.max(1, Math.ceil(measuredWidth + 1));
                    }
                    textAlign = 'center';
                }

                // Create a unique stable ID based on page and index
                const id = `parsed-${pageNum}-${idx}-${Math.random().toString(36).substr(2, 4)}`;

                if (!isLine && styleAttr.includes('translate(-50%, -50%)')) {
                    // Estimate height of the old element to adjust its y coordinate to be top-anchored
                    const textLength = text.length;
                    const approxCharWidth = fontSize * 0.5;
                    const totalTextWidth = textLength * approxCharWidth;
                    const linesCount = Math.max(1, Math.ceil(totalTextWidth / width));
                    const estimatedHeightPx = linesCount * fontSize * 1.3;
                    const canvasHeight = pageNum === 1 ? (latestAssetStateRef.current?.orientation === 'portrait' ? 1123 : 794) : 794;
                    const offsetYPercent = (estimatedHeightPx / canvasHeight) * 100 / 2;
                    y = Math.max(0, y - offsetYPercent);
                }

                parsedElements.push({
                    id,
                    text,
                    // If the div contains nested HTML tags, preserve them so the canvas renders correctly
                    ...(hasNestedTags ? { html: innerHtml } : {}),
                    type,
                    x,
                    y,
                    fontSize,
                    color,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    fontFamily,
                    textAlign,
                    width,
                    height,
                    lineHeight,
                    pdfPositioned,
                    page: pageNum
                });
            });
            // A PDF line can be split into multiple positioned runs solely because
            // its formatting changes (for example bold "Ministrante:" followed by
            // regular "Prof. Alberto Ponzo Neto"). Treat those runs as one editable
            // line; otherwise their independent boxes overlap and the second run can
            // be clipped by the first one. The nested span keeps each run's weight.
            const mergedElements: TextElement[] = [];
            const pageWidthForMerge = pageWidth;
            parsedElements.forEach((current) => {
                const previous = mergedElements[mergedElements.length - 1];
                if (
                    previous &&
                    previous.pdfPositioned &&
                    current.pdfPositioned &&
                    previous.type === 'text' &&
                    current.type === 'text' &&
                    Math.abs(previous.y - current.y) < 0.25 &&
                    Math.abs(previous.fontSize - current.fontSize) < 0.1 &&
                    previous.fontFamily === current.fontFamily
                ) {
                    const previousRight = (previous.x / 100) * pageWidthForMerge + previous.width;
                    const currentLeft = (current.x / 100) * pageWidthForMerge;
                    const gap = currentLeft - previousRight;
                    if (gap >= -2 && gap <= 8) {
                        const previousHtml = previous.html ?? previous.text;
                        const currentHtml = current.html ?? current.text;
                        previous.html = `${previousHtml}<span style="font-weight:${current.fontWeight};font-style:${current.fontStyle};">${currentHtml}</span>`;
                        previous.text = `${previous.text}${current.text}`;
                        previous.width = Math.max(
                            previous.width,
                            Math.ceil((currentLeft + current.width) - ((previous.x / 100) * pageWidthForMerge))
                        );
                        previous.textAlign = 'left';
                        return;
                    }
                }
                mergedElements.push(current);
            });
            console.info('[Template Trace] parser output', {
                traceId: templateTraceIdRef.current,
                pageNum,
                parsedElements: mergedElements.length,
                texts: mergedElements.slice(0, 20).map(element => element.text),
            });
            return mergedElements;

        } catch (e) {
            console.error('[Template Trace] parser failed', {
                traceId: templateTraceIdRef.current,
                pageNum,
                error: e,
            });
            return [];
        }
    };

    // Initial Elements modelled after the user's attachment
    const [elements, setElements] = useState<TextElement[]>(() => {
        const parsedPage1 = initialTemplate ? parseTemplateHtml(initialTemplate, 1) : [];
        const parsedPage2 = initialTemplate && initialBackDocument ? parseTemplateHtml(initialBackDocument, 2) : [];
        const combined = [...parsedPage1, ...parsedPage2];

        if (combined.length > 0) {
            return combined;
        }

        return DEFAULT_TEXT_ELEMENTS;
    });

    useEffect(() => {
        if (selectedId === 'edit-me' || editingId === 'edit-me') {
            setHasClickedEditMe(true);
        }
    }, [selectedId, editingId]);

    // New Creative options requested by the user
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(effectiveOrientation);
    const [bgTheme, setBgTheme] = useState<string>(initialBgTheme || 'custom-image');
    const [frameColor, setFrameColor] = useState<string>('blue');
    const [customBgUrl, setCustomBgUrl] = useState(initialCustomBgUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop');
    const [dbBorders, setDbBorders] = useState<any[]>([]);

    // Parser helper functions to extract logos and signatures from database HTML templates
    const parseLogoFromHtml = (html: string | undefined): { url: string | null, pos: { x: number, y: number, width: number } } => {
        if (!html) return { url: null, pos: { x: 58, y: 8, width: 130 } };
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const logoDiv = doc.querySelector('div[data-mask-key="logo"], div[data-mask-key="logo-p2"]');
            if (!logoDiv) {
                const fallbackImg = Array.from(doc.querySelectorAll('img')).find(img => img.getAttribute('alt') === 'Logotipo');
                const fallbackDiv = fallbackImg?.closest('div');
                if (fallbackDiv) {
                    const styleAttr = fallbackDiv.getAttribute('style') || '';
                    const leftMatch = styleAttr.match(/left:\s*([\d.]+)%/);
                    const topMatch = styleAttr.match(/top:\s*([\d.]+)%/);
                    const widthMatch = styleAttr.match(/width:\s*([\d.]+)px/);
                    return {
                        url: fallbackImg?.getAttribute('src') || null,
                        pos: {
                            x: leftMatch ? parseFloat(leftMatch[1]) : 58,
                            y: topMatch ? parseFloat(topMatch[1]) : 8,
                            width: widthMatch ? Math.round(parseFloat(widthMatch[1])) : 130
                        }
                    };
                }
                return { url: null, pos: { x: 58, y: 8, width: 130 } };
            }
            const img = logoDiv.querySelector('img');
            const styleAttr = logoDiv.getAttribute('style') || '';
            const leftMatch = styleAttr.match(/left:\s*([\d.]+)%/);
            const topMatch = styleAttr.match(/top:\s*([\d.]+)%/);
            const widthMatch = styleAttr.match(/width:\s*([\d.]+)px/);
            return {
                url: img?.getAttribute('src') || null,
                pos: {
                    x: leftMatch ? parseFloat(leftMatch[1]) : 58,
                    y: topMatch ? parseFloat(topMatch[1]) : 8,
                    width: widthMatch ? Math.round(parseFloat(widthMatch[1])) : 130
                }
            };
        } catch (e) {
            console.error('Error parsing logo from HTML:', e);
            return { url: null, pos: { x: 58, y: 8, width: 130 } };
        }
    };

    const parseSignaturesFromHtml = (html: string | undefined, pageNum: number): SignatureItem[] => {
        if (!html) return [];
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sigDivs = Array.from(doc.querySelectorAll('div')).filter(div => {
                const styleAttr = div.getAttribute('style') || '';
                return styleAttr.includes('z-index: 31') || div.querySelector('img[alt="Assinatura"]');
            });
            return sigDivs.map((div, idx) => {
                const img = div.querySelector('img');
                const styleAttr = div.getAttribute('style') || '';
                const leftMatch = styleAttr.match(/left:\s*([\d.]+)%/);
                const topMatch = styleAttr.match(/top:\s*([\d.]+)%/);
                const widthMatch = styleAttr.match(/width:\s*([\d.]+)px/);
                return {
                    id: `parsed-sig-${pageNum}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                    url: img?.getAttribute('src') || '',
                    x: leftMatch ? parseFloat(leftMatch[1]) : 50,
                    y: topMatch ? parseFloat(topMatch[1]) : 50,
                    width: widthMatch ? Math.round(parseFloat(widthMatch[1])) : 150,
                    page: pageNum
                };
            }).filter(sig => sig.url);
        } catch (e) {
            console.error('Error parsing signatures from HTML:', e);
            return [];
        }
    };

    // Logo states and refs (loaded from API when courseId is present)
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoPos, setLogoPos] = useState<{ x: number; y: number; width: number }>({ x: 58, y: 8, width: 130 });
    const [logoDbId, setLogoDbId] = useState<number | null>(null); // tracks the DB record id
    const [selectedLogo, setSelectedLogo] = useState(false);
    const [showLogoIndicator, setShowLogoIndicator] = useState(false);
    const [showSigIndicator, setShowSigIndicator] = useState(false);
    const [lastAddedSigId, setLastAddedSigId] = useState<string | null>(null);
    const draggingLogoRef = useRef(false);
    const logoDragOffset = useRef({ x: 0, y: 0 });
    const resizingLogoRef = useRef(false);
    const resizeLogoStartXRef = useRef(0);
    const resizeLogoStartWidthRef = useRef(0);

    // Signature states and refs (loaded from API when courseId is present)
    const [signatures, setSignatures] = useState<SignatureItem[]>([]);
    const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
    const draggingSignatureIdRef = useRef<string | null>(null);
    const signatureDragOffset = useRef({ x: 0, y: 0 });
    const resizingSignatureIdRef = useRef<string | null>(null);
    const resizeSignatureStartXRef = useRef(0);
    const resizeSignatureStartWidthRef = useRef(0);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [enableVerso, setEnableVerso] = useState<boolean>(initialEnableVerso || false);
    const [activeTool, setActiveTool] = useState<'text' | 'line'>('text');

    useEffect(() => {
        if (onPageChange) {
            onPageChange(currentPage);
        }
    }, [currentPage, onPageChange]);

    useEffect(() => {
        if (onVersoChange) {
            onVersoChange(enableVerso);
        }
    }, [enableVerso, onVersoChange]);

    const handleSelectPage = (pageNum: number) => {
        if (pageNum === 1) {
            setCurrentPage(1);
        } else {
            // "se clicar em verso, quero que herde as mesmas configurações menos o texto"
            // Inherit configurations only if it is the first activation, making them independent afterwards.
            if (!enableVerso) {
                setBgThemePage2(bgTheme);
                setFrameColorPage2(frameColor);
                setCustomBgUrlPage2(customBgUrl);
                setLogoUrlPage2(logoUrl);
                setLogoPosPage2({ ...logoPos });
                setSignaturesPage2(signatures.map(s => ({ ...s, id: `${s.id}-p2` })));
                setOrientationPage2(orientation);
                setEnableVerso(true);
            }
            setCurrentPage(2);
        }
    };

    const handleToggleVerso = (checked: boolean) => {
        if (!checked) {
            // Confirm deactivation to avoid accidental loss of Page 2 elements
            Swal.fire({
                title: 'Desativar Verso?',
                text: 'Ao desativar o verso, os elementos da segunda página não serão excluídos da edição, mas não serão exibidos nem exportados no certificado final.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#fa3f7a',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sim, desativar',
                cancelButtonText: 'Cancelar',
                background: '#18181b',
                color: '#f4f4f5'
            }).then((result) => {
                if (result.isConfirmed) {
                    setEnableVerso(false);
                    setCurrentPage(1);
                    // Reset Page 2 configurations to start fresh when reactivated
                    setBgThemePage2('clean');
                    setFrameColorPage2('blue');
                    setCustomBgUrlPage2('');
                    setLogoUrlPage2(null);
                    setSignaturesPage2([]);
                }
            });
        } else {
            handleSelectPage(2);
        }
    };

    // States for Page 2 (starts clean)
    const [bgThemePage2, setBgThemePage2] = useState<string>(initialCustomBgUrlPage2 ? 'custom-image' : 'clean');
    const [frameColorPage2, setFrameColorPage2] = useState<string>('blue');
    const [customBgUrlPage2, setCustomBgUrlPage2] = useState<string>(initialCustomBgUrlPage2 || '');
    // States for page 2 logo (page 2 uses same logo as page 1 by design)
    const [logoUrlPage2, setLogoUrlPage2] = useState<string | null>(null);
    const [logoPosPage2, setLogoPosPage2] = useState<{ x: number; y: number; width: number }>({ x: 58, y: 8, width: 130 });
    const [signaturesPage2, setSignaturesPage2] = useState<SignatureItem[]>([]);
    const [orientationPage2, setOrientationPage2] = useState<'landscape' | 'portrait'>(effectiveOrientation);

    // DB-backed assets for this course only
    const [dbLogoRecord, setDbLogoRecord] = useState<any>(null);
    const [dbSignatureRecords, setDbSignatureRecords] = useState<any[]>([]);

    // Dynamic getters based on active page
    const activeBgTheme = currentPage === 1 ? bgTheme : bgThemePage2;
    const activeFrameColor = currentPage === 1 ? frameColor : frameColorPage2;
    const activeCustomBgUrl = currentPage === 1 ? customBgUrl : customBgUrlPage2;
    const activeLogoUrl = logoUrl;
    const activeLogoPos = logoPos;
    const activeSignatures = currentPage === 1 ? signatures : signaturesPage2;
    const activeOrientation = currentPage === 1 ? orientation : orientationPage2;

    // Dynamic setters
    const setActiveBgTheme = (val: string) => {
        if (currentPage === 1) setBgTheme(val);
        else setBgThemePage2(val);
    };
    const setActiveFrameColor = (val: string) => {
        if (currentPage === 1) setFrameColor(val);
        else setFrameColorPage2(val);
    };
    const setActiveCustomBgUrl = (val: string) => {
        if (currentPage === 1) setCustomBgUrl(val);
        else setCustomBgUrlPage2(val);
    };
    const setActiveLogoUrl = (val: string | null) => {
        setLogoUrl(val);
    };
    const setActiveLogoPos = (val: any) => {
        setLogoPos(val);
    };
    const setActiveSignatures = (val: SignatureItem[] | ((prev: SignatureItem[]) => SignatureItem[])) => {
        if (currentPage === 1) setSignatures(val);
        else setSignaturesPage2(val);
    };
    const setActiveOrientation = (val: 'landscape' | 'portrait') => {
        if (currentPage === 1) setOrientation(val);
        else setOrientationPage2(val);
    };

    // Helper to proxy S3 images through http://localhost/api/image?image={URL}
    const getProxiedImageUrl = async (rawUrl: string): Promise<string> => {
        if (!rawUrl) return '';
        if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
            return rawUrl;
        }
        try {
            const imgResp = await api.get(`/image?image=${rawUrl}`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(imgResp.data);
        } catch (err) {
            console.error('Erro ao buscar imagem via proxy:', rawUrl, err);
            return rawUrl;
        }
    };

    // Load logo and signatures from the API for the current course
    useEffect(() => {
        if (!courseId) return;

        const loadCourseAssets = async () => {
            try {
                // Load logo
                const logoResp = await api.get(`/courses/${courseId}/logo`);
                if (logoResp.data) {
                    const l = logoResp.data;
                    setDbLogoRecord(l);
                    const proxiedLogoUrl = await getProxiedImageUrl(l.url);
                    setLogoUrl(proxiedLogoUrl);

                    const parsedX = parseFloat(l.x);
                    const parsedY = parseFloat(l.y);
                    const parsedWidth = parseInt(l.width);

                    setLogoPos({
                        x: isNaN(parsedX) ? 58 : parsedX,
                        y: isNaN(parsedY) ? 8 : parsedY,
                        width: isNaN(parsedWidth) || parsedWidth <= 0 ? 130 : parsedWidth
                    });
                }
            } catch {
                // No logo yet — remains null
            }

            try {
                // Load signatures
                const sigResp = await api.get(`/courses/${courseId}/signatures`);
                const sigs: any[] = sigResp.data || [];
                setDbSignatureRecords(sigs);

                const processedSigs: SignatureItem[] = await Promise.all(
                    sigs.map(async (s) => {
                        const proxiedSigUrl = await getProxiedImageUrl(s.url);
                        return {
                            id: `db-sig-${s.id}`,
                            url: proxiedSigUrl,
                            rawUrl: s.url,
                            x: s.x,
                            y: s.y,
                            width: s.width,
                            page: s.page || 1,
                            dbId: s.id
                        };
                    })
                );

                const page1Sigs = processedSigs.filter(s => s.page === 1);
                const page2Sigs = processedSigs.filter(s => s.page === 2);

                setSignatures(page1Sigs);
                setSignaturesPage2(page2Sigs);
            } catch {
                // No signatures yet
            }
        };

        loadCourseAssets();
    }, [courseId]);

    // Sync signature POSITIONS for already-saved signatures (debounced) — new sigs are handled by saveCourseAssets
    useEffect(() => {
        if (!courseId) return;
        const allSigs = [...signatures, ...signaturesPage2];
        const existingSigs = allSigs.filter(s => !!s.dbId);
        if (existingSigs.length === 0) return;
        const timer = setTimeout(async () => {
            for (const sig of existingSigs) {
                try {
                    await api.put(`/courses/${courseId}/signatures/${sig.dbId}`, {
                        x: sig.x,
                        y: sig.y,
                        width: sig.width,
                        page: sig.page || 1,
                    });
                } catch { /* silent */ }
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [courseId, signatures, signaturesPage2]);

    // Always-current ref to avoid stale closures inside useImperativeHandle
    const latestAssetStateRef = useRef({
        logoUrl,
        logoPos,
        signatures,
        signaturesPage2,
        dbLogoRecord,
        elements,
        orientation,
        orientationPage2,
        bgTheme,
        bgThemePage2,
        frameColor,
        frameColorPage2,
        customBgUrl,
        customBgUrlPage2,
        enableVerso,
        effectiveFrameId,
        dbBorders,
    });
    useEffect(() => {
        latestAssetStateRef.current = {
            logoUrl,
            logoPos,
            signatures,
            signaturesPage2,
            dbLogoRecord,
            elements,
            orientation,
            orientationPage2,
            bgTheme,
            bgThemePage2,
            frameColor,
            frameColorPage2,
            customBgUrl,
            customBgUrlPage2,
            enableVerso,
            effectiveFrameId,
            dbBorders,
        };
    });

    useImperativeHandle(ref, () => ({
        currentPage,
        setCurrentPage: (p: number) => {
            handleSelectPage(p);
        },
        enableVerso,
        setEnableVerso: (val: boolean) => {
            setEnableVerso(val);
            if (!val) {
                setCurrentPage(1);
            }
        },
        getPageHTML: (pageNum: number) => {
            return getPageHTML(pageNum);
        },
        updatePageHTML: (pageNum: number, newHtml: string) => {
            const normalizedHtml = normalizeHtmlPayload(newHtml);
            console.info('[Template Trace] updatePageHTML', {
                traceId: templateTraceIdRef.current,
                pageNum,
                receivedBytes: String(newHtml ?? '').length,
                normalizedBytes: normalizedHtml.length,
                wasNormalized: normalizedHtml !== String(newHtml ?? '').trim(),
                hasCertContainer: normalizedHtml.includes('cert-container'),
                hasContentSide: normalizedHtml.includes('content-side'),
            });
            const parsed = parseTemplateHtml(normalizedHtml, pageNum);
            setElements(prev => {
                // Elements without a 'page' field are implicitly page 1 (DEFAULT_TEXT_ELEMENTS have no page)
                const otherPages = prev.filter(el => (el.page ?? 1) !== pageNum);
                return [...otherPages, ...parsed];
            });
        },
        getTemplateData: () => {
            const {
                enableVerso: curEnableVerso,
                bgTheme: curBgTheme,
                bgThemePage2: curBgThemePage2,
                customBgUrl: curCustomBgUrl,
                customBgUrlPage2: curCustomBgUrlPage2,
                orientation: curOrientation,
                effectiveFrameId: curEffectiveFrameId,
                frameColor: curFrameColor,
            } = latestAssetStateRef.current;

            const page1Html = getPageHTML(1);
            const page2Html = curEnableVerso ? getPageHTML(2) : null;

            const frame_type = (curBgTheme === 'custom-image' || curBgTheme.startsWith('db-border-')) ? 'custom' : 'color';

            let frame_id: number | null = null;
            if (curBgTheme.startsWith('db-border-')) {
                frame_id = parseInt(curBgTheme.replace('db-border-', '')) || null;
            } else if (typeof curEffectiveFrameId === 'number') {
                frame_id = curEffectiveFrameId;
            }

            return {
                template: page1Html,
                back_document: page2Html,
                orientation: curOrientation,
                frame_type: frame_type as any,
                frame_color: curBgTheme === 'theme' ? curFrameColor : null,
                frame_id: frame_id,
                customFrame: curBgTheme === 'custom-image' ? curCustomBgUrl : null,
                customBackFrame: curEnableVerso && curBgThemePage2 === 'custom-image' ? curCustomBgUrlPage2 : null
            };
        },

        /**
         * saveCourseAssets(courseId)
         * Call this BEFORE saving the document template.
         * Uses latestAssetStateRef to avoid stale closures.
         */
        saveCourseAssets: async (cId: number) => {
            // Always read from ref to get latest values (avoids stale closure)
            const { logoUrl: currentLogoUrl, logoPos: currentLogoPos, signatures: currentSigs, signaturesPage2: currentSigsPage2, dbLogoRecord: currentDbLogoRecord } = latestAssetStateRef.current;

            // --- Logo ---
            if (currentLogoUrl) {
                try {
                    // If it is a local blob URL, send the raw S3 URL from dbLogoRecord instead of blob:http://localhost/...
                    const logoUrlToSend = currentLogoUrl.startsWith('blob:') && currentDbLogoRecord?.url
                        ? currentDbLogoRecord.url
                        : currentLogoUrl;

                    const resp = await api.put(`/courses/${cId}/logo`, {
                        url: logoUrlToSend,  // may be base64 (new) or S3 URL (existing)
                        x: currentLogoPos.x,
                        y: currentLogoPos.y,
                        width: currentLogoPos.width,
                    });
                    setDbLogoRecord(resp.data);
                    const proxiedLogo = await getProxiedImageUrl(resp.data.url);
                    setActiveLogoUrl(proxiedLogo); // replace base64/blob with proxied URL in canvas
                } catch (err) {
                    console.error('saveCourseAssets: erro ao salvar logo', err);
                }
            }

            // --- Signatures ---
            const allSigs = [...currentSigs, ...currentSigsPage2];
            const updatedSigs: SignatureItem[] = [];

            for (const sig of allSigs) {
                if (sig.dbId) {
                    // existing record — just update position
                    try {
                        await api.put(`/courses/${cId}/signatures/${sig.dbId}`, {
                            x: sig.x, y: sig.y, width: sig.width, page: sig.page || 1,
                        });
                    } catch { /* silent */ }
                    updatedSigs.push(sig);
                } else {
                    // new record — upload base64 → S3
                    try {
                        const resp = await api.post(`/courses/${cId}/signatures`, {
                            url: sig.url,
                            x: sig.x, y: sig.y, width: sig.width, page: sig.page || 1,
                        });
                        const proxiedSig = await getProxiedImageUrl(resp.data.url);
                        updatedSigs.push({
                            ...sig,
                            url: proxiedSig,
                            rawUrl: resp.data.url,
                            dbId: resp.data.id,
                            id: `db-sig-${resp.data.id}`,
                        });
                    } catch (err) {
                        console.error('saveCourseAssets: erro ao salvar assinatura', err);
                        updatedSigs.push(sig);
                    }
                }
            }

            // Push updated S3 URLs back into canvas state
            const p1 = updatedSigs.filter(s => (s.page || 1) === 1);
            const p2 = updatedSigs.filter(s => (s.page || 1) === 2);
            setSignatures(p1);
            setSignaturesPage2(p2);
        }
    }), []);

    useEffect(() => {
        const fetchDbBorders = async () => {
            try {
                const response = await api.get('/document-template-frames?all=1');
                const processed = await Promise.all(
                    response.data.map(async (item: any) => {
                        try {
                            const imgResp = await api.get(`/image?image=${item.frame}`, {
                                responseType: 'blob'
                            });
                            const url = URL.createObjectURL(imgResp.data);

                            let backUrl = '';
                            if (item.back_frame) {
                                try {
                                    const backImgResp = await api.get(`/image?image=${item.back_frame}`, {
                                        responseType: 'blob'
                                    });
                                    backUrl = URL.createObjectURL(backImgResp.data);
                                } catch (err) {
                                    console.error('Erro ao carregar verso da moldura do banco:', err);
                                }
                            }

                            return {
                                id: `db-border-${item.id}`,
                                label: item.name || `Moldura ${item.id}`,
                                frameUrl: url,
                                rawUrl: item.frame,
                                backFrameUrl: backUrl || url,
                                rawBackUrl: item.back_frame || item.frame,
                                isDbBorder: true,
                                originalBorderId: item.id
                            };
                        } catch (err) {
                            console.error('Erro ao carregar moldura:', err);
                            return null;
                        }
                    })
                );
                const validBorders = processed.filter(b => b !== null);
                setDbBorders(validBorders);
                // If coming from V4 wizard, auto-select the matching frame
                if (isFromV4 && effectiveFrameId) {
                    const targetBorderId = `db-border-${effectiveFrameId}`;
                    const match = validBorders.find((b: any) => b.id === targetBorderId);
                    if (match) {
                        setBgTheme(match.id);
                    }
                }
                // If coming from V4 wizard with back frame, auto-select the matching back frame
                if (isFromV4 && initialEnableVerso) {
                    const backId = initialBackFrameId || effectiveFrameId;
                    if (backId === 'custom' || backId === 'custom_back' || initialCustomBgUrlPage2) {
                        setBgThemePage2('custom-image');
                        if (initialCustomBgUrlPage2) {
                            setCustomBgUrlPage2(initialCustomBgUrlPage2);
                        } else if (initialCustomBgUrl) {
                            setCustomBgUrlPage2(initialCustomBgUrl);
                        }
                    } else if (backId) {
                        const targetBackBorderId = `db-border-${backId}`;
                        const matchBack = validBorders.find((b: any) => b.id === targetBackBorderId);
                        if (matchBack) {
                            setBgThemePage2(matchBack.id);
                        }
                    }
                }
                // Keep 'custom-image' (Degradê Premium) as the default first style
                // if (validBorders.length > 0) {
                //     setBgTheme(validBorders[0].id);
                // }
            } catch (error) {
                console.error('Erro ao carregar molduras do banco:', error);
            }
        };
        fetchDbBorders();
    }, []);

    // Effect to pre-fill elements with the extracted/filled metadata
    useEffect(() => {
        if (initialCourseName || initialHours || initialInstructorName) {
            setElements(prev => prev.map(el => {
                if (el.id === 'desc') {
                    let text = el.text;
                    if (initialCourseName) {
                        text = text.replace('Gestão Estratégica de Projetos', initialCourseName);
                    }
                    if (initialHours) {
                        text = text.replace('60 horas', `${initialHours} horas`);
                    }
                    return { ...el, text };
                }
                if (el.id === 'sig-name' && initialInstructorName) {
                    return { ...el, text: initialInstructorName };
                }
                return el;
            }));
        }
    }, [initialCourseName, initialHours, initialInstructorName]);

    // Undo / Redo History Stack
    const [history, setHistory] = useState<TextElement[][]>([]);
    const [redoHistory, setRedoHistory] = useState<TextElement[][]>([]);

    const saveHistory = (currentElements: TextElement[]) => {
        setHistory(prev => {
            const newHistory = [...prev, JSON.parse(JSON.stringify(currentElements))];
            if (newHistory.length > 50) {
                newHistory.shift();
            }
            return newHistory;
        });
        setRedoHistory([]);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const currentState = JSON.parse(JSON.stringify(elements));
            setRedoHistory(prev => [...prev, currentState]);

            setHistory(prev => {
                const nextHistory = [...prev];
                const lastState = nextHistory.pop();
                if (lastState) {
                    setElements(lastState);
                }
                return nextHistory;
            });
        }
    };

    const handleRedo = () => {
        if (redoHistory.length > 0) {
            const currentState = JSON.parse(JSON.stringify(elements));
            setHistory(prev => [...prev, currentState]);

            setRedoHistory(prev => {
                const nextRedo = [...prev];
                const nextState = nextRedo.pop();
                if (nextState) {
                    setElements(nextState);
                }
                return nextRedo;
            });
        }
    };

    const dragOffset = useRef({ x: 0, y: 0 });
    const resizingIdRef = useRef<string | null>(null);
    const resizeStartXRef = useRef<number>(0);
    const resizeStartYRef = useRef<number>(0);
    const resizeStartWidthRef = useRef<number>(0);
    const resizeStartHeightRef = useRef<number>(0);
    const resizeStartXPercentRef = useRef<number>(0);
    const resizingDirectionRef = useRef<'left' | 'right' | 'bottom' | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const savedSelectionRef = useRef<Range | null>(null);
    const activeSelFontSizeRef = useRef<number | null>(null); // tracks font size of active selection
    const wasAlreadySelectedRef = useRef<boolean>(false);
    const editingStartHeightRef = useRef<number>(0);
    const resizeStartElementsRef = useRef<TextElement[]>([]);

    // Track editing element initial height
    useEffect(() => {
        if (editingId) {
            const domNode = document.getElementById(`canvas-el-${editingId}`);
            if (domNode) {
                editingStartHeightRef.current = domNode.getBoundingClientRect().height;
            }
        }
    }, [editingId]);
    const clickStartCoords = useRef<{ x: number; y: number } | null>(null);
    const naturalYRef = useRef<Record<string, number>>({});
    const isAdjustingOverlapsRef = useRef(false);
    const wasDraggingOrResizingRef = useRef(false);

    const selectedElement = elements.find(el => el.id === selectedId) || null;
    const [toolbarRect, setToolbarRect] = useState<{ top: number; left: number; width: number } | null>(null);

    // Update toolbar position whenever selectedId or elements change
    useEffect(() => {
        if (!selectedId) { setToolbarRect(null); return; }
        const domEl = document.getElementById(`canvas-el-${selectedId}`);
        if (domEl) {
            const r = domEl.getBoundingClientRect();
            setToolbarRect({ top: r.top, left: r.left, width: r.width });
        }
    }, [selectedId, elements]);

    const [canvasScale, setCanvasScale] = useState(1);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const editorSidebarRef = useRef<HTMLDivElement>(null);

    // Sidebar toggler to collapse the menu when entering the editor and restore it when exiting
    useEffect(() => {
        if (embedded) return;

        let didWeCollapseIt = false;

        const timer = setTimeout(() => {
            const bodyElement = document.body;
            const htmlElement = document.documentElement;

            // Check if already collapsed
            const isAlreadyCollapsed =
                bodyElement.classList.contains('sidenav-toggled') ||
                htmlElement.getAttribute('data-toggled') === 'close';

            if (!isAlreadyCollapsed) {
                const toggleBtn = document.querySelector('.sidemenu-toggle') as HTMLElement;
                if (toggleBtn) {
                    toggleBtn.click();
                    didWeCollapseIt = true;
                }
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (didWeCollapseIt) {
                const toggleBtn = document.querySelector('.sidemenu-toggle') as HTMLElement;
                if (toggleBtn) {
                    toggleBtn.click();
                }
            }
        };
    }, [embedded]);

    // Pink irradiating glow animation state (2 seconds when text elements selected)
    const [hudGlowActive, setHudGlowActive] = useState(false);
    useEffect(() => {
        if (selectedId) {
            const isLine = elements.find(item => item.id === selectedId)?.type === 'line';
            if (!isLine) {
                setHudGlowActive(true);
                const timer = setTimeout(() => {
                    setHudGlowActive(false);
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [selectedId, elements]);

    useEffect(() => {
        const updateScale = () => {
            if (canvasWrapperRef.current) {
                // Get workspace width minus paddings and offset for floating toolbar
                const wrapperWidth = canvasWrapperRef.current.getBoundingClientRect().width;
                const horizontalPadding = selectedId ? (96 + 32) : 64;
                const availableWidth = Math.max(300, wrapperWidth - horizontalPadding);

                const targetWidth = activeOrientation === 'landscape' ? 1123 : 794;
                let newScale = availableWidth / targetWidth;

                // Cap the scale factor to at most 1.0 to ensure the certificate stays elegant,
                // proportional, and fits perfectly on all monitors without giant blow-ups (matching the second figure)
                const maxScale = 1.0;
                if (newScale > maxScale) {
                    newScale = maxScale;
                }

                // Scale strictly by width to occupy the maximum horizontal space, letting the height scroll naturally
                setCanvasScale(newScale || 1);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        const timer = setTimeout(updateScale, 100);
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(timer);
        };
    }, [activeOrientation, embedded, selectedId]);

    // Onboarding Guided Tour for the Floating Toolbar (runs ONLY the first time the toolbar is opened on this page load)
    const hasRunTourRef = useRef(false);

    useEffect(() => {
        if (!selectedId || editingId !== selectedId) {
            setTourStep(0);
            return;
        }

        if (hasRunTourRef.current) {
            return;
        }

        setTourStep(1);
        hasRunTourRef.current = true; // Mark as run forever on this mount

        const t1 = setTimeout(() => {
            setTourStep(2);
            const t2 = setTimeout(() => {
                setTourStep(0); // Reset after step 2 finishes
            }, 5000);
            return () => clearTimeout(t2);
        }, 4000);

        return () => {
            clearTimeout(t1);
        };
    }, [selectedId, editingId]);

    // Keyboard Shortcuts Listener: ESC to deselect/cleanup, Delete/Backspace to delete element, Ctrl+Z to Undo, Ctrl+Y to Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.getAttribute('contenteditable') === 'true'
            );

            if (e.key === 'Escape') {
                setSelectedId('');
                setEditingId(null);
                setSelectedLogo(false);
                setSelectedSignatureId(null);
                setElements(prev => prev.filter(el => el.type === 'line' || (el.text.trim() !== '' && el.text !== 'Novo Texto')));
                setActiveTool('text');
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping && !editingId) {
                if (selectedId) {
                    e.preventDefault();
                    saveHistory(elements);
                    setElements(prev => prev.filter(el => el.id !== selectedId));
                    setSelectedId('');
                } else if (selectedLogo) {
                    e.preventDefault();
                    setActiveLogoUrl(null);
                    setSelectedLogo(false);
                } else if (selectedSignatureId) {
                    e.preventDefault();
                    const sigToRemove = activeSignatures.find(s => s.id === selectedSignatureId);
                    setActiveSignatures(prev => prev.filter(sig => sig.id !== selectedSignatureId));
                    setSelectedSignatureId(null);
                    if (courseId && sigToRemove?.dbId) {
                        void api.delete(`/courses/${courseId}/signatures/${sigToRemove.dbId}`).catch(() => { });
                    }
                }
            } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !isTyping) {
                e.preventDefault();
                handleUndo();
            } else if ((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey) && !isTyping) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [elements, selectedId, editingId, history, redoHistory, selectedLogo, selectedSignatureId, signatures, signaturesPage2, currentPage]);

    // Focus input on inline edit activation
    useEffect(() => {
        if (editingId && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select();
        }
    }, [editingId]);

    // Automatically auto-resize the inline editing textarea and focus
    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.style.height = 'auto';
            textInputRef.current.style.height = `${textInputRef.current.scrollHeight}px`;
        }
    }, [elements, editingId]);

    // Track natural coordinates when the user manually positions/adds/resizes elements
    useEffect(() => {
        if (!isAdjustingOverlapsRef.current) {
            elements.forEach(el => {
                naturalYRef.current[el.id] = el.y;
            });
        }
    }, [elements]);

    // Show resize hint arrow animation for 3s when an element is selected (Animation: always, Text: only once per page load!)
    const hasRunResizeHintRef = useRef(false);
    useEffect(() => {
        if (!selectedId) return;

        // Arrows pulse animation triggers every time
        setShowResizeHintId(selectedId);

        // Tooltip text displays only on the very first interaction
        if (!hasRunResizeHintRef.current) {
            setShowResizeHintText(true);
            hasRunResizeHintRef.current = true;
        }

        const timer = setTimeout(() => {
            setShowResizeHintId(null);
            setShowResizeHintText(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [selectedId]);

    // Automatic overlap prevention: disabled to allow free dragging and overlapping (e.g. dragging elements above/over other elements)
    /*
    useEffect(() => {
        if (draggingId || resizingIdRef.current) return;
        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        if (canvasRect.height === 0) return;

        // Convert percentage coordinates to pixels and build bounding boxes
        const elementsWithRects = elements.map(el => {
            const domEl = document.getElementById(`canvas-el-${el.id}`);
            // Use actual DOM dimensions for accurate collision — el.width may be larger than
            // the rendered max-content width after the text box was auto-fitted on save.
            let widthPx = el.width; // fallback to stored width
            let heightPx = el.fontSize * 1.3 + 12; // fallback estimate
            if (domEl) {
                const domRect = domEl.getBoundingClientRect();
                widthPx = domRect.width;
                heightPx = domRect.height;
            }
            const naturalY = naturalYRef.current[el.id] !== undefined ? naturalYRef.current[el.id] : el.y;
            const centerYPx = (naturalY / 100) * canvasRect.height;
            const topYPx = centerYPx - heightPx / 2;
            const bottomYPx = centerYPx + heightPx / 2;

            const centerXPx = (el.x / 100) * canvasRect.width;
            const leftXPx = centerXPx - widthPx / 2;
            const rightXPx = centerXPx + widthPx / 2;

            return {
                id: el.id,
                y: naturalY,
                heightPx,
                topYPx,
                bottomYPx,
                leftXPx,
                rightXPx,
                width: widthPx
            };
        });

        // Sort from top to bottom
        const sorted = [...elementsWithRects].sort((a, b) => a.y - b.y);

        let didAdjust = false;
        const newElements = elements.map(el => ({ ...el }));

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            for (let j = i + 1; j < sorted.length; j++) {
                const other = sorted[j];

                // Check if they overlap horizontally
                const horizontalOverlap = !(current.rightXPx < other.leftXPx || current.leftXPx > other.rightXPx);

                if (horizontalOverlap) {
                    const minGapPx = 4; // minimum visual spacing gap in pixels
                    if (current.bottomYPx + minGapPx > other.topYPx) {
                        const newOtherTopYPx = current.bottomYPx + minGapPx;
                        const newOtherCenterYPx = newOtherTopYPx + other.heightPx / 2;
                        const newOtherYPercent = (newOtherCenterYPx / canvasRect.height) * 100;

                        const diffPercent = newOtherYPercent - other.y;
                        if (diffPercent > 0.01) {
                            other.y = newOtherYPercent;
                            other.topYPx = newOtherTopYPx;
                            other.bottomYPx = newOtherTopYPx + other.heightPx;

                            const targetIdx = newElements.findIndex(el => el.id === other.id);
                            if (targetIdx !== -1) {
                                newElements[targetIdx].y = Math.min(98, newOtherYPercent);
                                didAdjust = true;
                            }
                        }
                    }
                }
            }
        }

        if (didAdjust) {
            isAdjustingOverlapsRef.current = true;
            setElements(newElements);
            setTimeout(() => {
                isAdjustingOverlapsRef.current = false;
            }, 0);
        } else {
            let didRestore = false;
            const restoredElements = elements.map(el => {
                const naturalY = naturalYRef.current[el.id];
                if (naturalY !== undefined && Math.abs(el.y - naturalY) > 0.01) {
                    didRestore = true;
                    return { ...el, y: naturalY };
                }
                return el;
            });
            if (didRestore) {
                isAdjustingOverlapsRef.current = true;
                setElements(restoredElements);
                setTimeout(() => {
                    isAdjustingOverlapsRef.current = false;
                }, 0);
            }
        }
    }, [elements, draggingId]);
    */

    // Insert mask/variable at cursor in textarea or create new element if none selected
    const insertMaskAtCursor = (maskKey: string) => {
        const maskPlaceholder = `{{${maskKey}}}`;
        saveHistory(elements);

        if (editingId && contentEditableRef.current) {
            const editor = contentEditableRef.current;
            editor.focus();
            const sel = window.getSelection();

            // Try to restore saved selection if available
            let range: Range | null = null;
            if (savedSelectionRef.current && editor.contains(savedSelectionRef.current.commonAncestorContainer)) {
                range = savedSelectionRef.current;
            } else if (sel && sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                range = sel.getRangeAt(0);
            }

            if (range) {
                range.deleteContents();
                const textNode = document.createTextNode(maskPlaceholder);
                range.insertNode(textNode);

                // Move cursor right after the inserted mask
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.setEndAfter(textNode);
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
                savedSelectionRef.current = newRange.cloneRange();
            } else {
                // Fallback: append at the end of the text
                const textNode = document.createTextNode(maskPlaceholder);
                editor.appendChild(textNode);

                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.setEndAfter(textNode);
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
                savedSelectionRef.current = newRange.cloneRange();
            }

            const finalHtml = editor.innerHTML;
            const finalText = editor.innerText;
            setElements(prev => prev.map(el => {
                if (el.id === editingId) {
                    return { ...el, html: finalHtml, text: finalText };
                }
                return el;
            }));
        } else if (selectedId) {
            setElements(prev => prev.map(el => {
                if (el.id === selectedId) {
                    return { ...el, text: maskPlaceholder, html: maskPlaceholder };
                }
                return el;
            }));
        } else {
            // Create a new text element centered on the canvas with the mask
            const newId = `text_${Date.now()}`;
            const newElement: TextElement = {
                id: newId,
                text: maskPlaceholder,
                html: maskPlaceholder,
                x: 50,
                y: 50,
                fontSize: 16,
                color: '#1a56db',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textDecoration: 'none',
                fontFamily: 'Inter',
                textAlign: 'center',
                width: 250,
                page: currentPage
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(newId);
        }
    };

    // Handle Drag Start
    const handleMouseDown = (e: React.MouseEvent, id: string, forceAllowDrag = false) => {
        const isTextarea = (e.target as HTMLElement).tagName === 'TEXTAREA';
        if (editingId === id && isTextarea && !forceAllowDrag) return;

        if (dragEndTimerRef.current) {
            clearTimeout(dragEndTimerRef.current);
        }
        setDragEndHintId(null);

        // Clean up other untouched 'Novo Texto' blocks first when selecting a different element!
        setElements(prev => prev.filter(item => item.id === id || (item.text.trim() !== '' && item.text !== 'Novo Texto')));

        saveHistory(elements);
        setSelectedId(id);
        setSelectedLogo(false);
        setSelectedSignatureId(null);

        const el = elements.find(item => item.id === id);
        if (el && el.type === 'line') {
            setEditingId(null);
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }

        setDraggingId(id);
        if (el && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const posX = rect.left + (el.x / 100) * rect.width;
            const posY = rect.top + (el.y / 100) * rect.height;
            dragOffset.current = {
                x: e.clientX - posX,
                y: e.clientY - posY
            };
        }
        e.stopPropagation();
    };

    // Handle Dragging and Resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingId || resizingIdRef.current || draggingLogoRef.current || resizingLogoRef.current || draggingSignatureIdRef.current || resizingSignatureIdRef.current) {
                wasDraggingOrResizingRef.current = true;
            }

            if (draggingId && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newLeftPx = e.clientX - rect.left - dragOffset.current.x;
                const newTopPx = e.clientY - rect.top - dragOffset.current.y;

                // Snap coordinates in precise steps of 1px
                const snappedLeftPx = Math.round(newLeftPx);
                const snappedTopPx = Math.round(newTopPx);

                // Convert snapped pixels back to responsive percentage floats
                let newX = (snappedLeftPx / rect.width) * 100;
                let newY = (snappedTopPx / rect.height) * 100;

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                setElements(prev => prev.map(el => {
                    if (el.id === draggingId) {
                        return { ...el, x: newX, y: newY };
                    }
                    return el;
                }));

                if (selectedId) {
                    updateTooltipPlacement(selectedId);
                }
            } else if (draggingLogoRef.current && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newLeftPx = e.clientX - rect.left - logoDragOffset.current.x;
                const newTopPx = e.clientY - rect.top - logoDragOffset.current.y;

                // Snap coordinates in precise steps of 1px
                const snappedLeftPx = Math.round(newLeftPx);
                const snappedTopPx = Math.round(newTopPx);

                // Convert snapped pixels back to responsive percentage floats
                let newX = (snappedLeftPx / rect.width) * 100;
                let newY = (snappedTopPx / rect.height) * 100;

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                setActiveLogoPos((prev: any) => ({ ...prev, x: newX, y: newY }));
            } else if (resizingLogoRef.current) {
                const deltaX = e.clientX - resizeLogoStartXRef.current;
                const newWidth = Math.max(30, Math.min(600, resizeLogoStartWidthRef.current + (deltaX / canvasScale) * 2));
                setActiveLogoPos((prev: any) => ({ ...prev, width: newWidth }));
            } else if (draggingSignatureIdRef.current && canvasRef.current) {
                const sigId = draggingSignatureIdRef.current;
                const rect = canvasRef.current.getBoundingClientRect();
                const newLeftPx = e.clientX - rect.left - signatureDragOffset.current.x;
                const newTopPx = e.clientY - rect.top - signatureDragOffset.current.y;

                // Snap coordinates in precise steps of 1px
                const snappedLeftPx = Math.round(newLeftPx);
                const snappedTopPx = Math.round(newTopPx);

                // Convert snapped pixels back to responsive percentage floats
                let newX = (snappedLeftPx / rect.width) * 100;
                let newY = (snappedTopPx / rect.height) * 100;

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                setActiveSignatures((prev) => prev.map(sig => sig.id === sigId ? { ...sig, x: newX, y: newY } : sig));
            } else if (resizingSignatureIdRef.current) {
                const sigId = resizingSignatureIdRef.current;
                const deltaX = e.clientX - resizeSignatureStartXRef.current;
                const newWidth = Math.max(30, Math.min(800, resizeSignatureStartWidthRef.current + (deltaX / canvasScale) * 2));
                setActiveSignatures((prev) => prev.map(sig => sig.id === sigId ? { ...sig, width: newWidth } : sig));
            } else if (resizingIdRef.current && canvasRef.current) {
                const canvasEl = canvasRef.current;
                const canvasRect = canvasEl.getBoundingClientRect();
                const canvasHeight = canvasRect.height;
                const canvasWidth = canvasRect.width;

                const startElements = resizeStartElementsRef.current;
                const startEl = startElements.find(item => item.id === resizingIdRef.current);
                if (!startEl) return;

                let newWidth = startEl.width;
                let newHeight = startEl.height || resizeStartHeightRef.current;
                let newY = startEl.y;

                if (resizingDirectionRef.current === 'bottom') {
                    const deltaY = e.clientY - resizeStartYRef.current;
                    newHeight = Math.max(20, Math.min(1000, resizeStartHeightRef.current + deltaY / canvasScale));
                } else if (resizingDirectionRef.current === 'top') {
                    const deltaY = e.clientY - resizeStartYRef.current;
                    newHeight = Math.max(20, Math.min(1000, resizeStartHeightRef.current - deltaY / canvasScale));
                    const actualDeltaHeight = newHeight - resizeStartHeightRef.current;
                    const deltaYPercent = (-actualDeltaHeight * canvasScale / canvasRect.height) * 100;
                    newY = Math.max(0, Math.min(100, startEl.y + deltaYPercent));
                } else {
                    const deltaX = e.clientX - resizeStartXRef.current;
                    const scaleFactor = activeOrientation === 'portrait' ? (canvasWidth / 1123) : (canvasWidth / 1123);
                    const isLeftHandle = resizingDirectionRef.current === 'left';
                    const changeRefPx = deltaX / scaleFactor;

                    newWidth = Math.max(40, Math.min(2000,
                        isLeftHandle
                            ? resizeStartWidthRef.current - 2 * changeRefPx
                            : resizeStartWidthRef.current + 2 * changeRefPx
                    ));
                }

                let deltaH = 0;
                if (resizingDirectionRef.current === 'bottom') {
                    deltaH = newHeight - resizeStartHeightRef.current;
                } else if (resizingDirectionRef.current === 'top') {
                    deltaH = 0;
                } else {
                    const elDom = document.getElementById(`canvas-el-${resizingIdRef.current}`);
                    if (elDom) {
                        const currentHeight = elDom.getBoundingClientRect().height / canvasScale;
                        deltaH = currentHeight - resizeStartHeightRef.current;
                    }
                }

                const deltaYPercent = deltaH > 1.5 ? (deltaH / canvasHeight) * 100 : 0;

                const aWidthPercent = (newWidth / canvasWidth) * 100;
                const aLeft = startEl.x - aWidthPercent / 2;
                const aRight = startEl.x + aWidthPercent / 2;

                setElements(prev => prev.map(el => {
                    if (el.id === resizingIdRef.current) {
                        return {
                            ...el,
                            width: newWidth,
                            height: (resizingDirectionRef.current === 'bottom' || resizingDirectionRef.current === 'top') ? newHeight : el.height,
                            y: resizingDirectionRef.current === 'top' ? newY : el.y
                        };
                    }

                    const startEl2 = startElements.find(item => item.id === el.id);
                    if (startEl2 && deltaYPercent > 0 && (el.page || 1) === (startEl.page || 1) && startEl2.y > startEl.y) {
                        const el2WidthPercent = (startEl2.width / canvasWidth) * 100;
                        const el2Left = startEl2.x - el2WidthPercent / 2;
                        const el2Right = startEl2.x + el2WidthPercent / 2;

                        const hasHorizontalOverlap = Math.max(aLeft, el2Left) < Math.min(aRight, el2Right);
                        if (hasHorizontalOverlap) {
                            return { ...el, y: Math.min(100, startEl2.y + deltaYPercent) };
                        }
                    } else if (startEl2) {
                        return { ...el, y: startEl2.y };
                    }

                    return el;
                }));

                if (selectedId) {
                    updateTooltipPlacement(selectedId);
                }
            }
        };

        const handleMouseUp = () => {
            if (draggingId) {
                const finishedId = draggingId;
                setDragEndHintId(finishedId);
                if (dragEndTimerRef.current) {
                    clearTimeout(dragEndTimerRef.current);
                }
                dragEndTimerRef.current = setTimeout(() => {
                    setDragEndHintId(null);
                }, 3500);
            }

            setDraggingId(null);
            resizingIdRef.current = null;
            resizingDirectionRef.current = null;
            draggingLogoRef.current = false;
            resizingLogoRef.current = false;
            draggingSignatureIdRef.current = null;
            resizingSignatureIdRef.current = null;

            // Clear the flag after a brief delay so the canvas click handler has time to run first
            setTimeout(() => {
                wasDraggingOrResizingRef.current = false;
            }, 80);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        // draggingId controls when to run; refs are always fresh (no stale closure issue)
    }, [draggingId]);

    // Click canvas background to spawn new text element, deselect and clean up untouched texts
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (wasDraggingOrResizingRef.current) {
            return;
        }
        const target = e.target as HTMLElement;

        // Trigger deselect & cleanup when clicking empty canvas
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-right-side')) {
            setSelectedLogo(false);
            setSelectedSignatureId(null);
            // Clean up other untouched 'Novo Texto' blocks first
            setElements(prev => prev.filter(el => el.type === 'line' || (el.text.trim() !== '' && el.text !== 'Novo Texto')));

            const hasActiveSelection = !!selectedId;

            if (canvasRef.current && !hasActiveSelection) {
                const rect = canvasRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                const percentageX = Math.round((clickX / rect.width) * 100);
                const percentageY = Math.round((clickY / rect.height) * 100);

                if (activeTool === 'line') {
                    const newId = 'line_' + Date.now();
                    const newEl: TextElement = {
                        id: newId,
                        text: '—',
                        type: 'line',
                        x: percentageX,
                        y: percentageY,
                        fontSize: 4, // 4px thickness
                        color: '#1e293b',
                        fontWeight: '500',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        fontFamily: 'Montserrat',
                        textAlign: 'center',
                        width: 150,
                        page: currentPage
                    };

                    saveHistory(elements);
                    setElements(prev => [...prev, newEl]);
                    setSelectedId(newId);
                    setEditingId(null);
                } else {
                    const newId = 'text_' + Date.now();
                    const newEl: TextElement = {
                        id: newId,
                        text: 'Novo Texto',
                        x: percentageX,
                        y: percentageY,
                        fontSize: 22,
                        color: '#1e293b',
                        fontWeight: '500',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        fontFamily: 'Montserrat',
                        textAlign: 'center',
                        width: 250,
                        page: currentPage
                    };

                    saveHistory(elements);
                    setElements(prev => [...prev, newEl]);
                    setSelectedId(newId);
                    setEditingId(newId);
                }
            } else {
                setSelectedId('');
                setEditingId(null);
                // Return to text tool when clicking away after organizing the line/element!
                setActiveTool('text');
            }
        }
    };

    // Handle Input Blur for Textarea inline typing
    const handleInputBlur = (id: string, currentText: string) => {
        setEditingId(null);
        const targetEl = elements.find(el => el.id === id);
        if (targetEl && targetEl.type === 'line') return;
        // If the text is empty or remains untouched as "Novo Texto", immediately filter it out of the array
        if (currentText.trim() === '' || currentText === 'Novo Texto') {
            setElements(prev => prev.filter(el => el.id !== id));
            if (selectedId === id) {
                setSelectedId('');
            }
        }
    };

    // Check if the current line/selection has the specified alignment active
    const isAlignActive = (alignVal: 'left' | 'center' | 'right' | 'justify') => {
        const el = elements.find(item => item.id === selectedId);
        if (!el) return false;
        if (editingId === el.id && contentEditableRef.current) {
            let cmd = 'justifyLeft';
            if (alignVal === 'center') cmd = 'justifyCenter';
            if (alignVal === 'right') cmd = 'justifyRight';
            if (alignVal === 'justify') cmd = 'justifyFull';

            try {
                return document.queryCommandState(cmd);
            } catch (e) {
                return el.textAlign === alignVal;
            }
        }
        return el.textAlign === alignVal;
    };

    // Helper to get selection character offsets relative to a container
    const getSelectionCharacterOffsets = (element: HTMLElement) => {
        let start = 0, end = 0;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (element.contains(range.startContainer)) {
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                start = preCaretRange.toString().length;
                end = start + range.toString().length;
            }
        }
        return { start, end };
    };

    // Helper to restore selection using character offsets relative to a container
    const setSelectionCharacterOffsets = (element: HTMLElement, start: number, end: number) => {
        if (start < 0 || end < 0) return;
        const sel = window.getSelection();
        if (!sel) return;

        let charIndex = 0;
        const range = document.createRange();

        let nodeStack: Node[] = [element];
        let node: Node | undefined;
        let foundStart = false;

        while ((node = nodeStack.pop())) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nextCharIndex = charIndex + (node.textContent?.length || 0);
                if (!foundStart && start >= charIndex && start <= nextCharIndex) {
                    range.setStart(node, start - charIndex);
                    foundStart = true;
                }
                if (foundStart && end >= charIndex && end <= nextCharIndex) {
                    range.setEnd(node, end - charIndex);
                    break;
                }
                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        sel.removeAllRanges();
        sel.addRange(range);

        // Save the selection range locally too
        if (sel.rangeCount > 0) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    // Rich text: apply style to selection or whole element
    const applyStyle = (key: keyof TextElement, value: any) => {
        // Measure character offsets of selection before doing anything
        const hasContainer = contentEditableRef.current;
        const offsets = hasContainer ? getSelectionCharacterOffsets(hasContainer) : { start: 0, end: 0 };

        // Restore saved selection if available (toolbar click stole focus)
        const savedRange = savedSelectionRef.current;
        if (savedRange && contentEditableRef.current) {
            contentEditableRef.current.focus();
            const sel2 = window.getSelection();
            if (sel2) {
                sel2.removeAllRanges();
                sel2.addRange(savedRange);
            }
        }

        const sel = window.getSelection();

        if (key === 'textAlign') {
            const isEditing = editingId === selectedId && contentEditableRef.current;
            if (isEditing) {
                let cmd = 'justifyLeft';
                if (value === 'center') cmd = 'justifyCenter';
                if (value === 'right') cmd = 'justifyRight';
                if (value === 'justify') cmd = 'justifyFull';

                document.execCommand(cmd, false);

                // Save DOM immediately to prevent losing rich text changes
                if (contentEditableRef.current) {
                    const finalHtml = contentEditableRef.current.innerHTML;
                    const finalText = contentEditableRef.current.innerText;
                    setElements(prev => prev.map(el => {
                        if (el.id === selectedId) {
                            return { ...el, html: finalHtml, text: finalText, textAlign: value };
                        }
                        return el;
                    }));
                }

                // Restore selection perfectly using character offsets
                setTimeout(() => {
                    if (contentEditableRef.current) {
                        contentEditableRef.current.focus();
                        setSelectionCharacterOffsets(contentEditableRef.current, offsets.start, offsets.end);
                    }
                }, 50);
            } else if (selectedId) {
                // If not in active edit mode, auto-enter edit mode and select all text to apply alignment at the line level!
                setEditingId(selectedId);
                setTimeout(() => {
                    if (contentEditableRef.current) {
                        contentEditableRef.current.focus();
                        document.execCommand('selectAll');

                        let cmd = 'justifyLeft';
                        if (value === 'center') cmd = 'justifyCenter';
                        if (value === 'right') cmd = 'justifyRight';
                        if (value === 'justify') cmd = 'justifyFull';

                        document.execCommand(cmd, false);

                        const finalHtml = contentEditableRef.current.innerHTML;
                        const finalText = contentEditableRef.current.innerText;
                        setElements(prev => prev.map(el => {
                            if (el.id === selectedId) {
                                return { ...el, html: finalHtml, text: finalText, textAlign: value };
                            }
                            return el;
                        }));
                    }
                }, 50);
            }
            return;
        }
        const hasSelection = sel && !sel.isCollapsed && contentEditableRef.current?.contains(sel.anchorNode);

        if (hasSelection && contentEditableRef.current) {
            if (key === 'fontWeight') {
                document.execCommand('fontName', false, 'TempFontWeightMarker');
                if (contentEditableRef.current) {
                    const fontElements = contentEditableRef.current.querySelectorAll('font[face="TempFontWeightMarker"]');
                    fontElements.forEach(fontEl => {
                        const span = document.createElement('span');
                        span.style.fontWeight = value;

                        // Strip nested weight styles inside selection to avoid duplicate overrides
                        const innerSpans = fontEl.querySelectorAll('span');
                        innerSpans.forEach(innerSpan => {
                            if (innerSpan.style.fontWeight) {
                                innerSpan.style.fontWeight = '';
                                if (!innerSpan.style.cssText || innerSpan.style.cssText.trim() === '') {
                                    innerSpan.replaceWith(...Array.from(innerSpan.childNodes));
                                }
                            }
                        });
                        const boldTags = fontEl.querySelectorAll('b, strong');
                        boldTags.forEach(item => {
                            item.replaceWith(...Array.from(item.childNodes));
                        });

                        while (fontEl.firstChild) {
                            span.appendChild(fontEl.firstChild);
                        }
                        fontEl.replaceWith(span);
                    });
                }
                if (savedRange) {
                    const s = window.getSelection();
                    if (s) { s.removeAllRanges(); s.addRange(savedRange.cloneRange()); }
                }
            } else if (key === 'fontStyle') {
                document.execCommand('italic');
                if (savedRange) {
                    const s = window.getSelection();
                    if (s) { s.removeAllRanges(); s.addRange(savedRange.cloneRange()); }
                }
            } else if (key === 'textDecoration') {
                document.execCommand('underline');
                if (savedRange) {
                    const s = window.getSelection();
                    if (s) { s.removeAllRanges(); s.addRange(savedRange.cloneRange()); }
                }
            } else if (key === 'fontSize') {
                // Use a temporary font size command to mark the selection cleanly
                document.execCommand('fontSize', false, '7');

                // Now find all <font size="7"> elements and convert them to clean spans,
                // while stripping any nested font-size styles to avoid duplication.
                if (contentEditableRef.current) {
                    const fontElements = contentEditableRef.current.querySelectorAll('font[size="7"]');
                    fontElements.forEach(fontEl => {
                        const span = document.createElement('span');
                        span.style.fontSize = `${value}px`;

                        // Clean up nested spans/fonts inside this selection
                        const innerSpans = fontEl.querySelectorAll('span');
                        innerSpans.forEach(innerSpan => {
                            if (innerSpan.style.fontSize) {
                                innerSpan.style.fontSize = '';
                                if (!innerSpan.style.cssText || innerSpan.style.cssText.trim() === '') {
                                    innerSpan.replaceWith(...Array.from(innerSpan.childNodes));
                                }
                            }
                        });

                        while (fontEl.firstChild) {
                            span.appendChild(fontEl.firstChild);
                        }
                        fontEl.replaceWith(span);
                    });
                }
                activeSelFontSizeRef.current = value as number; // update ref for next +/- click
            } else if (key === 'color') {
                document.execCommand('foreColor', false, value as string);
                // Restore selection after color dialog closes
                if (savedRange) {
                    const s = window.getSelection();
                    if (s) { s.removeAllRanges(); s.addRange(savedRange.cloneRange()); }
                    savedSelectionRef.current = savedRange.cloneRange();
                }
            } else if (key === 'fontFamily') {
                document.execCommand('fontName', false, 'TempFontMarker');
                if (contentEditableRef.current) {
                    const fontElements = contentEditableRef.current.querySelectorAll('font[face="TempFontMarker"]');
                    fontElements.forEach(fontEl => {
                        const span = document.createElement('span');
                        span.style.fontFamily = `'${value}', sans-serif`;

                        const innerSpans = fontEl.querySelectorAll('span');
                        innerSpans.forEach(innerSpan => {
                            if (innerSpan.style.fontFamily) {
                                innerSpan.style.fontFamily = '';
                                if (!innerSpan.style.cssText || innerSpan.style.cssText.trim() === '') {
                                    innerSpan.replaceWith(...Array.from(innerSpan.childNodes));
                                }
                            }
                        });

                        while (fontEl.firstChild) {
                            span.appendChild(fontEl.firstChild);
                        }
                        fontEl.replaceWith(span);
                    });
                }
            }
            // Sync DOM immediately to state and restore selection perfectly using character offsets
            if (contentEditableRef.current) {
                // Clean up any empty or style-less spans to heal pre-existing nesting
                const spans = contentEditableRef.current.querySelectorAll('span');
                spans.forEach(span => {
                    if (!span.style.cssText || span.style.cssText.trim() === '') {
                        span.replaceWith(...Array.from(span.childNodes));
                    }
                });

                const finalHtml = contentEditableRef.current.innerHTML;
                const finalText = contentEditableRef.current.innerText;
                setElements(prev => prev.map(el => {
                    if (el.id === selectedId) {
                        return { ...el, html: finalHtml, text: finalText };
                    }
                    return el;
                }));

                setTimeout(() => {
                    if (contentEditableRef.current) {
                        contentEditableRef.current.focus();
                        setSelectionCharacterOffsets(contentEditableRef.current, offsets.start, offsets.end);
                    }
                }, 50);
            }
        } else {
            // No selection → apply to whole element and clear saved range
            activeSelFontSizeRef.current = null;
            savedSelectionRef.current = null;
            if (key === 'fontSize' && selectedId) {
                // Clean up live DOM elements if currently editing
                if (contentEditableRef.current && editingId === selectedId) {
                    const styledElements = contentEditableRef.current.querySelectorAll('[style]');
                    styledElements.forEach(item => {
                        if (item instanceof HTMLElement && item.style.fontSize) {
                            item.style.fontSize = '';
                            if (item.getAttribute('style') === '') {
                                item.removeAttribute('style');
                            }
                        }
                    });
                }

                // Clean up any inner font-size overrides from saved html
                saveHistory(elements);
                setElements(prev => prev.map(el => {
                    if (el.id === selectedId) {
                        let updatedHtml = el.html;
                        if (updatedHtml) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = updatedHtml;
                            const styledElements = tempDiv.querySelectorAll('[style]');
                            styledElements.forEach(item => {
                                if (item instanceof HTMLElement && item.style.fontSize) {
                                    item.style.fontSize = '';
                                    if (item.getAttribute('style') === '') {
                                        item.removeAttribute('style');
                                    }
                                }
                            });
                            updatedHtml = tempDiv.innerHTML;
                        }
                        return { ...el, fontSize: value, html: updatedHtml };
                    }
                    return el;
                }));
            } else if (key === 'fontWeight' && selectedId) {
                // Clean up live DOM elements if currently editing
                if (contentEditableRef.current && editingId === selectedId) {
                    const styledElements = contentEditableRef.current.querySelectorAll('[style]');
                    styledElements.forEach(item => {
                        if (item instanceof HTMLElement && item.style.fontWeight) {
                            item.style.fontWeight = '';
                            if (item.getAttribute('style') === '') {
                                item.removeAttribute('style');
                            }
                        }
                    });
                    const boldTags = contentEditableRef.current.querySelectorAll('b, strong');
                    boldTags.forEach(item => {
                        item.replaceWith(...Array.from(item.childNodes));
                    });
                }

                // Clean up any inner font-weight overrides from saved html
                saveHistory(elements);
                setElements(prev => prev.map(el => {
                    if (el.id === selectedId) {
                        let updatedHtml = el.html;
                        if (updatedHtml) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = updatedHtml;
                            const styledElements = tempDiv.querySelectorAll('[style]');
                            styledElements.forEach(item => {
                                if (item instanceof HTMLElement && item.style.fontWeight) {
                                    item.style.fontWeight = '';
                                    if (item.getAttribute('style') === '') {
                                        item.removeAttribute('style');
                                    }
                                }
                            });
                            const boldTags = tempDiv.querySelectorAll('b, strong');
                            boldTags.forEach(item => {
                                item.replaceWith(...Array.from(item.childNodes));
                            });
                            updatedHtml = tempDiv.innerHTML;
                        }
                        return { ...el, fontWeight: value, html: updatedHtml };
                    }
                    return el;
                }));
            } else {
                updateSelected(key, value);
            }
        }
    };

    // Element Styling Updates
    const updateSelected = (key: keyof TextElement, value: any) => {
        if (!selectedId) return;
        if (key !== 'text') {
            saveHistory(elements);
        }
        setElements(prev => prev.map(el => {
            if (el.id === selectedId) {
                return { ...el, [key]: value };
            }
            return el;
        }));
    };

    const handleSaveModel = () => {
        Swal.fire({
            title: 'Design Master Salvo!',
            text: 'O modelo editável de certificado foi guardado (Simulação).',
            icon: 'success',
            confirmButtonColor: '#1a56db'
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    saveHistory(elements);
                    if (currentPage === 1) {
                        setCustomBgUrl(event.target.result as string);
                        setBgTheme('custom-image');
                    } else {
                        setCustomBgUrlPage2(event.target.result as string);
                        setBgThemePage2('custom-image');
                    }
                    // Filter out elements only from the active page!
                    setElements(prev => prev.filter(el => (el.page || 1) !== currentPage));
                    setSelectedId('');
                    setEditingId(null);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64 = event.target.result as string;
                    setActiveLogoUrl(base64); // stored locally; API called at save time
                    setShowLogoIndicator(true);
                    setTimeout(() => setShowLogoIndicator(false), 5000);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64 = event.target.result as string;
                    const newId = `sig-${Date.now()}`;
                    const newSig: SignatureItem = {
                        id: newId,
                        url: base64, // stored locally; API called at save time
                        x: 50,
                        y: 75 + activeSignatures.length * 3,
                        width: 140,
                        page: currentPage,
                    };
                    setActiveSignatures(prev => [...prev, newSig]);
                    setLastAddedSigId(newId);
                    setShowSigIndicator(true);
                    setTimeout(() => setShowSigIndicator(false), 5000);

                    // Scroll canvas to the new signature
                    setTimeout(() => {
                        const sigEl = document.querySelector(`.canvas-signature-element[data-sig-id="${newId}"]`);
                        if (sigEl) {
                            sigEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            // Fallback: scroll canvas wrapper down to ~75% position
                            const canvas = canvasRef.current;
                            if (canvas) {
                                const top = canvas.getBoundingClientRect().top + window.scrollY + canvas.offsetHeight * 0.7;
                                window.scrollTo({ top, behavior: 'smooth' });
                            }
                        }
                    }, 100);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };


    // Color presets for frame styles
    const COLOR_PRESETS = [
        { id: 'blue', label: 'Azul', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', single: '#2563eb' },
        { id: 'gold', label: 'Dourado', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', single: '#d97706' },
        { id: 'red', label: 'Vinho', value: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', single: '#dc2626' },
        { id: 'green', label: 'Esmeralda', value: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', single: '#059669' },
        { id: 'purple', label: 'Púrpura', value: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', single: '#7c3aed' },
        { id: 'navy', label: 'Marinho', value: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', single: '#1d4ed8' },
        { id: 'dark', label: 'Carvão', value: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)', single: '#374151' },
        { id: 'orange', label: 'Sunset', value: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', single: '#ea580c' }
    ];

    const getFrameColorValue = (colorId = activeFrameColor) => {
        const found = COLOR_PRESETS.find(c => c.id === colorId);
        return found ? found.value : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    };

    const getFrameColorSingle = (colorId = activeFrameColor) => {
        const found = COLOR_PRESETS.find(c => c.id === colorId);
        return found ? found.single : '#2563eb';
    };

    // Helper to draw active border frame styles
    const renderFrameStyleJSX = (theme = activeBgTheme, color = activeFrameColor) => {
        if (theme === 'custom-image' || theme === 'clean') return null;

        // Check if database border
        const activeDbBorder = dbBorders.find(b => b.id === theme);
        if (activeDbBorder) {
            const frameUrlToUse = currentPage === 2 ? (activeDbBorder.backFrameUrl || activeDbBorder.frameUrl) : activeDbBorder.frameUrl;
            return (
                <img
                    src={frameUrlToUse}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 0,
                        objectFit: 'fill'
                    }}
                    alt="Moldura do Banco"
                />
            );
        }

        const colorSingle = getFrameColorSingle(color);
        const colorValue = getFrameColorValue(color);

        switch (theme) {
            case 'stripe':
                return (
                    <div style={{
                        width: activeOrientation === 'landscape' ? '28%' : '100%',
                        height: activeOrientation === 'landscape' ? '100%' : '24%',
                        background: colorValue,
                        position: 'relative',
                        overflow: 'hidden',
                        pointerEvents: 'none'
                    }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', opacity: 0.15 }}>
                            <circle cx="20" cy="20" r="30" fill="white" />
                            <circle cx="80" cy="80" r="40" fill="white" />
                            <path d="M 0 50 L 100 0 L 100 100 Z" fill="white" />
                        </svg>
                    </div>
                );
            case 'single-thin':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '20px',
                        bottom: '20px',
                        border: `2px solid ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}></div>
                );
            case 'single-thick':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '20px',
                        bottom: '20px',
                        border: `8px solid ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}></div>
                );
            case 'double-classic':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '20px',
                        bottom: '20px',
                        border: `5px solid ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            right: '4px',
                            bottom: '4px',
                            border: `1.5px solid ${colorSingle}`,
                        }}></div>
                    </div>
                );
            case 'double-equal':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '20px',
                        bottom: '20px',
                        border: `1.5px solid ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            right: '5px',
                            bottom: '5px',
                            border: `1.5px solid ${colorSingle}`,
                        }}></div>
                    </div>
                );
            case 'corners-bracket':
                return (
                    <>
                        <div style={{ position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderLeft: `4px solid ${colorSingle}`, borderTop: `4px solid ${colorSingle}`, zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderRight: `4px solid ${colorSingle}`, borderTop: `4px solid ${colorSingle}`, zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '30px', height: '30px', borderLeft: `4px solid ${colorSingle}`, borderBottom: `4px solid ${colorSingle}`, zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '30px', height: '30px', borderRight: `4px solid ${colorSingle}`, borderBottom: `4px solid ${colorSingle}`, zIndex: 5, pointerEvents: 'none' }} />
                    </>
                );
            case 'corners-floral':
                return (
                    <>
                        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: `1px solid ${colorSingle}`, opacity: 0.7, pointerEvents: 'none', zIndex: 5 }} />
                        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '16px', height: '16px', background: colorSingle, borderRadius: '3px', zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '16px', height: '16px', background: colorSingle, borderRadius: '3px', zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '16px', height: '16px', background: colorSingle, borderRadius: '3px', zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '16px', height: '16px', background: colorSingle, borderRadius: '3px', zIndex: 5, pointerEvents: 'none' }} />
                    </>
                );
            case 'minimalist-card':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '25px',
                        left: '25px',
                        right: '25px',
                        bottom: '25px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                        pointerEvents: 'none',
                        zIndex: 2
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '120px',
                            height: '5px',
                            background: colorValue,
                            borderRadius: '0 0 4px 4px'
                        }} />
                    </div>
                );
            case 'elegant-inset':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '30px',
                        left: '30px',
                        right: '30px',
                        bottom: '30px',
                        border: `1.5px solid ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderLeft: `1px solid ${colorSingle}`, borderTop: `1px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderRight: `1px solid ${colorSingle}`, borderTop: `1px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '20px', height: '20px', borderLeft: `1px solid ${colorSingle}`, borderBottom: `1px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', borderRight: `1px solid ${colorSingle}`, borderBottom: `1px solid ${colorSingle}` }} />
                    </div>
                );
            case 'header-footer':
                return (
                    <>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '14px', background: colorValue, zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '14px', background: colorValue, zIndex: 5, pointerEvents: 'none' }} />
                    </>
                );
            case 'asymmetric-corners':
                return (
                    <>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', background: colorValue, borderRadius: '0 0 100% 0', opacity: 0.85, zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', background: colorValue, borderRadius: '100% 0 0 0', opacity: 0.85, zIndex: 5, pointerEvents: 'none' }} />
                    </>
                );
            case 'modern-stripes':
                return (
                    <>
                        <div style={{ position: 'absolute', left: '16px', top: '30px', bottom: '30px', width: '4px', background: colorValue, borderRadius: '2px', zIndex: 5, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', right: '16px', top: '30px', bottom: '30px', width: '4px', background: colorValue, borderRadius: '2px', zIndex: 5, pointerEvents: 'none' }} />
                    </>
                );
            case 'classic-certificate':
                return (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        right: '16px',
                        bottom: '16px',
                        border: `4px solid ${colorSingle}`,
                        borderRadius: '4px',
                        padding: '6px',
                        boxShadow: `inset 0 0 0 2px ${colorSingle}`,
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        <div style={{ position: 'absolute', top: '12px', left: '12px', width: '24px', height: '24px', borderLeft: `2px solid ${colorSingle}`, borderTop: `2px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '24px', height: '24px', borderRight: `2px solid ${colorSingle}`, borderTop: `2px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '24px', height: '24px', borderLeft: `2px solid ${colorSingle}`, borderBottom: `2px solid ${colorSingle}` }} />
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '24px', height: '24px', borderRight: `2px solid ${colorSingle}`, borderBottom: `2px solid ${colorSingle}` }} />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderFrameStyleHTML = (theme = latestAssetStateRef.current.bgTheme, color = latestAssetStateRef.current.frameColor, pageNum = 1, customBgUrlOverride?: string | null) => {
        if (theme === 'clean') return '';
        if (theme === 'custom-image') {
            const customUrl = customBgUrlOverride;
            if (!customUrl || customUrl.startsWith('data:')) return ''; // skip base64, keep as CSS background
            return `<img src="${customUrl}" referrerpolicy="no-referrer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; object-fit: fill;" alt="Moldura Personalizada" />`;
        }

        // Check if database border
        const curDbBorders = latestAssetStateRef.current.dbBorders || [];
        const activeDbBorder = curDbBorders.find(b => b.id === theme);
        if (activeDbBorder) {
            const frameUrlToUse = pageNum === 2 ? (activeDbBorder.rawBackUrl || activeDbBorder.rawUrl) : activeDbBorder.rawUrl;
            return `<img src="${frameUrlToUse}" referrerpolicy="no-referrer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; object-fit: fill;" alt="Moldura do Banco" />`;
        }

        const colorSingle = getFrameColorSingle(color);
        const colorValue = getFrameColorValue(color);

        switch (theme) {
            case 'stripe':
                return `
                    <div style="
                        width: 28%;
                        height: 100%;
                        background: ${colorValue};
                        position: relative;
                        overflow: hidden;
                    ">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; opacity: 0.15;">
                            <circle cx="20" cy="20" r="30" fill="white" />
                            <circle cx="80" cy="80" r="40" fill="white" />
                            <path d="M 0 50 L 100 0 L 100 100 Z" fill="white" />
                        </svg>
                    </div>`;
            case 'single-thin':
                return `<div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid ${colorSingle}; pointer-events: none; z-index: 5;"></div>`;
            case 'single-thick':
                return `<div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 8px solid ${colorSingle}; pointer-events: none; z-index: 5;"></div>`;
            case 'double-classic':
                return `
                    <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 5px solid ${colorSingle}; pointer-events: none; z-index: 5;">
                        <div style="position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px; border: 1.5px solid ${colorSingle};"></div>
                    </div>`;
            case 'double-equal':
                return `
                    <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 1.5px solid ${colorSingle}; pointer-events: none; z-index: 5;">
                        <div style="position: absolute; top: 5px; left: 5px; right: 5px; bottom: 5px; border: 1.5px solid ${colorSingle};"></div>
                    </div>`;
            case 'corners-bracket':
                return `
                    <div style="position: absolute; top: 20px; left: 20px; width: 30px; height: 30px; border-left: 4px solid ${colorSingle}; border-top: 4px solid ${colorSingle}; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; top: 20px; right: 20px; width: 30px; height: 30px; border-right: 4px solid ${colorSingle}; border-top: 4px solid ${colorSingle}; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 20px; left: 20px; width: 30px; height: 30px; border-left: 4px solid ${colorSingle}; border-bottom: 4px solid ${colorSingle}; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 20px; right: 20px; width: 30px; height: 30px; border-right: 4px solid ${colorSingle}; border-bottom: 4px solid ${colorSingle}; z-index: 5; pointer-events: none;"></div>`;
            case 'corners-floral':
                return `
                    <div style="position: absolute; top: 24px; left: 24px; right: 24px; bottom: 24px; border: 1px solid ${colorSingle}; opacity: 0.7; pointer-events: none; z-index: 5;"></div>
                    <div style="position: absolute; top: 16px; left: 16px; width: 16px; height: 16px; background: ${colorSingle}; border-radius: 3px; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; top: 16px; right: 16px; width: 16px; height: 16px; background: ${colorSingle}; border-radius: 3px; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 16px; left: 16px; width: 16px; height: 16px; background: ${colorSingle}; border-radius: 3px; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 16px; right: 16px; width: 16px; height: 16px; background: ${colorSingle}; border-radius: 3px; z-index: 5; pointer-events: none;"></div>`;
            case 'minimalist-card':
                return `
                    <div style="
                        position: absolute;
                        top: 25px;
                        left: 25px;
                        right: 25px;
                        bottom: 25px;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                        pointer-events: none;
                        z-index: 2;
                    ">
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 120px;
                            height: 5px;
                            background: ${colorValue};
                            border-radius: 0 0 4px 4px;
                        "></div>
                    </div>`;
            case 'elegant-inset':
                return `
                    <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 1.5px solid ${colorSingle}; pointer-events: none; z-index: 5;">
                        <div style="position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; border-left: 1px solid ${colorSingle}; border-top: 1px solid ${colorSingle};"></div>
                        <div style="position: absolute; top: -10px; right: -10px; width: 20px; height: 20px; border-right: 1px solid ${colorSingle}; border-top: 1px solid ${colorSingle};"></div>
                        <div style="position: absolute; bottom: -10px; left: -10px; width: 20px; height: 20px; border-left: 1px solid ${colorSingle}; border-bottom: 1px solid ${colorSingle};"></div>
                        <div style="position: absolute; bottom: -10px; right: -10px; width: 20px; height: 20px; border-right: 1px solid ${colorSingle}; border-bottom: 1px solid ${colorSingle};"></div>
                    </div>`;
            case 'header-footer':
                return `
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 14px; background: ${colorValue}; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 14px; background: ${colorValue}; z-index: 5; pointer-events: none;"></div>`;
            case 'asymmetric-corners':
                return `
                    <div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; background: ${colorValue}; border-radius: 0 0 100% 0; opacity: 0.85; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; bottom: 0; right: 0; width: 40px; height: 40px; background: ${colorValue}; border-radius: 100% 0 0 0; opacity: 0.85; z-index: 5; pointer-events: none;"></div>`;
            case 'modern-stripes':
                return `
                    <div style="position: absolute; left: 16px; top: 30px; bottom: 30px; width: 4px; background: ${colorValue}; border-radius: 2px; z-index: 5; pointer-events: none;"></div>
                    <div style="position: absolute; right: 16px; top: 30px; bottom: 30px; width: 4px; background: ${colorValue}; border-radius: 2px; z-index: 5; pointer-events: none;"></div>`;
            case 'classic-certificate':
                return `
                    <div style="
                        position: absolute;
                        top: 16px;
                        left: 16px;
                        right: 16px;
                        bottom: 16px;
                        border: 4px solid ${colorSingle};
                        border-radius: 4px;
                        padding: 6px;
                        box-shadow: inset 0 0 0 2px ${colorSingle};
                        pointer-events: none;
                        z-index: 5;
                    ">
                        <div style="position: absolute; top: 12px; left: 12px; width: 24px; height: 24px; border-left: 2px solid ${colorSingle}; border-top: 2px solid ${colorSingle};"></div>
                        <div style="position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; border-right: 2px solid ${colorSingle}; border-top: 2px solid ${colorSingle};"></div>
                        <div style="position: absolute; bottom: 12px; left: 12px; width: 24px; height: 24px; border-left: 2px solid ${colorSingle}; border-bottom: 2px solid ${colorSingle};"></div>
                        <div style="position: absolute; bottom: 12px; right: 12px; width: 24px; height: 24px; border-right: 2px solid ${colorSingle}; border-bottom: 2px solid ${colorSingle};"></div>
                    </div>`;
            default:
                return '';
        }
    };

    // Generate responsive absolute-positioned HTML reflecting background and orientation
    const getPageHTML = (pageNum: number) => {
        const {
            elements: curElements,
            logoUrl: curLogoUrl,
            logoPos: curLogoPos,
            signatures: curSignatures,
            signaturesPage2: curSignaturesPage2,
            orientation: curOrientation,
            orientationPage2: curOrientationPage2,
            bgTheme: curBgTheme,
            bgThemePage2: curBgThemePage2,
            frameColor: curFrameColor,
            frameColorPage2: curFrameColorPage2,
            customBgUrl: curCustomBgUrl,
            customBgUrlPage2: curCustomBgUrlPage2,
        } = latestAssetStateRef.current;

        const pageElements = curElements.filter(el => {
            const elPage = el.page || 1;
            return elPage === pageNum;
        });

        const elementsHtml = pageElements.map(el => {
            if (el.type === 'line') {
                return `
        <div style="
            position: absolute;
            left: ${el.x}%;
            top: ${el.y}%;
            transform: translate(-50%, -50%);
            width: ${el.width}px;
            height: ${Math.max(1, el.fontSize || 3)}px;
            background-color: ${el.color};
            line-height: 1;
        "></div>`;
            }
            const fontStyle = el.fontStyle === 'italic' ? 'font-style: italic;' : '';
            const textDecor = el.textDecoration === 'underline' ? 'text-decoration: underline;' : '';
            const heightStyle = el.height ? `min-height: ${el.height}px; height: auto;` : '';
            const widthStyle = `width: ${el.width}px;`;
            const transform = el.pdfPositioned ? 'none' : 'translate(-50%, 0)';
            const lineHeight = el.lineHeight ?? 1.45;
            const whiteSpace = el.pdfPositioned ? 'pre' : 'pre-wrap';
            const wordBreak = el.pdfPositioned ? 'normal' : 'break-word';
            const pdfMarker = el.pdfPositioned ? ' data-pdf-positioned="true"' : '';
            return `<div${pdfMarker} style="position: absolute; left: ${el.x}%; top: ${el.y}%; transform: ${transform}; font-size: ${el.fontSize}px; color: ${el.color}; font-family: '${el.fontFamily}', sans-serif; font-weight: ${el.fontWeight}; ${fontStyle} ${textDecor} text-align: ${el.textAlign}; ${widthStyle} ${heightStyle} line-height: ${lineHeight}; margin: 0; padding: 0; white-space: ${whiteSpace}; word-break: ${wordBreak}; overflow-wrap: normal;">${el.html ?? el.text}</div>`;

        }).join('');

        console.info('[Template Trace] export page', {
            traceId: templateTraceIdRef.current,
            pageNum,
            currentElements: curElements.length,
            pageElements: pageElements.length,
            elementTexts: pageElements.slice(0, 20).map(element => element.text),
            elementsHtmlBytes: elementsHtml.length,
            elementsHtmlHasJessica: elementsHtml.includes('Jessica'),
        });

        const pageOrientation = pageNum === 1 ? curOrientation : curOrientationPage2;
        const pageBgTheme = pageNum === 1 ? curBgTheme : curBgThemePage2;
        const pageFrameColor = pageNum === 1 ? curFrameColor : curFrameColorPage2;
        const pageCustomBgUrl = pageNum === 1 ? curCustomBgUrl : curCustomBgUrlPage2;
        const pageLogoUrl = latestAssetStateRef.current.dbLogoRecord?.url || curLogoUrl;
        const pageLogoPos = {
            x: curLogoPos && typeof curLogoPos.x === 'number' && !isNaN(curLogoPos.x) ? curLogoPos.x : 58,
            y: curLogoPos && typeof curLogoPos.y === 'number' && !isNaN(curLogoPos.y) ? curLogoPos.y : 8,
            width: curLogoPos && typeof curLogoPos.width === 'number' && !isNaN(curLogoPos.width) ? curLogoPos.width : 130
        };
        const pageSignatures = pageNum === 1 ? curSignatures : curSignaturesPage2;

        const isLandscape = pageOrientation === 'landscape';
        const widthPx = isLandscape ? 1123 : 794;
        const heightPx = isLandscape ? 794 : 1123;

        const isStripe = pageBgTheme === 'stripe';
        const isCustomImg = pageBgTheme === 'custom-image';
        const isClean = pageBgTheme === 'clean';

        const getPageFrameColorValue = () => {
            switch (pageFrameColor) {
                case 'gold': return '#d4af37';
                case 'blue': return '#1a56db';
                case 'emerald': return '#10b981';
                case 'rose': return '#f43f5e';
                default: return '#1a56db';
            }
        };

        const patternStyle = isStripe ? `
            background: ${getPageFrameColorValue()};
            position: relative;
            overflow: hidden;
            ${isLandscape ? 'width: 28%; height: 100%;' : 'width: 100%; height: 24%;'}
        ` : 'display: none;';

        const contentStyle = `
            position: relative;
            padding: 0px;
            z-index: 2;
            ${isStripe ? (isLandscape ? 'width: 72%; height: 100%;' : 'width: 100%; height: 76%;') : 'width: 100%; height: 100%;'}
            ${isClean ? `background: #f8fafc;` : ''}
        `;

        const logoHtml = pageLogoUrl ? `
            <div style="
                position: absolute;
                left: ${pageLogoPos.x}%;
                top: ${pageLogoPos.y}%;
                transform: translate(-50%, -50%);
                width: ${pageLogoPos.width}px;
                z-index: 30;
            ">
                <img src="${pageLogoUrl}" referrerpolicy="no-referrer" style="width: 100%; height: auto; object-fit: contain; mix-blend-mode: multiply;" alt="Logotipo" />
            </div>
        ` : '';

        const signatureHtml = pageSignatures.map(sig => {
            const sigX = typeof sig.x === 'number' && !isNaN(sig.x) ? sig.x : 50;
            const sigY = typeof sig.y === 'number' && !isNaN(sig.y) ? sig.y : 50;
            const sigWidth = typeof sig.width === 'number' && !isNaN(sig.width) ? sig.width : 150;
            const sigUrl = sig.url;
            return `
            <div style="
                position: absolute;
                left: ${sigX}%;
                top: ${sigY}%;
                transform: translate(-50%, -50%);
                width: ${sigWidth}px;
                z-index: 31;
            ">
                <img src="${sigUrl}" referrerpolicy="no-referrer" style="width: 100%; height: auto; object-fit: contain; mix-blend-mode: multiply;" alt="Assinatura" />
            </div>
        `;
        }).join('');

        const pageHtml = `
        <div class="cert-container" style="
            width: ${widthPx}px;
            height: ${heightPx}px;
            flex-shrink: 0;
            background-color: #ffffff;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            overflow: hidden;
            display: flex;
            flex-direction: ${isLandscape ? 'row' : 'column'};
            page-break-after: always;
            margin-bottom: 30px;
        ">
            ${isStripe ? `
            <div class="pattern-side" style="${patternStyle}">
                <div class="pattern-shape-1"></div>
                <div class="pattern-shape-2"></div>
            </div>
            ` : ''}

            ${renderFrameStyleHTML(pageBgTheme, pageFrameColor, pageNum, pageCustomBgUrl)}

            <div class="content-side" style="${contentStyle}">
                ${logoHtml}
                ${signatureHtml}
                ${elementsHtml}
            </div>
        </div>`;

        console.info('[Template Trace] export result', {
            traceId: templateTraceIdRef.current,
            pageNum,
            htmlBytes: pageHtml.length,
            hasContentSide: pageHtml.includes('content-side'),
            contentSideEmpty: /content-side[^>]*>\s*<\/div>/i.test(pageHtml),
            hasJessica: pageHtml.includes('Jessica'),
        });

        return pageHtml;
    };

    const handleExportHTML = () => {
        const page1Html = getPageHTML(1);

        // Only render Page 2 if the optional Verso page is enabled
        const page2Html = enableVerso ? getPageHTML(2) : '';

        const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado Exportado</title>
    <base href="${window.location.origin}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Architects+Daughter&family=Bad+Script&family=Berkshire+Swash&family=Cinzel+Decorative&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Inter:wght@300;400;500;600;700&family=Italianno&family=Kaushan+Script&family=La+Belle+Aurore&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Marck+Script&family=Montserrat+Alternates:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Mr+De+Haviland&family=Niconne&family=Oswald:wght@300;400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quintessential&family=Roboto:wght@300;400;500;700&family=Sacramento&family=Satisfy&family=Tangerine:wght@700&family=Yellowtail&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Baskervville&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Prata&family=DM+Serif+Display&family=Playfair+Display+SC:wght@400;700&family=Cormorant+Unicase:wght@400;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Rochester&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&family=Qwigley&family=WindSong&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background-color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            min-height: 100vh;
            overflow: auto;
        }
        .pattern-shape-1 {
            position: absolute;
            width: 250px;
            height: 250px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            top: -50px;
            left: -50px;
        }
        .pattern-shape-2 {
            position: absolute;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            bottom: -50px;
            right: -30px;
        }
        @media print {
            body {
                background: none;
                padding: 0;
            }
            .cert-container {
                box-shadow: none !important;
                margin-bottom: 0 !important;
            }
        }
    </style>
</head>
<body>
    ${page1Html}
    ${page2Html}
</body>
</html>`;

        const newWin = window.open();
        if (newWin) {
            newWin.document.write(fullHtml);
            newWin.document.close();
        }
    };

    return (
        <div style={{
            background: embedded ? 'transparent' : '#121214',
            color: '#e4e4e7',
            minHeight: embedded ? 'auto' : 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, sans-serif'
        }}>
            <GoogleFontsLoader />

            <style>{`
                @keyframes glowPulse {
                    0% { border-color: rgba(250, 63, 122, 0.4); box-shadow: 0 0 4px rgba(250, 63, 122, 0.4); }
                    50% { border-color: rgba(250, 63, 122, 1); box-shadow: 0 0 16px rgba(250, 63, 122, 0.8); }
                    100% { border-color: rgba(250, 63, 122, 0.4); box-shadow: 0 0 4px rgba(250, 63, 122, 0.4); }
                }
                /* Force line-height across all canvas text elements and their inner spans/content,
                   so the editor preview exactly matches the printed/exported certificate. */
                .canvas-text-element,
                .canvas-text-element * {
                    line-height: 1.45 !important;
                }
            `}</style>

            {/* Layout body taking full remaining height */}
            <div style={{ display: 'flex', flex: 1, minHeight: embedded ? 'auto' : 'calc(100vh - 60px)', overflow: 'visible' }}>

                {/* Left Active Sidebar: properties */}
                <div
                    ref={editorSidebarRef}
                    style={{
                        width: '72px',
                        minWidth: '72px',
                        background: '#1a1a1e',
                        borderRight: '1px solid #2d2d34',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: '100vh',
                        padding: '1.5rem 0.5rem',
                        gap: '2rem',
                        position: 'sticky',
                        top: 0,
                        alignSelf: 'flex-start',
                        zIndex: 9999999999
                    }}
                >
                    {/* Logo Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span style={{ color: '#8e8e93', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', display: 'block', letterSpacing: '0.5px' }}>Logo</span>
                        {activeLogoUrl ? (
                            <div
                                style={{
                                    position: 'relative',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px',
                                    border: '1px solid #2d2d34',
                                    background: '#27272a',
                                    padding: '4px',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden'
                                }}
                                title="Clique para remover o Logotipo"
                                onClick={async () => {
                                    setActiveLogoUrl(null);
                                    setDbLogoRecord(null);
                                    if (courseId) {
                                        try { await api.delete(`/courses/${courseId}/logo`); } catch { }
                                    }
                                }}
                            >
                                <img src={activeLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <div
                                    className="compact-remove-overlay"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease-in-out'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                >
                                    Apagar
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="logo-file-upload"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '2px dashed #3f3f46',
                                    borderRadius: '8px',
                                    background: '#141417',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    marginBottom: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#fa3f7a';
                                    e.currentTarget.style.background = '#1c1c21';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#3f3f46';
                                    e.currentTarget.style.background = '#141417';
                                }}
                                title="Carregar Logotipo (PNG/JPG)"
                            >
                                <FiUploadCloud size={20} style={{ color: '#fa3f7a' }} />
                            </label>
                        )}



                    </div>

                    {/* Signature Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span style={{ color: '#8e8e93', fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', display: 'block', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>Assinatura</span>
                        <label
                            htmlFor="signature-file-upload"
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '2px dashed #3f3f46',
                                borderRadius: '8px',
                                background: '#141417',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: 0
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#fa3f7a';
                                e.currentTarget.style.background = '#1c1c21';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3f3f46';
                                e.currentTarget.style.background = '#141417';
                            }}
                            title="Carregar Assinatura (PNG transparente)"
                        >
                            <FiUploadCloud size={20} style={{ color: '#fa3f7a' }} />
                        </label>

                        {activeSignatures.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', width: '100%', alignItems: 'center' }}>
                                {activeSignatures.map((sig, index) => (
                                    <div
                                        key={sig.id}
                                        style={{
                                            position: 'relative',
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '8px',
                                            border: selectedSignatureId === sig.id ? '2px solid #fa3f7a' : '1px solid #2d2d34',
                                            background: '#27272a',
                                            padding: '4px',
                                            boxSizing: 'border-box',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            overflow: 'hidden'
                                        }}
                                        title={`Assinatura ${index + 1} - Clique para selecionar/remover`}
                                        onClick={() => {
                                            setSelectedSignatureId(sig.id);
                                            setSelectedLogo(false);
                                            setSelectedId('');
                                        }}
                                    >
                                        <img src={sig.url} alt={`Signature ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        <div
                                            className="compact-remove-overlay"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'rgba(239, 68, 68, 0.9)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                fontSize: '0.62rem',
                                                fontWeight: 700,
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease-in-out'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setActiveSignatures(prev => prev.filter(s => s.id !== sig.id));
                                                if (selectedSignatureId === sig.id) {
                                                    setSelectedSignatureId(null);
                                                }
                                                if (courseId) {
                                                    const dbId = (sig as any).dbId;
                                                    if (dbId) { try { await api.delete(`/courses/${courseId}/signatures/${dbId}`); } catch { } }
                                                }
                                            }}
                                        >
                                            Apagar
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}



                    </div>

                    {/* Divider/Line Tool Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span style={{ color: '#8e8e93', fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', display: 'block', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>Traço</span>
                        <button
                            onClick={() => {
                                const newId = 'line_' + Date.now();
                                const newEl: TextElement = {
                                    id: newId,
                                    text: '—',
                                    type: 'line',
                                    x: 50,
                                    y: 50,
                                    fontSize: 4, // 4px thickness
                                    color: '#1e293b',
                                    fontWeight: '500',
                                    fontStyle: 'normal',
                                    textDecoration: 'none',
                                    fontFamily: 'Montserrat',
                                    textAlign: 'center',
                                    width: 150,
                                    page: currentPage
                                };

                                saveHistory(elements);
                                setElements(prev => [...prev, newEl]);
                                setSelectedId(newId);
                                setEditingId(null);
                                if (document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur();
                                }

                                // Deselect others
                                setSelectedSignatureId(null);
                                setSelectedLogo(false);
                                setActiveTool('text');
                            }}
                            style={{
                                width: '48px',
                                height: '48px',
                                border: activeTool === 'line' ? '2px solid #fa3f7a' : '1px solid #3f3f46',
                                borderRadius: '8px',
                                background: activeTool === 'line' ? 'rgba(250, 63, 122, 0.15)' : '#141417',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: '#fa3f7a',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTool !== 'line') {
                                    e.currentTarget.style.borderColor = '#fa3f7a';
                                    e.currentTarget.style.background = '#1c1c21';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTool !== 'line') {
                                    e.currentTarget.style.borderColor = '#3f3f46';
                                    e.currentTarget.style.background = '#141417';
                                }
                            }}
                            title="Adicionar Traço"
                        >
                            <FiMinus size={22} style={{ transform: 'rotate(-45deg)' }} />
                        </button>
                    </div>

                    <input
                        type="file"
                        id="bg-image-file-upload"
                        accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />

                    <input
                        type="file"
                        id="logo-file-upload"
                        accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                    />

                    <input
                        type="file"
                        id="signature-file-upload"
                        accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml, image/webp"
                        onChange={handleSignatureUpload}
                        style={{ display: 'none' }}
                    />

                    {/* Fixed HUD Toolbar */}
                    {selectedId && (
                        <div
                            id="fixed-hud-toolbar"
                            className="fixed-hud-container"
                            onMouseDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName !== 'INPUT' && !target.closest('.portal-font-dropdown')) {
                                    const sel = window.getSelection();
                                    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                                        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
                                    }
                                    e.preventDefault();
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: '90px',
                                left: '76px',
                                width: '76px', // Premium dark studio sizing
                                background: 'rgba(20, 20, 25, 0.95)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                                zIndex: 9999999,
                                fontFamily: 'Inter, sans-serif',
                                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                animation: hudGlowActive ? 'hudPinkRadiate 2s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none'
                            }}
                        >
                            <style>{`
                                @keyframes hudPinkRadiate {
                                    0% {
                                        border-color: rgba(250, 63, 122, 0.4);
                                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 0px rgba(250, 63, 122, 0.8);
                                    }
                                    50% {
                                        border-color: rgba(250, 63, 122, 1);
                                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px 4px rgba(250, 63, 122, 0.6);
                                    }
                                    100% {
                                        border-color: rgba(255, 255, 255, 0.08);
                                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 0px rgba(250, 63, 122, 0);
                                    }
                                }
                                @keyframes slideInRight {
                                    0% { opacity: 0; transform: translateX(-12px) scale(0.95); }
                                    100% { opacity: 1; transform: translateX(0) scale(1); }
                                }
                            `}</style>

                            {/* Section Header: FONTE */}
                            {elements.find(item => item.id === selectedId)?.type !== 'line' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                                    <span style={{ color: '#8e8e93', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                                        Fonte
                                    </span>
                                    <VerticalFixedFontSelect
                                        value={elements.find(item => item.id === selectedId)?.fontFamily || 'Inter'}
                                        onChange={(val) => applyStyle('fontFamily', val)}
                                    />
                                </div>
                            )}

                            {elements.find(item => item.id === selectedId)?.type !== 'line' && <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />}

                            {/* Color Picker */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                                <span style={{ color: '#8e8e93', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                                    Cor
                                </span>
                                <input
                                    type="color"
                                    value={elements.find(item => item.id === selectedId)?.color || '#000000'}
                                    onMouseDown={(e) => {
                                        const s = window.getSelection();
                                        if (s && !s.isCollapsed && s.rangeCount > 0) {
                                            savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                        }
                                        e.stopPropagation();
                                    }}
                                    onChange={(e) => applyStyle('color', e.target.value)}
                                    className="color-picker-input"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        padding: 0,
                                        border: '1px solid #3f3f46',
                                        borderRadius: '8px',
                                        background: '#27272a',
                                        cursor: 'pointer'
                                    }}
                                    title="Cor"
                                />
                            </div>

                            <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                            {/* Font Size or Stroke Thickness - Horizontal Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                                <span style={{ color: '#8e8e93', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {elements.find(item => item.id === selectedId)?.type === 'line' ? 'Espessura' : 'Tamanho'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', overflow: 'hidden' }}>
                                    <button
                                        onClick={() => {
                                            const el = elements.find(item => item.id === selectedId);
                                            if (el) {
                                                const base = toolbarFontSize;
                                                const minVal = el.type === 'line' ? 1 : 8;
                                                const newVal = Math.max(minVal, Number(base) - 1);
                                                setToolbarFontSize(newVal);
                                                applyStyle('fontSize', newVal);
                                            }
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#f4f4f5',
                                            width: '20px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            outline: 'none'
                                        }}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={toolbarFontSize}
                                        onChange={(e) => {
                                            const valStr = e.target.value;
                                            setToolbarFontSize(valStr);
                                            const rawVal = parseInt(valStr);
                                            if (!isNaN(rawVal)) {
                                                const el = elements.find(item => item.id === selectedId);
                                                const minVal = el?.type === 'line' ? 1 : 8;
                                                const maxVal = el?.type === 'line' ? 50 : 150;
                                                const newVal = Math.min(maxVal, Math.max(minVal, rawVal));
                                                applyStyle('fontSize', newVal);
                                            }
                                        }}
                                        className="no-spinners"
                                        style={{
                                            width: '28px',
                                            height: '32px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#f4f4f5',
                                            textAlign: 'center',
                                            fontSize: '11px',
                                            outline: 'none',
                                            fontWeight: '600'
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const el = elements.find(item => item.id === selectedId);
                                            if (el) {
                                                const base = toolbarFontSize;
                                                const maxVal = el.type === 'line' ? 50 : 150;
                                                const newVal = Math.min(maxVal, Number(base) + 1);
                                                setToolbarFontSize(newVal);
                                                applyStyle('fontSize', newVal);
                                            }
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#f4f4f5',
                                            width: '20px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            outline: 'none'
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                            {/* Style buttons */}
                            {elements.find(item => item.id === selectedId)?.type !== 'line' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                                    <div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const el = elements.find(item => item.id === selectedId);
                                                const current = el?.fontWeight || '500';
                                                const isBold = ['600', 'bold', '700', '800', '900'].includes(current);
                                                const next = isBold ? '500' : '600';
                                                applyStyle('fontWeight', next);
                                            }}
                                            style={{
                                                background: ['600', 'bold', '700', '800', '900'].includes(elements.find(item => item.id === selectedId)?.fontWeight || '') ? '#fa3f7a' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: '#f4f4f5',
                                                borderRadius: '8px',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title={`Peso atual: ${elements.find(item => item.id === selectedId)?.fontWeight || '500'} — clique para alternar`}
                                        >
                                            <FiBold size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const el = elements.find(item => item.id === selectedId);
                                            if (el) applyStyle('fontStyle', el.fontStyle === 'italic' ? 'normal' : 'italic');
                                        }}
                                        style={{
                                            background: elements.find(item => item.id === selectedId)?.fontStyle === 'italic' ? '#fa3f7a' : '#27272a',
                                            border: '1px solid #3f3f46',
                                            color: '#f4f4f5',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Itálico"
                                    >
                                        <FiItalic size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const el = elements.find(item => item.id === selectedId);
                                            if (el) applyStyle('textDecoration', el.textDecoration === 'underline' ? 'none' : 'underline');
                                        }}
                                        style={{
                                            background: elements.find(item => item.id === selectedId)?.textDecoration === 'underline' ? '#fa3f7a' : '#27272a',
                                            border: '1px solid #3f3f46',
                                            color: '#f4f4f5',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Sublinhado"
                                    >
                                        <FiUnderline size={14} />
                                    </button>
                                </div>
                            )}

                            {elements.find(item => item.id === selectedId)?.type !== 'line' && <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />}

                            {/* Text Alignment */}
                            {elements.find(item => item.id === selectedId)?.type !== 'line' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => applyStyle('textAlign', 'left')}
                                            style={{
                                                background: isAlignActive('left') ? '#fa3f7a' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: '#f4f4f5',
                                                borderRadius: '6px',
                                                width: '26px',
                                                height: '26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Alinhar à Esquerda"
                                        >
                                            <FiAlignLeft size={12} />
                                        </button>
                                        <button
                                            onClick={() => applyStyle('textAlign', 'center')}
                                            style={{
                                                background: isAlignActive('center') ? '#fa3f7a' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: '#f4f4f5',
                                                borderRadius: '6px',
                                                width: '26px',
                                                height: '26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Centralizar"
                                        >
                                            <FiAlignCenter size={12} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => applyStyle('textAlign', 'right')}
                                            style={{
                                                background: isAlignActive('right') ? '#fa3f7a' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: '#f4f4f5',
                                                borderRadius: '6px',
                                                width: '26px',
                                                height: '26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Alinhar à Direita"
                                        >
                                            <FiAlignRight size={12} />
                                        </button>
                                        <button
                                            onClick={() => applyStyle('textAlign', 'justify')}
                                            style={{
                                                background: isAlignActive('justify') ? '#fa3f7a' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: '#f4f4f5',
                                                borderRadius: '6px',
                                                width: '26px',
                                                height: '26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Justificar"
                                        >
                                            <FiAlignJustify size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Onboarding Guide Step 1: Mirrored to show on the right of the Left-HUD */}
                            {tourStep === 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: 'calc(100% + 14px)',
                                    top: '20px',
                                    background: 'rgba(20, 20, 25, 0.98)',
                                    border: '2px solid #fa3f7a',
                                    borderRadius: '12px',
                                    padding: '14px 22px',
                                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(250, 63, 122, 0.45)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    width: '280px',
                                    zIndex: 99999999,
                                    fontFamily: 'Inter, sans-serif',
                                    animation: 'tourFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '15px' }}>✨</span>
                                        <span style={{ color: '#fa3f7a', fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px' }}>
                                            PAINEL DE FORMATAÇÃO
                                        </span>
                                    </div>
                                    <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left' }}>
                                        Personalize a fonte, tamanho, estilo, cor e alinhamento do seu elemento selecionado aqui!
                                    </span>
                                    {/* Leftward pointing arrow */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-7px',
                                        top: '24px',
                                        transform: 'rotate(45deg)',
                                        width: '12px',
                                        height: '12px',
                                        background: 'rgba(20, 20, 25, 0.98)',
                                        borderLeft: '2px solid #fa3f7a',
                                        borderBottom: '2px solid #fa3f7a',
                                    }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Central Canvas workspace */}
                <div
                    ref={canvasWrapperRef}
                    style={{
                        flexGrow: 1,
                        background: '#232328',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '1.5rem',
                        paddingLeft: selectedId ? '96px' : '1.5rem',
                        paddingBottom: '2rem',
                        overflow: 'visible',
                        position: 'relative',
                        gap: '1.25rem',
                        minHeight: 'calc(100vh - 120px)',
                        transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >

                    <div
                        id="top-static-toolbar"
                        style={{
                            position: 'sticky',
                            top: '12px',
                            width: '100%',
                            maxWidth: `${(activeOrientation === 'landscape' ? 1123 : 794) * canvasScale}px`,
                            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.92) 0%, rgba(28, 28, 35, 0.96) 100%)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '12px',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            margin: '0 auto 1.25rem auto',
                            zIndex: 1000005,
                            fontFamily: 'Inter, sans-serif',
                            opacity: 1, // Always fully active and interactive
                            pointerEvents: 'auto',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {/* Onboarding Guide Step 2: Fast Masks Row */}
                        {tourStep === 2 && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 14px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(20, 20, 25, 0.98)',
                                border: '2px solid #3b82f6',
                                borderRadius: '12px',
                                padding: '14px 22px',
                                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(59, 130, 246, 0.45)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                zIndex: 99999999,
                                fontFamily: 'Inter, sans-serif',
                                animation: 'tourFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '15px' }}>🏷️</span>
                                    <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px' }}>
                                        MÁSCARAS RÁPIDAS
                                    </span>
                                </div>
                                <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left' }}>
                                    Insira tags dinâmicas para preenchimento automático de Nome do Aluno, Curso, CPF e mais!
                                </span>
                                {/* Upward pointing arrow */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-7px',
                                    left: '50%',
                                    transform: 'translateX(-50%) rotate(45deg)',
                                    width: '12px',
                                    height: '12px',
                                    background: 'rgba(20, 20, 25, 0.98)',
                                    borderLeft: '2px solid #3b82f6',
                                    borderTop: '2px solid #3b82f6',
                                }} />
                            </div>
                        )}

                        {/* LEFT SECTION: Masks Title/Label */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '6px',
                            width: '240px',
                            minWidth: '220px',
                            flexShrink: 0
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, rgba(250, 63, 122, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                border: '1px solid rgba(250, 63, 122, 0.2)',
                                borderRadius: '10px',
                                padding: '6px 12px',
                                color: '#fa3f7a',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                userSelect: 'none'
                            }}>
                                <span style={{ fontSize: '13px' }}>🏷️</span>
                                <span style={{ background: 'linear-gradient(135deg, #ff6097 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Preenchimento
                                </span>
                            </div>
                            <span style={{
                                color: '#10b981',
                                fontSize: '11.5px',
                                fontWeight: 500,
                                marginLeft: '4px',
                                opacity: 0.95,
                                letterSpacing: '0.1px',
                                whiteSpace: 'normal',
                                lineHeight: '1.4'
                            }}>
                                Essas tags mudam automaticamente para os dados reais do aluno ao gerar o certificado.
                            </span>
                        </div>

                        {/* CENTRAL TALL DIVIDER */}
                        <div style={{
                            width: '1px',
                            alignSelf: 'stretch',
                            minHeight: '26px',
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)',
                            flexShrink: 0,
                            margin: '0 8px'
                        }}></div>

                        {/* RIGHT SECTION: Quick Masks flowing compactly */}
                        <div
                            className="toolbar-masks"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap',
                                flex: 1,
                                padding: '2px 0'
                            }}
                        >
                            {[
                                { key: 'nome_aluno', label: 'Nome Aluno' },
                                { key: 'cpf_aluno', label: 'CPF Aluno' },
                                { key: 'rg_aluno', label: 'RG Aluno' },
                                { key: 'funcao_aluno', label: 'Função Aluno' },
                                { key: 'nome_curso', label: 'Nome Curso' },
                                { key: 'carga_horaria', label: 'Carga Horária' },
                                { key: 'periodo_curso', label: 'Período Curso' },
                                { key: 'data_de_emissao', label: 'Data Emissão' },
                                { key: 'nome_empresa', label: 'Nome Empresa' },
                                { key: 'responsavel_empresarial', label: 'Resp. Empresarial' },
                                { key: 'data_validade', label: 'Validade' },
                                { key: 'cidade_de_realizacao', label: 'Cidade' }
                            ].map((m) => (
                                <button
                                    key={m.key}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        insertMaskAtCursor(m.key);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: '#e4e4e7',
                                        borderRadius: '12px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        flexShrink: 0,
                                        fontFamily: 'Inter, sans-serif',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(250, 63, 122, 0.6)';
                                        e.currentTarget.style.background = 'rgba(250, 63, 122, 0.08)';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(250, 63, 122, 0.15)';
                                        const dot = e.currentTarget.querySelector('.mask-bullet-dot') as HTMLElement;
                                        if (dot) {
                                            dot.style.transform = 'scale(1.2)';
                                            dot.style.background = '#fa3f7a';
                                            dot.style.boxShadow = '0 0 8px #fa3f7a';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                        e.currentTarget.style.color = '#e4e4e7';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                        const dot = e.currentTarget.querySelector('.mask-bullet-dot') as HTMLElement;
                                        if (dot) {
                                            dot.style.transform = 'scale(1)';
                                            dot.style.background = 'linear-gradient(135deg, #fa3f7a 0%, #a855f7 100%)';
                                            dot.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    <span
                                        className="mask-bullet-dot"
                                        style={{
                                            display: 'inline-block',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #fa3f7a 0%, #a855f7 100%)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    />
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Page / Verso Tab Selector Bar */}
                    {enableVerso && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(26, 26, 30, 0.95)',
                            border: '1px solid #2d2d34',
                            borderRadius: '24px',
                            padding: '8px 16px',
                            width: 'fit-content',
                            minWidth: '400px',
                            zIndex: 40,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(12px)',
                            gap: '24px',
                            userSelect: 'none',
                            animation: 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* Page 1 (Frente) Button */}
                                <button
                                    onClick={() => handleSelectPage(1)}
                                    style={{
                                        background: currentPage === 1 ? 'linear-gradient(135deg, #fa3f7a 0%, #a855f7 100%)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: '#ffffff',
                                        padding: '8px 18px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: currentPage === 1 ? '0 4px 15px rgba(250, 63, 122, 0.4)' : 'none'
                                    }}
                                >
                                    <span style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: currentPage === 1 ? '#ffffff' : '#3f3f46',
                                        color: currentPage === 1 ? '#fa3f7a' : '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 700
                                    }}>1</span>
                                    Frente (Principal)
                                </button>

                                {/* Page 2 (Verso) Button */}
                                <button
                                    onClick={() => handleSelectPage(2)}
                                    style={{
                                        background: currentPage === 2 ? 'linear-gradient(135deg, #fa3f7a 0%, #a855f7 100%)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: '#ffffff',
                                        padding: '8px 18px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: currentPage === 2 ? '0 4px 15px rgba(250, 63, 122, 0.4)' : 'none'
                                    }}
                                >
                                    <span style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: currentPage === 2 ? '#ffffff' : '#3f3f46',
                                        color: currentPage === 2 ? '#fa3f7a' : '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 700
                                    }}>2</span>
                                    Verso (Segunda Página)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bounded parent wrapping the A4 canvas to keep it centered and maintain heights */}
                    <div style={{
                        width: `${(activeOrientation === 'landscape' ? 1123 : 794) * canvasScale}px`,
                        height: `${(activeOrientation === 'landscape' ? 794 : 1123) * canvasScale}px`,
                        position: 'relative',
                        overflow: 'visible',
                        margin: '0 auto',
                        marginBottom: activeOrientation === 'landscape' ? '40px' : '80px',
                    }}>
                        {/* The A4 Canvas mimicking Adobe's rendering */}
                        <div
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            style={{
                                width: activeOrientation === 'landscape' ? '1123px' : '794px',
                                height: activeOrientation === 'landscape' ? '794px' : '1123px',
                                background: activeBgTheme === 'custom-image' ? `url('${activeCustomBgUrl}') center/cover no-repeat` : '#ffffff',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transform: `scale(${canvasScale})`,
                                transformOrigin: 'top left',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                                overflow: 'visible',
                                display: 'flex',
                                flexDirection: activeOrientation === 'landscape' ? 'row' : 'column',
                                cursor: activeTool === 'line' ? 'crosshair' : 'default',
                                transition: 'transform 0.15s ease-in-out',
                                zIndex: 1000000
                            }}
                        >
                            {/* A4 background pattern based on orientation */}
                            {activeBgTheme === 'stripe' && (
                                <div style={{
                                    width: activeOrientation === 'landscape' ? '28%' : '100%',
                                    height: activeOrientation === 'landscape' ? '100%' : '24%',
                                    background: getFrameColorValue(),
                                    position: 'relative',
                                    overflow: 'hidden',
                                    pointerEvents: 'none'
                                }}>
                                    {/* SVG Geometric decorations */}
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', opacity: 0.15 }}>
                                        <circle cx="20" cy="20" r="30" fill="white" />
                                        <circle cx="80" cy="80" r="40" fill="white" />
                                        <path d="M 0 50 L 100 0 L 100 100 Z" fill="white" />
                                    </svg>
                                    <div style={{
                                        position: 'absolute',
                                        width: '220px',
                                        height: '220px',
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: '50%',
                                        top: '-40px',
                                        left: '-40px'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        width: '180px',
                                        height: '180px',
                                        background: 'rgba(255,255,255,0.06)',
                                        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                                        bottom: '-30px',
                                        right: '-30px'
                                    }}></div>
                                </div>
                            )}

                            {/* Draw the selected border overlay dynamically over the entire canvas */}
                            {renderFrameStyleJSX(activeBgTheme, activeFrameColor)}

                            {/* A4 Right/Bottom side: Canvas items */}
                            <div
                                className="canvas-right-side"
                                style={{
                                    width: activeBgTheme === 'stripe' ? (activeOrientation === 'landscape' ? '72%' : '100%') : '100%',
                                    height: activeBgTheme === 'stripe' ? (activeOrientation === 'landscape' ? '100%' : '76%') : '100%',
                                    position: 'relative'
                                }}
                            >
                                {activeLogoUrl && (
                                    <div
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSelectedLogo(true);
                                            setSelectedSignatureId(null);
                                            setSelectedId('');
                                            if (canvasRef.current) {
                                                const rect = canvasRef.current.getBoundingClientRect();
                                                draggingLogoRef.current = true;
                                                const currentLeftPx = (activeLogoPos.x / 100) * rect.width;
                                                const currentTopPx = (activeLogoPos.y / 100) * rect.height;
                                                logoDragOffset.current = {
                                                    x: e.clientX - rect.left - currentLeftPx,
                                                    y: e.clientY - rect.top - currentTopPx
                                                };
                                            }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLogo(true);
                                            setSelectedSignatureId(null);
                                            setSelectedId('');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: `${activeLogoPos.x}%`,
                                            top: `${activeLogoPos.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            width: `${activeLogoPos.width}px`,
                                            cursor: 'move',
                                            zIndex: 35,
                                            border: selectedLogo ? '2px solid #fa3f7a' : '1.5px dashed #fa3f7a',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            background: 'transparent',
                                            userSelect: 'none'
                                        }}
                                        className="canvas-logo-element"
                                    >
                                        {showLogoIndicator && (
                                            <>
                                                <style>{`
                                                @keyframes logoPulseAnimation {
                                                    0% { transform: translate(-50%, 0); }
                                                    100% { transform: translate(-50%, -8px); }
                                                }
                                                @keyframes glowPulse {
                                                    0% { box-shadow: 0 0 0 0 rgba(250, 63, 122, 0.7); }
                                                    70% { box-shadow: 0 0 0 10px rgba(250, 63, 122, 0); }
                                                    100% { box-shadow: 0 0 0 0 rgba(250, 63, 122, 0); }
                                                }
                                            `}</style>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 'calc(100% + 20px)',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: '#18181b',
                                                    border: '2px solid #fa3f7a',
                                                    color: '#ffffff',
                                                    padding: '12px 18px',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(250, 63, 122, 0.25)',
                                                    zIndex: 100,
                                                    minWidth: '280px',
                                                    textAlign: 'left',
                                                    animation: 'logoPulseAnimation 0.8s infinite alternate ease-in-out',
                                                    fontFamily: 'Inter, sans-serif',
                                                    pointerEvents: 'none',
                                                    userSelect: 'none'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: '#fa3f7a',
                                                            display: 'inline-block',
                                                            animation: 'glowPulse 1.5s infinite'
                                                        }} />
                                                        <strong style={{ fontSize: '12.5px', color: '#fa3f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            Guia do Logotipo
                                                        </strong>
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#e4e4e7', fontWeight: 500, lineHeight: '1.4' }}>
                                                        Arraste o logotipo para posicioná-lo. Use a alça no canto inferior direito para redimensionar.
                                                    </div>
                                                    {/* Down pointer arrow */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-7px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%) rotate(45deg)',
                                                        width: '12px',
                                                        height: '12px',
                                                        background: '#18181b',
                                                        borderRight: '2px solid #fa3f7a',
                                                        borderBottom: '2px solid #fa3f7a'
                                                    }} />
                                                </div>
                                            </>
                                        )}
                                        <img src={activeLogoUrl} style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', pointerEvents: 'none', mixBlendMode: 'multiply' }} alt="Logotipo do Certificado" />

                                        {/* Resize handle */}
                                        <div
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                resizingLogoRef.current = true;
                                                resizeLogoStartXRef.current = e.clientX;
                                                resizeLogoStartWidthRef.current = activeLogoPos.width;
                                            }}
                                            style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                right: '-4px',
                                                width: '10px',
                                                height: '10px',
                                                background: '#fa3f7a',
                                                border: '1.5px solid #ffffff',
                                                borderRadius: '50%',
                                                cursor: 'se-resize',
                                                zIndex: 60
                                            }}
                                        />

                                        {/* Remove logo button */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveLogoUrl(null);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                background: '#ef4444',
                                                color: '#ffffff',
                                                borderRadius: '50%',
                                                width: '16px',
                                                height: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '9px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                zIndex: 60
                                            }}
                                        >
                                            ✕
                                        </div>
                                    </div>
                                )}

                                {activeSignatures.map((sig) => {
                                    const isSelected = selectedSignatureId === sig.id;
                                    return (
                                        <div
                                            key={sig.id}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setSelectedSignatureId(sig.id);
                                                setSelectedLogo(false);
                                                setSelectedId('');
                                                if (canvasRef.current) {
                                                    const rect = canvasRef.current.getBoundingClientRect();
                                                    draggingSignatureIdRef.current = sig.id;
                                                    const currentLeftPx = (sig.x / 100) * rect.width;
                                                    const currentTopPx = (sig.y / 100) * rect.height;
                                                    signatureDragOffset.current = {
                                                        x: e.clientX - rect.left - currentLeftPx,
                                                        y: e.clientY - rect.top - currentTopPx
                                                    };
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSignatureId(sig.id);
                                                setSelectedLogo(false);
                                                setSelectedId('');
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: `${sig.x}%`,
                                                top: `${sig.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                width: `${sig.width}px`,
                                                cursor: 'move',
                                                zIndex: 36,
                                                border: isSelected ? '2px solid #fa3f7a' : '1.5px dashed #fa3f7a',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                background: 'transparent',
                                                userSelect: 'none'
                                            }}
                                            className="canvas-signature-element"
                                            data-sig-id={sig.id}
                                        >
                                            {showSigIndicator && lastAddedSigId === sig.id && (
                                                <>
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 'calc(100% + 20px)',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: '#18181b',
                                                        border: '2px solid #fa3f7a',
                                                        color: '#ffffff',
                                                        padding: '12px 18px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(250,63,122,0.25)',
                                                        zIndex: 100,
                                                        minWidth: '260px',
                                                        textAlign: 'left',
                                                        animation: 'logoPulseAnimation 0.8s infinite alternate ease-in-out',
                                                        fontFamily: 'Inter, sans-serif',
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                            <span style={{
                                                                width: '8px', height: '8px', borderRadius: '50%',
                                                                background: '#fa3f7a', display: 'inline-block',
                                                                animation: 'glowPulse 1.5s infinite'
                                                            }} />
                                                            <strong style={{ fontSize: '12.5px', color: '#fa3f7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                Guia da Assinatura
                                                            </strong>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#e4e4e7', fontWeight: 500, lineHeight: '1.4' }}>
                                                            Arraste para posicionar. Use a alça no canto inferior direito para redimensionar.
                                                        </div>
                                                        {/* Down pointer arrow */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '-7px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%) rotate(45deg)',
                                                            width: '12px',
                                                            height: '12px',
                                                            background: '#18181b',
                                                            borderRight: '2px solid #fa3f7a',
                                                            borderBottom: '2px solid #fa3f7a'
                                                        }} />
                                                    </div>
                                                </>
                                            )}
                                            <img src={sig.url} style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', pointerEvents: 'none', mixBlendMode: 'multiply' }} alt="Assinatura do Certificado" />

                                            {/* Resize handle */}
                                            <div
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    resizingSignatureIdRef.current = sig.id;
                                                    resizeSignatureStartXRef.current = e.clientX;
                                                    resizeSignatureStartWidthRef.current = sig.width;
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '-4px',
                                                    right: '-4px',
                                                    width: '10px',
                                                    height: '10px',
                                                    background: '#fa3f7a',
                                                    border: '1.5px solid #ffffff',
                                                    borderRadius: '50%',
                                                    cursor: 'se-resize',
                                                    zIndex: 60
                                                }}
                                            />

                                            {/* Remove signature button */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveSignatures(prev => prev.filter(s => s.id !== sig.id));
                                                    if (selectedSignatureId === sig.id) {
                                                        setSelectedSignatureId(null);
                                                    }
                                                    if (courseId && sig.dbId) {
                                                        void api.delete(`/courses/${courseId}/signatures/${sig.dbId}`).catch(() => { });
                                                    }
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    background: '#ef4444',
                                                    color: '#ffffff',
                                                    borderRadius: '50%',
                                                    width: '16px',
                                                    height: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '9px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                    zIndex: 60
                                                }}
                                            >
                                                ✕
                                            </div>
                                        </div>
                                    );
                                })}

                                {elements.filter((el) => (el.page || 1) === currentPage).map((el) => {
                                    const isSelected = el.id === selectedId;
                                    const isEditing = el.id === editingId;
                                    const fontStyle = el.fontStyle === 'italic' ? 'italic' : 'normal';
                                    const textDecor = el.textDecoration === 'underline' ? 'underline' : 'none';
                                    const shouldPulse = el.id === 'edit-me' && !hasClickedEditMe;

                                    return (
                                        <div
                                            key={el.id}
                                            id={`canvas-el-${el.id}`}
                                            onMouseDown={(e) => {
                                                const target = e.target as HTMLElement;
                                                const isInsideEditable = target.closest('[contenteditable="true"]');
                                                if (isEditing && isInsideEditable) {
                                                    // Se o elemento está ativo em modo de edição e o clique foi no texto,
                                                    // permite a seleção e posicionamento nativo do cursor sem arrastar
                                                    return;
                                                }
                                                e.stopPropagation();
                                                // Permite o arraste a partir da borda do elemento
                                                handleMouseDown(e, el.id, editingId === el.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onDoubleClick={(e) => {
                                                if (el.type === 'line') return;
                                                if (editingId === el.id) return;
                                                saveHistory(elements);
                                                const offsets = getSelectionCharacterOffsets(e.currentTarget);
                                                setEditingId(el.id);
                                                e.stopPropagation();
                                                setTimeout(() => {
                                                    if (contentEditableRef.current) {
                                                        contentEditableRef.current.focus();
                                                        setSelectionCharacterOffsets(contentEditableRef.current, offsets.start, offsets.end);
                                                    }
                                                }, 50);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: `${el.x}%`,
                                                top: `${el.y}%`,
                                                transform: el.type === 'line'
                                                    ? 'translate(-50%, -50%)'
                                                    : (el.pdfPositioned ? 'none' : 'translate(-50%, 0)'),
                                                fontSize: `${el.fontSize}px`,
                                                color: el.color,
                                                fontFamily: `'${el.fontFamily}', sans-serif`,
                                                fontWeight: el.fontWeight,
                                                fontStyle: fontStyle,
                                                textDecoration: textDecor,
                                                textAlign: el.textAlign,
                                                // Use the stored element width so text wraps consistently with the View HTML output.
                                                width: `${el.width}px`,
                                                maxWidth: 'none',
                                                lineHeight: el.lineHeight ?? '1.45',
                                                height: el.type === 'line'
                                                    ? `${Math.max(1, el.fontSize || 3)}px`
                                                    : 'fit-content',
                                                minHeight: (el.type !== 'line' && el.height) ? `${el.height}px` : 'auto',
                                                display: 'inline-block',
                                                overflow: 'visible',
                                                whiteSpace: el.pdfPositioned ? 'pre' : 'pre-wrap',
                                                wordBreak: el.pdfPositioned ? 'normal' : 'break-word',
                                                overflowWrap: el.pdfPositioned ? 'normal' : 'break-word',
                                                cursor: draggingId === el.id ? 'grabbing' : 'grab',
                                                padding: el.type === 'line' || el.pdfPositioned ? '0px' : '0px 4px',
                                                borderRadius: el.type === 'line' ? '0px' : '4px',
                                                userSelect: isEditing ? 'text' : 'none',
                                                transition: 'border-color 0.15s, box-shadow 0.15s',
                                                border: shouldPulse ? '2px solid #fa3f7a' : (isSelected ? '2px solid #3b82f6' : '2px dashed transparent'),
                                                boxShadow: shouldPulse ? '0 0 12px rgba(250, 63, 122, 0.6)' : 'none',
                                                animation: shouldPulse ? 'glowPulse 1.5s infinite ease-in-out' : 'none',
                                                zIndex: isSelected ? 99999 : 10
                                            }}
                                            className="canvas-text-element"
                                        >
                                            {/* Bounding box resize handles and rotate controls */}
                                            {isSelected && (
                                                <>
                                                    <style>{`
                                                     @keyframes resizeExpandLeft {
                                                         0% { transform: translateY(-50%) translateX(0) scale(1); }
                                                         50% { transform: translateY(-50%) translateX(-8px) scale(1.25); }
                                                         100% { transform: translateY(-50%) translateX(0) scale(1); }
                                                     }
                                                     @keyframes resizeExpandRight {
                                                         0% { transform: translateY(-50%) translateX(0) scale(1); }
                                                         50% { transform: translateY(-50%) translateX(8px) scale(1.25); }
                                                         100% { transform: translateY(-50%) translateX(0) scale(1); }
                                                     }
                                                     @keyframes hintFade {
                                                         0% { opacity: 0; transform: translate(-50%, 10px); }
                                                         15% { opacity: 0.95; transform: translate(-50%, 0); }
                                                         85% { opacity: 0.95; transform: translate(-50%, 0); }
                                                         100% { opacity: 0; transform: translate(-50%, -10px); }
                                                     }
                                                 `}</style>

                                                    {/* Left Resize Double-Arrow Handle */}
                                                    <div
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            saveHistory(elements);
                                                            resizeStartElementsRef.current = elements;
                                                            resizingIdRef.current = el.id;
                                                            resizingDirectionRef.current = 'left';
                                                            resizeStartXRef.current = e.clientX;
                                                            resizeStartWidthRef.current = el.width;
                                                            resizeStartXPercentRef.current = el.x;
                                                            const elDom = document.getElementById(`canvas-el-${el.id}`);
                                                            resizeStartHeightRef.current = el.height || (elDom ? elDom.getBoundingClientRect().height / canvasScale : 50);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            left: '-12px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%) scale(1)',
                                                            width: '24px',
                                                            height: '24px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'ew-resize',
                                                            zIndex: 999999,
                                                            animation: showResizeHintId === el.id ? 'resizeExpandLeft 1.2s ease-in-out infinite' : 'none',
                                                            transition: 'transform 0.15s ease-in-out'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                                        }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.45))' }}>
                                                            <path d="M3 12H21M3 12L8 7M3 12L8 17M21 12L16 7M21 12L16 17" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>

                                                    {/* Right Resize Double-Arrow Handle */}
                                                    <div
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            saveHistory(elements);
                                                            resizeStartElementsRef.current = elements;
                                                            resizingIdRef.current = el.id;
                                                            resizingDirectionRef.current = 'right';
                                                            resizeStartXRef.current = e.clientX;
                                                            resizeStartWidthRef.current = el.width;
                                                            resizeStartXPercentRef.current = el.x;
                                                            const elDom = document.getElementById(`canvas-el-${el.id}`);
                                                            resizeStartHeightRef.current = el.height || (elDom ? elDom.getBoundingClientRect().height / canvasScale : 50);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '-12px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%) scale(1)',
                                                            width: '24px',
                                                            height: '24px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'ew-resize',
                                                            zIndex: 999999,
                                                            animation: showResizeHintId === el.id ? 'resizeExpandRight 1.2s ease-in-out infinite' : 'none',
                                                            transition: 'transform 0.15s ease-in-out'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                                        }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.45))' }}>
                                                            <path d="M3 12H21M3 12L8 7M3 12L8 17M21 12L16 7M21 12L16 17" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>

                                                    {/* Top Resize Handle */}
                                                    {el.type !== 'line' && (
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                saveHistory(elements);
                                                                resizeStartElementsRef.current = elements;
                                                                resizingIdRef.current = el.id;
                                                                resizingDirectionRef.current = 'top';
                                                                resizeStartYRef.current = e.clientY;
                                                                const elDom = document.getElementById(`canvas-el-${el.id}`);
                                                                resizeStartHeightRef.current = el.height || (elDom ? elDom.getBoundingClientRect().height / canvasScale : 50);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '-12px',
                                                                left: '50%',
                                                                transform: 'translateX(-50%) scale(1)',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'ns-resize',
                                                                zIndex: 999999,
                                                                transition: 'transform 0.15s ease-in-out'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'translateX(-50%) scale(1.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                                                            }}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)', filter: 'drop-shadow(0px -2px 4px rgba(0, 0, 0, 0.45))' }}>
                                                                <path d="M12 3V21M12 3L7 8M12 3L17 8M12 21L7 16M12 21L17 16" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    {/* Bottom Resize Handle */}
                                                    {el.type !== 'line' && (
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                saveHistory(elements);
                                                                resizeStartElementsRef.current = elements;
                                                                resizingIdRef.current = el.id;
                                                                resizingDirectionRef.current = 'bottom';
                                                                resizeStartYRef.current = e.clientY;
                                                                const elDom = document.getElementById(`canvas-el-${el.id}`);
                                                                resizeStartHeightRef.current = el.height || (elDom ? elDom.getBoundingClientRect().height / canvasScale : 50);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: '-12px',
                                                                left: '50%',
                                                                transform: 'translateX(-50%) scale(1)',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'ns-resize',
                                                                zIndex: 999999,
                                                                transition: 'transform 0.15s ease-in-out'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'translateX(-50%) scale(1.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                                                            }}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.45))' }}>
                                                                <path d="M12 3V21M12 3L7 8M12 3L17 8M12 21L7 16M12 21L17 16" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    )}


                                                    {/* Drag End / Double Click Friendly Hint */}
                                                    {dragEndHintId === el.id && !editingId && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-45px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                                            color: '#ffffff',
                                                            fontSize: '11px',
                                                            fontWeight: 700,
                                                            fontFamily: 'Inter, sans-serif',
                                                            fontStyle: 'normal',
                                                            textDecoration: 'none',
                                                            padding: '6px 14px',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)',
                                                            whiteSpace: 'nowrap',
                                                            pointerEvents: 'none',
                                                            zIndex: 9999999,
                                                            animation: 'logoPulseAnimation 0.8s infinite alternate ease-in-out',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            <FiEdit2 size={12} style={{ animation: 'glowPulse 1s infinite' }} />
                                                            <span>Dê um duplo clique para editar o texto</span>
                                                        </div>
                                                    )}

                                                    {/* Elegant discreet tooltip help text */}
                                                    {showResizeHintText && showResizeHintId === el.id && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: isPasteWarning ? 'unset' : '-45px',
                                                            top: isPasteWarning ? '-52px' : 'unset',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: isPasteWarning ? 'linear-gradient(135deg, #ef4444, #ec4899)' : 'rgba(15, 23, 42, 0.95)',
                                                            border: isPasteWarning ? '2px solid #ffffff' : '1px solid rgba(59, 130, 246, 0.25)',
                                                            color: '#ffffff',
                                                            fontSize: isPasteWarning ? '12px' : '11px',
                                                            fontWeight: 700,
                                                            fontFamily: 'Inter, sans-serif',
                                                            fontStyle: 'normal',
                                                            textDecoration: 'none',
                                                            padding: isPasteWarning ? '8px 16px' : '6px 12px',
                                                            borderRadius: '8px',
                                                            boxShadow: isPasteWarning ? '0 0 25px rgba(239, 68, 68, 0.75), 0 8px 20px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                                            whiteSpace: 'nowrap',
                                                            pointerEvents: 'none',
                                                            zIndex: 9999999,
                                                            animation: isPasteWarning ? 'logoPulseAnimation 0.8s infinite alternate ease-in-out' : 'hintFade 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            {isPasteWarning ? (
                                                                <>
                                                                    <span style={{ fontSize: '15px', animation: 'glowPulse 1s infinite' }}>⚠️</span>
                                                                    <strong>Texto Colado!</strong> Arraste as setas nas bordas do elemento para expandir o tamanho da caixa de texto
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontSize: '16px' }}>↔</span> Arraste as setas para aumentar a caixa de texto
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Drag and Rotate visual widgets */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-36px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        zIndex: 100,
                                                        // CSS reset to prevent inheriting font styles from parent cert element
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: 'normal',
                                                        fontStyle: 'normal',
                                                        textDecoration: 'none',
                                                        color: '#1e293b'
                                                    }}>
                                                        {/* Edit button */}
                                                        {el.type !== 'line' && (
                                                            <div
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setEditingId(el.id);
                                                                }}
                                                                style={{
                                                                    width: '26px',
                                                                    height: '26px',
                                                                    borderRadius: '50%',
                                                                    background: '#dbeafe',
                                                                    border: '1px solid #93c5fd',
                                                                    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.2)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    color: '#2563eb',
                                                                    transition: 'all 0.2s ease-in-out'
                                                                }}
                                                                title="Editar texto"
                                                            >
                                                                <FiEdit2 size={13} />
                                                            </div>
                                                        )}
                                                        {/* Save button (beautiful green circular theme) */}
                                                        {el.type !== 'line' && (
                                                            <div
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleInputBlur(el.id, el.text);
                                                                    setSelectedId('');
                                                                }}
                                                                style={{
                                                                    width: '26px',
                                                                    height: '26px',
                                                                    borderRadius: '50%',
                                                                    background: '#dcfce7', // light soft green
                                                                    border: '1px solid #bbf7d0', // green border
                                                                    boxShadow: '0 2px 5px rgba(22, 163, 74, 0.2)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    color: '#16a34a',
                                                                    transition: 'all 0.2s ease-in-out'
                                                                }}
                                                                title="Salvar"
                                                            >
                                                                <FiCheck size={13} />
                                                            </div>
                                                        )}

                                                        {/* Trash button (highly evident, same shape but with red theme) */}
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                Swal.fire({
                                                                    title: 'Excluir elemento?',
                                                                    text: 'Você tem certeza que deseja remover este bloco de texto do certificado?',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#ef4444',
                                                                    cancelButtonColor: '#6b7280',
                                                                    confirmButtonText: 'Sim, excluir',
                                                                    cancelButtonText: 'Cancelar',
                                                                    background: '#18181b',
                                                                    color: '#f4f4f5'
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        saveHistory(elements);
                                                                        setElements(prev => prev.filter(item => item.id !== el.id));
                                                                        setSelectedId('');
                                                                        setEditingId(null);
                                                                    }
                                                                });
                                                            }}
                                                            style={{
                                                                width: '26px',
                                                                height: '26px',
                                                                borderRadius: '50%',
                                                                background: '#fee2e2', // beautiful soft pastel red
                                                                border: '1px solid #fca5a5', // light red border
                                                                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                color: '#ef4444',
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                        >
                                                            <FiTrash2 size={13} />
                                                        </div>

                                                        {/* Rotate button */}
                                                        <div style={{
                                                            width: '26px',
                                                            height: '26px',
                                                            borderRadius: '50%',
                                                            background: '#ffffff',
                                                            border: '1px solid #cbd5e1',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: '#475569'
                                                        }}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                        >
                                                            <FiRotateCw size={13} />
                                                        </div>
                                                        {/* Move button */}
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleMouseDown(e, el.id, true);
                                                            }}
                                                            style={{
                                                                width: '26px',
                                                                height: '26px',
                                                                borderRadius: '50%',
                                                                background: '#ffffff',
                                                                border: '1px solid #cbd5e1',
                                                                boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'grab',
                                                                color: '#475569'
                                                            }}
                                                        >
                                                            <FiMove size={13} />
                                                        </div>


                                                    </div>
                                                    {/* Floating Toolbar — rendered via Portal to escape overflow:auto parent */}
                                                    {false && createPortal(
                                                        <div
                                                            data-toolbar-portal="true"
                                                            style={{
                                                                position: 'fixed',
                                                                top: `${Math.max(toolbarRect.top - 14, 8)}px`,
                                                                left: el.x > 50
                                                                    ? `${toolbarRect.left + toolbarRect.width}px`
                                                                    : el.x < 30
                                                                        ? `${toolbarRect.left}px`
                                                                        : `${toolbarRect.left + toolbarRect.width / 2}px`,
                                                                transform: el.x > 50
                                                                    ? 'translate(-100%, -100%)'
                                                                    : el.x < 30
                                                                        ? 'translateY(-100%)'
                                                                        : 'translate(-50%, -100%)',
                                                                background: '#1a1a1e',
                                                                border: '1px solid #2d2d34',
                                                                borderRadius: '11px',
                                                                padding: '10px 14px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'stretch',
                                                                gap: '8px',
                                                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                                                whiteSpace: 'nowrap',
                                                                zIndex: 9999999,
                                                                fontFamily: 'Inter, sans-serif',
                                                                fontSize: '18px',
                                                                fontWeight: 'normal',
                                                                fontStyle: 'normal',
                                                                textDecoration: 'none',
                                                                color: '#cbd5e1',
                                                                lineHeight: '1.2',
                                                                letterSpacing: 'normal',
                                                                pointerEvents: 'auto'
                                                            }}
                                                            onMouseDown={(e) => {
                                                                // Save selection before toolbar steals focus
                                                                const sel = window.getSelection();
                                                                if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                                                                    savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
                                                                } else {
                                                                    savedSelectionRef.current = null;
                                                                }
                                                                e.preventDefault(); // Prevent contenteditable blur
                                                                e.stopPropagation();
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <style>{`
                                                             @keyframes tourFadeIn {
                                                                 0% { opacity: 0; transform: translate(-50%, 10px) scale(0.96); }
                                                                 100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                                                             }
                                                             @keyframes pulseGlowPink {
                                                                 0% { box-shadow: 0 0 0 0 rgba(250, 63, 122, 0.6); }
                                                                 70% { box-shadow: 0 0 0 6px rgba(250, 63, 122, 0); }
                                                                 100% { box-shadow: 0 0 0 0 rgba(250, 63, 122, 0); }
                                                             }
                                                             @keyframes pulseGlowBlue {
                                                                 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
                                                                 70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
                                                                 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                                                             }
                                                         `}</style>

                                                            {/* Onboarding Guide Step 1: Font and Style controls */}
                                                            {tourStep === 1 && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '-90px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)',
                                                                    background: 'rgba(20, 20, 25, 0.98)',
                                                                    border: '2px solid #fa3f7a',
                                                                    borderRadius: '12px',
                                                                    padding: '14px 22px',
                                                                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(250, 63, 122, 0.45)',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '4px',
                                                                    zIndex: 99999999,
                                                                    fontFamily: 'Inter, sans-serif',
                                                                    animation: 'tourFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontSize: '15px' }}>✨</span>
                                                                        <span style={{ color: '#fa3f7a', fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px' }}>
                                                                            PERSONALIZE SEU TEXTO
                                                                        </span>
                                                                    </div>
                                                                    <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left' }}>
                                                                        Altere a fonte, aumente/diminua o tamanho, aplique negrito, itálico, cores e alinhamento aqui!
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

                                                            {/* Onboarding Guide Step 2: Fast Masks Row */}
                                                            {tourStep === 2 && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '-90px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)',
                                                                    background: 'rgba(20, 20, 25, 0.98)',
                                                                    border: '2px solid #3b82f6',
                                                                    borderRadius: '12px',
                                                                    padding: '14px 22px',
                                                                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(59, 130, 246, 0.45)',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '4px',
                                                                    zIndex: 99999999,
                                                                    fontFamily: 'Inter, sans-serif',
                                                                    animation: 'tourFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontSize: '15px' }}>🏷️</span>
                                                                        <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px' }}>
                                                                            MÁSCARAS RÁPIDAS
                                                                        </span>
                                                                    </div>
                                                                    <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left' }}>
                                                                        Insira tags dinâmicas para preenchimento automático de Nome do Aluno, Curso, CPF e mais!
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
                                                                        borderRight: '2px solid #3b82f6',
                                                                        borderBottom: '2px solid #3b82f6',
                                                                    }} />
                                                                </div>
                                                            )}

                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                borderRadius: '6px',
                                                                padding: '2px',
                                                                animation: tourStep === 1 ? 'pulseGlowPink 2s infinite' : 'none',
                                                                transition: 'all 0.3s ease'
                                                            }}>
                                                                <span
                                                                    onClick={() => setEditingId(el.id)}
                                                                    style={{
                                                                        background: '#fa3f7a',
                                                                        color: 'white',
                                                                        fontSize: '15px',
                                                                        fontFamily: 'Inter, sans-serif',
                                                                        fontWeight: 600,
                                                                        fontStyle: 'normal',
                                                                        textDecoration: 'none',
                                                                        padding: '5px 14px',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        display: 'inline-block',
                                                                        lineHeight: '1'
                                                                    }}
                                                                >
                                                                    Editar
                                                                </span>
                                                                <div style={{ width: '1px', height: '18px', background: '#3f3f46' }}></div>
                                                                <SearchableFontSelect
                                                                    key={`floating_${el.id}`}
                                                                    value={el.fontFamily}
                                                                    onChange={(val) => applyStyle('fontFamily', val)}
                                                                    width="150px"
                                                                    direction="down"
                                                                />
                                                                <div style={{ width: '1px', height: '18px', background: '#3f3f46' }}></div>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <style>{`
                                                                 .color-picker-input::-webkit-color-swatch-wrapper {
                                                                     padding: 0;
                                                                 }
                                                                 .color-picker-input::-webkit-color-swatch {
                                                                     border: none;
                                                                     border-radius: 4px;
                                                                 }
                                                                 .color-picker-input::-moz-color-swatch {
                                                                     border: none;
                                                                     border-radius: 4px;
                                                                 }
                                                            `}</style>
                                                                    <input
                                                                        type="color"
                                                                        value={el.color || '#000000'}
                                                                        onMouseDown={(e) => {
                                                                            // Save selection before color picker steals focus
                                                                            // Do NOT call e.preventDefault() — color picker needs to open
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.stopPropagation(); // Stop portal's onMouseDown from calling preventDefault
                                                                        }}
                                                                        onChange={(e) => applyStyle('color', e.target.value)}
                                                                        className="color-picker-input"
                                                                        style={{
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            padding: 0,
                                                                            border: '1px solid #3f3f46',
                                                                            borderRadius: '6px',
                                                                            background: '#27272a',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Cor do Texto"
                                                                    />
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontStyle: 'normal', textDecoration: 'none' }}>
                                                                    <style>{`
                                                                 .no-spinners::-webkit-outer-spin-button,
                                                                 .no-spinners::-webkit-inner-spin-button {
                                                                     -webkit-appearance: none;
                                                                     margin: 0;
                                                                 }
                                                                 .no-spinners {
                                                                     -moz-appearance: textfield;
                                                                 }
                                                            `}</style>
                                                                    <button
                                                                        onClick={() => {
                                                                            const base = toolbarFontSize;
                                                                            const minVal = el.type === 'line' ? 1 : 8;
                                                                            const newVal = Math.max(minVal, Number(base) - 1);
                                                                            setToolbarFontSize(newVal);
                                                                            applyStyle('fontSize', newVal);
                                                                        }}
                                                                        onMouseDown={(e) => {
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        style={{
                                                                            background: '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px 0 0 6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                        value={toolbarFontSize}
                                                                        onMouseDown={(e) => {
                                                                            // Save selection before input steals focus (without preventDefault so typing works)
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.stopPropagation();
                                                                        }}
                                                                        onChange={(e) => {
                                                                            const valStr = e.target.value;
                                                                            setToolbarFontSize(valStr);

                                                                            const rawVal = parseInt(valStr);
                                                                            if (!isNaN(rawVal)) {
                                                                                const minVal = el.type === 'line' ? 1 : 8;
                                                                                const maxVal = el.type === 'line' ? 50 : 150;
                                                                                const newVal = Math.min(maxVal, Math.max(minVal, rawVal));
                                                                                applyStyle('fontSize', newVal);
                                                                            }
                                                                        }}
                                                                        className="no-spinners"
                                                                        style={{
                                                                            width: '38px',
                                                                            height: '28px',
                                                                            background: '#27272a',
                                                                            borderTop: '1px solid #3f3f46',
                                                                            borderBottom: '1px solid #3f3f46',
                                                                            borderLeft: 'none',
                                                                            borderRight: 'none',
                                                                            color: '#f4f4f5',
                                                                            textAlign: 'center',
                                                                            fontSize: '12px',
                                                                            outline: 'none',
                                                                            fontWeight: '600'
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const base = toolbarFontSize;
                                                                            const maxVal = el.type === 'line' ? 50 : 150;
                                                                            const newVal = Math.min(maxVal, Number(base) + 1);
                                                                            setToolbarFontSize(newVal);
                                                                            applyStyle('fontSize', newVal);
                                                                        }}
                                                                        onMouseDown={(e) => {
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        style={{
                                                                            background: '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '0 6px 6px 0',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <div style={{ width: '1px', height: '18px', background: '#3f3f46' }}></div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            const isBold = ['600', 'bold', '700', '800', '900'].includes(el.fontWeight || '');
                                                                            applyStyle('fontWeight', isBold ? '500' : '600');
                                                                        }}
                                                                        onMouseDown={(e) => {
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        style={{
                                                                            background: ['600', 'bold', '700', '800', '900'].includes(el.fontWeight || '') ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <FiBold size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => applyStyle('fontStyle', el.fontStyle === 'italic' ? 'normal' : 'italic')}
                                                                        onMouseDown={(e) => {
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        style={{
                                                                            background: el.fontStyle === 'italic' ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <FiItalic size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => applyStyle('textDecoration', el.textDecoration === 'underline' ? 'none' : 'underline')}
                                                                        onMouseDown={(e) => {
                                                                            const s = window.getSelection();
                                                                            if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                                                savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                                            }
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        style={{
                                                                            background: el.textDecoration === 'underline' ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <FiUnderline size={12} />
                                                                    </button>
                                                                </div>
                                                                <div style={{ width: '1px', height: '18px', background: '#3f3f46' }}></div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <button
                                                                        onClick={() => applyStyle('textAlign', 'left')}
                                                                        style={{
                                                                            background: isAlignActive('left') ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Alinhar à Esquerda"
                                                                    >
                                                                        <FiAlignLeft size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => applyStyle('textAlign', 'center')}
                                                                        style={{
                                                                            background: isAlignActive('center') ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Centralizar"
                                                                    >
                                                                        <FiAlignCenter size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => applyStyle('textAlign', 'right')}
                                                                        style={{
                                                                            background: isAlignActive('right') ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Alinhar à Direita"
                                                                    >
                                                                        <FiAlignRight size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => applyStyle('textAlign', 'justify')}
                                                                        style={{
                                                                            background: isAlignActive('justify') ? '#fa3f7a' : '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#f4f4f5',
                                                                            borderRadius: '6px',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Justificar"
                                                                    >
                                                                        <FiAlignJustify size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Divider */}
                                                            <div style={{ width: '100%', height: '1px', background: '#2d2d34', margin: '2px 0' }}></div>

                                                            {/* Horizontal Scrollable Quick Masks Row */}
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                width: '100%',
                                                                flexWrap: 'wrap',
                                                                padding: '6px 8px',
                                                                background: '#141417',
                                                                borderRadius: '6px',
                                                                border: tourStep === 2 ? '1px solid #3b82f6' : '1px solid #27272a',
                                                                whiteSpace: 'normal',
                                                                animation: tourStep === 2 ? 'pulseGlowBlue 2s infinite' : 'none',
                                                                transition: 'all 0.3s ease'
                                                            }}>

                                                                {[
                                                                    { key: 'nome_aluno', label: 'Nome Aluno' },
                                                                    { key: 'cpf_aluno', label: 'CPF Aluno' },
                                                                    { key: 'rg_aluno', label: 'RG Aluno' },
                                                                    { key: 'funcao_aluno', label: 'Função Aluno' },
                                                                    { key: 'nome_curso', label: 'Nome Curso' },
                                                                    { key: 'carga_horaria', label: 'Carga Horária' },
                                                                    { key: 'periodo_curso', label: 'Período Curso' },
                                                                    { key: 'data_de_emissao', label: 'Data Emissão' },
                                                                    { key: 'nome_empresa', label: 'Nome Empresa' },
                                                                    { key: 'responsavel_empresarial', label: 'Resp. Empresarial' },
                                                                    { key: 'nome_instrutor', label: 'Nome Instrutor' },
                                                                    { key: 'formacao_instrutor', label: 'Formação Instrutor' },
                                                                    { key: 'crea_instrutor', label: 'CREA Instrutor' },
                                                                    { key: 'data_validade', label: 'Validade' },
                                                                    { key: 'cidade_de_realizacao', label: 'Cidade' }
                                                                ].map((m) => (
                                                                    <button
                                                                        key={m.key}
                                                                        onMouseDown={(e) => {
                                                                            e.stopPropagation();
                                                                            e.preventDefault();
                                                                            insertMaskAtCursor(m.key);
                                                                        }}
                                                                        style={{
                                                                            background: '#27272a',
                                                                            border: '1px solid #3f3f46',
                                                                            color: '#e4e4e7',
                                                                            borderRadius: '12px',
                                                                            padding: '2px 8px',
                                                                            fontSize: '10px',
                                                                            fontWeight: 600,
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s ease',
                                                                            flexShrink: 0,
                                                                            fontFamily: 'Inter, sans-serif'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.borderColor = '#fa3f7a';
                                                                            e.currentTarget.style.color = '#fa3f7a';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.borderColor = '#3f3f46';
                                                                            e.currentTarget.style.color = '#e4e4e7';
                                                                        }}
                                                                    >
                                                                        {m.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </>
                                            )}

                                            {el.type === 'line' ? (
                                                <div style={{ width: '100%', height: '100%', minHeight: '2px', background: 'currentColor' }} />
                                            ) : isEditing ? (
                                                <div
                                                    ref={contentEditableRef}
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onDragStart={(e) => e.preventDefault()}
                                                    onPaste={(e) => {
                                                        e.preventDefault();
                                                        setIsPasteWarning(true);
                                                        setShowResizeHintId(el.id);
                                                        setShowResizeHintText(true);
                                                        if (pasteTimerRef.current) {
                                                            clearTimeout(pasteTimerRef.current);
                                                        }
                                                        pasteTimerRef.current = setTimeout(() => {
                                                            setIsPasteWarning(false);
                                                            setShowResizeHintId(null);
                                                            setShowResizeHintText(false);
                                                        }, 6000);

                                                        const html = e.clipboardData.getData('text/html');
                                                        const text = e.clipboardData.getData('text/plain');

                                                        const selection = window.getSelection();
                                                        if (!selection || selection.rangeCount === 0) return;
                                                        const range = selection.getRangeAt(0);
                                                        range.deleteContents();

                                                        if (html) {
                                                            try {
                                                                const parser = new DOMParser();
                                                                const doc = parser.parseFromString(html, 'text/html');

                                                                // Strip background, colors and layout-breaking inline styles
                                                                const allElements = doc.querySelectorAll('*');
                                                                allElements.forEach(item => {
                                                                    if (item instanceof HTMLElement) {
                                                                        const fontFamily = item.style.fontFamily;
                                                                        const fontSize = item.style.fontSize;
                                                                        const fontWeight = item.style.fontWeight;
                                                                        const fontStyle = item.style.fontStyle;
                                                                        const textDecoration = item.style.textDecoration;

                                                                        // Remove all inline styles completely
                                                                        item.removeAttribute('style');

                                                                        // Selectively restore ONLY typography styles
                                                                        if (fontFamily) item.style.fontFamily = fontFamily;
                                                                        if (fontSize) item.style.fontSize = fontSize;
                                                                        if (fontWeight) item.style.fontWeight = fontWeight;
                                                                        if (fontStyle) item.style.fontStyle = fontStyle;
                                                                        if (textDecoration) item.style.textDecoration = textDecoration;
                                                                    }
                                                                });

                                                                const cleanHtml = doc.body.innerHTML;
                                                                const fragment = range.createContextualFragment(cleanHtml);
                                                                const lastNode = fragment.lastChild;
                                                                range.insertNode(fragment);

                                                                if (lastNode) {
                                                                    range.setStartAfter(lastNode);
                                                                    range.setEndAfter(lastNode);
                                                                    selection.removeAllRanges();
                                                                    selection.addRange(range);
                                                                }
                                                            } catch (err) {
                                                                console.error('Error parsing clean HTML paste:', err);
                                                                // Fallback to plain text
                                                                const textNode = document.createTextNode(text);
                                                                range.insertNode(textNode);
                                                                range.setStartAfter(textNode);
                                                                range.setEndAfter(textNode);
                                                                selection.removeAllRanges();
                                                                selection.addRange(range);
                                                            }
                                                        } else {
                                                            const textNode = document.createTextNode(text);
                                                            range.insertNode(textNode);
                                                            range.setStartAfter(textNode);
                                                            range.setEndAfter(textNode);
                                                            selection.removeAllRanges();
                                                            selection.addRange(range);
                                                        }
                                                    }}
                                                    onKeyUp={() => {
                                                        const s = window.getSelection();
                                                        if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                            savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                        }
                                                    }}
                                                    onMouseUp={() => {
                                                        const s = window.getSelection();
                                                        if (s && !s.isCollapsed && s.rangeCount > 0) {
                                                            savedSelectionRef.current = s.getRangeAt(0).cloneRange();
                                                        }
                                                    }}
                                                    onInput={(e) => {
                                                        // Store content in a local ref ONLY — do NOT call setElements.
                                                        // Calling setElements here triggers React re-render which
                                                        // reassigns innerHTML (via dangerouslySetInnerHTML) and destroys
                                                        // the active selection and any manual DOM edits.
                                                        // State is persisted on onBlur instead.
                                                        void (e.target as HTMLDivElement); // keep event reference
                                                    }}
                                                    onBlur={(e) => {
                                                        const relatedTarget = e.relatedTarget as HTMLElement | null;
                                                        if (relatedTarget && relatedTarget.closest('[data-toolbar-portal]')) return;
                                                        // Save current DOM state (with rich text edits) to elements state
                                                        if (contentEditableRef.current) {
                                                            const finalHtml = contentEditableRef.current.innerHTML;
                                                            const finalText = contentEditableRef.current.innerText;
                                                            const newHeight = contentEditableRef.current.getBoundingClientRect().height;
                                                            const oldHeight = editingStartHeightRef.current;
                                                            const deltaH = newHeight - oldHeight;

                                                            setElements(prev => {
                                                                const canvasEl = canvasRef.current;
                                                                let deltaYPercent = 0;
                                                                let aLeft = 0;
                                                                let aRight = 0;

                                                                if (canvasEl && deltaH > 1.5) {
                                                                    const canvasRect = canvasEl.getBoundingClientRect();
                                                                    const canvasHeight = canvasRect.height;
                                                                    const canvasWidth = canvasRect.width;
                                                                    deltaYPercent = (deltaH / canvasHeight) * 100;

                                                                    const aWidthPercent = (el.width / canvasWidth) * 100;
                                                                    aLeft = el.x - aWidthPercent / 2;
                                                                    aRight = el.x + aWidthPercent / 2;
                                                                }

                                                                return prev.map(el2 => {
                                                                    if (el2.id === el.id) {
                                                                        return { ...el2, html: finalHtml, text: finalText };
                                                                    }

                                                                    if (deltaYPercent > 0 && el2.id !== el.id && (el2.page || 1) === (el.page || 1) && el2.y > el.y) {
                                                                        const canvasEl = canvasRef.current;
                                                                        if (canvasEl) {
                                                                            const canvasWidth = canvasEl.getBoundingClientRect().width;
                                                                            const el2WidthPercent = (el2.width / canvasWidth) * 100;
                                                                            const el2Left = el2.x - el2WidthPercent / 2;
                                                                            const el2Right = el2.x + el2WidthPercent / 2;

                                                                            // Check horizontal overlap
                                                                            const hasHorizontalOverlap = Math.max(aLeft, el2Left) < Math.min(aRight, el2Right);
                                                                            if (hasHorizontalOverlap) {
                                                                                return { ...el2, y: Math.min(100, el2.y + deltaYPercent) };
                                                                            }
                                                                        }
                                                                    }
                                                                    return el2;
                                                                });
                                                            });
                                                            handleInputBlur(el.id, finalText);
                                                        } else {
                                                            handleInputBlur(el.id, el.text);
                                                        }
                                                        savedSelectionRef.current = null;
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: el.html ?? el.text }}
                                                    style={{
                                                        width: '100%',
                                                        height: el.height ? '100%' : 'fit-content',
                                                        minHeight: '100%',
                                                        border: 'none',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        color: el.color,
                                                        fontFamily: 'inherit',
                                                        fontSize: 'inherit',
                                                        fontWeight: 'inherit',
                                                        fontStyle: 'inherit',
                                                        textAlign: el.textAlign,
                                                        lineHeight: 'inherit',
                                                        overflow: 'hidden',
                                                        whiteSpace: el.pdfPositioned ? 'pre' : 'pre-wrap',
                                                        wordBreak: el.pdfPositioned ? 'normal' : 'break-word',
                                                        cursor: 'text'
                                                    }}
                                                />
                                            ) : (
                                                el.html
                                                    ? <div
                                                        dangerouslySetInnerHTML={{ __html: el.html }}
                                                        style={{
                                                            whiteSpace: el.pdfPositioned ? 'pre' : 'pre-wrap',
                                                            wordBreak: el.pdfPositioned ? 'normal' : 'break-word',
                                                            lineHeight: 'inherit',
                                                            overflow: 'hidden',
                                                        }}
                                                    />
                                                    : el.text
                                            )}
                                        </div>
                                    );
                                })}


                            </div>

                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
});

export default MasterCourseCreate;
