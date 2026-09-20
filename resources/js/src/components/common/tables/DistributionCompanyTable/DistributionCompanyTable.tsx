// DistributionCompanyTable.tsx
import { FC } from "react";
import { Table } from "react-bootstrap";
import PlatformBadge from "../../../utils/ads/PlatformBadge/PlatformBadge";
import { brazilianMoney, colombianMoney, formatSimpleDate, usMoney } from "@/src/lib/helper";
import EditButton from "../../table-buttons/EditButton";
import DeleteButton from "../../table-buttons/DeleteButton";
import usaFlag from "../../../../assets/images/flags/usaFlag.svg"
import brazilFlag from "../../../../assets/images/flags/brazilFlag.svg"
import colombiaFlag from "../../../../assets/images/flags/colombiaFlag.svg"
import CurrencyBadge from "../../currency-badge/currencyBadge";
import CoordinadoraImage from "../../../../assets/images/distribution-companies/COORDINADORA.png";
import TiuiImage from "../../../../assets/images/distribution-companies/TIUI.jpg";
import AfimexImage from "../../../../assets/images/distribution-companies/AFIMEX.jpg";
import XCargoImage from "../../../../assets/images/distribution-companies/XCARGO.png";
import EnviaImage from "../../../../assets/images/distribution-companies/ENVIA.png";
import InterrapidisimoImage from "../../../../assets/images/distribution-companies/INTERRAPIDISIMO.png";
import ServientregaImage from "../../../../assets/images/distribution-companies/SERVIENTREGA.png";
import TccImage from "../../../../assets/images/distribution-companies/TCC.png";
import VelocesImage from "../../../../assets/images/distribution-companies/VELOCES.png";
import DominaImage from "../../../../assets/images/distribution-companies/DOMINA.png";
import Minutos99Image from "../../../../assets/images/distribution-companies/99MINUTOS.png";
import BlueImage from "../../../../assets/images/distribution-companies/BLUE.jpg";
import LaarcourierImage from "../../../../assets/images/distribution-companies/LAARCOURIER.jpg";
import GintracomImage from "../../../../assets/images/distribution-companies/GINTRACOM.jpg";
import TableSkeleton from "../../skeletons/TableSkeleton";
import EffectivenessBadge from "../../effectiveness-badge/EffectivenessBadge";
import LogoImage from "../../logo-image/LogoImage";

interface DistributionCompany {
    position?: number;
    distribution_company: string;
    total_orders: number;
    confirmed_orders: number;
    delivered_orders: number;
    delivery_rate: number;
    delivery_effectiveness: number;
    average_shipping_amount: string;
    average_delivered_shipping_amount: string;
    average_devolution_shipping_amount: string;
}

interface DistributionCompanyTableProps {
    distributionCompanies: DistributionCompany[];
    isLoading: boolean; 
}

const companyImages: { [key: string]: string } = {
    COORDINADORA: CoordinadoraImage,
    ENVIA: EnviaImage,
    INTERRAPIDISIMO: InterrapidisimoImage,
    SERVIENTREGA: ServientregaImage,
    TCC: TccImage,
    VELOCES: VelocesImage,
    "99MINUTOS": Minutos99Image,
    DOMINA: DominaImage,
    XCARGO: XCargoImage,
    BLUE: BlueImage,
    LAARCOURIER: LaarcourierImage,
    GINTRACOM: GintracomImage,
    AFIMEX: AfimexImage,
    TIUI: TiuiImage,
};

const DistributionCompanyTable: FC<DistributionCompanyTableProps> = ({ distributionCompanies, isLoading}) => {
    const currency = "BRL"

    const formatCurrency = (value: string, currency: string) => {
        switch (currency) {
            case "COP":
                return colombianMoney(value);
            case "USD":
                return usMoney(value);
            case "BRL":
                return brazilianMoney(value);
            default:
                return value;
        }
    };

    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                    <th style={{borderRight: '1px solid #dee2e6'}}>#</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Transportadora</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Total de Pedidos</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Pedidos Entregues</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete Entregue</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete Devolvido</th>
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={8} rows={5} /> 
                ) : distributionCompanies.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={8} className="text-center py-3">
                                <span className="text-muted">Nenhum dado encontrado</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {distributionCompanies.map((distributionCompany) => (
                            <tr key={distributionCompany.position}>
                                <td className="fw-semibold">{distributionCompany.position}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <LogoImage 
                                            imageSrc={companyImages[distributionCompany.distribution_company.toUpperCase()]}
                                            altText={distributionCompany.distribution_company} 
                                        />
                                        <span className="ms-2">{distributionCompany.distribution_company}</span>
                                    </div>
                                </td>
                                <td>{distributionCompany.total_orders}</td>
                                <td>{distributionCompany.delivered_orders}</td>
                                <td><EffectivenessBadge value={Math.round(distributionCompany.delivery_rate)} type="rate"/></td>
                                <td>{formatCurrency(distributionCompany.average_shipping_amount, currency)}</td>
                                <td><EffectivenessBadge value={Math.round(distributionCompany.delivery_effectiveness)} type="effectiveness"/></td>
                                <td>{formatCurrency(distributionCompany.average_delivered_shipping_amount, currency)}</td>
                                <td>{formatCurrency(distributionCompany.average_devolution_shipping_amount, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                )}
                
            </Table>

                            

            
        </div>
    );
};

export default DistributionCompanyTable;
