import React, { FC } from "react";
import { Card, CardBody, CardHeader, CardTitle, Form } from "react-bootstrap";
import ProductTable from "../../../../common/tables/ProductRankingTable/ProductRankingTable";

interface ProductRankingCardProps {
    title: string;
    type: "logistics" | "revenue";
    rankings?: any;
    selectedRanking?: string;
    setSelectedRanking?: (value: string) => void;
    singleRankingData?: any[];
    isLoading: boolean;
}

const ProductRankingCard: FC<ProductRankingCardProps> = ({
    title,
    type,
    rankings,
    selectedRanking,
    setSelectedRanking,
    singleRankingData,
    isLoading
}) => {
    const handleRankingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRanking && setSelectedRanking(event.target.value);
    };

    const selectedRankingData = singleRankingData || (rankings && selectedRanking && rankings[selectedRanking as keyof typeof rankings]) || [];

    return (
        <Card className="custom-card" style={{ borderRadius: '12px' }}>
            <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle className= "mb-0">{title}</CardTitle>
                {rankings && setSelectedRanking && (
                    <Form.Select value={selectedRanking} onChange={handleRankingChange} style={{ maxWidth: '250px' }}>
                        <option value="top_confirmed_orders">Pedidos Confirmados</option>
                        <option value="top_delivery_effectiveness">Efetividade de Entrega</option>
                        <option value="top_average_shipping_amount">Custo Médio de Frete</option>
                        <option value="top_average_delivered_shipping_amount">Custo Médio de Frete Entregue</option>
                    </Form.Select>

                )}                
            </CardHeader>
            <CardBody>
                <ProductTable
                    products={selectedRankingData}
                    isLoading={isLoading}
                    type = {type}
                />
            </CardBody>
        </Card>
    );
};

export default ProductRankingCard;
