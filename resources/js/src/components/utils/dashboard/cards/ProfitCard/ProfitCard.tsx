import { FC } from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import DashboardTooltip from "../../../../common/tooltips/DashboardTooltip";

interface ProfitCardProps {
    title: string;
    value: string | number;
    icon: string;
    tooltip?: string;
    type: "real" | "predicted";
}

const ProfitCard: FC<ProfitCardProps> = ({ title, value, icon, type, tooltip}) => {
    // Função para verificar se o valor é positivo
    const isValuePositive = (): boolean => {
        // Tenta converter o value para número, ignorando formatos de moeda
        const numericValue = typeof value === "string" 
            ? parseFloat(value.replace(/[^0-9.-]+/g, "")) 
            : value;

        return numericValue > 0;
    };

    const cardStyles = type === "predicted" ? { backgroundColor: "#e5dafe" } : {};
    const textStyles = 
        type === "predicted"
            ? { color: "#540af5" }
            : type === "real" && isValuePositive()
            ? { color: "rgb(38,191,148)" } // Verde se for "real" e positivo
            : { color: "inherit" };
    
    const titleClass = type === "real" 
        ? "fw-medium mb-0 fs-12 text-muted" 
        : "fw-medium mb-0 fs-12";

    const iconBgStyles = type === "predicted"
        ? { backgroundColor: "#540af5", minWidth: "35px", height: "35px" }
        : { backgroundColor: "rgba(38, 191, 148, 0.15)", minWidth: "35px", height: "35px" };

    const iconStyles = type === "predicted" 
        ? { color: "white" } 
        : { color: "rgb(38, 191, 148)" };

    return (
        <Col>
            <Card className="custom-card" style={{ ...cardStyles, borderRadius: "12px"}}>
                <CardBody className="p-3 d-flex flex-row align-items-center">
                    <div
                        className="me-3 d-flex align-items-center justify-content-center rounded"
                        style={iconBgStyles}
                    >
                        <i className={`${icon} fs-24`} style={iconStyles}></i>
                    </div>
                    <div className="d-flex w-100 justify-content-between">
                        <div className="">
                            <div className="mb-0">
                                <p className={titleClass} style={textStyles}>
                                    {title}
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-1 fs-16" style={textStyles}>
                                    {value}
                                </h3>
                            </div>
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

export default ProfitCard;
