
import AppContext from "@/src/AppContext/Context";
import { Fragment, useContext } from "react";
import { Link } from "react-router-dom";

function Menuloop({ MENUITEMS, toggleSidemenu, level }: any) {
	const { theme: themeApp } = useContext(AppContext);
	
	// Check if dark mode based on document attribute
	const isDarkMode = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme-mode') === 'dark';
	
	// Style for active menu item in dark mode
	const darkModeActiveStyle = isDarkMode && MENUITEMS?.selected ? {
		background: 'linear-gradient(90deg, #0d1b2e 0%, #112240 100%)',
	} : {};
	
	return (
		<Fragment>
			<Link to="#" style={{color: themeApp.primary_color, ...darkModeActiveStyle}} className={`side-menu__item ${MENUITEMS?.selected ? "active" : ""}`} onClick={(event) => { event.preventDefault(); toggleSidemenu(event, MENUITEMS); }}>

				{level <= 1 ?
					<span style={{color: themeApp.primary_color}} className='side-menu__icon'>
						{MENUITEMS.icon}
					</span>
					: " "}
				<span style={{color: themeApp.primary_color}} className={`${level == 1 ? "side-menu__label" : ""}`}>
					{MENUITEMS.title}
					{MENUITEMS.badgetxt ? (
						<span className={MENUITEMS.class}>
							{MENUITEMS.badgetxt}
						</span>
					) : (
						""
					)}
				</span>
				<i className="fe fe-chevron-right side-menu__angle"></i>
			</Link>
			<ul
			style={{
				color: themeApp.primary_color,
				display: MENUITEMS.active ? "block" : "none", // CORRIGIDO AQUI
			}}
			className={`slide-menu child${level} ${MENUITEMS.active ? "double-menu-active" : ""} ${MENUITEMS?.dirchange ? "force-left" : ""}`}
			>
				{level <= 1 ? <li style={{color: themeApp.primary_color}} className='slide side-menu__label1'>
					<Link to="#">{MENUITEMS.title}</Link>
				</li> : ""}
				{MENUITEMS.children.map((firstlevel: any) =>
					<li style={{color: themeApp.primary_color}} className={`${firstlevel.menutitle ? "slide__category" : ""} ${firstlevel?.type == "empty" ? "slide" : ""} ${firstlevel?.type == "link" ? "slide" : ""} ${firstlevel?.type == "sub" ? "slide has-sub" : ""} ${firstlevel?.active ? "open" : ""} ${firstlevel?.selected ? "active" : ""}`} key={Math.random()}>

						{firstlevel.type === "link" ?
							<Link style={{color: themeApp.primary_color, ...(isDarkMode && firstlevel.selected ? {background: 'linear-gradient(90deg, #0d1b2e 0%, #112240 100%)'} : {})}} to={firstlevel.path} className={`side-menu__item ${firstlevel.selected ? "active" : ""}`}>
								{firstlevel.icon}
								<span style={{color: themeApp.primary_color}} className="">
									{firstlevel.title}
									{firstlevel.badgetxt ? (
										<span style={{color: themeApp.primary_color}} className={firstlevel.class}>
											{firstlevel.badgetxt}
										</span>
									) : (
										""
									)}
								</span>
							</Link>
							: ""}
						{firstlevel.type === "empty" ?
							<Link to="#" className='side-menu__item'>
								<span className="">
									{firstlevel.title}
									{firstlevel.badgetxt ? (
										<span className={firstlevel.class}>
											{firstlevel.badgetxt}
										</span>
									) : (
										""
									)}
								</span>
							</Link>
							: ""}
						{firstlevel.type === "sub" ?
							<Menuloop MENUITEMS={firstlevel} toggleSidemenu={toggleSidemenu} level={level + 1} />
							: ""}

					</li>
				)}

			</ul>
		</Fragment>
	);
}

export default Menuloop;
