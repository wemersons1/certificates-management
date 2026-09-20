import React, { FC, ReactNode } from "react";
import { Card, CardBody, CardHeader, CardTitle, Form } from "react-bootstrap";
import DepartmentTable from "../../../../common/tables/DepartmentTable/DepartmentTable";
import DistributionCompanyTable from "../../../../common/tables/DistributionCompanyTable/DistributionCompanyTable";

interface DistributionCompanyRankingCardProps {
    title: string;
    rankings: any;
    selectedRanking: string;
    setSelectedRanking: (value: string) => void;
    isLoading: boolean;
}

const DistributionCompanyRankingCard: FC<DistributionCompanyRankingCardProps> = ({
    title,
    rankings,
    selectedRanking,
    setSelectedRanking,
    isLoading
}) => {
    const handleRankingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRanking(event.target.value);
    };

    const selectedRankingData = rankings[selectedRanking as keyof typeof rankings] || [];

    return (
        <Card className="custom-card" style={{ borderRadius: '12px' }}>
            <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle className= "mb-0">{title}</CardTitle>
                <Form.Select value={selectedRanking} onChange={handleRankingChange} style={{ maxWidth: '250px' }}>
                    <option value="top_total_orders">Total de Pedidos</option>
                    <option value="top_delivery_rate">Taxa de Entrega</option>
                    <option value="top_delivery_effectiveness">Efetividade de Entrega</option>
                    <option value="top_average_shipping_amount">Custo Médio de Frete</option>
                    <option value="top_average_delivered_shipping_amount">Custo Médio de Frete Entregue</option>
                </Form.Select>
            </CardHeader>
            <CardBody>
                <DistributionCompanyTable
                    distributionCompanies={selectedRankingData}
                    isLoading={isLoading}
                />
            </CardBody>
        </Card>
    );
};

export default DistributionCompanyRankingCard
;
