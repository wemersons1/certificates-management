import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Alert } from "react-bootstrap";
import CotacaoPesoColombiano  from "../../../lib/apiCOP"
import api from "../../../lib/api";

interface HistoryWalletItem {
  id: number;
  wallet_id: number;
  order_id: number;
  user_id: number | null;
  amount: string;
  type: string;
  created_at: string;
  previous_amount: string;
  description: string;
  wallet: {
    id: number;
    user_id: number;
    user: {
      id: number;
      email: string;
    };
  };
}



interface HistoryWalletProps {
  orderId: string;
  historyDetails: HistoryWalletItem[]; 
  error: string | null; 
  loading: boolean; 
}



const HistoryWallet: React.FC<HistoryWalletProps> = ({
  orderId,
  historyDetails,
  error,
  loading,
}) => {
  const [cotacaopesocolombiano, setCotacao] = useState<number | null>(null);

  const convertToCOP = (value: string | number) => {
    if (value === "-" || isNaN(parseFloat(value.toString()))) {
      return "-";
    }

    if (cotacaopesocolombiano) {
      const convertedValue = (parseFloat(value.toString()) * cotacaopesocolombiano).toFixed(2);
      return convertedValue.replace(".", ",");
    }

    return "Carregando cotação...";
  };


  

  
 
  if (loading) return <p>...</p>;

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (

    <>
    
    <CotacaoPesoColombiano setCotacaoPesoColombiano={setCotacao} />
      <Card.Body >
        <Card.Title style={{marginLeft: '-1.5%'}}>Histórico da Carteira</Card.Title>
        {historyDetails.length > 0 ? (
          <Table>
            <thead>
              <tr>
              <th style={{ borderRight: '1px solid #dee2e6' }}>Tipo</th>
              <th style={{ borderRight: '1px solid #dee2e6' }}>Data</th>
              <th style={{ borderRight: '1px solid #dee2e6' }}>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {historyDetails.map((detail) => (
                <tr key={detail.id}>
                   <td style={{ borderRight: '1px solid #dee2e6', fontSize: '17px' }}>
                  <span
                    className={`badge ${detail.type === 'ENTRADA' ? 'bg-success-transparent' : 'bg-danger-transparent'}`}
                  >
                    {detail.type}
                    {detail.type === 'ENTRADA' ? (
                      <i className="fas fa-arrow-up" style={{ marginLeft: '8px' }}></i> 
                    ) : (
                      <i className="fas fa-arrow-down" style={{ marginLeft: '8px' }}></i> 
                    )}
                  </span>
                </td>
                  <td style={{ borderRight: '1px solid #dee2e6' }}>{new Date(detail.created_at).toLocaleString() || 'Data não encontrada.'}</td>
                  <td style={{ borderRight: '1px solid #dee2e6' }}>{detail.description || 'Descrição não encontrada.'}</td>
                  <td>R$ {convertToCOP(detail.amount)}</td>
                 
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Nenhum histórico encontrado.</p>
        )}
      </Card.Body>
      </>
  );
};

export default HistoryWallet;
