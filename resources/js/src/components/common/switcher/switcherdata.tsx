import { ClassAttributes, InputHTMLAttributes, useState } from "react";
import store from "../../../redux/store";
import { getMenuItemsEntity, getMenuItemsCompany, getMenuItemsMaster } from "../sidebar/sidemenu";
import { JSX } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";

interface Theme {
	lang:string,
	dir: string,
	dataThemeMode: string,
	dataMenuStyles:string,
	dataNavLayout: string,
	dataHeaderStyles: string,
	defaultHeaderStyles: string,
	dataVerticalStyle:string,
	StylebodyBg: string,
	StyleDarkBg: string,
	toggled: string,
	dataNavStyle: string,
	horStyle: string,
	dataPageStyle: string,
	dataWidth: string,
	dataMenuPosition:string,
	dataHeaderPosition: string,
	loader: string,
	iconOverlay: string,
	colorPrimaryRgb: string,
	bodyBg: string,
	Light: string,
	darkBg: string,
	inputBorder: string,
	bgImg: string,
	iconText: string,
}

// Define an interface for the action function parameter
interface ActionFunction {
    (theme: Theme): void;
}

let MENUITEMS: any = [];

export function Dark(actionfunction:ActionFunction) {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark",
		"defaultHeaderStyles": "",
		"bodyBg": "",
		"Light": "",
		"darkBg": "",
		"inputBorder": "",
	});
	localStorage.setItem("velvetdarktheme", "dark");
	localStorage.removeItem("velvetlighttheme");
	localStorage.setItem("velvetMenu", "dark");
	localStorage.setItem("velvetHeader", "dark");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("darkBgRGB1");
	localStorage.removeItem("darkBgRGB2");
	localStorage.removeItem("darkBgRGB3");
	localStorage.removeItem("darkBgRGB4");
}
export function Light(actionfunction: ActionFunction) {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataThemeMode": "light",
		"darkBg": "",
		"bodyBg": "",
		"Light": "",
		"inputBorder": "",
		"dataMenuStyles": theme.dataNavLayout == "horizontal" ? "light" : "dark",
		"dataHeaderStyles": "",
		"defaultHeaderStyles":"light",

	});
	localStorage.setItem("velvetlighttheme", "light");
	localStorage.removeItem("velvetdarktheme");
	localStorage.setItem("velvetdefaultHeader", "light");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("darkBgRGB1");
	localStorage.removeItem("darkBgRGB2");
	localStorage.removeItem("darkBgRGB3");
	localStorage.removeItem("darkBgRGB4");
}
export function Ltr(actionfunction: ActionFunction) {
	const theme = store.getState();
	actionfunction({ ...theme, dir: "ltr" });
	localStorage.setItem("velvetltr", "ltr");
	localStorage.removeItem("velvetrtl");
}
export function Rtl(actionfunction: ActionFunction) {
	const theme = store.getState();
	actionfunction({ ...theme, dir: "rtl" });
	localStorage.setItem("velvetrtl", "rtl");
	localStorage.removeItem("velvetltr");
}
export const HorizontalClick = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "horizontal",
		"dataMenuStyles": localStorage.velvetdarktheme ? "dark" : localStorage.darkBgRGB1 ? "dark" : localStorage.velvetMenu ? localStorage.velvetMenu : "gradient",
		"dataVerticalStyle": "",
		"dataNavStyle": localStorage.velvetnavstyles ? localStorage.velvetnavstyles : "menu-click"
	});
	localStorage.setItem("velvetlayout", "horizontal");
	localStorage.removeItem("velvetverticalstyles");
	const Sidebar: any = document.querySelector(".main-menu");
	if (Sidebar) {
		Sidebar.style.marginInline = "0px";
	}
	closeMenuFn();
};
export const Vertical = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataMenuStyles": "dark",
		"dataVerticalStyle": "overlay",
		"toggled": "",
		"dataNavStyle": ''
	});
	localStorage.setItem("velvetlayout", "vertical");

};

export const Menuclick = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavStyle": "menu-click",
		"dataVerticalStyle": "",
		"toggled": "menu-click-closed",
	});
	localStorage.setItem("velvetnavstyles", "menu-click");
	localStorage.removeItem("velvetverticalstyles");
	const Sidebar: any = document.querySelector(".main-menu");
	if (Sidebar) {
		Sidebar.style.marginInline = "0px";
	}
};
export const MenuHover = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavStyle": "menu-hover",
		"dataVerticalStyle": "",
		"toggled": "menu-hover-closed",
		"horStyle": ""
	});
	localStorage.setItem("velvetnavstyles", "menu-hover");
	localStorage.removeItem("velvetverticalstyles");
	const Sidebar: any = document.querySelector(".main-menu");
	if (Sidebar) {
		Sidebar.style.marginInline = "0px";
	}
};
export const IconClick = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavStyle": "icon-click",
		"dataVerticalStyle": "",
		"toggled": "icon-click-closed",
	});
	localStorage.setItem("velvetnavstyles", "icon-click");
	localStorage.removeItem("velvetverticalstyles");
	const Sidebar: any = document.querySelector(".main-menu");
	if (Sidebar) {
		Sidebar.style.marginInline = "0px";
	}
};
function closeMenuFn() {
	const closeMenuRecursively = (items: any[]) => {

		items?.forEach((item) => {
			item.active = false;
			closeMenuRecursively(item.children);
		});
	};
	closeMenuRecursively(MENUITEMS);
}
export const IconHover = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavStyle": "icon-hover",
		"dataVerticalStyle": "",
		"toggled": "icon-hover-closed"
	});
	localStorage.setItem("velvetnavstyles", "icon-hover");
	localStorage.removeItem("velvetverticalstyles");
	const Sidebar: any = document.querySelector(".main-menu");
	if (Sidebar) {
		Sidebar.style.marginInline = "0px";
	}

	closeMenuFn();
};
export const Fullwidth = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataWidth": "fullwidth",
	});
	localStorage.setItem("velvetfullwidth", "Fullwidth");
	localStorage.removeItem("velvetboxed");

};
export const Boxed = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataWidth": "boxed",
	});
	localStorage.setItem("velvetboxed", "Boxed");
	localStorage.removeItem("velvetfullwidth");
};
export const FixedMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuPosition": "fixed",
	});
	localStorage.setItem("velvetmenufixed", "MenuFixed");
	localStorage.removeItem("velvetmenuscrollable");
};
export const scrollMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuPosition": "scrollable",
	});
	localStorage.setItem("velvetmenuscrollable", "Menuscrolled");
	localStorage.removeItem("velvetmenufixed");
};
export const Headerpostionfixed = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataHeaderPosition": "fixed",
	});
	localStorage.setItem("velvetheaderfixed", "FixedHeader");
	localStorage.removeItem("velvetheaderscrollable");
	localStorage.removeItem("velvetheaderrounded");
};
export const Headerpostionscroll = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataHeaderPosition": "scrollable",
	});
	localStorage.setItem("velvetheaderscrollable", "ScrollableHeader");
	localStorage.removeItem("velvetheaderfixed");
	localStorage.removeItem("velvetheaderrounded");
};
export const Headerpostionrounded = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataHeaderPosition": "rounded",
	});
	localStorage.setItem("velvetheaderrounded", "RoundedHeader");
	localStorage.removeItem("velvetheaderfixed");
	localStorage.removeItem("velvetheaderscrollable");
};
export const Regular = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataPageStyle": "regular"
	});
	localStorage.setItem("velvetregular", "Regular");
	localStorage.removeItem("velvetclassic");
	localStorage.removeItem("velvetmodern");
};
export const Classic = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataPageStyle": "classic",
	});
	localStorage.setItem("velvetclassic", "Classic");
	localStorage.removeItem("velvetregular");
	localStorage.removeItem("velvetmodern");
};
export const Modern = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataPageStyle": "modern",
	});
	localStorage.setItem("velvetmodern", "Modern");
	localStorage.removeItem("velvetregular");
	localStorage.removeItem("velvetclassic");
};
export function Enable(actionfunction: ActionFunction) {
	const theme = store.getState();
	actionfunction({ ...theme, loader: "enable" });
	localStorage.setItem("velvetloaderenable", "enable");
	localStorage.setItem("velvetloaderdisable", "enable");
}
export function Disable(actionfunction: ActionFunction) {
	const theme = store.getState();
	actionfunction({ ...theme, loader: "disable" });
	localStorage.setItem("velvetloaderdisable", "disable");
	localStorage.removeItem("velvetloaderenable");
}
export const Defaultmenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataVerticalStyle": "overlay",
		"dataNavLayout": "vertical",
		"toggled": "",
		"dataNavStyle": "",
	});
	localStorage.removeItem("velvetnavstyles");
	localStorage.setItem("velvetverticalstyles", "default");
	let icon = document.getElementById("switcher-default-menu") as HTMLInputElement;
	if (icon) {
		icon.checked = true;
	}

};
export const Closedmenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "closed",
		"toggled": "close-menu-close",
		"dataNavStyle": "",
	});
	localStorage.setItem("velvetverticalstyles", "closed");
	localStorage.removeItem("velvetnavstyles");

};

function icontextOpenFn() {
	let html = document.documentElement;
	if (html.getAttribute("data-toggled") === "icon-text-close") {
		html.setAttribute("data-icon-text", "open");
	}
}
function icontextCloseFn() {
	let html = document.documentElement;
	if (html.getAttribute("data-toggled") === "icon-text-close") {
		html.removeAttribute("data-icon-text");
	}
}
export const iconText = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "icontext",
		"toggled": "icon-text-close",
		"dataNavStyle": "",
	});
	localStorage.setItem("velvetverticalstyles", "icontext");
	localStorage.removeItem("velvetnavstyles");
	const MainContent = document.querySelector(".main-content");
	const appSidebar = document.querySelector(".app-sidebar");

	appSidebar?.addEventListener("click", () => {
		icontextOpenFn();
	});
	MainContent?.addEventListener("click", () => {
		icontextCloseFn();
	});
};
export const iconOverayFn = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "overlay",
		"toggled": "icon-overlay-close",
		"dataNavStyle": "",
	});
	localStorage.setItem("velvetverticalstyles", "overlay");
	localStorage.removeItem("velvetnavstyles");
	let icon: any = document.getElementById("switcher-icon-overlay");
	if (icon) {
		icon.checked = true;
	}
};
function DetachedOpenFn() {
	if (window.innerWidth > 992) {
		let html = document.documentElement;
		if (html.getAttribute("data-toggled") === "detached-close" || html.getAttribute("data-toggled") === "icon-overlay-close") {
			html.setAttribute("data-icon-overlay", "open");
		}
	}
}
function DetachedCloseFn() {
	if (window.innerWidth > 992) {
		let html = document.documentElement;
		if (html.getAttribute("data-toggled") === "detached-close" || html.getAttribute("data-toggled") === "icon-overlay-close") {
			html.removeAttribute("data-icon-overlay");
		}
	}
}
export const DetachedFn = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "detached",
		"toggled": "detached-close",
		"dataNavStyle": "",
	});
	localStorage.setItem("velvetverticalstyles", "detached");
	localStorage.removeItem("velvetnavstyles");
	
	const MainContent = document.querySelector(".main-content");
	const appSidebar = document.querySelector(".app-sidebar");

	appSidebar?.addEventListener("click", () => {
		DetachedOpenFn();
	});
	MainContent?.addEventListener("click", () => {
		DetachedCloseFn();
	});
};

export const DoubletFn = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "doublemenu",
		"toggled": "double-menu-open",
		"dataNavStyle": "",
	});
	localStorage.setItem("velvetverticalstyles", "doublemenu");
	localStorage.removeItem("velvetnavstyles");
	// setTimeout(() => {
	// 	if (!document.querySelectorAll(".main-menu .slide.active")[0].querySelector("ul")) {
	// 		const theme = store.getState();
	// 		actionfunction(
	// 			{
	// 				...theme,
	// 				"toggled": "double-menu-close",
	// 			}
	// 		);
	// 	}
	// }, 100);
};
export const bgImage1 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bgImg": "bgimg1"
	});
	localStorage.setItem("bgimage1", "bgimg1");
	localStorage.removeItem("bgimage2");
	localStorage.removeItem("bgimage3");
	localStorage.removeItem("bgimage4");
	localStorage.removeItem("bgimage5");
};
export const bgImage2 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bgImg": "bgimg2"
	});
	localStorage.setItem("bgimage2", "bgimg2");
	localStorage.removeItem("bgimage1");
	localStorage.removeItem("bgimage3");
	localStorage.removeItem("bgimage4");
	localStorage.removeItem("bgimage5");
};
export const bgImage3 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bgImg": "bgimg3"
	});
	localStorage.setItem("bgimage3", "bgimg3");
	localStorage.removeItem("bgimage1");
	localStorage.removeItem("bgimage2");
	localStorage.removeItem("bgimage4");
	localStorage.removeItem("bgimage5");
};
export const bgImage4 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bgImg": "bgimg4"
	});
	localStorage.setItem("bgimage4", "bgimg4");
	localStorage.removeItem("bgimage1");
	localStorage.removeItem("bgimage2");
	localStorage.removeItem("bgimage3");
	localStorage.removeItem("bgimage5");
};
export const bgImage5 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bgImg": "bgimg5"
	});
	localStorage.setItem("bgimage5", "bgimg5");
	localStorage.removeItem("bgimage1");
	localStorage.removeItem("bgimage2");
	localStorage.removeItem("bgimage3");
	localStorage.removeItem("bgimage4");
};

export const colorMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuStyles": "color",
	});
	localStorage.setItem("velvetMenu", "color");
	localStorage.removeItem("gradient");
};

export const lightMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuStyles": "light",
	});
	localStorage.setItem("velvetMenu", "light");
	localStorage.removeItem("light");
};

export const darkMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuStyles": "dark",
	});
	localStorage.setItem("velvetMenu", "dark");
	localStorage.removeItem("light");
};

export const gradientMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuStyles": "gradient",
	});
	localStorage.setItem("velvetMenu", "gradient");
	localStorage.removeItem("color");
};
export const transparentMenu = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataMenuStyles": "transparent",
	});
	localStorage.setItem("velvetMenu", "transparent");
	localStorage.removeItem("gradient");
};

export const darkHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "",
		"dataHeaderStyles": "dark",
	});
	localStorage.setItem("velvetHeader", "dark");
	localStorage.removeItem("velvetdefaultHeader");
};
export const colorHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "",
		"dataHeaderStyles": "color",
	});
	localStorage.setItem("velvetHeader", "color");
	localStorage.removeItem("velvetdefaultHeader");
};
export const gradientHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "",
		"dataHeaderStyles": "gradient",
	});
	localStorage.setItem("velvetHeader", "gradient");
	localStorage.removeItem("velvetdefaultHeader");
};
export const transparentHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "",
		"dataHeaderStyles": "transparent",
	});
	localStorage.setItem("velvetHeader", "transparent");
	localStorage.removeItem("velvetdefaultHeader");
};

export const defaultlightHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "light",
		"dataHeaderStyles": "",
	});
	localStorage.setItem("velvetdefaultHeader", "light");
	localStorage.removeItem("dark");
};
export const defaultdarkHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "dark",
		"dataHeaderStyles": "",
	});
	localStorage.setItem("velvetdefaultHeader", "dark");
	localStorage.removeItem("light");
};
export const defaultcolorHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "color",
		"dataHeaderStyles": "",
	});
	localStorage.setItem("velvetdefaultHeader", "color");
	localStorage.removeItem("dark");
};
export const defaultgradientHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "gradient",
		"dataHeaderStyles": "",

	});
	localStorage.setItem("velvetdefaultHeader", "gradient");
	localStorage.removeItem("transparent");
};
export const defaulttransparentHeader = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "transparent",
		"dataHeaderStyles": "",
	});
	localStorage.removeItem("gradient");
	localStorage.setItem("velvetdefaultHeader", "transparent");
};

export const primaryColor1 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "13, 73, 159",
	});
	localStorage.setItem("primaryRGB", "13, 73, 159");

};
export const primaryColor2 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "0, 128, 172",
	});
	localStorage.setItem("primaryRGB", "0, 128, 172");
};
export const primaryColor3 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "100, 48, 124",
	});
	localStorage.setItem("primaryRGB", "100, 48, 124");
};
export const primaryColor4 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "5, 154, 114",
	});
	localStorage.setItem("primaryRGB", "5, 154, 114");
};
export const primaryColor5 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "177, 90, 17",
	});
	localStorage.setItem("primaryRGB", "177, 90, 17");
};

export const backgroundColor1 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "20, 30, 96",
		"Light": "25, 38, 101",
		"darkBg": "25, 38, 101",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark",
		"defaultHeaderStyles":"",
	});
	localStorage.setItem("darkBgRGB1", "20, 30, 96");
	localStorage.setItem("darkBgRGB2", "25, 38, 101");
	localStorage.setItem("darkBgRGB3", "25, 38, 101");
	localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("velvetMenu");


};
export const backgroundColor2 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "8, 78, 115",
		"Light": "13, 86, 120",
		"darkBg": "13, 86, 120",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark",
		"defaultHeaderStyles":"",
	});
	localStorage.setItem("darkBgRGB1", "8, 78, 115");
	localStorage.setItem("darkBgRGB2", "13, 86, 120");
	localStorage.setItem("darkBgRGB3", "13, 86, 120",);
	localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("velvetMenu");

};
export const backgroundColor3 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "90, 37, 135",
		"Light": "95, 45, 140",
		"darkBg": "95, 45, 140",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles":"dark",
		"defaultHeaderStyles":"",
	});
	localStorage.setItem("darkBgRGB1", "90, 37, 135");
	localStorage.setItem("darkBgRGB2", "95, 45, 140");
	localStorage.setItem("darkBgRGB3", "95, 45, 140",);
	localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("velvetMenu");

};
export const backgroundColor4 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "24, 101, 51",
		"Light": "29, 109, 56",
		"darkBg": "29, 109, 56",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles":  "dark",
		"defaultHeaderStyles":"",
	});
	localStorage.setItem("darkBgRGB1", "24, 101, 51");
	localStorage.setItem("darkBgRGB2", "29, 109, 56");
	localStorage.setItem("darkBgRGB3", "29, 109, 56");
	localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("velvetMenu");

};
export const backgroundColor5 = (actionfunction: ActionFunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "120, 66, 20",
		"Light": "125, 74,25",
		"darkBg": "125, 74, 25",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles":"dark",
		"defaultHeaderStyles":"",
	});
	localStorage.setItem("darkBgRGB1", "120, 66, 20");
	localStorage.setItem("darkBgRGB2", "125, 74,25");
	localStorage.setItem("darkBgRGB3", "125, 74,25");
	localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
	localStorage.removeItem("velvetHeader");
	localStorage.removeItem("velvetdefaultHeader");
	localStorage.removeItem("velvetMenu");

};

const ColorPicker = (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>) => {
	return (
		<div className="color-picker-input">
			<input type="color" {...props} />
		</div>
	);
};

function hexToRgb(hex: string) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
const Themeprimarycolor = ({ actionfunction }: any) => {
	const theme = store.getState();
	const [state, updateState] = useState("#FFFFFF");

	const handleInput = (e: any) => {
		const rgb = hexToRgb(e.target.value);

		if (rgb !== null) {
			const { r, g, b } = rgb;
			updateState(e.target.value);
			actionfunction({
				...theme,
				"colorPrimaryRgb": `${r} , ${g} , ${b}`,
			});
			localStorage.setItem("dynamiccolor", `${r}, ${g}, ${b}`);
		}
	};

	return (
		<div className="Themeprimarycolor theme-container-primary pickr-container-primary">
			<ColorPicker onChange={handleInput} value={state} />
		</div>
	);
};

export default Themeprimarycolor;

//themeBackground
export const Themebackgroundcolor = ({ actionfunction }: any) => {
	const theme = store.getState();
	const [state, updateState] = useState("#FFFFFF");
	const handleInput = (e: any) => {
		const { r, g, b }: any = hexToRgb(e.target.value);
		updateState(e.target.value);
		actionfunction({
			...theme,
			"bodyBg": `${r}, ${g}, ${b}`,
			"Light": `${r + 19}, ${g + 19}, ${b + 19}`,
			"darkBg": `${r + 19}, ${g + 19}, ${b + 19}`,
			"inputBorder": "255, 255, 255, 0.1",
			"dataThemeMode": "dark",
			"dataHeaderStyles": "dark",
			"dataMenuStyles": "dark",
			"defaultHeaderStyles":"",
		});
		localStorage.setItem("darkBgRGB1", `${r}, ${g}, ${b}`);
		localStorage.setItem("darkBgRGB2", `${r + 19}, ${g + 19}, ${b + 19}`);
		localStorage.setItem("darkBgRGB3", `${r + 19}, ${g + 19}, ${b + 19}`);
		localStorage.setItem("darkBgRGB4", "255, 255, 255, 0.1");
		localStorage.removeItem("velvetMenu");
		localStorage.removeItem("velvetdefaultHeader");
		localStorage.removeItem("velvetHeader");


	};
	return (
		<div className="Themebackgroundcolor">
			<ColorPicker onChange={handleInput} value={state} />
		</div>
	);
};

export const Reset = (actionfunction: any) => {
	const theme = store.getState();
	Vertical(actionfunction);
	actionfunction({
		...theme,
		lang: "en",
		dir: "ltr",
		dataThemeMode: "light",
		dataMenuStyles: "dark",
		dataNavLayout: "vertical",
		defaultHeaderStyles: "",
		dataHeaderStyles: "gradient",
		dataVerticalStyle: "overlay",
		toggled: "",
		dataNavStyle: "",
		horStyle: "",
		dataPageStyle: "regular",
		dataWidth: "fullwidth",
		dataMenuPosition: "fixed",
		dataHeaderPosition: "fixed",
		loader: "disable",
		iconOverlay: "",
		colorPrimaryRgb: "",
		bodyBg: "",
		Light: "",
		darkBg: "",
		inputBorder: "",
		bgImg: "",
		iconText: "",
		body: {
			class: ""
		}
	});
	localStorage.clear();
};
export const Reset1 = (actionfunction: any) => {
	const theme = store.getState();
	Vertical(actionfunction);
	actionfunction({
		...theme,
		lang: "en",
		dir: "ltr",
		dataThemeMode: "light",
		dataMenuStyles: "dark",
		dataNavLayout: "horizontal",
		dataHeaderStyles: "gradient",
		defaultHeaderStyles: "",
		dataVerticalStyle: "overlay",
		toggled: "",
		dataNavStyle: "menu-click",
		dataMenuPosition: "fixed",
		iconOverlay: "",
		colorPrimaryRgb: "",
		bgImg: "",
		iconText: "",
		body: {
			class: ""
		}
	});
	localStorage.clear();
};
export const LocalStorageBackup = (actionfunction: any) => {

	(localStorage.velvetltr) ? Ltr(actionfunction) : "";
	(localStorage.velvetrtl) ? Rtl(actionfunction) : "";
	(localStorage.velvetdarktheme) ? Dark(actionfunction) : "";
	(localStorage.velvetlighttheme) ? Light(actionfunction) : "";
	(localStorage.velvetregular) ? Regular(actionfunction) : "";
	(localStorage.velvetclassic) ? Classic(actionfunction) : "";
	(localStorage.velvetmodern) ? Modern(actionfunction) : "";
	(localStorage.velvetfullwidth) ? Fullwidth(actionfunction) : "";
	(localStorage.velvetboxed) ? Boxed(actionfunction) : "";
	(localStorage.velvetmenufixed) ? FixedMenu(actionfunction) : "";
	(localStorage.velvetmenuscrollable) ? scrollMenu(actionfunction) : "";
	(localStorage.velvetheaderfixed) ? Headerpostionfixed(actionfunction) : "";
	(localStorage.velvetheaderscrollable) ? Headerpostionscroll(actionfunction) : "";
	(localStorage.velvetheaderrounded) ? Headerpostionrounded(actionfunction) : "";


	(localStorage.velvetloaderenable) ? Enable(actionfunction) : "";
	(localStorage.velvetloaderdisable) ? Disable(actionfunction) : "";

	(localStorage.velvetnavstyles === "menu-click") ? Menuclick(actionfunction) : "";
	(localStorage.velvetnavstyles === "menu-hover") ? MenuHover(actionfunction) : "";
	(localStorage.velvetnavstyles === "icon-click") ? IconClick(actionfunction) : "";
	(localStorage.velvetnavstyles === "icon-hover") ? IconHover(actionfunction) : "";

	(localStorage.bgimage1) ? bgImage1(actionfunction) : "";
	(localStorage.bgimage2) ? bgImage2(actionfunction) : "";
	(localStorage.bgimage3) ? bgImage3(actionfunction) : "";
	(localStorage.bgimage4) ? bgImage4(actionfunction) : "";
	(localStorage.bgimage5) ? bgImage5(actionfunction) : "";
	(localStorage.velvetlayout == "horizontal") && HorizontalClick(actionfunction);
	(localStorage.velvetlayout == "vertical") && Vertical(actionfunction);
	//primitive 
	if (
		localStorage.getItem("velvetltr") == null ||
		localStorage.getItem("velvetltr") == "ltr"
	)

		// Theme Primary: Colors: Start
		switch (localStorage.primaryRGB) {
			case "13, 73, 159":
				primaryColor1(actionfunction);

				break;
			case "0, 128, 172":
				primaryColor2(actionfunction);

				break;
			case "100, 48, 124":
				primaryColor3(actionfunction);

				break;
			case "5, 154, 114":
				primaryColor4(actionfunction);

				break;
			case "177, 90, 17":
				primaryColor5(actionfunction);

				break;
			default:
				break;
		}
	// Theme Primary: Colors: End

	switch (localStorage.darkBgRGB1) {
		case "20, 30, 96":
			backgroundColor1(actionfunction);

			break;
		case "8, 78, 115":
			backgroundColor2(actionfunction);

			break;
		case "90, 37, 135":
			backgroundColor3(actionfunction);

			break;
		case "24, 101, 51":
			backgroundColor4(actionfunction);

			break;
		case "120, 66, 20":
			backgroundColor5(actionfunction);

			break;
		default:
			break;
	}

	//layout
	if (localStorage.velvetverticalstyles) {
		const verticalStyles = localStorage.getItem("velvetverticalstyles");

		switch (verticalStyles) {
			case "default":
				Defaultmenu(actionfunction);
				break;
			case "closed":
				Closedmenu(actionfunction);
				break;
			case "icontext":
				iconText(actionfunction);
				break;
			case "overlay":
				iconOverayFn(actionfunction);
				break;
			case "detached":
				DetachedFn(actionfunction);
				break;
			case "doublemenu":
				DoubletFn(actionfunction);
				break;
		}
	}

	//Theme Primary:
	if (localStorage.dynamiccolor) {
		const theme = store.getState();
		actionfunction({
			...theme,
			"colorPrimaryRgb": localStorage.dynamiccolor,
			"colorPrimary": localStorage.dynamiccolor
		});
	}
	//Theme BAckground:
	if (localStorage.darkBgRGB1) {
		const theme = store.getState();
		actionfunction({
			...theme,
			"bodyBg": localStorage.darkBgRGB1,
			"Light": localStorage.darkBgRGB2,
			"darkBg": localStorage.darkBgRGB3,
			"inputBorder": localStorage.darkBgRGB4,
			"dataThemeMode": "dark",
			"dataHeaderStyles": localStorage.velvetHeader ? localStorage.velvetHeader : localStorage.velvetdarktheme ? "dark" : "dark",
			"dataMenuStyles": "dark",
		});
		// Dark(actionfunction);
	}
	switch (localStorage.velvetMenu) {
		case "light":
			lightMenu(actionfunction);
			break;
		case "dark":
			darkMenu(actionfunction);

			break;
		case "color":
			colorMenu(actionfunction);

			break;
		case "gradient":
			gradientMenu(actionfunction);

			break;
		case "transparent":
			transparentMenu(actionfunction);

			break;
		default:
			break;
	}
	// ThemeColor Header Colors: start
	switch (localStorage.velvetdefaultHeader) {
		case "light":
			defaultlightHeader(actionfunction);

			break;
		case "dark":
			defaultdarkHeader(actionfunction);

			break;
		case "color":
			defaultcolorHeader(actionfunction);

			break;
		case "gradient":
			defaultgradientHeader(actionfunction);

			break;
		case "transparent":
			defaulttransparentHeader(actionfunction);

			break;
		default:
			break;
	}
};

