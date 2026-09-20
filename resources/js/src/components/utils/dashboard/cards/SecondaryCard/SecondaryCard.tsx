import { FC } from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import DashboardTooltip from "../../../../common/tooltips/DashboardTooltip";

interface SecondaryCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconColor?: string;
    predicted?: string;
    tooltip?: string;
    type?: "real" | "predicted";
}

const SecondaryCard: FC<SecondaryCardProps> = ({ title, value, icon, iconColor, tooltip, predicted, type = "real" }) => {
    const isPredicted = type === "predicted";

    const cardStyles = isPredicted ? { backgroundColor: '#e5dafe' } : {};
    const textStyles = isPredicted ? { color: '#540af5' } : { color: 'inherit' };
    const titleClass = isPredicted ? "fw-medium mb-0 fs-12" : "fw-medium mb-0 fs-12 text-muted";

    const iconBgStyles = isPredicted
        ? { backgroundColor: '#540af5', minWidth: '35px', height: '35px' }
        : { backgroundColor: 'rgba(' + iconColor + ', 0.15)', minWidth: '35px', height: '35px' };

    const iconStyles = isPredicted
        ? { color: 'white' }
        : { color: 'rgb(' + iconColor + ')' };

    return (
        <Col>
            <Card className="custom-card" style={{ ...cardStyles, borderRadius: '12px', height:"86px" }}>
                <CardBody className="p-3 d-flex flex-row align-items-center">
                    <div className="me-3 d-flex align-items-center justify-content-center rounded" style={iconBgStyles}>
                        <i className={`${icon} fs-24`} style={iconStyles}></i>
                    </div>
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <div className='d-flex flex-column justify-content-between'>
                            <div className="mb-0">
                                <p className={titleClass} style={textStyles}>{title}</p>
                            </div>
                            <div>
                                <h3 className="mb-1 fs-16" style={textStyles}>{value}</h3>
                            </div>
                            {predicted && (
    <div 
        className="rounded d-inline-flex align-items-center justify-content-center" 
        style={{ backgroundColor: '#e5dafd', whiteSpace: 'nowrap' }}
    >
        <p 
            className="mb-0 fs-12 fw-semibold" 
            style={{
                color: '#540af5',
                paddingLeft: '5px',
                paddingRight: '5px',
                margin: 0,
            }}
        >
            {`Previsto: ${predicted}`}
        </p>
    </div>
)}

                        </div>
                        {tooltip && (
                            <div className="d-flex align-items-center justify-content-center">
                                <DashboardTooltip message={tooltip} text="text-muted"/>
                            </div>
                        )}                        
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default SecondaryCard;
