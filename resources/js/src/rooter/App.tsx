import { Fragment, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { JobMonitorProvider } from "../AppContext/JobMonitorContext";
import store from "../redux/store";
import Header from "../components/common/header/header";
import Switcher from "../components/common/switcher/switcher";
import Sidebar from "../components/common/sidebar/sidebar";
import Tabtotop from "../components/common/tab-to-tap/tabtotap";
import AppContext from "../AppContext/Context";
import CompleteRegistrationModal from "../components/common/complete-registration-modal";

interface AppProps {
    children: ReactNode;
}

function App({children}: AppProps) {
	const [lateLoad, setlateLoad] = useState(false);
	const { user, userIsBlock, setUserLogged } = useContext(AppContext);
	const shouldBlockWelcomeAssistant = useMemo(() => {
		const phone = typeof user?.phone === 'string' ? user.phone.trim() : '';
		const missingPhone = !phone;
		const missingBusinessSegment = !user?.entity?.business_segment_id;

		return Boolean(user?.id && user?.role?.name === 'Entity' && (missingPhone || missingBusinessSegment));
	}, [user]);

	useEffect(() => {
		setlateLoad(true);
	});

	if (! user?.email_verified_at) {
		return children;
	}

	if (userIsBlock()) {
		return (
			<Provider store={store}>
				<div className="page">
					<CompleteRegistrationModal user={user} onUpdated={setUserLogged} />
					<Header suppressWelcomeAssistant={shouldBlockWelcomeAssistant} />
					<div className="container-fluid pt-4">
						{children}
					</div>
				</div>
			</Provider>
		);
	}
	
	return (
			<Fragment>
				<JobMonitorProvider>
					<Provider store={store}>
						<div style={{display: `${lateLoad ? 'block' : 'none'}`}}>
							<Switcher />
							<div className="page">
								<CompleteRegistrationModal user={user} onUpdated={setUserLogged} />
								<Header suppressWelcomeAssistant={shouldBlockWelcomeAssistant} />
								<Sidebar />
								<div className="pt-5 main-content app-content">
									<div className="container-fluid pt-4">
										{children}
									</div>
								</div>
							</div>
							<Tabtotop />
						</div>
					</Provider>
				</JobMonitorProvider>
			</Fragment>
		);
}

export default App;


