// OrdersTable.tsx
import { FC } from "react";
import { Table } from "react-bootstrap";
import TableSkeleton from "../../skeletons/TableSkeleton";
import { brazilianMoney, colombianMoney, formatDate } from "@/src/lib/helper";
import LogoImage from "../../logo-image/LogoImage";



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
import ShowOrderButton from "../../table-buttons/ShowOrderButton";



interface Order {
    id: number;
    external_id: number;
    customer_name: string;
    customer_surname: string;
    customer_email: string;
    created_at_in_dropi: string;
    status_category_name: string;
    distribution_company_name: string;
    total_order: number;
}

interface OrdersTableProps {
    orders: Order[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean; 
}

const OrdersTable: FC<OrdersTableProps> = ({ orders, currentPage, totalPages, onPageChange, isLoading}) => {


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


    const getStatusBadgeStyle = (status: string): React.CSSProperties => {
        const style = {
            padding: "2px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 500,
            color: "white",
            textAlign: "center" as const,
            display: "inline-block",
        };
    
        switch (status.toLowerCase()) {
            case "pendente de confirmação":
                return { ...style, backgroundColor: "rgb(214,156,47, 0.15)", color: "rgb(214, 156, 47)" };
                case "pendente de envio":
                    return {...style, backgroundColor: "rgba(245, 150, 50, 0.15)",  color: "rgb(245, 150, 50)"};
                case "em trânsito":
                    return {...style, backgroundColor: "rgba(73, 182, 245, 0.15)",  color: "rgb(73, 182, 245)"};
                case "entregue":
                    return {...style, backgroundColor: "rgba(38, 191, 148, 0.15)", color: "rgb(38, 191, 148)"};
                case "cancelado":
                    return {...style, backgroundColor: "rgba(51, 51, 51, 0.15)", color: "rgb(51, 51, 51)"};
                case "devolução":
                    return {...style, backgroundColor: "rgba(230, 83, 60, 0.15)", color: "rgb(230, 83, 60)" };
                case "novidade":
                    return {...style, backgroundColor: "rgba(151, 103, 255, 0.15)", color: "rgb(151, 103, 255)"};
                case "indenizado":
                    return {...style, backgroundColor: "rgba(100, 160, 220, 0.15)", color: "rgb(100, 160, 220)"};
                case "não traqueado":
                    return {...style, backgroundColor: "rgba(130, 130, 130, 0.15)", color: "rgb(130, 130, 130)" };
                default:
                    return {...style, backgroundColor: "rgba(130, 130, 130, 0.15)", color: "rgb(130, 130, 130)"};
        }
    };

    const showOrder = (orderId) => {
        window.location.href = `/orderdetails/${orderId}`;
    }

    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                    <th style={{borderRight: '1px solid #dee2e6'}}>Pedido</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Nome Cliente</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>E-mail Cliente</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Data do Pedido</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Status</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Transportadora</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Valor</th>
                    <th>Ação</th>
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={8} rows={5} /> 
                ) : orders.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={8} className="text-center py-3">
                                <span className="text-muted">Nenhum pedido encontrado</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td style={{fontWeight:400}}>{order.external_id}</td>
                                <td style={{fontWeight:400}}>{`${order.customer_name} ${order.customer_surname}`}</td>
                                <td style={{fontWeight:400}}>{order.customer_email ?? "-"}</td>
                                <td style={{fontWeight:400}}>{formatDate(order.created_at_in_dropi)}</td>
                                <td style={{fontWeight:400}}>                                   
                                        <span style={getStatusBadgeStyle(order.status_category_name)}>
                                            {order.status_category_name.toUpperCase()}
                                        </span>                                  
                                    </td>
                                <td style={{fontWeight:400}}>
                                        <div className="d-flex align-items-center">
                                            <LogoImage 
                                                imageSrc={companyImages[order.distribution_company_name.toUpperCase()]}
                                                altText={order.distribution_company_name} 
                                            />
                                            <span className="ms-2">{order.distribution_company_name}</span>
                                        </div>
                                    </td>
                                <td style={{fontWeight:400}}>
                                    <span className="bg-primary-transparent p-1 rounded">{brazilianMoney(order.total_order)}</span>

                                    
                                    
                                </td>
                                <td style={{fontWeight:400}}>
                                    <div className="hstack gap-2 fs-15">
                                        <ShowOrderButton onClick={() => showOrder(order.external_id)}/>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
                
            </Table>

                            

            
        </div>
    );
};

export default OrdersTable;
