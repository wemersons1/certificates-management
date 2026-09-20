import React, { useState } from "react";
import { Card, Table, Alert, Modal, Button } from "react-bootstrap";

interface HistoryNewsItem {
  id: number;
  order_id: number;
  created_at: Date;
  tipocategoria_env: string | null;
  novedad: string;
  solution: string;
  date_solution: string;
}

interface HistoryNewsProps {
  historyDetails: HistoryNewsItem[];
  error: string | null;
  loading: boolean;
}

const HistoryNews: React.FC<HistoryNewsProps> = ({ historyDetails, error, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<HistoryNewsItem | null>(null);

  const handleShowModal = (detail: HistoryNewsItem) => {
    setSelectedDetail(detail);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetail(null);
  };

  if (loading) return <p>...</p>;

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Card.Body>
        <Card.Title style={{ marginLeft: "-1.5%" }}>Histórico de Novidades</Card.Title>
        {historyDetails.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Data</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Novidade</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historyDetails.map((detail) => (
                <tr key={detail.id}>
                  <td style={{ borderRight: "1px solid #dee2e6" }}>
                    {new Date(detail.created_at).toLocaleString() || "Data não encontrada."}
                  </td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}>
                    {detail.novedad || "Novedade não encontrada."}
                  </td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}>
                    {detail.tipocategoria_env || "Categoria não encontrada."}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0",
                        cursor: "pointer",
                      }}
                      onClick={() => handleShowModal(detail)}
                    >
                      <i className="las la-search" style={{ color: "blue", fontSize: "20px" }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Nenhum histórico encontrado.</p>
        )}
      </Card.Body>

      {/* Modal */}
      <div className="mb-2">
      <Modal show={showModal} onHide={handleCloseModal} style={{marginTop: '10%'}}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail ? (
            <>
              <p><strong>ID:</strong> {selectedDetail.id}</p>
              <p><strong>Data:</strong> {new Date(selectedDetail.created_at).toLocaleString()}</p>
              <p><strong>Novidade:</strong> {selectedDetail.novedad}.</p>
              <p><strong>Categoria:</strong> {selectedDetail.tipocategoria_env || "Não encontrada."}</p>
              <p><strong>Solução:</strong> {selectedDetail.solution || "Solução não encontrada."}</p>
              <p><strong>Data de Solução:</strong> {selectedDetail.date_solution || "Data não encontrada."}</p>
            </>
          ) : (
            <p>Nenhuma informação disponível.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </>
  );
};

export default HistoryNews;
