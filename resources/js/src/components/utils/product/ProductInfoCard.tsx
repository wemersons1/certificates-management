import { useState } from "react";
import { Button } from "react-bootstrap";
import minutes from "../../../assets/images/distribution-companies/99MINUTOS.png";

interface ProductInfoCard {
    imgSrc?: string;
    productName: string;
}

const ProductInfoCard = ({imgSrc = null, productName}) => {
    const [tag, setTag] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleTagSubmit = (event) => {
        event.preventDefault();
        const newTag = event.target.tag.value.trim();
        if (newTag) {
            setTag(newTag);
            setIsEditing(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true); // Abre o formulário de edição
    };

    return (
        <div className="col flex mb-3">
            <div className="d-flex p-3">
                <div className="me-3" style={{ width: '100px', height: '100px' }}>
                    <img 
                        src={minutes} 
                        alt={productName} 
                        className="w-100 h-100 object-cover rounded"
                    />
                </div>
                <div className="d-flex flex-column justify-content-between">
                    <h4>{productName}</h4>
                    {tag && !isEditing ? ( 
                        <div className="d-flex flex-column align-items-start">
                            <span className="text-muted">Tag:</span>
                            <div className="d-flex align-items-center">
                                <span className="fs-18 text-primary">{tag}</span>
                                <i
                                    className="las la-edit text-primary"
                                    style={{ cursor: "pointer", fontSize: "18px", marginLeft: "8px" }}
                                    onClick={handleEditClick}
                                ></i>

                            </div>
                            
                        </div>
                    ) : isEditing ? (
                        <form onSubmit={handleTagSubmit} className="d-flex align-items-center">
                            <input 
                                type="text" 
                                name="tag" 
                                className="form-control form-control-sm me-2" 
                                style={{ width: '150px', fontSize: '0.875rem' }} 
                                placeholder="Digite a tag" 
                                defaultValue={tag || ""} 
                                autoFocus 
                            />
                            <Button 
                                type="submit" 
                                size="sm" 
                                variant="success"
                            >
                                Salvar
                            </Button>
                        </form>
                    ) : ( 
                        <Button 
                            size="sm" 
                            onClick={() => setIsEditing(true)}
                        >
                            Criar tag
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductInfoCard;

