import { useState, useEffect } from 'react';
import api from '@/src/lib/api';

interface Orders {
    pending_confirmation: number;
    pending_shipping: number;
    in_transit: number;
    delivered: number;
    canceled: number;
    devolution: number;
    news: number;
    solved_news: number;
    compensated: number;
    not_tracked: number;
    full_transit: number;
    completed: number;
    confirmed: number;
    delivered_previous: number;
    total: number;   
    total_previous: number;
    total_growth: number;
}

interface OrdersByStatus {
    status_category: string;
    total: number;
}

interface Logistics {
    pending_rate: number;
    news_rate: number;
    devolution_rate: number;
    delivery_rate: number;
    canceled_rate: number;
    previous_delivery_rate: number;
    delivery_effectiveness: number;
    predictions: {
        predicted_delivery_rate: number;
        predicted_devolution_rate: number;
        predicted_delivered_orders: number;
        predicted_devolution_orders: number;
    }
}

interface Financial {
    total_revenue: number;
    growth_total_revenue: number;
    average_ticket: number;
    amount_earned_revenue: number;
    average_amount_earned_ticket_current: number;
    average_amount_earned_ticket: number;
    product_cost: number;
    growth_product_cost: number;
    devolution_shipping_cost: number;
    average_devolution_ticket_current: number;
    average_devolution_ticket: number;
    delivered_shipping_cost: number;
    average_delivered_shipping_cost: number;
    growth_average_delivered_shipping_cost: number;
    total_shipping_cost: number;
    total_order_cost: number;
    growth_total_order_cost: number;
    total_cost: number;
    growth_total_cost: number;
    total_cost_by_order: number;
    growth_total_cost_by_order: number;
    total_invested: number;
    growth_total_invested: number;
    profit: number;
    profit_margin: number;
    profit_by_delivered_order: number;
    cpa: number;
    real_cpa: number;
    roas: number;
    real_roas: number;
    roi: number;
    additional_income: number;
    growth_additional_income: number;
    additional_cost: number;
    growth_additional_cost: number;
    predictions: {
        predicted_amount_earned_revenue: number;
        predicted_devolution_cost: number;
        predicted_profit: number;
        predicted_profit_margin: number;
        predicted_roi: number;
        predicted_real_cpa: number;
        predicted_real_roas: number;
    }
}

interface MarketingGraph {
    name: string;
    value_invested: number;
    color: string;
}

interface DailyGraphFinancial {
    day: string,
    total_invested: number;
    total_revenue: number;
    total_cost: number;
    profit: number;
}


interface DailyGraphLogistics {
    day: string,
    pending_confirmation: number;
    pending_shipping: number;
    transit: number;
    delivered: number;
    canceled: number;
    devolution: number;
    news: number;
    total: number;
}

interface DailyGraph {
    financial: DailyGraphFinancial[];
    logistics: DailyGraphLogistics[];
}

interface ProductsRankingData {
    position: number;
    product_name: string;
    confirmed_orders: number;
    delivered_orders: number;
    devolution_orders: number;
    total_revenue: number;
    delivery_rate: number;
    delivery_effectiveness: number;
}

interface ProductsRanking {
    top_confirmed_orders: ProductsRankingData[];
    top_delivery_effectiveness: ProductsRankingData[];
    top_total_revenue: ProductsRankingData[];
}

interface StatesRankingData {
    position: number;
    state: string,
    confirmed_orders: number,
    delivered_orders: number,
    devolution_orders: number,
    total_revenue: number,
    delivery_rate: number,
    delivery_effectiveness: number,
    average_shipping_amount: number,
    average_delivered_shipping_amount: number
    average_devolution_shipping_amount: number
}

interface StatesRanking {
    top_total_orders: StatesRankingData[];
    top_confirmed_orders: StatesRankingData[];
    top_delivery_effectiveness: StatesRankingData[];
    top_average_shipping_amount: StatesRankingData[];
    top_average_delivered_shipping_amount: StatesRankingData[];
    top_total_revenue: StatesRankingData[];
}

interface DistributionCompanyRankingData {
    position: number;
    distribution_company: string;
    total_orders: number;
    confirmed_orders: number;
    delivered_orders: number;
    devolution_orders: number;
    delivery_rate: number;
    delivery_effectiveness: number;
    average_shipping_amount: number;
    average_delivered_shipping_amount: number;
    average_devolution_shipping_amount: number;
}


interface DistributionCompanyRanking {
    top_confirmed_orders: DistributionCompanyRankingData[];
    top_total_orders: DistributionCompanyRankingData[];
    top_delivery_effectiveness: DistributionCompanyRankingData[];
    top_delivery_rate: DistributionCompanyRankingData[];
    top_average_shipping_amount: DistributionCompanyRankingData[];
    top_average_delivered_shipping_amount: DistributionCompanyRankingData[];    
}

interface DashboardMetrics {
    orders: Orders;
    logistics: Logistics;
    financial: Financial;
    marketing_graph: MarketingGraph[];
    daily_graph: DailyGraph;
    orders_by_status: OrdersByStatus[],
    products_ranking: ProductsRanking,
    states_ranking: StatesRanking,
    distribution_company_ranking: DistributionCompanyRanking,
    loading: boolean;
    error: string | null;
}

const initialState: DashboardMetrics = {
    orders: {
        pending_confirmation: 0,
        pending_shipping: 0,
        in_transit: 0,
        delivered: 0,
        canceled: 0,
        devolution: 0,
        news: 0,
        solved_news: 0,
        compensated: 0,
        not_tracked: 0,
        full_transit: 0,
        completed: 0,
        confirmed: 0,
        delivered_previous: 0,
        total: 0,   
        total_previous: 0,
        total_growth: 0,
    },
    logistics: {
        pending_rate: 0,
        news_rate: 0,
        devolution_rate: 0,
        delivery_rate: 0,
        canceled_rate: 0,
        previous_delivery_rate: 0,
        delivery_effectiveness: 0,
        predictions: {
            predicted_delivery_rate: 0,
            predicted_devolution_rate: 0,
            predicted_delivered_orders: 0,
            predicted_devolution_orders: 0,
        },
    },
    financial: {
        total_revenue: 0,
        growth_total_revenue: 0,
        average_ticket: 0,
        amount_earned_revenue: 0,
        average_amount_earned_ticket_current: 0,
        average_amount_earned_ticket: 0,
        product_cost: 0,
        growth_product_cost: 0,
        devolution_shipping_cost: 0,
        average_devolution_ticket_current: 0,
        average_devolution_ticket: 0,
        delivered_shipping_cost: 0,
        average_delivered_shipping_cost: 0,
        growth_average_delivered_shipping_cost: 0,
        total_shipping_cost: 0,
        total_order_cost: 0,
        growth_total_order_cost: 0,
        total_cost: 0,
        growth_total_cost: 0,
        total_cost_by_order: 0,
        growth_total_cost_by_order: 0,
        total_invested: 0,
        growth_total_invested: 0,
        profit: 0,
        profit_margin: 0,
        profit_by_delivered_order: 0,
        cpa: 0,
        real_cpa: 0,
        roas: 0,
        real_roas: 0,
        roi: 0,
        additional_income: 0,
        growth_additional_income: 0,
        additional_cost: 0,
        growth_additional_cost: 0,
        predictions: {
            predicted_amount_earned_revenue: 0,
            predicted_devolution_cost: 0,
            predicted_profit: 0,
            predicted_profit_margin: 0,
            predicted_roi: 0,
            predicted_real_cpa: 0,
            predicted_real_roas: 0,
        }
    },
    marketing_graph: [],
    daily_graph: {
        financial: [],
        logistics: [],
    },
    products_ranking: {
        top_confirmed_orders: [],
        top_delivery_effectiveness: [],
        top_total_revenue: [],
    },
    states_ranking: {
        top_total_orders: [],
        top_average_delivered_shipping_amount: [],
        top_average_shipping_amount: [],
        top_confirmed_orders: [],
        top_delivery_effectiveness: [],
        top_total_revenue: [],
    },
    distribution_company_ranking: {
        top_average_delivered_shipping_amount: [],
        top_average_shipping_amount: [],
        top_total_orders: [],
        top_confirmed_orders: [],
        top_delivery_effectiveness: [],
        top_delivery_rate: [],
    },
    orders_by_status: [],
    loading: true,
    error: null,
};

interface Option {
    value: string;
    label: string;
}


type MultiValue<T> = T[];

export const useDashboardData = (selectedDates: { startDate: string; endDate: string, dateOption: string }, setProducts: React.Dispatch<React.SetStateAction<never[]>>, selectedProducts: MultiValue<Option>, productId: string | null) => {
    const { startDate, endDate, dateOption } = selectedDates;
    const [dashboardData, setDashboardData] = useState<DashboardMetrics>(initialState);

    useEffect(() => {
        api.get('/me/products').then(response => {
            setProducts(response.data.map(item => {
                return {
                    value: item.id,
                    label: item.name
                }
            }));
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setDashboardData((prevState) => ({ ...prevState, loading: true }));
            const products = selectedProducts.map(item => {
                return item.value
            });

            if (!products.length && productId) {
                products.push(productId);
            }

            try {
                const response = await api.get('/dashboard/metrics', {
                    params: {
                        dateOption: dateOption || 'custom',
                        startDate: dateOption === 'custom' ? startDate : undefined,
                        endDate: dateOption === 'custom' ? endDate : undefined,
                        products
                    },
                });

                const {orders, financial, logistics, marketing_graph, daily_graph, orders_by_status, products_ranking, states_ranking, distribution_company_ranking} = response.data;


                setDashboardData({
                    orders,
                    financial,
                    logistics,
                    marketing_graph,
                    daily_graph,
                    orders_by_status,
                    products_ranking,
                    states_ranking,
                    distribution_company_ranking,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                setDashboardData((prevState) => ({
                    ...prevState,
                    loading: false,
                    error: 'Erro ao carregar os dados da dashboard',
                }));
            }
        };

        fetchData();
    }, [dateOption, startDate, endDate, selectedProducts, productId]);

    return dashboardData;
};
