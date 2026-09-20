import { FC, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle"
import StoreLogo from "../../storelogo/storelogo";
import api from '@/src/lib/api';
import AppContext from "../../../../AppContext/Context";

interface StoreItemCardProps {
    id: number,
    name: string,
    country: string,
    currency: string,
    image?: string,
    active: boolean,
}


const StoreItemCard : FC<StoreItemCardProps> = ({id, name, country, currency, image, active = false}) => {


    return(
        <div className="d-flex justify-content-between align-items-center mb-3 p-3" 
            style={{
                borderRadius: '5px',
                backgroundColor: active
                    ? "rgba(84, 10, 245, 0.1)"
                    : "rgba(250, 250, 250, 1)",
            }}
            >
            <div className="d-flex align-items-center">
                <StoreLogo storeName={name} />
                <div className="d-block ms-3 ">
                    <h6>{name}</h6>
                    <span className="text-muted">{`${country} - ${currency}`}</span>
                </div>

            </div>
            <div>
                <Link 
                    to={`/store-management/${id}`}
                    className="text-primary">                
                    <i className="fs-20 las la-cog me-2"></i>
                    
                </Link>                     
            </div> 
        </div>
    )
}

export default StoreItemCard