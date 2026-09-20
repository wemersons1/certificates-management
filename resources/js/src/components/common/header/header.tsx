import React, { FC, Fragment, useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Dropdown, InputGroup, ListGroup, Modal, Nav, Offcanvas, Tab } from "react-bootstrap";
import { FaRocket } from 'react-icons/fa';
import { getMenuItemsMaster, getMenuItemsCompany, getMenuItemsEntity } from "../sidebar/sidemenu";
import store from "../../../redux/store";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { ThemeChanger } from "../../../redux/action";
//IMAGES
import desktoplogo from "../../../assets/images/brand-logos/desktop-logo.png";
import togglelogo from "../../../assets/images/brand-logos/toggle-logo.png";
import desktopdark from "../../../assets/images/brand-logos/desktop-dark.png";
import toggledark from "../../../assets/images/brand-logos/toggle-dark.png";
import AppContext from "../../../AppContext/Context";
import { firstLetterUppercase } from "../../../lib/helper";
import If from "../if/if";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';
import api from "@/src/lib/api";
import WelcomeAssistant from "@/src/pages/WelcomeAssistant";

interface HeaderProps {
	suppressWelcomeAssistant?: boolean;
}

const Header: FC<HeaderProps> = ({ local_varaiable, ThemeChanger, suppressWelcomeAssistant = false }: any) => {
	const location = useLocation();
	const isNotCheckoutPage = location.pathname !== '/checkout';

	const { signOut, checkRole } = useContext(AppContext);
	const [show3, setShow3] = useState(false);
	const handleClose3 = () => setShow3(false);
	const navigate = useNavigate();
	const { user } = useContext(AppContext);
	const { t } = useTranslation();
	const [notifications, setNotifications] = useState([]);
	const [totalUnread, setTotalUnread] = useState(0);
	const [isPolling, setIsPolling] = useState(false);
	const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
	const [customNotification, setCustomNotification] = useState<{ id: string, title: string, presenceListId?: any, presenceListUuid?: any, type?: string } | null>(null);

	let MENUITEMS: any = [];

	if (checkRole('Master')) {
		MENUITEMS = getMenuItemsMaster();
	} else if (checkRole('Company')) {
		MENUITEMS = getMenuItemsCompany();
	} else if (checkRole('Entity')) {
		MENUITEMS = getMenuItemsEntity();
	}

	function menuClose() {
		const theme = store.getState();
		if (window.innerWidth <= 992) {
			ThemeChanger({ ...theme, toggled: "close" });
		}
		if (window.innerWidth >= 992) {
			ThemeChanger({ ...theme, toggled: local_varaiable.toggled ? local_varaiable.toggled : "" });
		}
	}

	const [_menuitems, setMenuitems] = useState(MENUITEMS);

	function closeMenuFn() {
		const closeMenuRecursively = (items: any[]) => {
			items?.forEach((item: { active: boolean; children: any; }) => {
				item.active = false;
				closeMenuRecursively(item.children);
			});
		};
		closeMenuRecursively(MENUITEMS);
		setMenuitems((arr: any) => [...arr]);
	}
	const toggleSidebar = () => {
		const theme = store.getState();
		const sidemenuType = theme.dataNavLayout;
		if (window.innerWidth >= 992) {
			if (sidemenuType === "vertical") {
				const verticalStyle = theme.dataVerticalStyle;
				const navStyle = theme.dataNavStyle;
				switch (verticalStyle) {
					// closed
					case "closed":
						ThemeChanger({ ...theme, "dataNavStyle": "" });
						if (theme.toggled === "close-menu-close") {
							ThemeChanger({ ...theme, "toggled": "" });
						} else {
							ThemeChanger({ ...theme, "toggled": "close-menu-close" });
						}
						break;
					// icon-overlay
					case "overlay":
						ThemeChanger({ ...theme, "dataNavStyle": "" });
						if (theme.toggled === "icon-overlay-close") {
							ThemeChanger({ ...theme, "toggled": "", "iconOverlay": '' });
						} else {
							if (window.innerWidth >= 992) {
								ThemeChanger({ ...theme, "toggled": "icon-overlay-close", "iconOverlay": '' });
							}
						}
						break;
					// icon-text
					case "icontext":
						ThemeChanger({ ...theme, "dataNavStyle": "" });
						if (theme.toggled === "icon-text-close") {
							ThemeChanger({ ...theme, "toggled": "" });
						} else {
							ThemeChanger({ ...theme, "toggled": "icon-text-close" });
						}
						break;
					// doublemenu
					case "doublemenu":
						ThemeChanger({ ...theme, "dataNavStyle": "" });
						if (theme.toggled === "double-menu-open") {
							ThemeChanger({ ...theme, "toggled": "double-menu-close" });
						} else {
							const sidemenu = document.querySelector(".side-menu__item.active");
							if (sidemenu) {
								if (sidemenu.nextElementSibling) {
									sidemenu.nextElementSibling.classList.add("double-menu-active");
									ThemeChanger({ ...theme, "toggled": "double-menu-open" });
								} else {

									ThemeChanger({ ...theme, "toggled": "double-menu-close" });
								}
							}
						}

						break;
					// detached
					case "detached":
						if (theme.toggled === "detached-close") {
							ThemeChanger({ ...theme, "toggled": "" });

						} else {
							ThemeChanger({ ...theme, "toggled": "detached-close", "iconOverlay": '' });
						}
						break;
					// default
					case "default":
						ThemeChanger({ ...theme, "toggled": "" });

				}
				switch (navStyle) {
					case "menu-click":
						if (theme.toggled === "menu-click-closed") {
							ThemeChanger({ ...theme, "toggled": "" });
						}
						else {
							ThemeChanger({ ...theme, "toggled": "menu-click-closed" });
						}
						break;
					// icon-overlay
					case "menu-hover":
						if (theme.toggled === "menu-hover-closed") {
							ThemeChanger({ ...theme, "toggled": "" });
							closeMenuFn();
						} else {
							ThemeChanger({ ...theme, "toggled": "menu-hover-closed" });
							// setMenuUsingUrl();
						}
						break;
					case "icon-click":
						if (theme.toggled === "icon-click-closed") {
							ThemeChanger({ ...theme, "toggled": "" });
						} else {
							ThemeChanger({ ...theme, "toggled": "icon-click-closed" });

						}
						break;
					case "icon-hover":
						if (theme.toggled === "icon-hover-closed") {
							ThemeChanger({ ...theme, "toggled": "" });
							closeMenuFn();
						} else {
							ThemeChanger({ ...theme, "toggled": "icon-hover-closed" });
							// setMenuUsingUrl();

						}
						break;
				}
			}
		}
		else {
			if (theme.toggled === "close") {
				ThemeChanger({ ...theme, "toggled": "open" });

				setTimeout(() => {
					if (theme.toggled == "open") {
						const overlay = document.querySelector("#responsive-overlay");

						if (overlay) {
							overlay.classList.add("active");
							overlay.addEventListener("click", () => {
								const overlay = document.querySelector("#responsive-overlay");

								if (overlay) {
									overlay.classList.remove("active");
									menuClose();
								}
							});
						}
					}

					window.addEventListener("resize", () => {
						if (window.screen.width >= 992) {
							const overlay = document.querySelector("#responsive-overlay");

							if (overlay) {
								overlay.classList.remove("active");
							}
						}
					});
				}, 100);
			} else {
				ThemeChanger({ ...theme, "toggled": "close" });
			}
		}
	};
	/****fullscreeen */
	const [fullScreen, setFullScreen] = useState(false);

	const toggleFullScreen = () => {
		const elem = document.documentElement;

		if (!document.fullscreenElement) {
			elem.requestFullscreen().then(() => setFullScreen(true));
		} else {
			document.exitFullscreen().then(() => setFullScreen(false));
		}
	};

	const handleFullscreenChange = () => {
		setFullScreen(!!document.fullscreenElement);
	};

	useEffect(() => {
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const searchRef = useRef(null);

	const handleClick = (event: any) => {
		const searchInput: any = searchRef.current;

		if (searchInput && (searchInput === event.target || searchInput.contains(event.target))) {
			document.querySelector(".header-search")?.classList.add("searchdrop");
		} else {
			document.querySelector(".header-search")?.classList.remove("searchdrop");
		}
	};

	useEffect(() => {
		document.body.addEventListener("click", handleClick);

		return () => {
			document.body.removeEventListener("click", handleClick);
		};
	}, []);

	const goToProfile = () => {
		navigate('/profile');
	}

	const changeStoreHandle = () => {
		navigate('/stores');
	}

	//   sticky-pin
	const Topup = () => {
		if (window.scrollY > 30 && document.querySelector(".app-header")) {
			const Scolls = document.querySelectorAll(".app-header");
			Scolls.forEach((e) => {
				e.classList.add("sticky-pin");
			});
		} else {
			const Scolls = document.querySelectorAll(".app-header");
			Scolls.forEach((e) => {
				e.classList.remove("sticky-pin");
			});
		}
	};
	if (typeof window !== "undefined") {
		window.addEventListener("scroll", Topup);
	}

	const fetchNotifications = async () => {
		try {
			const response = await api.get('/last-notifications-details');
			const data = response.data;
			setNotifications(data.notifications);
			setTotalUnread(data.total_dont_read);
		} catch (error: any) {

		}
	};

	const [creditsBalance, setCreditsBalance] = useState<{ total: number; free: number; monthly_yearly: number; addon: number } | null>(null);

	const fetchCredits = () => {
		api.get('/credits/balance')
			.then(res => setCreditsBalance(res.data))
			.catch(err => console.error("Error fetching credit balance in header:", err));
	};

	useEffect(() => {
		fetchCredits();

		const handleCreditsUpdate = () => {
			fetchCredits();
		};
		window.addEventListener('credits-updated', handleCreditsUpdate);
		return () => {
			window.removeEventListener('credits-updated', handleCreditsUpdate);
		};
	}, []);

	useEffect(() => {
		// Initial fetch on mount
		const initFetch = async () => {
			try {
				const response = await api.get('/last-notifications-details');
				const data = response.data;
				setNotifications(data.notifications);
				setTotalUnread(data.total_dont_read);
				if (data.notifications && data.notifications.length > 0) {
					setLastNotificationId(data.notifications[0].id);
				}
			} catch (error) { }
		};
		initFetch();

		// Listen for the custom certificate generation event
		const handleStart = async () => {
			// Update the baseline before starting polling to avoid picking up old notifications
			try {
				const response = await api.get('/last-notifications-details');
				const data = response.data;
				if (data.notifications && data.notifications.length > 0) {
					setLastNotificationId(data.notifications[0].id);
				}
			} catch (error) { }
			setIsPolling(true);
		};

		window.addEventListener('certificate-generation-started', handleStart);
		return () => {
			window.removeEventListener('certificate-generation-started', handleStart);
		};
	}, []);

	useEffect(() => {
		if (!isPolling) return;

		const interval = setInterval(async () => {
			try {
				const response = await api.get('/last-notifications-details');
				const data = response.data;

				// Verify if a new notification arrived
				if (data.notifications && data.notifications.length > 0) {
					const latestNotif = data.notifications[0];
					if (latestNotif.id !== lastNotificationId) {
						// A new notification arrived! Stop polling and show toast.
						setIsPolling(false);
						setLastNotificationId(latestNotif.id);
						setNotifications(data.notifications);
						setTotalUnread(data.total_dont_read);
						fetchCredits();

						let presenceListId: any = null;
						let presenceListUuid: any = null;
						let type = 'certificates_generated';
						try {
							const sourceData = latestNotif.metadata || latestNotif.errors;
							if (sourceData) {
								const parsed = typeof sourceData === 'string'
									? JSON.parse(sourceData)
									: sourceData;
								presenceListId = parsed?.presence_list_id || null;
								presenceListUuid = parsed?.presence_list_uuid || null;
								type = parsed?.type || 'certificates_generated';
							}
						} catch (e) {
							console.error('Erro ao fazer parse dos metadados da notificação:', e);
						}

						setCustomNotification({
							id: latestNotif.id,
							title: latestNotif.title,
							presenceListId: presenceListId,
							presenceListUuid: presenceListUuid,
							type: type
						});
					}
				}
			} catch (error) {
				console.error('[Polling] Erro ao buscar notificações:', error);
			}
		}, 3000); // 3 segundos

		return () => clearInterval(interval);
	}, [isPolling, lastNotificationId]);


	const handleToggleRead = async (notificationId: string, isRead: boolean) => {
		try {
			await api.put(`/notifications/${notificationId}`, { is_read: !isRead });
			setNotifications((prevNotifications: any) =>
				prevNotifications.map((notif: any) =>
					// A correção está aqui:
					// Se a notificação não for a que foi alterada, retorne-a sem modificações.
					notif.id === notificationId ? { ...notif, is_read: !isRead } : notif
				)
			);
			setTotalUnread(prevTotal => isRead ? prevTotal + 1 : prevTotal - 1);
		} catch (error: any) {
			toast.error('Erro ao atualizar notificação.');
		}
	};
	const isDark = local_varaiable?.dataThemeMode === 'dark';
	return (
		<Fragment>
			<style>
				{`
					@keyframes pulse-green {
						0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
						70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
						100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
					}
				`}
			</style>
			<WelcomeAssistant blocked={suppressWelcomeAssistant} />
			<header className="app-header">

				<div className="main-header-container container-fluid">

					<div className="header-content-left">

						<div className="header-element">
							<div className="horizontal-logo">
								<Link to={`${import.meta.env.BASE_URL}dashboard`} className="header-logo">
									<img src={desktoplogo} alt="logo" className="desktop-logo" />
									<img src={togglelogo} alt="logo" className="toggle-logo" />
									<img src={desktopdark} alt="logo" className="desktop-dark" />
									<img src={toggledark} alt="logo" className="toggle-dark" />
								</Link>
							</div>
						</div>

						<div className="header-element">
							<Link aria-label="anchor" to="#" className="sidemenu-toggle header-link" data-bs-toggle="sidebar" onClick={() => toggleSidebar()}>
								<span className="open-toggle me-2">
									<i className="bx bx-menu header-link-icon"></i>
								</span>
								<span className="close-toggle me-2">
									<i className="bx bx-menu header-link-icon"></i>
								</span>
							</Link>
						</div>
					</div>


					<div className="header-content-right">
						{creditsBalance !== null && (
							<div className="d-flex justify-content-center align-items-center my-4 ms-2">
								<Link
									to="/dashboard"
									className="d-flex flex-column align-items-stretch px-3 py-1"
									style={{
										height: '38px',
										minWidth: '140px',
										fontSize: '0.75rem',
										whiteSpace: 'nowrap',
										background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
										border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
										borderRadius: '10px',
										color: isDark ? '#f8fafc' : '#334155',
										fontWeight: 700,
										textDecoration: 'none',
										transition: 'all 0.2s',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
										justifyContent: 'center',
										gap: '3px'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)';
										e.currentTarget.style.transform = 'translateY(-1px)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
										e.currentTarget.style.transform = 'translateY(0)';
									}}
								>
									<div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.65rem', gap: '8px' }}>
										<span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
											<FiAward style={{ fontSize: '0.8rem', color: (creditsBalance.limit - creditsBalance.used <= 5) ? '#ef4444' : '#10b981' }} />
											<strong>{creditsBalance.total}</strong> {creditsBalance.total === 1 ? 'disp.' : 'disp.'}
										</span>
										<span style={{ color: (creditsBalance.limit - creditsBalance.used <= 5) ? '#ef4444' : '#64748b' }}>
											{Math.min(100, Math.round((creditsBalance.total / (creditsBalance.limit || 1)) * 100))}%
										</span>
									</div>
									<div style={{
										height: '4px',
										background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
										borderRadius: '2px',
										overflow: 'hidden',
										width: '100%'
									}}>
										<div style={{
											height: '100%',
											width: `${Math.min(100, Math.round((creditsBalance.total / (creditsBalance.limit || 1)) * 100))}%`,
											background: (creditsBalance.limit - creditsBalance.used <= 5)
												? 'linear-gradient(90deg, #ef4444 0%, #f43f5e 100%)'
												: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
											borderRadius: '2px',
											transition: 'width 0.3s ease'
										}} />
									</div>
								</Link>
							</div>
						)}

						<If condition={isNotCheckoutPage && user?.entity?.config?.main_user_id === user?.id}>
							<div className={'d-flex justify-content-center align-items-center m-1'}>
								<Link
									to={'/checkout?mode=credits'}
									className="btn btn-primary d-flex align-items-center px-3 py-1 border-0"
									style={{
										height: '38px',
										gap: '8px',
										fontSize: '0.9rem',
										whiteSpace: 'nowrap',
										background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
										boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
										fontWeight: 700,
										transition: 'all 0.3s ease'
									}}
								>
									<i className="las la-coins" style={{ fontSize: '1.2rem' }}></i>
									<span className="d-none d-sm-inline">Comprar Créditos</span>
									<span className="d-inline d-sm-none">Créditos</span>
								</Link>
							</div>
						</If>

						<Dropdown className="header-element header-shortcuts">
							<Dropdown.Toggle as="a" variant="" className="header-link dropdown-toggle nav-link icon" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
								<i className="bx bx-bell header-link-icon"></i>
								{totalUnread > 0 && (
									<span className="badge bg-danger rounded-pill header-icon-badge pulse pulse-secondary" id="notification-icon-badge">
										{totalUnread}
									</span>
								)}
							</Dropdown.Toggle>
							<Dropdown.Menu className="main-header-dropdown dropdown-menu dropdown-menu-end" data-popper-placement="bottom-end">
								<div className="p-3">
									<div className="d-flex align-items-center justify-content-between">
										<p className="mb-0 fs-17 fw-semibold">Notificações</p>
									</div>
								</div>
								<div className="dropdown-divider"></div>
								{notifications.length > 0 ? (
									<ListGroup className="list-group list-group-flush mb-0 notifications-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
										{notifications.map((notif: any) => (
											<ListGroup.Item
												key={notif.id}
												className={`list-group-item d-flex align-items-center ${!notif.is_read ? 'bg-light' : ''}`}
												style={{ cursor: 'pointer' }}
												onClick={async () => {
													if (notif.title === 'Certificados gerados com sucesso') {
														if (!notif.is_read) {
															await handleToggleRead(notif.id, notif.is_read);
														}
														let presenceListId: any = null;
														let presenceListUuid: any = null;
														try {
															const sourceData = notif.metadata || notif.errors;
															if (sourceData) {
																const parsed = typeof sourceData === 'string'
																	? JSON.parse(sourceData)
																	: sourceData;
																presenceListId = parsed?.presence_list_id || null;
																presenceListUuid = parsed?.presence_list_uuid || null;
															}
														} catch (e) {
															console.error('Erro ao fazer parse dos metadados da notificação:', e);
														}

														if (presenceListUuid) {
															navigate(`/documents?presence_list_uuid=${presenceListUuid}`);
														} else if (presenceListId) {
															navigate(`/documents?presence_list_id=${presenceListId}`);
														} else {
															navigate('/documents');
														}
													}
												}}
											>
												<div className="flex-grow-1">
													<p className="fw-semibold mb-0 fs-13">{notif.title}</p>
													<small className="text-muted">{notif.message}</small>
												</div>
												<Button
													variant="link"
													onClick={(e) => {
														e.stopPropagation();
														handleToggleRead(notif.id, notif.is_read);
													}}
													className="p-0"
												>
													{notif.is_read ? <FaEyeSlash size={16} color="gray" /> : <FaEye size={16} color="blue" />}
												</Button>
											</ListGroup.Item>
										))}
									</ListGroup>
								) : (
									<p className="text-center text-muted m-3">Nenhuma notificação.</p>
								)}
								<div className="p-3 empty-header-item border-top">
									<div className="d-grid">
										<Link to={'/notifications'} className="btn btn-primary">Ver todas as Notificações</Link>
									</div>
								</div>
							</Dropdown.Menu>
						</Dropdown>

						<div className="header-element header-fullscreen">
							<Link aria-label="anchor" onClick={toggleFullScreen} to="#" className="header-link">
								{fullScreen ? (
									<i className="bx bx-exit-fullscreen header-link-icon  full-screen-close"></i>
								) : (
									<i className="bx bx-fullscreen header-link-icon  full-screen-open"></i>
								)}
							</Link>
						</div>

						<Dropdown className="header-element mainuserProfile">
							<Dropdown.Toggle variant='' as="a" className="header-link dropdown-toggle" id="mainHeaderProfile" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
								<div className="d-flex align-items-center ">
									<div className="d-sm-flex wd-100p">
										<i style={{ border: '1px solid grey', borderRadius: '50%' }} className="fs-16 me-2 las la-user"></i>
										<div className="ms-2 my-auto d-none d-xl-flex" style={{ cursor: 'pointer' }}>
											<h6 className="font-weight-semibold mb-0 fs-13 user-name d-sm-block d-none"> Olá, {firstLetterUppercase(user.name)} </h6>
										</div>
									</div>
								</div>
							</Dropdown.Toggle>
							<Dropdown.Menu as="ul" className="dropdown-menu  border-0 main-header-dropdown  overflow-hidden header-profile-dropdown" aria-labelledby="mainHeaderProfile">
								<Link to={'/profile'} className={'w-100 h-100 w-full'} >
									<Dropdown.Item as="li" className="border-0">
										<i className="fs-16 me-2 las la-user"></i>Perfil
									</Dropdown.Item>
								</Link>
								<Dropdown.Item as="li" className="border-0" onClick={signOut}>
									<div className={'w-100 h-100 w-full'} >
										<i className="fs-16 me-2 las la-sign-out-alt"></i>Sair
									</div>
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>

						{/*}		
						<div className="header-element">
							<Link aria-label="anchor" to="#" className="header-link switcher-icon ms-1" data-bs-toggle="offcanvas" data-bs-target="#switcher-canvas" onClick={() => Switchericon()}>
								<i className="bx bx-cog bx-spin header-link-icon"></i>
							</Link>
						</div>
						{*/}

					</div>

				</div>

			</header>


			<Modal className="fade" id="searchModal" show={show3} onHide={handleClose3} tabIndex={-1} aria-labelledby="searchModal" aria-hidden="true">
				{/* <Modal.Dialog> */}
				<div className="modal-content">
					<Modal.Body>
						<InputGroup>
							<input type="search" className="form-control px-2 " placeholder="Search..." aria-label="Username" />
							<Link to="#" className="input-group-text bg-primary text-fixed-white" id="Search-Grid"><i className="fe fe-search header-link-icon fs-18"></i></Link>
						</InputGroup>
						<div className="mt-3">
							<div className="">
								<p className="fw-semibold text-muted mb-2 fs-13">Recent Searches</p>
								<div className="ps-2">
									<Link to="#" className="search-tags"><i className="fe fe-search me-2"></i>People<span></span></Link>
									<Link to="#" className="search-tags"><i className="fe fe-search me-2"></i>Pages<span></span></Link>
									<Link to="#" className="search-tags"><i className="fe fe-search me-2"></i>Articles<span></span></Link>
								</div>
							</div>
							<div className="mt-3">
								<p className="fw-semibold text-muted mb-2 fs-13">Apps and pages</p>
								<ul className="ps-2">
									<li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
										<Link to="#"><span><i className='bx bx-calendar me-2 fs-14 bg-primary-transparent p-2 rounded-circle '></i>Calendar</span></Link>
									</li>
									<li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
										<Link to="#"><span><i className='bx bx-envelope me-2 fs-14 bg-primary-transparent p-2 rounded-circle'></i>Mail</span></Link>
									</li>
									<li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
										<Link to="#"><span><i className='bx bx-dice-1 me-2 fs-14 bg-primary-transparent p-2 rounded-circle '></i>Buttons</span></Link>
									</li>
								</ul>
							</div>
							<div className="mt-3">
								<p className="fw-semibold text-muted mb-2 fs-13">Links</p>
								<ul className="ps-2">
									<li className="p-1 align-items-center  mb-1 search-app">
										<Link to="#" className="text-primary"><u>http://spruko/html/spruko.com</u></Link>
									</li>
									<li className="p-1 align-items-center mb-1 search-app">
										<Link to="#" className="text-primary"><u>http://spruko/demo/spruko.com</u></Link>
									</li>
								</ul>
							</div>
						</div>
					</Modal.Body>
					<div className="modal-footer d-block">
						<div className="text-center">
							<Link to="#" className="text-primary text-decoration-underline fs-15">View all results</Link>
						</div>
					</div>
				</div>
			</Modal>

			{customNotification && (
				<div
					className="position-fixed"
					style={{
						bottom: '24px',
						right: '24px',
						zIndex: 99999,
						width: '360px',
						background: 'rgba(220, 252, 231, 0.96)', // Middle intensity light green
						borderLeft: '5px solid #10b981',
						borderRadius: '12px',
						boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
						backdropFilter: 'blur(10px)',
						padding: '16px',
						color: '#14532d',
						animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
						display: 'flex',
						flexDirection: 'column',
						gap: '12px'
					}}
				>
					<style>{`
						@keyframes slideIn {
							from {
								transform: translateY(50px) scale(0.95);
								opacity: 0;
							}
							to {
								transform: translateY(0) scale(1);
								opacity: 1;
							}
						}
					`}</style>

					{/* Header of Notification */}
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							{customNotification.type === 'email_batch_success' ? (
								<i className="bx bxs-envelope" style={{ color: '#10b981', fontSize: '20px' }}></i>
							) : (
								<i className="bx bxs-check-circle" style={{ color: '#10b981', fontSize: '20px' }}></i>
							)}
							<span style={{ fontWeight: 800, fontSize: '13px', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
								{customNotification.type === 'email_batch_success' ? 'E-mails Enviados' : 'Lote Processado'}
							</span>
						</div>
						<button
							onClick={() => setCustomNotification(null)}
							style={{
								background: 'transparent',
								border: 'none',
								color: '#15803d',
								fontSize: '20px',
								cursor: 'pointer',
								padding: 0,
								lineHeight: 1,
								opacity: 0.6,
								transition: 'opacity 0.2s'
							}}
							onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
							onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
						>
							&times;
						</button>
					</div>

					{/* Body / Title */}
					<div style={{ fontSize: '14px', fontWeight: 600, color: '#166534', lineHeight: '1.4' }}>
						{customNotification.title}
					</div>

					{/* Action Button */}
					{
						customNotification.type === 'email_batch_success' ? '' :
							<div
								onClick={async () => {
									const notifId = customNotification.id;
									const presenceListId = customNotification.presenceListId;
									const presenceListUuid = customNotification.presenceListUuid;
									setCustomNotification(null);
									try {
										await api.put(`/notifications/${notifId}`, { is_read: true });
										setNotifications((prev: any) =>
											prev.map((n: any) => n.id === notifId ? { ...n, is_read: true } : n)
										);
										setTotalUnread((prev) => Math.max(0, prev - 1));
									} catch (err) {
										console.error('Erro ao marcar notificação como lida:', err);
									}
									if (presenceListUuid) {
										navigate(`/documents?presence_list_uuid=${presenceListUuid}`);
									} else if (presenceListId) {
										navigate(`/documents?presence_list_id=${presenceListId}`);
									} else {
										navigate('/documents');
									}
								}}
								style={{
									cursor: 'pointer',
									background: '#10b981',
									color: '#ffffff',
									padding: '10px 16px',
									borderRadius: '8px',
									fontSize: '13px',
									fontWeight: 700,
									textAlign: 'center',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
									transition: 'all 0.2s',
									boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#059669';
									e.currentTarget.style.transform = 'translateY(-1px)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = '#10b981';
									e.currentTarget.style.transform = 'translateY(0)';
								}}
							>
								<span>
									Clique aqui para visualizar certificados
									<i className="bx bx-right-arrow-alt" style={{ fontSize: '18px', fontWeight: 'bold' }}></i>
								</span>
							</div>
					}
				</div>
			)}
		</Fragment>
	);
};

const mapStateToProps = (state: any) => ({
	local_varaiable: state
});
export default connect(mapStateToProps, { ThemeChanger })(Header);