import { Fragment } from 'react';

export const CreditCardForm = () => {

    return (
        <Fragment>
            <form id="form-checkout">
                <div id="form-checkout__cardNumber" class="container"></div>
                <div id="form-checkout__expirationDate" class="container"></div>
                <div id="form-checkout__securityCode" class="container"></div>
                <input type="text" id="form-checkout__cardholderName" />
                <select id="form-checkout__issuer"></select>
                <select id="form-checkout__installments"></select>
                <select id="form-checkout__identificationType"></select>
                <input type="text" id="form-checkout__identificationNumber" />
                <input type="email" id="form-checkout__cardholderEmail" />

                <button type="submit" id="form-checkout__submit">Pagar</button>
                <progress value="0" class="progress-bar">Carregando...</progress>
            </form>
        </Fragment>
    );
}

export default CreditCardForm;