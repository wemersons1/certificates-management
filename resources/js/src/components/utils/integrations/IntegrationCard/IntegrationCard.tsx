import React, { FC } from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from './IntegrationCard.module.css'
import { Link } from "react-router-dom";

interface IntegrationCardProps {
  title: string;
  category: string;
  imageSrc: string;
  status: number;
  isAdmin: boolean;
  onDelete: (id: number) => void;
  id: number
}

const IntegrationCard: FC<IntegrationCardProps> = ({ title, imageSrc, status, isAdmin, onDelete, id}) => {
    const BACKEND_URL = import.meta.env.VITE_URL_IMAGE;
    const imageUrl = `${BACKEND_URL}${imageSrc}`;
    return (
        <Card className={`${styles.integration_card} ${!isAdmin && status === 0 ? styles.disabled : ''} bg-body`}>
        <Card.Img src={imageUrl} className={styles.img}/>
        <Card.Body>
            <h6 className='mb-3'>{title}</h6>

            {isAdmin ? (
                    <div className="d-flex justify-content-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
                            <Link to={`/integrations/${id}`} aria-label="anchor" className="btn  btn-primary-light btn-sm" data-bs-toggle="tooltip" data-bs-original-title="Edit">
                                <span className="ri-pencil-line fs-14"></span>
                            </Link>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Excluir</Tooltip>}>
                            <button 
                                aria-label="delete-button" 
                                className="btn btn-danger-light btn-sm ms-2" 
                                data-bs-toggle="tooltip" 
                                data-bs-original-title="Delete"
                                onClick={() => onDelete(id)}
                            >
                                <span className="ri-delete-bin-7-line fs-14"></span>
                            </button>
                        </OverlayTrigger>
                    </div>
                ) : (
                    <Link to={`/integrations/${title.toLowerCase().replace(/\s+/g, '-')}`} className="xl-2 btn btn-primary">
                        {status === 0 ? 'Em breve...' : 'Configurar'}
                    </Link>
            )}            
        </Card.Body>
        </Card>
    );
};

export default IntegrationCard;
