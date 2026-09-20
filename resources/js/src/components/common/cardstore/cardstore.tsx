import React, { FC, Fragment, useContext, useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'; 
import api from '../../../lib/api';
import desktoplogo from "../../../assets/images/brand-logos/desktop-logo.png";
import StoreLogo from "../../utils/storelogo/storelogo";
import AppContext from "../../../AppContext/Context";
import { firstLetterUppercase } from "../../../lib/helper";
interface Store {
  id: number;
  name: string;
  country_id: number;
  currency_name: string; 
}

const StoreItem: FC<{ store: Store; onSelect: (id: number) => void }> = ({ store, onSelect }) => (
  <div
    key={store.id}
    className="d-flex justify-content-between align-items-center p-3 border rounded mb-3"
    style={{ backgroundColor: "#f8f9fa", cursor: 'pointer' }}
    onClick={() => onSelect(store.id)} 
  >
    <div className="d-flex align-items-center">
      <StoreLogo storeName={store.name} />
      <div style={{ marginLeft: "10px" }}>
        <h6 className="mb-0">{store.name}</h6>
        <small className="text-muted">Moeda: {store.currency_name}</small>
      </div>
    </div>
    <i className="ri-arrow-right-s-line" style={{ fontSize: "24px" }}></i>
  </div>
);

const StoreList: FC<{ stores: Store[], onStoreSelect: (id: number) => void; onNavigate: () => void }> = ({ stores, onStoreSelect, onNavigate }) => (
  <div className="container my-3">
    {stores.map((store) => (
      <StoreItem key={store.id} store={store} onSelect={onStoreSelect} />
    ))}
    <div 
      className="d-flex justify-content-between align-items-center p-3 border rounded mb-3" 
      style={{ backgroundColor: "#f8f9fa", cursor: 'pointer' }} 
      onClick={onNavigate}
    >
      <div className="d-flex align-items-center">
        <i className="ri-add-line" style={{ fontSize: "24px", marginRight: "10px" }}></i>
        <span className="text-muted">{stores.length > 0 ? "Configurar nova loja" : "Configurar loja"}</span>
      </div>
      {stores.length > 0 && <span className="badge bg-primary">DELUXE</span>}
    </div>
  </div>
);

const Basic: FC = () => {
  const [stores, setStores] = useState<Store[]>([]); 
  const [loading, setLoading] = useState(true); 
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/client-store')
      .then((response) => {
        setStores(response.data); 
      })
      .catch((error) => {
        console.error("Error fetching stores:", error);
      })
      .finally(() => {
        setLoading(false); 
      });
  }, []);

  const handleStoreSelect = (storeId: number) => {
    api.put(`/client-store/${storeId}`, { active: 1 })
      .then(() => {
        navigate('/home'); 
      })
      .catch((error) => {
        console.error("Erro ao ativar a loja:", error); 
      });
  };

  const handleNavigate = () => {
    navigate('/setup');
  };

  if (loading) {
    return <div>Carregando lojas...</div>; 
  }

  const firstNameUser = () => {
    const userName = firstLetterUppercase(user.name);

    return userName.split(' ')[0];
  }

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
                    </h5>
                    <p className="mb-6 text-black op-7 fw-normal text-center" style={{ fontSize: "15px" }}>
                      Selecione a loja que deseja acessar
                    </p>
                    <StoreList stores={stores} onStoreSelect={handleStoreSelect} onNavigate={handleNavigate} />
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

export default Basic;
