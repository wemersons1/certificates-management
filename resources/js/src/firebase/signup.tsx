import React, { FC, Fragment } from 'react';
import { Col, Form } from "react-bootstrap";
import { Link } from 'react-router-dom';

//IMAGES
import desktopdark from "../assets/images/brand-logos/desktop-dark.png";
import desktoplogo from "../assets/images/brand-logos/desktop-logo.png";


interface SignbasicProps { }

const Signup: FC<SignbasicProps> = () => {

	return (
		<Fragment>
			<div className="page error-bg" id="particles-js">
				<div className="error-page  ">
					<div className="container-lg">
						<div className="row justify-content-center align-items-center authentication authentication-basic h-100">
							<div className="col-xxl-4 col-xl-5 col-lg-5 col-md-6 col-sm-8 col-12">
								<div className="my-5 d-flex justify-content-center">
									<Link to={`${import.meta.env.BASE_URL}dashboards/sales`}>
										<img src={desktoplogo} alt="logo" className="desktop-logo" />
										<img src={desktopdark} alt="logo" className="desktop-dark" />
									</Link>
								</div>
								<div className="card custom-card  rectangle2">
									<div className="card-body p-sm-5 p-3  rectangle3">
										<p className="h4 fw-semibold mb-2 text-center">Sign Up</p>
										<p className="mb-4 text-muted op-7 fw-normal text-center">Welcome &amp; Join us by creating a free account !</p>
										<div className="row gy-3">
											<Col xl={12}>
												<label htmlFor="signup-firstname" className="form-label text-default">Full Name</label>
												<Form.Control type="text" className="form-control form-control-lg" id="signup-firstname" placeholder="first name" />
											</Col>
											<Col xl={12}>
												<label htmlFor="signup-lastname" className="form-label text-default">Email</label>
												<input type="email" className="form-control form-control-lg" id="signup-lastname" placeholder="email" />
											</Col>
											<div className="col-xl-12 d-grid mt-2">
												<button type="button" className="btn btn-lg btn-primary mt-4">Create Account</button>
											</div>
										</div>
										<div className="text-center">
											<p className="fs-12 text-muted mt-3">Already have an account? <Link to="#" className="text-primary">Sign In</Link></p>
										</div>
										<div className="text-center my-3 authentication-barrier">
											<span>OR</span>
										</div>
										<div className="btn-list text-center">
											<button aria-label="button" type="button" className="btn btn-icon btn-light btn-wave waves-effect waves-light">
												<i className="ri-facebook-line fw-bold "></i>
											</button>
											<button aria-label="button" type="button" className="btn btn-icon btn-light btn-wave waves-effect waves-light">
												<i className="ri-google-line fw-bold "></i>
											</button>
											<button aria-label="button" type="button" className="btn btn-icon btn-light btn-wave waves-effect waves-light">
												<i className="ri-twitter-line fw-bold "></i>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default Signup;
