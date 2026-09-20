import { FC, useContext } from "react"
import { Badge, Button, Card, CardBody } from "react-bootstrap"
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle"
import { Link, useNavigate } from "react-router-dom";
import StoreItemCard from "./StoreItemCard";
import AppContext from "../../../../AppContext/Context";


interface Store {
    id: number,
    name: string,
    country_name: string,
    currency_name: string,
    image?: string,
    active: boolean,
}

interface ManageStoresCardProps {
    stores: Store[],
}


const ManageStoresCard:FC<ManageStoresCardProps> = ({stores}) => {
    const navigate = useNavigate();
    const { user, setUserLogged } = useContext(AppContext);

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-store-alt" 
                    />
                    <div className="d-block ms-3 ">
                        <h6>Gerenciar Lojas</h6>
                        <span className="text-muted">Atualize as informações das lojas e configure uma nova loja</span>
                    </div>

                </div>
                <div className="d-flex flex-column">
                    {stores.map((store) => (
                        <StoreItemCard
                            key={store.id}
                            id = {store.id}
                            name = {store.name}
                            country = {store.country_name}
                            currency = {store.currency_name}
                            active = {store.active}                        
                        />
                    ))}
                    
                </div>

                {user.plan && (
                        // Verifica se o plano não é o id 3 e se o número de lojas não atingiu o limite
                        (user.plan_id !== 4 || stores.length < user.plan.number_of_stores) && (
                          <div 
                            className={`d-flex justify-content-between align-items-center p-3 border rounded mb-3`}
                            style={{ 
                              backgroundColor: "#f8f9fa", 
                              cursor: stores.length < user.plan.number_of_stores ? 'pointer' : 'not-allowed', 
                              opacity: stores.length < user.plan.number_of_stores ? 1 : 0.6
                            }} 
                            onClick={() => stores.length < user.plan.number_of_stores && navigate('/setup')}
                          >
                            <div className="d-flex align-items-center">
                              <i className="ri-add-line text-muted" style={{ fontSize: "24px", marginRight: "10px" }}></i>
                              <span className="text-muted">{stores.length > 0 ? "Configurar nova loja" : "Configurar loja"}</span>
                            </div>
                            
                            {/* Exibir badge apenas se o limite de lojas for atingido */}
                            {stores.length >= user.plan.number_of_stores && (
                              <span style={{
                                background: "linear-gradient(90deg, rgba(84, 10, 245, 1) 0%, rgba(73, 182, 245, 1) 100%)",
                                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "2px 10px",
                                fontSize: "14px"
                              }}>
                                {user.plan.number_of_stores === 1 ? "PRO" : "DELUXE"}                              
                              </span>
                            )}
                          </div>
                        )
                )}

            </CardBody>
            
        </Card>
    )
}

export default ManageStoresCard