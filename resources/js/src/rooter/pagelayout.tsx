import { Fragment, useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import Header from "../components/common/header/header";
import Switcher from "../components/common/switcher/switcher";
import Sidebar from "../components/common/sidebar/sidebar";
import Pageheader from "../components/pageheader/pageheader";
import { Outlet } from "react-router-dom";
import Footer from "../components/common/footer/footer";
import Tabtotop from "../components/common/tab-to-tap/tabtotap";

function Pagelayout() {

	const [lateLoad, setlateLoad] = useState(false);
	useEffect(() => {
		setlateLoad(true);
	  });
	  
  return (
		<Fragment>
			<Provider store={store}>
			<div style={{display: `${lateLoad ? 'block' : 'none'}`}}>
				<Switcher />
				<div className="page">
					<Header />
					<Sidebar />
					<Pageheader />
					<div className="main-content app-content">
						<div className="">
              	<Outlet/>
						</div>
					</div>
					<Footer />
				</div>
				
				<Tabtotop />
				</div>
			</Provider>
		</Fragment>
	);
}

export default Pagelayout;


