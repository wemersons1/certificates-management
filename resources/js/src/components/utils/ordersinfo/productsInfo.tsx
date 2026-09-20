import React, { useEffect, useState } from "react";
import { Card, Table, Alert } from "react-bootstrap";
import CotacaoPesoColombiano from "../../../lib/apiCOP";
import api from "../../../lib/api";

interface ProductInfoProps {
  orderId: string;
  productInfo: {
    productDetails: any[];  
    calculatedDetails: any[]; 
  };
  error: string | null;
  loading: boolean;
}


const ProductInfo = ({ orderId, productInfo, error, loading }: ProductInfoProps) => {
  const { productDetails, calculatedDetails } = productInfo; 

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
      <Card.Body>
        <Card.Title style={{ marginLeft: "-1.5%" }}>Informações dos Produtos</Card.Title>
        {calculatedDetails.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th style={{ borderRight: "1px solid #dee2e6" }}>ID</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Nome do Produto</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Preço de Venda</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Custo Total</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Frete</th>
                <th style={{ borderRight: "1px solid #dee2e6" }}>Lucro</th>
                <th>Margem de Lucro</th>
              </tr>
            </thead>
            <tbody>
              {calculatedDetails.map((detail, index) => (
                <tr key={index}>
                  <td style={{ borderRight: "1px solid #dee2e6" }}>{detail.id || "-"}</td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}>{detail.productName || "-"}</td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}> R$ {convertToCOP(detail.salePrice || "-")}</td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}> <span className="bg-danger-transparent" style={{borderRadius:'20px', padding:'5px'}}> R$ {convertToCOP(detail.totalCost || "-")}</span></td>
                  <td style={{ borderRight: "1px solid #dee2e6" }} > <span className="bg-danger-transparent" style={{borderRadius:'20px', padding:'5px'}}>R$ {convertToCOP(detail.shippingAmount || "-")}</span></td>
                  <td style={{ borderRight: "1px solid #dee2e6" }}> <span className="bg-success-transparent" style={{borderRadius:'20px', padding:'5px'}}> R$ {convertToCOP(detail.profit || "-")}</span></td>
                  <td > <span className="bg-success-transparent" style={{borderRadius:'20px', padding:'5px'}}> {detail.profitMargin || "-"} %</span></td>
                  
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Sem detalhes de produtos disponíveis.</p>
        )}
      </Card.Body>
    </>
  );
};


export default ProductInfo;
