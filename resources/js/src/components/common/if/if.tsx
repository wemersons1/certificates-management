
import React, { FC, Fragment } from "react";

interface IfProps {
    condition: boolean;
    children: React.ReactNode
}

const If: FC<IfProps> = ({children, condition}) => {
	return (
		<Fragment>
			{condition ? children : null}
		</Fragment>
	);
};

export default If;
