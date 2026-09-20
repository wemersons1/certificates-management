import { FC } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { Link } from "react-router-dom"

interface DashboardTooltipProps {
    message: string;
    text: string
}

const DashboardTooltip: FC<DashboardTooltipProps> = ({message, text}) => {
    return (
        <OverlayTrigger placement="top" overlay={
            <Tooltip className="tooltip-dark">{message}</Tooltip>}>
                <div style={{cursor: "pointer"}}>
                    <i className={`las la-question-circle fs-18 ${text}`}></i>                    
                </div>            
               

        </OverlayTrigger>
    )
}

export default DashboardTooltip