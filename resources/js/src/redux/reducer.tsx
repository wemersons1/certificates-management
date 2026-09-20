
const initialState = {
	lang: "en",
	dir: "ltl",
	dataThemeMode: "light",
	dataMenuStyles: "light",
	dataNavLayout: "vertical",
	dataHeaderStyles: "",
	defaultHeaderStyles: "light",
	dataVerticalStyle: "overlay",
	StylebodyBg: "107 64 64",
	StyleDarkBg: "93 50 50",
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
	},

};
export default function reducer(state = initialState, action: any) {
	const { type, payload } = action;

	switch (type) {

		case "ThemeChanger":
			state = payload;
			return state;
			break;

		default:
			return state;
	}
}
