import { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { ThemeChanger } from '../../../redux/action';
import store from '../../../redux/store';
import logo1 from "../../../assets/images/brand-logos/desktop-logo.png";
import SimpleBar from 'simplebar-react';
import { getMenuItemsEntity, getMenuItemsCompany, getMenuItemsMaster } from './sidemenu';
import Menuloop from './menuloop';
import AppContext from '../../../AppContext/Context';

interface SidebarProps { }

const Sidebar: FC<SidebarProps> = ({ local_varaiable, ThemeChanger }: any) => {
    const { checkRole, theme: themeApp, user } = useContext(AppContext);
    const [showThemeHint, setShowThemeHint] = useState<boolean>(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('theme_hint_seen');
        if (!hasSeen) {
            setShowThemeHint(true);
        }
    }, []);

    const setThemeMode = (mode: 'light' | 'dark') => {
        const currentTheme = store.getState();

        if (mode === 'dark') {
            ThemeChanger({
                ...currentTheme,
                dataThemeMode: 'dark',
                dataMenuStyles: 'dark',
                dataHeaderStyles: 'dark',
                defaultHeaderStyles: '',
                bodyBg: '',
                Light: '',
                darkBg: '',
                inputBorder: '',
            });

            localStorage.setItem('velvetdarktheme', 'dark');
            localStorage.removeItem('velvetlighttheme');
            localStorage.setItem('velvetMenu', 'dark');
            localStorage.setItem('velvetHeader', 'dark');
            localStorage.removeItem('velvetdefaultHeader');
            localStorage.removeItem('darkBgRGB1');
            localStorage.removeItem('darkBgRGB2');
            localStorage.removeItem('darkBgRGB3');
            localStorage.removeItem('darkBgRGB4');
            return;
        }

        ThemeChanger({
            ...currentTheme,
            dataThemeMode: 'light',
            darkBg: '',
            bodyBg: '',
            Light: '',
            inputBorder: '',
            dataMenuStyles: currentTheme.dataNavLayout == 'horizontal' ? 'light' : 'dark',
            dataHeaderStyles: '',
            defaultHeaderStyles: 'light',
        });

        localStorage.setItem('velvetlighttheme', 'light');
        localStorage.removeItem('velvetdarktheme');
        localStorage.setItem('velvetdefaultHeader', 'light');
        localStorage.removeItem('velvetHeader');
        localStorage.removeItem('darkBgRGB1');
        localStorage.removeItem('darkBgRGB2');
        localStorage.removeItem('darkBgRGB3');
        localStorage.removeItem('darkBgRGB4');
    };

    const handleDismissThemeHint = (e?: any) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        localStorage.setItem('theme_hint_seen', 'true');
        setShowThemeHint(false);
    };

    let MENUITEMS: any = [];
    if (checkRole('Master')) {
        MENUITEMS = getMenuItemsMaster();
    } else if (checkRole('Company')) {
        MENUITEMS = getMenuItemsCompany();
    } else if (checkRole('Entity')) {
        MENUITEMS = getMenuItemsEntity();
    }

    const [menuitems, setMenuitems] = useState<any>(MENUITEMS);

    function closeMenuFn() {
        const closeMenuRecursively = (items: any) => {
            items?.forEach((item: any) => {
                item.active = false;
                closeMenuRecursively(item.children);
            });
        };
        closeMenuRecursively(MENUITEMS);
        setMenuitems((arr: any) => [...arr]);
    }

    useEffect(() => {
        window.addEventListener('resize', menuResizeFn);
    }, []);

    const location = useLocation();

    function Onhover() {
        const theme = store.getState();
        if ((theme.toggled == 'icon-overlay-close' || theme.toggled == 'detached-close') && theme.iconOverlay != 'open') {
            ThemeChanger({ ...theme, "iconOverlay": "open" });
        }
    }

    function Outhover() {
        const theme = store.getState();
        if ((theme.toggled == 'icon-overlay-close' || theme.toggled == 'detached-close') && theme.iconOverlay == 'open') {
            ThemeChanger({ ...theme, "iconOverlay": "" });
        }
    }

    function menuClose() {
        const theme = store.getState();
        if (window.innerWidth <= 992) {
            ThemeChanger({ ...theme, toggled: "close" });
        }
        const overlayElement = document.querySelector("#responsive-overlay") as HTMLElement | null;
        if (overlayElement) {
            overlayElement.classList.remove("active");
        }
        if (theme.dataNavLayout == 'horizontal' || theme.dataNavStyle == 'menu-click' || theme.dataNavStyle == 'icon-click') {
            closeMenuFn();
        }
    }

    useEffect(() => {
        menuClose();
    }, []);

    const WindowPreSize = [window.innerWidth];

    function menuResizeFn() {
        WindowPreSize.push(window.innerWidth);
        if (WindowPreSize.length > 2) { WindowPreSize.shift(); }
        const theme = store.getState();
        if (WindowPreSize.length > 1) {
            if ((WindowPreSize[WindowPreSize.length - 1] < 992) && (WindowPreSize[WindowPreSize.length - 2] >= 992)) {
                ThemeChanger({ ...theme, toggled: "close" });
            }
            if ((WindowPreSize[WindowPreSize.length - 1] >= 992) && (WindowPreSize[WindowPreSize.length - 2] < 992)) {
                ThemeChanger({ ...theme, toggled: theme.dataVerticalStyle == "doublemenu" ? "double-menu-open" : "" });
            }
        }
    }

    const Topup = () => {
        if (window.scrollY > 30 && document.querySelector(".app-sidebar")) {
            document.querySelectorAll(".app-sidebar").forEach((e) => e.classList.add("sticky-pin"));
        } else {
            document.querySelectorAll(".app-sidebar").forEach((e) => e.classList.remove("sticky-pin"));
        }
    };
    window.addEventListener("scroll", Topup);

    const level = 0;
    let hasParent = false;
    let hasParentLevel = 0;

    function setSubmenu(event: any, targetObject: any, MENUITEMS = menuitems) {
        const theme = store.getState();
        if ((window.screen.availWidth <= 992 || theme.dataNavStyle != "icon-hover") && (window.screen.availWidth <= 992 || theme.dataNavStyle != "menu-hover")) {
            if (!event?.ctrlKey) {
                for (const item of MENUITEMS) {
                    if (item.path === targetObject.path) {
                        item.active = true;
                        item.selected = true;
                        setMenuAncestorsActive(item);
                    } else if (!item.active && !item.selected) {
                        item.active = false;
                        item.selected = false;
                    } else {
                        removeActiveOtherMenus(item);
                    }
                    if (item.children && item.children.length > 0) {
                        setSubmenu(event, targetObject, item.children);
                    }
                }
            }
        }
        setMenuitems((arr: any) => [...arr]);
    }

    function getParentObject(obj: any, childObject: any) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && JSON.stringify(obj[key]) === JSON.stringify(childObject)) {
                    return obj;
                }
                if (typeof obj[key] === 'object') {
                    const parentObject: any = getParentObject(obj[key], childObject);
                    if (parentObject !== null) {
                        return parentObject;
                    }
                }
            }
        }
        return null;
    }

    function setMenuAncestorsActive(targetObject: any) {
        const parent = getParentObject(menuitems, targetObject);
        const theme = store.getState();
        if (parent) {
            if (hasParentLevel > 2) {
                hasParent = true;
            }
            parent.active = true;
            parent.selected = true;
            hasParentLevel += 1;
            setMenuAncestorsActive(parent);
        } else if (!hasParent) {
            if (theme.dataVerticalStyle == 'doublemenu') {
                ThemeChanger({ ...theme, toggled: "double-menu-close" });
            }
        }
    }

    function removeActiveOtherMenus(item: any) {
        if (item) {
            if (Array.isArray(item)) {
                for (const val of item) {
                    val.active = false;
                    val.selected = false;
                }
            }
            item.active = false;
            item.selected = false;
            if (item.children && item.children.length > 0) {
                removeActiveOtherMenus(item.children);
            }
        }
    }

    function setMenuUsingUrl(currentPath: any) {
        hasParent = false;
        hasParentLevel = 1;
        const setSubmenuRecursively = (items: any) => {
            items?.forEach((item: any) => {
                if (item.path == '') { }
                else if (item.path === currentPath) {
                    setSubmenu(null, item);
                }
                setSubmenuRecursively(item.children);
            });
        };
        setSubmenuRecursively(MENUITEMS);
    }

    const [previousUrl, setPreviousUrl] = useState('/');

    useEffect(() => {
        const targetElement = document.documentElement;
        const observer = new MutationObserver(handleAttributeChange);
        observer.observe(targetElement, { attributes: true });

        let currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
        if (currentPath !== previousUrl) {
            setMenuUsingUrl(currentPath);
            setPreviousUrl(currentPath);
        }
    }, [location]);

    function toggleSidemenu(event: any, targetObject: any, MENUITEMS = menuitems) {
        const theme = store.getState();
        let element = event.target;
        if (
            (theme.dataNavStyle !== "icon-hover" && theme.dataNavStyle !== "menu-hover") ||
            window.innerWidth < 992 ||
            theme.dataNavLayout !== "horizontal" ||
            (theme.toggled !== "icon-hover-closed" && theme.toggled !== "menu-hover-closed")
        ) {
            for (const item of MENUITEMS) {
                if (item.path === targetObject.path) {
                    if (theme.dataVerticalStyle == 'doublemenu' && item.active) { return; }
                    item.active = !item.active;
                    if (item.active) {
                        closeOtherMenus(MENUITEMS, item);
                    } else {
                        if (theme.dataVerticalStyle == 'doublemenu') {
                            ThemeChanger({ ...theme, toggled: "double-menu-close" });
                        }
                    }
                    setAncestorsActive(MENUITEMS, item);
                } else if (!item.active) {
                    if (theme.dataVerticalStyle != 'doublemenu') {
                        item.active = false;
                    }
                }
                if (item.children && item.children.length > 0) {
                    toggleSidemenu(event, targetObject, item.children);
                }
            }
            if (targetObject?.children && targetObject.active) {
                if (theme.dataVerticalStyle == 'doublemenu' && theme.toggled != 'double-menu-open') {
                    ThemeChanger({ ...theme, toggled: "double-menu-open" });
                }
            }
            if (element && theme.dataNavLayout == 'horizontal' && (theme.dataNavStyle == 'menu-click' || theme.dataNavStyle == 'icon-click')) {
                const listItem = element.closest("li");
                if (listItem) {
                    const siblingUL = listItem.querySelector("ul");
                    let outterUlWidth = 0;
                    let listItemUL = listItem.closest('ul:not(.main-menu)');
                    while (listItemUL) {
                        listItemUL = listItemUL.parentElement.closest('ul:not(.main-menu)');
                        if (listItemUL) {
                            outterUlWidth += listItemUL.clientWidth;
                        }
                    }
                    if (siblingUL) {
                        let siblingULRect = listItem.getBoundingClientRect();
                        if (theme.dir == 'rtl') {
                            if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                                targetObject.dirchange = true;
                            } else {
                                targetObject.dirchange = false;
                            }
                        } else {
                            if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                                targetObject.dirchange = true;
                            } else {
                                targetObject.dirchange = false;
                            }
                        }
                        setTimeout(() => {
                            let computedValue = siblingUL.getBoundingClientRect();
                            if ((computedValue.bottom) > window.innerHeight) {
                                siblingUL.style.height = (window.innerHeight - computedValue.top - 8) + 'px';
                                siblingUL.style.overflow = 'auto';
                            }
                        }, 100);
                    }
                }
            }
        }
        setMenuitems((arr: any) => [...arr]);
    }

    function setAncestorsActive(MENUITEMS: any, targetObject: any) {
        const theme = store.getState();
        const parent = findParent(MENUITEMS, targetObject);
        if (parent) {
            parent.active = true;
            if (parent.active) {
                ThemeChanger({ ...theme, toggled: "double-menu-open" });
            }
            setAncestorsActive(MENUITEMS, parent);
        } else {
            if (theme.dataVerticalStyle == "doublemenu") {
                ThemeChanger({ ...theme, toggled: "double-menu-close" });
            }
        }
    }

    function closeOtherMenus(MENUITEMS: any, targetObject: any) {
        for (const item of MENUITEMS) {
            if (item !== targetObject) {
                item.active = false;
                if (item.children && item.children.length > 0) {
                    closeOtherMenus(item.children, targetObject);
                }
            }
        }
    }

    function findParent(MENUITEMS: any, targetObject: any) {
        for (const item of MENUITEMS) {
            if (item.children && item.children.includes(targetObject)) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const parent: any = findParent(MENUITEMS = item.children, targetObject);
                if (parent) {
                    return parent;
                }
            }
        }
        return null;
    }

    const Sideclick = () => {
        if (window.innerWidth > 992) {
            let html = document.documentElement;
            if (html.getAttribute('data-icon-overlay') != 'open') {
                html.setAttribute('data-icon-overlay', 'open');
            }
        }
    };

    function handleAttributeChange(mutationsList: any) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && (mutation.attributeName === 'data-nav-layout' || mutation.attributeName === 'data-vertical-style')) {
                const newValue = mutation.target.getAttribute('data-nav-layout');
                if (newValue == 'vertical') {
                    let currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
                    currentPath = !currentPath ? '/dashboard/ecommerce' : currentPath;
                    setMenuUsingUrl(currentPath);
                } else {
                    closeMenuFn();
                }
            }
        }
    }

    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const theme = useSelector((state: any) => state);
    const [showOrderCounter, setShowOrderCounter] = useState(true);
    const [showSidebarIcon, setShowSidebarIcon] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowOrderCounter(true);
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (
            theme.toggled === "icon-hover-closed" ||
            theme.toggled === "menu-hover-closed" ||
            theme.toggled === "close" ||
            theme.toggled === "icon-overlay-close"
        ) {
            setShowOrderCounter(false);
            setShowSidebarIcon(true);
        } else {
            setShowOrderCounter(true);
            setShowSidebarIcon(false);
        }
    }, [theme.toggled]);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width < 200) {
                    setShowOrderCounter(false);
                } else {
                    setShowOrderCounter(true);
                }
            }
        });

        if (sidebarRef.current) {
            observer.observe(sidebarRef.current);
        }

        return () => {
            if (sidebarRef.current) {
                observer.unobserve(sidebarRef.current);
            }
        };
    }, []);

    const whatsappBg = themeApp?.secondary_color?.length ? themeApp.secondary_color : '#25d366';

    return (
        <Fragment>
            <div id="responsive-overlay" onClick={() => menuClose()}></div>

            <aside
                ref={sidebarRef}
                className="app-sidebar"
                id="sidebar"
                onMouseEnter={() => Onhover()}
                onMouseLeave={() => Outhover()}
                style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
            >
                {/* Logo */}
                <div className="main-sidebar-header">
                    <Link to={`${import.meta.env.BASE_URL}dashboard`} className="header-logo">
                        <img src={logo1} alt="logo" className="desktop-logo" style={{ width: '100px', height: 'auto' }} />
                        <img src={logo1} alt="logo" className="toggle-logo" style={{ width: '100px', height: 'auto' }} />
                        <img src={logo1} alt="logo" className="desktop-dark" style={{ width: '100px', height: 'auto' }} />
                        <img src={logo1} alt="logo" className="toggle-dark" style={{ width: '100px', height: 'auto' }} />
                    </Link>
                </div>

                {/* Scrollable menu */}
                <SimpleBar
                    className="main-sidebar d-flex flex-column"
                    id="sidebar-scroll"
                    style={{ height: '100%', flexGrow: 1 }}
                >
                    <nav className="main-menu-container nav nav-pills flex-column sub-open">
                        <ul className="main-menu" onClick={() => Sideclick()}>
                            {menuitems
                                .filter((item: any) => {
                                    if (['Master'].includes(user?.role?.name) || user?.id == user?.entity?.config?.main_user_id) return true;
                                    return !!user?.menu_items?.filter((menuItem: any) => menuItem.name == item.name).length;
                                })
                                .map((levelone: any) => (
                                    <Fragment key={Math.random()}>
                                        <li
                                            onClick={menuClose}
                                            className={`slide-item ${levelone.menutitle ? 'slide__category' : ''} ${levelone.type === 'link' ? 'slide' : ''} ${levelone.type === 'sub' ? 'slide has-sub' : ''} ${levelone?.active ? 'open' : ''} ${levelone?.selected ? 'active' : ''}`}
                                        >
                                            {levelone.menutitle && (
                                                <span className="category-name">{levelone.menutitle}</span>
                                            )}

                                            {levelone.type === 'link' && (
                                                <Link
                                                    to={levelone.path + '/'}
                                                    className={`side-menu__item ${levelone.selected ? 'active' : ''}`}
                                                >
                                                    <span className="side-menu__icon">{levelone.icon}</span>
                                                    <span className="side-menu__label">
                                                        {levelone.title}
                                                        {levelone.badgetxt && (
                                                            <span className={levelone.class}>{levelone.badgetxt}</span>
                                                        )}
                                                    </span>
                                                </Link>
                                            )}

                                            {levelone.type === 'empty' && (
                                                <Link to="#" className="side-menu__item">
                                                    <span className="side-menu__icon">{levelone.icon}</span>
                                                    <span className="side-menu__label">
                                                        {levelone.title}
                                                        {levelone.badgetxt && (
                                                            <span className={levelone.class}>{levelone.badgetxt}</span>
                                                        )}
                                                    </span>
                                                </Link>
                                            )}

                                            {levelone.type === 'sub' && (
                                                <Menuloop MENUITEMS={levelone} level={level + 1} toggleSidemenu={toggleSidemenu} />
                                            )}
                                        </li>
                                    </Fragment>
                                ))}
                        </ul>
                    </nav>

                    {/* Bottom section */}
                    <div className="sidebar-bottom-section" style={{ position: 'relative' }}>
                        <style>{`
                            @keyframes modern-theme-float {
                                0%, 100% { transform: translateX(-50%) translateY(0); }
                                50% { transform: translateX(-50%) translateY(-6px); }
                            }
                            @keyframes modern-hand-bounce {
                                0%, 100% { transform: translateX(-50%) translateY(0); }
                                50% { transform: translateX(-50%) translateY(6px); }
                            }
                        `}</style>
                        {(showThemeHint && !showSidebarIcon) && (
                            <div className="modern-theme-hint" style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 22px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 1050,
                                width: '220px',
                                background: local_varaiable.dataThemeMode === 'dark' ? '#1e2130' : '#ffffff',
                                border: '2px solid rgb(var(--primary-rgb))',
                                padding: '12px 14px',
                                borderRadius: '16px',
                                boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                pointerEvents: 'auto',
                                cursor: 'default',
                                animation: 'modern-theme-float 2s ease-in-out infinite'
                            }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: '0.9rem' }}>💡</span>
                                    <strong style={{ 
                                        display: 'block', 
                                        color: 'rgb(var(--primary-rgb))', 
                                        fontSize: '0.84rem', 
                                        fontWeight: 800,
                                        letterSpacing: '-0.01em'
                                    }}>
                                        Tema Claro ou Escuro! ✨
                                    </strong>
                                </div>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '0.78rem', 
                                    color: local_varaiable.dataThemeMode === 'dark' ? '#9ca3af' : '#4b5563', 
                                    lineHeight: 1.35, 
                                    textAlign: 'center' 
                                }}>
                                    Clique aqui para alternar o visual da plataforma a qualquer momento.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px', justifyContent: 'center' }}>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setThemeMode('light');
                                            handleDismissThemeHint();
                                        }}
                                        style={{ 
                                            flex: 1,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '4px', 
                                            background: local_varaiable.dataThemeMode === 'light' ? 'rgb(var(--primary-rgb))' : 'rgba(var(--primary-rgb), 0.1)',
                                            border: '1px solid rgb(var(--primary-rgb))',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.72rem',
                                            color: local_varaiable.dataThemeMode === 'light' ? '#ffffff' : 'rgb(var(--primary-rgb))',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'transform 0.15s ease, background 0.2s, color 0.2s',
                                            boxShadow: local_varaiable.dataThemeMode === 'light' ? '0 4px 10px rgba(var(--primary-rgb), 0.2)' : 'none'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <span>☀️ Claro</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setThemeMode('dark');
                                            handleDismissThemeHint();
                                        }}
                                        style={{ 
                                            flex: 1,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '4px', 
                                            background: local_varaiable.dataThemeMode === 'dark' ? 'rgb(var(--primary-rgb))' : 'rgba(var(--primary-rgb), 0.1)',
                                            border: '1px solid rgb(var(--primary-rgb))',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.72rem',
                                            color: local_varaiable.dataThemeMode === 'dark' ? '#ffffff' : 'rgb(var(--primary-rgb))',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'transform 0.15s ease, background 0.2s, color 0.2s',
                                            boxShadow: local_varaiable.dataThemeMode === 'dark' ? '0 4px 10px rgba(var(--primary-rgb), 0.2)' : 'none'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <span>🌙 Escuro</span>
                                    </button>
                                </div>

                                {/* Pointing Hand pointing down towards the switch */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-24px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    animation: 'modern-hand-bounce 1.2s ease-in-out infinite',
                                    pointerEvents: 'none',
                                    zIndex: 1051
                                }}>
                                    <i className="bi bi-hand-index-thumb-fill" style={{
                                        fontSize: '1.5rem',
                                        color: 'rgb(var(--primary-rgb))',
                                        display: 'block',
                                        transform: 'rotate(180deg)',
                                        filter: 'drop-shadow(0 -3px 5px rgba(var(--primary-rgb), 0.45))',
                                    }}></i>
                                </div>
                            </div>
                        )}

                        {!showSidebarIcon && (
                            <div className="sidebar-theme-row">
                                <span>Claro</span>
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="sidebar-theme-switch"
                                        checked={local_varaiable.dataThemeMode === 'dark'}
                                        onChange={(e) => {
                                            setThemeMode(e.target.checked ? 'dark' : 'light');
                                            handleDismissThemeHint();
                                        }}
                                    />
                                </div>
                                <span>Escuro</span>
                            </div>
                        )}

                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://api.whatsapp.com/send?phone=5562995690496&text=Olá! Estou com uma dúvida sobre a plataforma Flash Certificados."
                            className="sidebar-whatsapp-btn"
                            style={{ background: whatsappBg }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                                <path d="M12 1H4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1l3 3 3-3h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z" />
                            </svg>
                            {!showSidebarIcon && 'Dúvidas? Fale Conosco!'}
                        </a>
                    </div>
                </SimpleBar>
            </aside>
        </Fragment>
    );
};

const mapStateToProps = (state: any) => ({
    local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Sidebar);
