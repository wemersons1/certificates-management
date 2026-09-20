import React from "react";
import { Card, Table } from "react-bootstrap";

interface StatusOrdersProps {
  orderId: string; 
  statusOrders: HistoryItem[] | null;
  error: string | null; 
  loading: boolean; 
}

interface HistoryItem {
  id: number;
  status: string;
  created_at: string;
  shipping_guide: string | null;
  usuario_chatcenter: {
    name: string;
    email: string;
  } | null;
}

const StatusOrders: React.FC<StatusOrdersProps> = ({
  orderId,
  statusOrders,
  error,
  loading,
}) => {

  const formatStatus = (status: string): string => {
    return status
      .toLowerCase()
      .replace(/_/g, " ") 
      .replace(/\b\w/g, (char) => char.toUpperCase()); 
  };

  if (loading) return <p>Carregando...</p>;

  if (error) return <p>{error}</p>;

  return (
    <Card.Body>
      <Card.Title style={{ marginLeft: "-1.5%" }}>Status de Entrega</Card.Title>
      {statusOrders && statusOrders.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Data e Hora</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {statusOrders.map((item: HistoryItem) => (
              <tr key={item.id}>
                <td style={{ borderRight: "1px solid #dee2e6", textAlign: "center" }}>
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td style={{ fontSize: "18px", textAlign: "center", cursor: "pointer" }}>
                  <span
                    className={`badge ${
                      item.status === "Novidade"
                        ? "bg-warning"
                        : item.status === "EN BODEGA ORIGEN"
                        ? "bg-primary"
                        : item.status === "PENDIENTE CONFIRMACION"
                        ? "bg-danger"
                        : item.status === "Aguardando"
                        ? "bg-light text-dark"
                        : item.status === "ENTREGADO"
                        ? "bg-success-transparent"
                        : item.status === "GUIA_GENERADA"
                        ? "bg-primary-transparent text-dark"
                        : item.status === "EN CAMINO"
                        ? "bg-success"
                        : item.status === "EN RUTA"
                        ? "bg-primary-transparent"
                        : item.status === "PENDIENTE"
                        ? "bg-danger-transparent"
                        : "bg-light text-dark"
                    }`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Sem histórico de status disponível.</p>
      )}
    </Card.Body>
  );
};

export default StatusOrders;
