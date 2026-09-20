import React, {FC} from "react";

import {Alert} from "react-bootstrap";
const AlertMessage: FC = () => (
    <Alert variant="info" className="d-flex justify-content-between">
        <div>
        <Alert.Heading>Nova atualização!</Alert.Heading>
        <p>
            Estamos trabalhando para uma melhor perfomance, com isso, temos uma nova atualização V.0.1.
        </p>
        </div>
    </Alert>
    );

export default AlertMessage;