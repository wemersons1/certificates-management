import { FC } from "react";

interface CurrencyBadgeProps {
    name: string; 
    flagIcon: string;
}

const CurrencyBadge: FC<CurrencyBadgeProps> = ({ name, flagIcon }) => {
    const currencyColors: { [key: string]: string } = {
        BRL: '34,139,34',   // Verde (Real)
        USD: '0,114,206',    // Azul (Dólar)
        COP: '255,215,0',    // Amarelo (Peso Colombiano)
        MXN: '0,128,0',      // Verde escuro (Peso Mexicano)
        PAB: '70,130,180',   // Azul aço (Balboa Panamenho)
        PEN: '178,34,34',    // Vermelho tijolo (Sol Peruano)
        EUR: '0,51,153',     // Azul escuro (Euro)
        PYG: '220,20,60',    // Vermelho (Guarani Paraguaio)
        CLP: '255,69,0',     // Laranja avermelhado (Peso Chileno)
    };

    // Define a cor ou usa um cinza padrão
    const color = currencyColors[name] || '108,117,125';  

    return (
        <div
            className="d-inline-flex align-items-center rounded"
            style={{ backgroundColor: `rgba(${color}, 0.15)`, color: `rgb(${color})`, padding: "2px 6px" }}
        >
            <img src={flagIcon} alt={`${name} flag`} style={{ width: '16px', height: '16px', marginRight: '6px' }} />
            <span className="fw-semibold">{name}</span>
        </div>
    );
};


export default CurrencyBadge;
