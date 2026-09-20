import { FC } from "react"
import { Card, CardBody, Col } from "react-bootstrap"

interface SecondaryDoubleCardRoasProps {
    title1: string,
    value1: string | number,
    predicted1?: string
    title2: string,
    value2: string | number,
    predicted2?: string
    icon: string
    iconColor?: string,
    
}

const SecondaryDoubleCardRoas: FC<SecondaryDoubleCardRoasProps> = ({title1, value1, predicted1, title2, value2, predicted2, icon, iconColor}) => {    
    const predictedBgColor = "#e5dafd";
    const predictedTxtColor = "#540AF5";

    const iconBgStyles = {
        minWidth: '35px',
        height: '35px',
        backgroundColor: 'rgba('+ iconColor + ', 0.15)',
    }

    const iconStyles = {
        color: 'rgb(' + iconColor + ')',
    }

    return (
        <Col>
            <Card className="custom-card" style={{borderRadius: '12px'}}>
                <CardBody className="p-3 d-flex flex-row align-items-center">
                    <div className="me-3 d-flex align-items-center justify-content-center rounded" style={iconBgStyles}>
                        <i className={`${icon} fs-24`}  style={iconStyles}></i> 
                    </div>
                    
                    <div className="d-flex justify-content-between w-100">
                        <div className="d-flex flex-column justify-content-between w-50"> 
                            <div className="mb-0">
                                <p className="fw-medium mb-0 fs-12 text-muted">{title1}</p>                    
                            </div>       
                            <div>
                                <h3 className="mb-1 fs-16">{value1}</h3>
                            </div> 
                            {predicted1 && (
                                <div className="rounded d-flex justify-content-center" style={{ backgroundColor: predictedBgColor }}>
                                    <p className="mb-0 fs-11 fw-semibold" style={{ 
                                        color: predictedTxtColor,
                                        paddingLeft: '5px',
                                        paddingRight: '5px',
                                    }}>{`Previsto: ${predicted1}`}</p>
                                </div>
                            )}
                        </div>

                        <div className="d-flex flex-column justify-content-between w-50"> 
                            <div className="mb-0">
                                <p className="fw-medium mb-0 fs-12 text-muted">{title2}</p>                    
                            </div>       
                            <div>
                                <h3 className="mb-1 fs-16">{value2}</h3>
                            </div> 
                            {predicted2 && (
                                <div className="rounded d-flex justify-content-center" style={{ backgroundColor: predictedBgColor }}>
                                    <p className="mb-0 fs-11 fw-semibold" style={{ 
                                        color: predictedTxtColor,
                                        paddingLeft: '5px',
                                        paddingRight: '5px',
                                    }}>{`Previsto: ${predicted2}`}</p>
                                </div>
                            )}
                        </div>
                    </div>                    
                </CardBody>
            </Card>
        </Col>
    )
}

export default SecondaryDoubleCardRoas
