
import React, { FC, Fragment } from "react";
import { Link } from "react-router-dom";

interface FooterProps { }

const Footer: FC<FooterProps> = () => {
	return (
		<Fragment>
			<footer className="footer mt-auto py-3 bg-white text-center">
				<div className="container">
					<span className="text-muted"> Copyright © <span id="year"> 2024</span> <Link
						to="#" className="text-dark fw-semibold">Velvet</Link>.
						Designed with <span className="bi bi-heart-fill text-danger"></span> by <Link to="#">
							<span className="fw-semibold text-primary text-decoration-underline">Spruko</span>
						</Link> All
						rights
						reserved
					</span>
				</div>
			</footer>
		</Fragment>
	);
};

export default Footer;
