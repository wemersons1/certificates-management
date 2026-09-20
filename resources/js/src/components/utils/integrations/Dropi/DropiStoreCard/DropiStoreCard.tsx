import { FC } from "react";
import { Button, Card, CardBody, Col, Row } from "react-bootstrap";
import ProfileIcon from "../../../../common/profileicon/ProfileIcon";

interface Store {
    id: number;
    name: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

const DropiStoreCard:FC<Store> = ({id, name, onEdit, onDelete }) => {
    return(
        <Card className="mt-3 mb-0 ">
            <CardBody>
                <Row className="align-items-center"> 
                    <Col xs="auto">                    
                        <ProfileIcon name={name} color='#540AF5'/>    
                    </Col>
                    <Col>              
                    <div className="d-block">
                        <h6 className="mb-0">{name}</h6>            
                    </div>
                    </Col>
                    <Col className="d-flex justify-content-end">
                    {onEdit && (
                        <Button
                            variant="primary-light"
                            size="sm"
                            className="me-3"
                            onClick={onEdit}
                        >
                            Editar
                        </Button>

                    )}
                    {onDelete && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onDelete}
                        >
                            Excluir
                        </Button>    

                    )}                        
                                                                         
                    </Col>
                                   
                    
                </Row>
            
            </CardBody>
            
            
        </Card>
    )
}

export default DropiStoreCard