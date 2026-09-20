import { FC, useContext, useTransition } from "react"
import { Badge, Button, Card, CardBody } from "react-bootstrap"
import IconLogoCircle from "../../../common/icon-logo-circle/IconLogoCircle"
import { Link, useNavigate } from "react-router-dom";
import StoreItemCard from "./StoreItemCard";
import AppContext from "../../../../AppContext/Context";
import StoreLogo from "../../storelogo/storelogo";
import api from "@/src/lib/api";
import { useTranslation } from "react-i18next";


interface Store {
    id: number,
    name: string,
    country_name: string,
    currency_name: string,
    image?: string,
    active: boolean,
}

interface ChooseStoresCardProps {
    stores: Store[],
    onStoreSelect: () => void;
}


const ChooseStoresCard:FC<ChooseStoresCardProps> = ({stores, onStoreSelect}) => {
    const navigate = useNavigate();
    const { user, setUserLogged } = useContext(AppContext);
    const { t } = useTranslation();

    const handleStoreSelect = (storeId: number) => {
        api.put(`/client-store/${storeId}`, { active: 1 })
          .then((response) => {
            const { data: store } = response;
            setUserLogged({...user, current_store: store});
            onStoreSelect();
            navigate('/home'); 
          })
          .catch((error) => {
            console.error("Erro ao ativar a loja:", error); 
          });
      };

    return(
        <Card className="custom-card" style={{borderRadius: '12px'}}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center mb-3">
                    <IconLogoCircle
                        icon = "las la-store-alt" 
                    />
                    <div className="d-block ms-3 ">
                        <h6>{t("components.choose_stores.manage_stores")}</h6>
                        <span className="text-muted">{t("components.choose_stores.manage_stores_message")}</span>
                    </div>

                </div>
                <div className="d-flex flex-column">
                    {stores.map((store) => (
                        <div
                            key={store.id}
                            className="d-flex justify-content-between align-items-center p-3 border rounded mb-3"
                            style={{
                                borderRadius: '5px',
                                backgroundColor: store.active
                                    ? "rgba(84, 10, 245, 0.1)"
                                    : "rgba(250, 250, 250, 1)",
                                cursor: "pointer",
                            }}
                            onClick={() => handleStoreSelect(store.id)} 
                        >
                            <div className="d-flex align-items-center">
                            <StoreLogo storeName={store.name} />
                            <div style={{ marginLeft: "10px" }}>
                                <h6 className="mb-0">{store.name}</h6>
                                <small className="text-muted">{t("components.choose_stores.currency")}: {store.currency_name}</small>
                            </div>
                            </div>
                            <i className="ri-arrow-right-s-line" style={{ fontSize: "24px" }}></i>
                        </div>
                        
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
                              <span className="text-muted">{stores.length > 0 ? t("components.choose_stores.setup_new_store") : t("components.choose_stores.setup_store")}</span>
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

export default ChooseStoresCard