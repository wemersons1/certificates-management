import React, { FC, Fragment, useContext, useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'; 
import api from '../../../lib/api.js';
import desktoplogo from "../../../assets/images/brand-logos/desktop-logo.png";
import StoreLogo from "../storelogo/storelogo.js";
import { firstLetterUppercase } from "../../../lib/helper.js";
import AppContext from "../../../AppContext/Context.js";
import CustomSpinner from "../../common/custom-spinner/index.js";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Store {
  id: number;
  name: string;
  country_id: number;
  currency_name: string; 
}

const StoreCard: FC = () => {
  const { signOut } = useContext(AppContext);
  const [stores, setStores] = useState<Store[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const { user, setUserLogged } = useContext(AppContext);
  const navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    api.get('/client-store')
      .then((response) => {
        setStores(response.data); 
      })
      .catch((error) => {
        console.error("Error fetching stores:", error);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false); 
      });
  }, []);

  useEffect(() => {
    if (user?.account === "limited") {
      toast.warning("Sua conta está limitada. Faça o upgrade para acessar.");
      navigate("/upgrade");
    }
  }, [user, navigate]);

  const handleStoreSelect = (storeId: number) => {
    api.put(`/client-store/${storeId}`, { active: 1 })
      .then((response) => {
        const { data: store } = response;
        setUserLogged({ ...user, current_store: store });
        navigate('/home'); 
      })
      .catch((error) => {
        console.error("Erro ao ativar a loja:", error); 
      });
  };

  const firstNameUser = () => {
    const userName = firstLetterUppercase(user.name);
    return userName.split(' ')[0];
  };

  const logoutHandle = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CustomSpinner/>                             
      </div>
    );
  }

  console.log(user);

  return (
    <Fragment>
      <div className="page error-bg" id="particles-js">
        <div className="error-page">
          <div className="container">
            <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <Card>
                  <Card.Body className="p-3 rectangle2">
                    <div className="my-3 d-flex justify-content-center">
                      <img src={desktoplogo} alt="logo" className="desktop-logo" />
                    </div>
                    <h5 className="mb-2 op-7 fw-bold text-center" style={{ color: "black" }}>
                      {t("pages.stores.welcome")}, {firstNameUser()}!
                    </h5>
                    <p className="mb-6 text-black op-7 fw-normal text-center" style={{ fontSize: "15px" }}>
                      {t("pages.stores.select_store")}
                    </p>

                    <div className="container my-3">
                      {stores.map((store) => (
                        <div
                          key={store.id}
                          className="d-flex justify-content-between align-items-center p-3 border rounded mb-3"
                          style={{ backgroundColor: "#f8f9fa", cursor: 'pointer' }}
                          onClick={() => handleStoreSelect(store.id)} 
                        >
                          <div className="d-flex align-items-center">
                            <StoreLogo storeName={store.name} />
                            <div style={{ marginLeft: "10px" }}>
                              <h6 className="mb-0">{store.name}</h6>
                              <small className="text-muted">{t("pages.stores.currency")}: {store.currency_name}</small>
                            </div>
                          </div>
                          <i className="ri-arrow-right-s-line" style={{ fontSize: "24px" }}></i>
                        </div>
                      ))}
                      
                      {/* Campo "nova loja" usando o plano do contrato ativo */}
                      {user.client?.contract_active?.plan && (
                        (user.client.contract_active.plan.id !== 4 ||
                         stores.length < user.client.contract_active.plan.number_of_stores) && (
                          <div 
                            className="d-flex justify-content-between align-items-center p-3 border rounded mb-3"
                            style={{ 
                              backgroundColor: "#f8f9fa", 
                              cursor: stores.length < user.client.contract_active.plan.number_of_stores ? 'pointer' : 'not-allowed', 
                              opacity: stores.length < user.client.contract_active.plan.number_of_stores ? 1 : 0.6
                            }} 
                            onClick={() => stores.length < user.client.contract_active.plan.number_of_stores && navigate('/setup')}
                          >
                            <div className="d-flex align-items-center">
                              <i className="ri-add-line text-muted" style={{ fontSize: "24px", marginRight: "10px" }}></i>
                              <span className="text-muted">{stores.length > 0 ? t("pages.stores.setup_new_store") : t("pages.stores.setup_store")}</span>
                            </div>
                            
                            {stores.length >= user.client.contract_active.plan.number_of_stores && (
                              <span style={{
                                background: "linear-gradient(90deg, rgba(84, 10, 245, 1) 0%, rgba(73, 182, 245, 1) 100%)",
                                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "2px 10px",
                                fontSize: "14px"
                              }}>
                                {user.client.contract_active.plan.number_of_stores === 1 ? "PRO" : "DELUXE"}                              
                              </span>
                            )}
                          </div>
                        )
                      )}

                      <div className="d-flex justify-content-center align-items-center">
                        <span 
                          className="text-muted" 
                          style={{ textDecoration: "underline", cursor: "pointer" }}  
                          onClick={logoutHandle}
                        >
                          {t("pages.stores.logout")}
                        </span>
                      </div>
                    </div>
                    
                  </Card.Body>
                </Card>
              </Col>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default StoreCard;
