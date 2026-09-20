
import React, { FC, Fragment, useContext, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AppContext from "@/src/AppContext/Context";
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import logo from "@/src/assets/images/brand-logos/desktop-logo.png";
import Cookies from 'js-cookie';

interface LoginProps { }

const Login: FC<LoginProps> = () => {
	const [passwordshow1, setpasswordshow1] = useState(false);
	const [email, setEmail] = useState(() => {
		const email = Cookies.get('email');
		if(email) {
			try {
				return atob(email);
			}catch (e) {
	
			}
		}

		return '';
	});
	const [password, setPassword] = useState(() => {
		const password = Cookies.get('password');
		if(password) {
			return atob(password);
		}

		return '';
	});
	const { sign, checkRole, theme } = useContext(AppContext);
	const [rememberPassword, setRememberPassword] = useState<boolean>(() => {
		return !!Cookies.get('email') && !!Cookies.get('password');
	});
	const [disabledButtonLogin, setDisabledButtonLogin] = useState<boolean>(false);;
	const { theme: themeApp } = useContext(AppContext);
	const logo_base64 = themeApp?.logo ?? logo;

	const navigate = useNavigate();
	const authenticate = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setDisabledButtonLogin(true);
	
		try {
			const response = await sign(email, password);
			const { user } = response.data;
	
			if (!user?.email_verified_at) {
				navigate('/confirmation-code');
			}
		
			if (user?.current_order?.status === 'completed' && !user?.entity) {
	
			} else if (checkRole('Lead')){
				navigate('/checkout');
            }
	
		} catch (e) {
			toast.error("Usuário ou senha inválidos");
		}
		setDisabledButtonLogin(false);
	};

	const handleClickRememberPassword = () => {
		const rememberPasswordChecked = !rememberPassword;
	
		setRememberPassword(!rememberPassword);

		if(rememberPasswordChecked && email.length && password.length) {
			Cookies.set('email', btoa(email));
			Cookies.set('password', btoa(password));
		} else {
			Cookies.remove('email');
			Cookies.remove('password');
		}
	}

	return (
		<Fragment>
			<HelmetProvider>
				<Helmet>
					<body className="bg-white"></body>
				</Helmet>
			</HelmetProvider>

			<div className="row mx-0 authentication">

				<Col xxl={6} xl={7} lg={12} className="">
					<div className="row mx-0 justify-content-center align-items-center h-100">
						<Col xxl={8} xl={9} lg={10} md={10} sm={12} className=" col-12">
							<div className="p-sm-5 p-0">
								<div className="text-center">
									<img src={logo_base64} style={{ width: '150px', height: 'auto' }} alt="" className='mb-3'/>
					
									<p className="mb-4 text-muted op-7 fw-normal">Seja bem vindo(a)!</p>
								</div>
								<form onSubmit={authenticate}>
									<Row className="gy-3 mb-3">									
										<Col xl={12}>
											<label htmlFor="login-email" className="form-label text-default">Email</label>
											<InputGroup>
												<InputGroup.Text className=""><i className="ri-mail-line"></i></InputGroup.Text>
												<Form.Control type="email" required value={email} onChange={e => setEmail(e.target.value)}className="form-control form-control-lg" id="login-email" placeholder="Insira seu e-mail"/>
											</InputGroup>
										</Col>
									</Row>
									<Row className="gy-3 mb-3">
										<Col xl={12}>
											<label htmlFor="login-password" className="form-label text-default d-block">Senha<Link to={`/insert-email`} className="float-end text-primary">Esqueceu a senha?</Link></label>
											<InputGroup>
												<InputGroup.Text className=""><i className="ri-lock-line"></i></InputGroup.Text>
												<Form.Control type={(passwordshow1) ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="form-control form-control-lg" id="login-password" placeholder="Insira a sua senha"/>
												<Button variant='' className="btn btn-light bg-transparent" type="button"
														onClick={() => setpasswordshow1(!passwordshow1)} id="button-addon2">
														<i className={`${passwordshow1 ? "ri-eye-line" : "ri-eye-off-line"} align-middle`} aria-hidden="true"></i>
												</Button>
											</InputGroup>
											<div className="mt-2">
												<div className="form-check">
													<Form.Check className="" type="checkbox" onClick={handleClickRememberPassword} checked={rememberPassword} id="defaultCheck1" />
													<label className="form-check-label text-muted fw-normal" htmlFor="defaultCheck1">
														Lembrar a senha?
													</label>
												</div>
											</div>
										</Col>								
									</Row>								
									<Row>
										<Col xl={12} className=" d-grid mt-4 ">
											<Button type={'submit'} disabled={disabledButtonLogin} className="btn btn-lg btn-primary">{disabledButtonLogin ? 'Estamos processando ...' : 'Login'}</Button>
										</Col>
										<ToastContainer />
									</Row>
								</form>
							</div>
						</Col>
					</div>
				</Col>
				<Col xxl={6} xl={5} lg={5} className="d-xl-block d-none px-0">
					<div className="authentication-cover login-cover">
						<div className="">
							<div className="row justify-content-center g-0">
								<div className="col-xl-9">
									<div className="text-fixed-white text-start  d-flex align-items-center">
										<div>
											<h3 className="fw-semibold op-8 mb-3  text-fixed-white">Login</h3>
											<p className="mb-5 fw-normal fs-14 op-6"> Faça o login para continuar aproveitando todos os recursos exclusivos que preparamos para você. <br></br>Entre com seu e-mail e senha para acessar a plataforma. Se ainda não tem uma conta, crie uma agora mesmo e comece a explorar!</p>
										</div>
									</div>								
								</div>
							</div>
						</div>
					</div>
				</Col>

			</div>
		</Fragment>
	);
}

export default Login;
