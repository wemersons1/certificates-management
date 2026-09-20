import { FC, useEffect, useState } from "react";
import { Button, ProgressBar, Card } from "react-bootstrap";
import api from "../../../lib/api";
import CustomSpinner from "../custom-spinner";

interface OrderCounterProps {}

const OrderCounter: FC<OrderCounterProps> = () => {
    const [orders, setOrders] = useState<number | null>(null); // Pedidos atuais
    const [plan, setPlan] = useState<string | null>(null); // Nome do plano
    const [limit, setLimit] = useState<number | null>(null); // Limite de pedidos
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
    
                // Busca os dados do usuário
                const userResponse = await api.get("/me");
                const user = userResponse.data;  
    
                console.log("Dados do usuário:", user);
    
                if (!user || !user.client || !user.client.contract_active) {
                    throw new Error("Contrato ativo do usuário não encontrado");
                }
    
                const contract = user.client.contract_active;
    
                if (!contract.plan || contract.plan.numbers_of_orders === undefined) {
                    throw new Error("Plano ou limite de pedidos não encontrado");
                }
    
                setPlan(contract.plan.name); 
                setLimit(contract.plan.numbers_of_orders); 
    
                const orderCountSinceActivation = user.order_count_since_activation;
    
                if (typeof orderCountSinceActivation === "undefined") {
                    throw new Error("Campo 'order_count_since_activation' não encontrado na resposta da API");
                }
    
                setOrders(orderCountSinceActivation);
    
                if (contract.plan.numbers_of_orders !== null && orderCountSinceActivation >= contract.plan.numbers_of_orders) {
                    setIsBlocked(true);
                }
            } catch (error: any) {
                console.error("Erro ao carregar dados:", error);
                setError(`Erro: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserData();
    }, []);
    
    
    if (loading) {
        return (
            <div className="">
             <CustomSpinner size={10}></CustomSpinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-danger">
                <p>{error}</p>
                <Button variant="danger" onClick={() => window.location.reload()}>
                    Tentar Novamente
                </Button>
            </div>
        );
    }

    const progressPercentage =
        orders !== null && limit !== null
            ? Math.min((orders / limit) * 100, 100)
            : 0;

    return (
        <div>
           
            <div>
                <div className="mb-3">
                    <div className="d-flex align-items-center mb-1">
                        <i className="las la-boxes fs-34 text-muted me-2"></i>
                        <div className="d-flex flex-column align-items-start text-muted fs-14">
                            <span>Limite de Pedidos</span>
                            <span className="fw-bold">
                                {orders !== null && limit !== null
                                    ? `${orders} de ${limit} Pedidos`
                                    : "Carregando..."}
                            </span>
                        </div>
                    </div>
                    <ProgressBar
                        variant="warning"
                        now={progressPercentage}
                        className="progress-sm"
                    />
                </div>
                <Button href="/upgrade" variant="primary-light" className="xl-2">
                    <i className="las la-upload fs-18 me-1"></i>
                    
                    Realizar upgrade
                </Button>
            </div>
        </div>
    );
};

export default OrderCounter;
