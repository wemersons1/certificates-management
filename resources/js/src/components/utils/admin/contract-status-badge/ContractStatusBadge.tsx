import { FC } from "react";

interface ContractStatusBadgeProps {
    name: string;
}


const ContractStatusBadge: FC<ContractStatusBadgeProps> = ({name}) => {

    const contractStatusColors: { [key: string]: string } = {
        "Ativo": '12,210,104',
        "Pendente": '239,215,0',
        "Inativo": '108,117,125',
        "Cancelado": '225,33,4',
    };

    const color = contractStatusColors[name] || '72,72,72';

    return(        
        <div className="d-inline-flex align-items-center rounded" style={{ backgroundColor: `rgba(${color},0.15)`, color: `rgb(${color})`, padding: "2px 6px"}}>
            <span className="fw-semibold">{name}</span>
        </div>
    )
}


export default ContractStatusBadge