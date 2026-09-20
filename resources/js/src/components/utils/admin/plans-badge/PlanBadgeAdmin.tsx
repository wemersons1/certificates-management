import { FC } from "react";

interface PlanBadgeAdminProps {
    name: string;
}


const PlanBadgeAdmin: FC<PlanBadgeAdminProps> = ({name}) => {

    const planColors: { [key: string]: string } = {
        "Sem Plano": '72,72,72',
        "Deluxe": '112,1,209',
        "Essentials": '250,189,13',
        "Pro": '0,181,209',
        "Gratuito": '12, 210, 104',
    };

    const color = planColors[name] || '72,72,72';

    return(        
        <div className="d-inline-flex align-items-center rounded" style={{ backgroundColor: `rgba(${color},0.15)`, color: `rgb(${color})`, padding: "2px 6px"}}>
            <span className="fw-semibold">{name}</span>
        </div>
    )
}


export default PlanBadgeAdmin