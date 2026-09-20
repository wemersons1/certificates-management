import { FC } from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface TripleCardProps {
    title1?: string,
    value1?: string | number,
    predicted1?: string,
    title2?: string,
    value2?:  string | number,
    predicted2?: string,
    title3?: string,
    value3?:  string | number,
    predicted3?: string,
    icon?: string,
    iconColor: string;
}

const TripleCard: FC<TripleCardProps> = ({ 
    icon, 
    title1, value1, predicted1, 
    title2, value2, predicted2, 
    title3, value3, predicted3,
    iconColor
}) => {  
    const { t } = useTranslation();
    const predictedBgColor = "#e5dafd";
    const predictedTxtColor = "#540AF5";

    const iconBgStyles = {
        minWidth: '35px',
        height: '35px',
        backgroundColor: `rgba(${iconColor}, 0.15)`,
    };

    const iconStyles = {
    color: `rgb(${iconColor})`,
    };
    

    return (
        <Col>
            <Card className="custom-card" style={{borderRadius: '12px', height:"80%"}}>
                <CardBody className="p-3 d-flex flex-row align-items-center">
                    <div className="me-3 d-flex align-items-center justify-content-center rounded" style={iconBgStyles}>
                        <i className={`${icon} fs-24`} style={iconStyles}></i> 
                    </div>
                    <div className="d-flex justify-content-between flex-fill">
                        <div className="d-flex align-items-center">
                            <div className='d-flex flex-column justify-content-between'> 
                                <div className="mb-0">
                                    <p className="fw-medium mb-0 fs-12 text-muted">{title1}</p>                    
                                </div>       
                                <div>
                                    <h3 className="mb-1 fs-16">{value1}</h3>
                                </div> 
                                {predicted1 && (
                                    <div className="rounded d-flex justify-content-center" style={{ backgroundColor: predictedBgColor }}>
                                        <p className="mb-0 fs-12 fw-semibold" style={{ 
                                            color: predictedTxtColor,
                                            paddingLeft: '5px',
                                            paddingRight: '5px',
                                        }}>{`${t("predicted")}: ${predicted1}`}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="border-start px-3 d-flex align-items-center">
                            <div className='d-flex flex-column justify-content-between'> 
                                <div className="mb-0">
                                    <p className="fw-medium mb-0 fs-12 text-muted">{title2}</p>                    
                                </div>       
                                <div>
                                    <h3 className="mb-1 fs-16">{value2}</h3>
                                </div> 
                                {predicted2 && (
                                    <div className="rounded d-flex justify-content-center" style={{ backgroundColor: predictedBgColor }}>
                                        <p className="mb-0 fs-12 fw-semibold" style={{ 
                                            color: predictedTxtColor,
                                            paddingLeft: '5px',
                                            paddingRight: '5px',
                                        }}>{`${t("predicted")}: ${predicted2}`}</p>
                                    </div>
                                )}
                            </div>    
                        </div>
                        <div className="border-start px-3 d-flex align-items-center">
                            <div className='d-flex flex-column justify-content-between'> 
                                <div className="mb-0">
                                    <p className="fw-medium mb-0 fs-12 text-muted">{title3}</p>                    
                                </div>       
                                <div>
                                    <h3 className="mb-1 fs-16">{value3}</h3>
                                </div> 
                                {predicted3 && (
                                    <div className="rounded d-flex justify-content-center" style={{ backgroundColor: '#e5dafd', whiteSpace: 'nowrap' }}>
                                        <p className="mb-0 fs-12 fw-semibold" style={{ 
                                            color: predictedTxtColor,
                                            paddingLeft: '5px',
                                            paddingRight: '5px',
                                        }}>{`${t("predicted")}: ${predicted3}`}</p>
                                    </div>
                                )}
                            </div>  
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
}

export default TripleCard;
