import { FC } from "react";
import StoreLogo from "../storelogo/storelogo";

interface Product {
    name: string;
    id: number;
    sku: string;
    tag: string;
}

const ProductDetails: FC<Product> = ({name, id, sku, tag}) => {
    return(
        <div className="d-flex align-items-center">
            <div className="d-flex justify-content-center align-items-center" style={{
                width: '100px',
                height: '100px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
               <img style={{width: '100%', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}} src="https://via.placeholder.com/80" alt="Placeholder Image"/>
            </div>
            <div className="d-flex flex-column ms-3">
                <span className="fs-18 fw-semibold text-dark">{name}</span>
                <span className="text-dark mb-1">id: <span className="text-muted">{id}</span></span>
                <span className="text-dark mb-1">sku: <span className="text-muted">{sku}</span></span>
                <span className="text-dark"><i className="las la-tag"></i>: <span className="text-muted">{id}</span></span>
               
            </div>
        </div>
    )
}

export default ProductDetails