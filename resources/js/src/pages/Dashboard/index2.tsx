import { Fragment, useState, useRef, useEffect, useContext, useTransition } from "react"
import { Col, Row } from "react-bootstrap"
import DateFilter from "../../../../components/common/datefilter/DateFilter"
import MainCard from "../../../../components/utils/dashboard/cards/MainCard/MainCard"
import ProfitCard from "../../../../components/utils/dashboard/cards/ProfitCard/ProfitCard"
import TripleCard from "../../../../components/utils/dashboard/cards/TripleCard/TripleCard"
import SecondaryCard from "../../../../components/utils/dashboard/cards/SecondaryCard/SecondaryCard"
import GraphBarCard from "../../../../components/utils/dashboard/cards/GraphBarCard/GraphBarCard"
import GraphRadialCard from "../../../../components/utils/dashboard/cards/GraphRadialCard/GraphRadialCard"

import GraphRadialDevolution from "../../../../components/utils/dashboard/cards/GraphRadialCard/GraphRadialDevolution"
import MainCardWithoutColor from "../../../../components/utils/dashboard/cards/MainCardWithoutColor/MainCardWithoutColor"

import { useDashboardData } from "./dashboardData2"
import SecondaryDoubleCard from "../../../../components/utils/dashboard/cards/SecondaryDoubleCard/SecondaryDoubleCard"
import MarketingGraphCard from "../../../../components/utils/dashboard/cards/MarketingGraphCard/MarketingGraphCard"
import { brazilianMoney } from "@/src/lib/helper"
import DepartmentRankingCard from "../../../../components/utils/dashboard/cards/RankingCards/DepartmentRankingCard"
import DistributionCompanyRankingCard from "../../../../components/utils/dashboard/cards/RankingCards/DistributionCompanyRankingCard"
import OrderStatusGraphCard from "../../../../components/utils/dashboard/cards/OrderStatusGraphCard/OrderStatusGraphCard"
import EffectivenessBadge from "../../../../components/common/effectiveness-badge/EffectivenessBadge"
import ProductRankingCard from "../../../../components/utils/dashboard/cards/RankingCards/ProductRankingCard"
import GraphPieCard from "../../../../components/utils/dashboard/cards/GraphPieCard/GraphPieCard"
import WhatsAppChat from "../../../../components/common/whatsappchat"
import DashboardTooltip from "../../../../components/common/tooltips/DashboardTooltip"
import PredictedDeliveryRateCard from "../../../../components/utils/dashboard/cards/PredictedDeliveryRateCard/PredictedDeliveryRateCard"
import GraphRadialEntregues from "../../../../components/utils/dashboard/cards/GraphRadialCard/GraphRadialEntregues"
import GraphBarCardLucro from "../../../../components/utils/dashboard/cards/GraphBarCard/GraphBarCardLucro"
import CustomSpinner from "../../../../components/common/custom-spinner"
import { useNavigate, useSearchParams } from "react-router-dom"
import AppContext from "../../../../AppContext/Context"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"
import Select from 'react-select'
import If from "../../../../components/common/if/if"

interface Option {
    value: string;
    label: string;
}
type MultiValue<T> = T[];

const Dashboard = () => {

    const [selectedDates, setSelectedDates] = useState({ startDate: '', endDate: '', dateOption: '7days'});
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState<MultiValue<Option>>([]);
    const [selectedPeriod, setSelectedPeriod] = useState("7 dias");
    const [customDateLabel, setCustomDateLabel] = useState("Selecionar Período");
    const [selectedStateRanking, setSelectedStateRanking] = useState("top_total_orders");
    const [selectedDistributionCompanyRanking, setSelectedDistributionCompanyRanking] = useState("top_total_orders");
    const [selectedDailyGraph, setSelectedDailyGraph] = useState("financial");
    const [includeAdditionalValue, setIncludeAdditionalValue] = useState(false);
    const [predictedDeliveryRateFront, setPredictedDeliveryRateFront] = useState(0);
    

    const sectionRefs = {
        finance: useRef(null),
        logistics: useRef(null),
        costs: useRef(null),
        revenue: useRef(null),
        marketing: useRef(null)
    };


    const { user } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

  useEffect(() => {
    if (user?.account === "limited") {
      toast.warning("Sua conta está limitada. Faça o upgrade para acessar.");
      navigate("/upgrade");
    }
  }, [user, navigate]);
    const scrollToSection = (section) => {
        const offset = 100;
        const element = sectionRefs[section]?.current;
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    };
    
    const periodMapping = {
        "today": "Hoje",
        "yesterday": "Ontem",
        "7days": "7 dias",
        "30days": "30 dias",
        "custom": "Selecionar Período"
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (startDate: string, endDate: string, dateOption: string) => {
        setSelectedDates({ startDate, endDate, dateOption });
        setSelectedPeriod(periodMapping[dateOption] || dateOption);

        if (dateOption === "custom") {
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            setCustomDateLabel(`${formattedStartDate} - ${formattedEndDate}`);
        } else {
            setCustomDateLabel("Selecionar Período");
        }
        setSelectedDailyGraph("financial");
    };

    

    const primaryColor = '84, 10, 245';
    const revenueColor = '38,191,148';
    const logisticColor = '245,184,73';
    const costColor = '230,83,60';
    const marketingColor = '73,182,245';

    const ordersIcon = "las la-boxes";
    const revenueIcon = "las la-dollar-sign";
    const productSupplierIcon = "las la-dolly"
    const costIcon = "las la-file-invoice-dollar";
    const marketingIcon = "las la-bullhorn";
    const confirmedIcon = "las la-check-circle";
    const canceledIcon = "las la-ban";
    const pendingConfirmationIcon = "las la-exclamation-triangle"
    const deliveredIcon = "las la-check";
    const devolutionIcon = "las la-exchange-alt"
    const transitIcon = "las la-truck-moving";
    const shippingCompanyIcon = "lab la-dropbox";
    const pendingShippingIcon = "las la-clock";
    const newsIcon = "las la-exclamation-circle";
    const taxesIcon = "las la-balance-scale-left";
    const roasIcon = "las la-redo-alt";
    const boxIcon = "las la-box";
    const additionalValueIcon = "las la-dolly-flatbed";



    const iconCpa = "las la-donate";
    const totalRevenueIcon = "las la-money-check-alt";
    const iconROI = "las la-chart-line";
    const iconPercentage = "las la-percentage";
    const iconTicket = "las la-ticket-alt";
    const cpaIcon = "las la-donate";
    const iconMarketing = "las la-bullhorn";
    const iconOrders = "las la-boxes";
    const marginIcon = "las la-coins";
    const profitIcon = "las la-hand-holding-usd";
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('product_id');
    
    const {
        orders,
        financial,
        logistics,
        marketing_graph,
        daily_graph,
        orders_by_status,
        products_ranking,
        states_ranking,
        distribution_company_ranking,
        loading,
        error,
    } = useDashboardData(selectedDates, setProducts, selectedProducts, productId);


    const costPieData = {
        labels: ['Receita Obtida', 'Custo Total'],
        values: [financial.amount_earned_revenue, (financial.devolution_shipping_cost + financial.total_invested)],
        colors: ['#FFAC9F', '#E6533C'],
    }

    const dailyGraphCategories = daily_graph.financial.map(item => item.day);
    const dailyGraphFinancialSeries = [
        {
            name: "Faturamento",
            data: daily_graph.financial.map(item => item.total_revenue),
        },
        {
            name: "Marketing",
            data: daily_graph.financial.map(item => item.total_invested), 
        },
        {
            name: "Custos",
            data: daily_graph.financial.map(item => item.total_cost), 
        },
        {
            name: "Lucro",
            data: daily_graph.financial.map(item => item.profit), 
        },
    ];
    const dailyGraphLogisticsSeries = [
        {
            name: "Pendente de Confirmação",
            data: daily_graph.logistics.map(item => item.pending_confirmation),
        },
        {
            name: "Pendente de Envio",
            data: daily_graph.logistics.map(item => item.pending_shipping), 
        },
        {
            name: "Em Trânsito",
            data: daily_graph.logistics.map(item => item.transit), 
        },
        {
            name: "Entregues",
            data: daily_graph.logistics.map(item => item.delivered), 
        },
        {
            name: "Cancelados",
            data: daily_graph.logistics.map(item => item.canceled), 
        },
        {
            name: "Devolvidos",
            data: daily_graph.logistics.map(item => item.devolution), 
        },
        {
            name: "Novidades",
            data: daily_graph.logistics.map(item => item.news), 
        },
        
    ];
    const dailyGraphFinancialColors = [
        `rgb(${logisticColor})`,
        `rgb(${marketingColor})`,
        `rgb(${costColor})`,
        `rgb(${revenueColor})`,
    ];

    const dailyGraphLogisticsColors = [
        `rgb(245,184,73)`,
        'rgb(245,150,50)',
        `rgb(73,182,245)`,
        `rgb(38,191,148)`,
        'rgb(35, 35, 35)',    
        `rgb(230,83,60)`,
        'rgb(151, 103, 255)',
    ];
    const dailyGraphData =
        selectedDailyGraph === "financial"
        ? {
            categories: dailyGraphCategories,
            series: dailyGraphFinancialSeries,
            colors: dailyGraphFinancialColors,
            title: "Resumo Financeiro",
            yAxisFormat: "currency" as "currency",
            tooltipFormat: (value) => brazilianMoney(value),
            }
        : {
            categories: dailyGraphCategories,
            series: dailyGraphLogisticsSeries,
            colors: dailyGraphLogisticsColors,
            title: "Resumo Logístico",
            yAxisFormat: "number" as "number",
            tooltipFormat: (value) => value,
        };
    const costGraphSeries = [
        {
            name: "Custo",
            data: daily_graph.financial.map(item => item.total_cost),
        },
    ];
    const profitGraphSeries = [
        {
            name: "Lucro",
            data: daily_graph.financial.map(item => item.profit), 
        },
    ];
    const marketingGraphSeries = [
        {
            name: "Marketing",
            data: daily_graph.financial.map(item => item.total_invested), 
        },
    ];

    const handleToggleAdditionalValue = (e) => {
        setIncludeAdditionalValue((prevState) => !prevState); 
        e.currentTarget.blur(); 
    };

    useEffect(() => {
        if (logistics) {
            setPredictedDeliveryRateFront(logistics.predictions.predicted_delivery_rate); 
        }
    }, [logistics]);

    const handleSaveDeliveryRate = (newRate: number) => {
        setPredictedDeliveryRateFront(newRate); 
    };


    const predictedDevolutionRateFront = parseFloat((100 - logistics.canceled_rate - predictedDeliveryRateFront).toFixed(2))

    const predictedDeliveredOrdersFront = Math.round(orders.total * (predictedDeliveryRateFront/100))
    const predictedDevolutionOrdersFront = Math.round(orders.total * (predictedDevolutionRateFront/100))


    
    const predictedAmountEarnedFront = parseFloat((financial.average_amount_earned_ticket * predictedDeliveredOrdersFront).toFixed(2))
    const predictedDevolutionCostFront = parseFloat((financial.average_devolution_ticket * predictedDevolutionOrdersFront).toFixed(2))
    const predictedProfitFront = parseFloat((predictedAmountEarnedFront - predictedDevolutionCostFront - financial.total_invested).toFixed(2))
    const predictedProfitMarginFront =predictedAmountEarnedFront > 0 ?  parseFloat((((predictedProfitFront / predictedAmountEarnedFront)*100)).toFixed(2)) : 0
    const predictedRoiFront = financial.total_invested > 0 ? parseFloat((predictedProfitFront/financial.total_invested).toFixed(2)) : 0     

    const predictedCPAFront = predictedDeliveredOrdersFront > 0 ? parseFloat((financial.total_invested/predictedDeliveredOrdersFront).toFixed(2)) : 0
    const predictedRoasFront = financial.total_invested > 0 ? parseFloat((predictedAmountEarnedFront/financial.total_invested).toFixed(2)) : 0

    const adjustedPredictedProfit = includeAdditionalValue ? parseFloat((predictedProfitFront + financial.additional_income - financial.additional_cost).toFixed(2)) : predictedProfitFront;

    const adjustedProfit = includeAdditionalValue ? parseFloat((financial.profit + financial.additional_income - financial.additional_cost).toFixed(2)) : financial.profit;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}>
                 <CustomSpinner size={30} color="#3c03cc" />                            
            </div>
        );
    }

    return (
        <Fragment>

            <WhatsAppChat
            phoneNumber="5511963989975" 
            message="Olá! Tenho algumas dúvidas sobre o Scalefy."
            position="right" 
            />                
            
            <Row className="d-flex justify-content-center">
            <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>

            <Row className="d-flex justify-content-center" style={{marginBottom: '50px'}}>
                <Row className="d-flex align-items-center mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-muted">{t("overview")}</h5>
                        <div className="d-flex" style={{zIndex: 10}}>

                            <PredictedDeliveryRateCard averageDeliveryRate={predictedDeliveryRateFront} onSave={handleSaveDeliveryRate} canceledRate={logistics.canceled_rate} devolutionRate={logistics.devolution_rate} deliveryRate={logistics.delivery_rate}/>                                                  
                            
                            <div className="d-flex form-check form-switch align-items-center">
                                <input
                                    type="checkbox"
                                    className="form-check-input form-checked-primary"
                                    role="switch"
                                    id="switchAdditionalValue"
                                    checked={includeAdditionalValue}
                                    onChange={handleToggleAdditionalValue}
                                    style={{
                                        width: '2.5rem',
                                        height: '1.5rem',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                    }}
                                />
                                <span className="ms-2 me-5 text-muted fs-14">Incluir valores adicionais</span>
                            </div>
                            <DateFilter
                                color={primaryColor}
                                selectedValue={selectedPeriod}
                                onChange={handleDateChange}
                                customLabel={customDateLabel}
                            />
                        </div>
                                   
                    </div>                    
                </Row>

                <If condition={!!!productId}>
                    <Row className={'d-flex justify-content-end mb-3'}>
                        <Col md={3}>
                            <Select 
                                options={products} 
                                isMulti 
                                value={selectedProducts}
                                onChange={value => {
                                    setSelectedProducts(value.map(item => {
                                        return {
                                            value: item.value,
                                            label: item.label
                                        }
                                    }));
                                }}
                            />
                        </Col>
                    </Row>
                </If>
               
                <Row>
                    <MainCard
                        title = {t("total_orders")}
                        value = {orders.total}
                        percentage = {orders.total_growth}
                        icon = {ordersIcon} 
                        bgColor = {logisticColor}
                        showLink={true}
                        onClick={() => scrollToSection('logistics')}
                        tooltip="Representa o total de pedidos gerado na loja."
                    /> 
                    <MainCard
                        title = {t("revenue")}
                        value = {brazilianMoney(financial.total_revenue)}
                        percentage = {financial.growth_total_revenue}
                        icon = {revenueIcon}
                        bgColor = {revenueColor}
                        showLink={true}
                        onClick={() => scrollToSection('revenue')}
                        tooltip="Representa o faturamento gerado pelos pedidos."
                    /> 
                    <MainCard
                        title = {t("costs")}
                        value = {brazilianMoney(financial.total_order_cost)}
                        percentage = {financial.growth_total_order_cost}
                        icon = {costIcon}
                        bgColor = {costColor}
                        showLink={true}
                        onClick={() => scrollToSection('costs')}
                        tooltip="Representa o custo total da operação. (Custo de produtos + Frete + Devoluções + Comissão)."
                    /> 
                    <MainCard
                        title = {t("marketing")}
                        value = {brazilianMoney(financial.total_invested)}
                        percentage = {financial.growth_total_invested}
                        icon = {marketingIcon}
                        bgColor = {marketingColor}
                        showLink={true}
                        onClick={() => scrollToSection('marketing')}
                        tooltip="Representa o valor total investido em anúncios."
                    />                    
                </Row>

                <Row> 
                    <Col md={5}> 
                        <Row>           
                            <ProfitCard
                                title= {t("net_profit")}
                                value= {brazilianMoney(adjustedProfit)}
                                icon = {profitIcon}
                                type = "real"
                                tooltip="Representa o valor real do lucro líquido já obtido. (Receita Líquida - Marketing)"
                            />
                            <ProfitCard
                                title= {t("predicted_profit")}
                                value= {brazilianMoney(adjustedPredictedProfit)}
                                icon = {profitIcon}
                                type = "predicted"
                                tooltip="Representa o provável lucro líquido que sua operação terá após todos os pedidos atingirem um status final."
                            />
                        </Row>
                        <Row>
                            <TripleCard
                                title1 = {t("profit_margin")}
                                value1 = {`${financial.profit_margin}%`}
                                predicted1 = {`${predictedProfitMarginFront}%`}
                                title2 = {t("roi")}
                                value2 = {`${financial.roi}x`}
                                predicted2 = {`${predictedRoiFront}x`}
                                title3 = {t("average_profit")}
                                value3 = {brazilianMoney(financial.profit_by_delivered_order)}
                                icon = {marginIcon}
                                iconColor={revenueColor}
                            />                            
                        </Row>
                        <Row>
                            <SecondaryCard
                                title= {t("gross_revenue")}
                                value= {brazilianMoney(financial.amount_earned_revenue)}
                                icon = {totalRevenueIcon}
                                iconColor={revenueColor}
                                predicted={brazilianMoney(predictedAmountEarnedFront)}
                                tooltip="Representa o valor total recebido pela entrega dos seus pedidos. Já está abatido o valor do frete e do custo do produto."
                            />
                            <SecondaryCard
                                title= {t("cpa")}
                                value= {brazilianMoney(financial.cpa)}
                                icon = {cpaIcon}
                                iconColor={marketingColor}
                                tooltip="Representa o valor gasto em anúncios para gerar um pedido no site."
                            />
                        </Row>
                        <Row>
                            <TripleCard
                                title1 = {t("average_ticket")}
                                value1 = {brazilianMoney(financial.average_ticket)}
                                title2 = {t("devolution_average_ticket")}
                                value2 = {brazilianMoney(financial.average_devolution_ticket_current)}
                                title3 = {t("devolutions")}
                                value3 = {`${brazilianMoney(financial.devolution_shipping_cost)} (${orders.devolution})`}
                                predicted3={`${brazilianMoney(predictedDevolutionCostFront)}  (${predictedDevolutionOrdersFront})`}
                                icon = {iconTicket}
                                iconColor={revenueColor}
                            />  
                        </Row>
                    </Col>
                    <Col md={7}>
                        <GraphBarCard
                            categories={dailyGraphData.categories}
                            seriesData={dailyGraphData.series}
                            title={dailyGraphData.title}
                            height={300}
                            stacked={true}
                            colors = {dailyGraphData.colors}
                            yAxisFormat={dailyGraphData.yAxisFormat}
                            legendPosition="top"
                            tooltipFormat={dailyGraphData.tooltipFormat}
                            selectOptions={[
                                { value: "financial", label: "Financeiro" },
                                { value: "logistics", label: "Logístico" },
                            ]}
                            onSelectChange={(value) => setSelectedDailyGraph(value)}
                            defaultSelected={selectedDailyGraph}
                        />                        
                    </Col>
                </Row>      
                <Row>
                    <Col md={5}>  
                        <OrderStatusGraphCard
                            title={t("order_report")}
                            labels={orders_by_status.map(item => item.status_category)}
                            values={orders_by_status.map(item => item.total)}
                          
                        />                     
                        
                    </Col>
                    <Col md={2 } className="d-flex">
                        <GraphRadialCard
                            title={t("pending")}
                            subtitle={t("pending")}
                            percentage={logistics.pending_rate}
                            units={orders.pending_confirmation + orders.pending_shipping}
                            color="#f0a500"
                            legends={[
                                { label: t("confirmation"), value: `${orders.pending_confirmation} ${t("units")}` },
                                { label: t("shipping"), value: `${orders.pending_shipping} ${t("units")}` },
                            ]}
                        />                           
                    </Col>
                    <Col md={2} className="d-flex">
                        <GraphRadialCard
                            title={t("returned")}
                            subtitle={t("returned")}
                            percentage={logistics.devolution_rate}
                            units={orders.devolution}
                            color="#E6533C"
                            legends={[
                                { label: t("returned"), value: `${orders.devolution} ${t("units")}` },
                            ]}
                        />                           
                    </Col>
                    <Col md={3} className="d-flex">
                        <GraphRadialCard
                            title={t("delivered")}
                            subtitle={t("delivered")}
                            percentage={logistics.delivery_rate}
                            units={orders.delivered}
                            color="#26bf94"
                            legends={[
                                { label: t("canceled"), value: `${orders.canceled} ${t("units")} - ${Math.round(logistics.canceled_rate)}%` },
                                { label: t("returned"), value: `${orders.devolution} ${t("units")} - ${Math.round(logistics.devolution_rate)}%` },
                                { label: t("effectiveness"), value: <EffectivenessBadge value = {logistics.delivery_effectiveness} type="effectiveness"/>},
                               
                            ]}
                            
                        />                           
                    </Col>                
                </Row>          
            </Row>

            {/* Logistics */}
            <Row ref={sectionRefs.logistics} className="d-flex justify-content-center" style={{paddingTop: '30px', marginBottom: '50px'}}>

                <Row className="d-flex align-items-center mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-muted">Logística</h5>
                        <div className="d-flex" style={{zIndex: 10}}>  
                            <PredictedDeliveryRateCard averageDeliveryRate={predictedDeliveryRateFront} onSave={handleSaveDeliveryRate} canceledRate={logistics.canceled_rate} devolutionRate={logistics.devolution_rate} deliveryRate={logistics.delivery_rate}/>                       
                            <DateFilter
                                color={logisticColor}
                                selectedValue={selectedPeriod}
                                onChange={handleDateChange}
                                customLabel={customDateLabel}
                            />  
                        </div>
                               
                    </div>                    
                </Row>

                <Row>
                    <Col md={3}>
                        <MainCard
                            title = "Total de Pedidos"
                            value = {orders.total}
                            percentage = {orders.total_growth}
                            icon = {ordersIcon}
                            bgColor = {logisticColor}
                            tooltip="Representa o total de pedidos gerado na loja."
                        />
                        <MainCard
                            title = "Frete Médio por Pedido"
                            value = {brazilianMoney(financial.average_delivered_shipping_cost)}
                            percentage = {financial.growth_average_delivered_shipping_cost}
                            icon = {costIcon}
                            bgColor = {logisticColor}
                            tooltip="Representa o valor médio pago em cada frete."
                        />                          
                    </Col>
                    <Col md={9}>
                        <Row>
                            <MainCardWithoutColor
                                title = "Pedidos Confirmados"
                                value = {orders.confirmed}
                                percentage = {1}
                                icon = {confirmedIcon}
                                iconColor = {logisticColor}
                            /> 
                            <MainCardWithoutColor
                                title = "Pedidos Cancelados"
                                value = {orders.canceled}
                                percentage = {1}
                                icon = {canceledIcon}
                                iconColor = {logisticColor}
                            /> 
                            <MainCardWithoutColor
                                title = "Pendentes de Confirmação"
                                value = {orders.pending_confirmation}
                                percentage = {1}
                                icon = {pendingConfirmationIcon}
                                iconColor = {logisticColor}
                            />        
                            <MainCardWithoutColor
                                title = "Pendentes de Envio"
                                value = {orders.pending_shipping}
                                percentage = {1}
                                icon = {pendingShippingIcon}
                                iconColor = {logisticColor}
                            />           
                            

                        </Row>
                        <Row>
                            <MainCardWithoutColor
                                title = "Entregues"
                                value = {orders.delivered}
                                percentage = {1}
                                icon = {deliveredIcon}
                                iconColor = {logisticColor}
                            />  
                            <MainCardWithoutColor
                                title = "Devolvidos"
                                value = {orders.devolution}
                                percentage = {1}
                                icon = {devolutionIcon}
                                iconColor = {logisticColor}
                            />
                            <MainCardWithoutColor
                                title = "Novidades"
                                value = {orders.news}
                                percentage = {1}
                                icon = {newsIcon}
                                iconColor = {logisticColor}
                            />
                            <MainCardWithoutColor
                                title = "Em Trânsito"
                                value = {orders.in_transit}
                                percentage = {1}
                                icon = {transitIcon}
                                iconColor = {logisticColor}
                            /> 

                        </Row>
                    </Col>
                    
                    
                </Row>
                <Row>
                    <Col>
                        <GraphRadialCard
                            title="Pendentes"
                            subtitle="Pendentes"
                            percentage={logistics.pending_rate}
                            units={orders.pending_confirmation + orders.pending_shipping}
                            color="#f0a500"
                            legends={[
                                { label: 'Confirmação', value: `${orders.pending_confirmation} unidades` },
                                { label: 'Envio', value: `${orders.pending_shipping} unidades` },
                            ]}
                        />  
                    </Col>
                    <Col> 
                        <GraphRadialCard
                            title="Novidades"
                            subtitle="Novidades"
                            percentage={logistics.news_rate}
                            units={orders.news}
                            color="#9767ff"
                            legends={[
                            { label: 'Novidades', value: `${orders.news - orders.solved_news} unidades` },
                            { label: 'Solucionadas', value: `${orders.solved_news} unidades` },
                            ]}
                        />  
                    </Col>
                    <Col> 
                        <GraphRadialCard
                            title="Devoluções"
                            subtitle="Devoluções"
                            percentage={logistics.devolution_rate}
                            units={orders.devolution}
                            color="#E6533C"
                            legends={[
                                { label: 'Devolvidos', value: `${orders.devolution} unidades` },
                            ]}
                        /> 
                    </Col>
                    <Col>
                        <GraphRadialCard
                            title="Entregues"
                            subtitle="Entregues"
                            percentage={logistics.delivery_rate}
                            units={orders.delivered}
                            color="#26bf94"
                            legends={[
                                { label: 'Cancelados', value: `${orders.canceled} uni - ${Math.round(logistics.canceled_rate)}%` },
                                { label: 'Devolvidos', value: `${orders.devolution} uni - ${Math.round(logistics.devolution_rate)}%` },
                                { label: 'Efetividade', value: <EffectivenessBadge value = {logistics.delivery_effectiveness} type="effectiveness"/>},
                               
                            ]}
                            
                        />       
                    </Col>  

                </Row>

                <Row> 
                    <Col md={5}>
                        <OrderStatusGraphCard
                            title="Relatório de Pedidos"
                            labels={orders_by_status.map(item => item.status_category)}
                            values={orders_by_status.map(item => item.total)}
                          
                        />   
                    </Col>
                    <Col md={7}>
                        <DepartmentRankingCard
                            title="Ranking de Departamentos"
                            type = "logistics"
                            rankings={states_ranking}
                            selectedRanking={selectedStateRanking}
                            setSelectedRanking={setSelectedStateRanking}
                            isLoading={loading}
                        />
                       
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <DistributionCompanyRankingCard
                            title="Ranking de Transportadoras"
                            rankings={distribution_company_ranking}
                            selectedRanking={selectedDistributionCompanyRanking}
                            setSelectedRanking={setSelectedDistributionCompanyRanking}
                            isLoading={loading}
                        />                        
                    </Col>
                </Row>      
                     
            </Row>

            {/* Revenue */}
            <Row ref={sectionRefs.revenue} className="d-flex justify-content-center" style={{paddingTop: '30px', marginBottom: '50px'}}>

                <Row className="d-flex align-items-center mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-muted">Receita</h5>
                        
                        <div className="d-flex" style={{zIndex: 10}}>
                            <PredictedDeliveryRateCard averageDeliveryRate={predictedDeliveryRateFront} onSave={handleSaveDeliveryRate} canceledRate={logistics.canceled_rate} devolutionRate={logistics.devolution_rate} deliveryRate={logistics.delivery_rate}/> 
                                      
                            <DateFilter
                                color={revenueColor}
                                selectedValue={selectedPeriod}
                                onChange={handleDateChange}
                                customLabel={customDateLabel}
                            />  
                        </div>          
                    </div>                    
                </Row>

                <Row>
                    <Col md={6}>
                        <Row>
                            <MainCard
                                title = "Faturamento"
                                value = {brazilianMoney(financial.total_revenue)}
                                percentage = {financial.growth_total_revenue}
                                icon = {revenueIcon}
                                bgColor = {revenueColor}
                                tooltip="Representa o faturamento gerado pelos pedidos."
                            />
                        </Row>
                        <Row>
                            <ProfitCard
                                title= "Lucro Líquido"
                                value= {brazilianMoney(financial.profit)}
                                icon = {profitIcon}
                                type = "real"
                                tooltip="Representa o valor real do lucro líquido já obtido. (Receita Líquida - Marketing)"
                            />
                            
                            <SecondaryCard
                                title = "Margem de Lucro"
                                value = {`${financial.profit_margin}%`}
                                icon = {marginIcon}
                                iconColor = {revenueColor}
                                tooltip="Representa a relação entre o lucro e a receita total."
                                
                            />
                            <SecondaryCard
                                title = "ROI"
                                value = {`${financial.roi}x`}
                                icon = {marginIcon}
                                iconColor = {revenueColor}
                                tooltip="Retorno sobre o investimento."
                            />
                        </Row>
                        <Row>
                           
                            <SecondaryCard
                                title = "Receita Bruta"
                                value = {brazilianMoney(financial.amount_earned_revenue)}
                                icon = {revenueIcon}
                                iconColor = {revenueColor}
                                //predicted={brazilianMoney(predictedAmountEarnedFront)}
                                tooltip="Representa o valor total recebido pela entrega dos seus pedidos. Já está abatido o valor do frete e do custo do produto."
                            />
                             <SecondaryCard
                                title = "Ticket Médio Ganancia"
                                value = {brazilianMoney(financial.average_amount_earned_ticket_current)}
                                icon = {revenueIcon}
                                iconColor = {revenueColor}
                                tooltip="Representa a receita bruta dividido pela quantidade de pedidos entregues."
                            />
                            <SecondaryCard
                                title = "Valores Adicionais"
                                value = {brazilianMoney(financial.additional_income)}
                                icon = {revenueIcon}
                                iconColor = {revenueColor}
                            />
                        </Row>
                    </Col>
                    <Col md={6}>
                        <GraphBarCardLucro
                            categories={dailyGraphCategories}
                            seriesData={profitGraphSeries}
                            title="Lucro Líquido"
                            colors={[`rgb(${revenueColor})`]}
                            height={254}
                            stacked={true}
                            yAxisFormat="currency"
                            legendPosition="top"
                            tooltipFormat={(value) => brazilianMoney(value)}
                        />                          
                    </Col>                 
                </Row>

                <Row> 
                    <Col md={6}> 
                        <ProductRankingCard
                            title="Produtos Mais Lucrativos"
                            type = "revenue"
                            singleRankingData={products_ranking.top_total_revenue}
                            isLoading={loading}
                        />                                  
                    </Col>
                    <Col md={6}>
                        <DepartmentRankingCard
                            title="Departamentos Mais Lucrativos"
                            type = "revenue"
                            singleRankingData={states_ranking.top_total_revenue}
                            isLoading={loading}
                        />                          
                    </Col>
                </Row>                    
            </Row>

            {/* Costs */}
            <Row ref={sectionRefs.costs} className="d-flex justify-content-center" style={{paddingTop: '30px', marginBottom: '50px'}}>

                <Row className="d-flex align-items-center mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-muted">Custos</h5>
                        <div className="d-flex" style={{zIndex: 10}}>
                            <PredictedDeliveryRateCard averageDeliveryRate={predictedDeliveryRateFront} onSave={handleSaveDeliveryRate} canceledRate={logistics.canceled_rate} devolutionRate={logistics.devolution_rate} deliveryRate={logistics.delivery_rate}/> 
                                                       
                            <DateFilter
                                color={costColor}
                                selectedValue={selectedPeriod}
                                onChange={handleDateChange}
                                customLabel={customDateLabel}
                            />  
                        </div>          
                    </div>                    
                </Row>

                <Row>
                    <Col md={6}>
                        <MainCard
                            title = "Custos Totais"
                            value = {brazilianMoney(financial.total_cost)}
                            percentage = {financial.growth_total_cost}
                            icon = {costIcon}
                            bgColor = {costColor}
                            tooltip="Representa o custo total da operação incluíndo o marketing."
                        /> 
                    </Col>
                    <Col md={6}>
                        <Row>
                        <MainCardWithoutColor
                            title = "Custo de Produtos"
                            value = {brazilianMoney(financial.product_cost)}
                            percentage = {financial.growth_product_cost}
                            icon = {productSupplierIcon}
                            iconColor = {costColor}
                        /> 
                        <MainCardWithoutColor
                            title = "Marketing"
                            value = {brazilianMoney(financial.total_invested)}
                            percentage = {financial.growth_total_invested}
                            icon = {marketingIcon}
                            iconColor = {costColor}
                        />  
                        </Row>
                    </Col>                 
                </Row>

                <Row> 
                    <Col md={6}> 
                        <Row>           
                            <MainCardWithoutColor
                                title = "Custo Médio por Pedido"
                                value = {brazilianMoney(financial.total_cost_by_order)}
                                percentage = {financial.growth_total_cost_by_order}
                                icon = {boxIcon}
                                iconColor = {costColor}
                            />  
                            <MainCardWithoutColor
                                title = "Valores Adicionais"
                                value = {brazilianMoney(financial.additional_cost)}
                                percentage = {financial.growth_additional_cost}
                                icon = {additionalValueIcon}
                                iconColor = {costColor}
                            />
                        </Row>
                        <Row>           
                            <TripleCard
                                title1 = "Frete Total"
                                value1 = {brazilianMoney(financial.total_shipping_cost)}
                                title2 = "Frete Entregue"
                                value2 = {brazilianMoney(financial.delivered_shipping_cost)}
                                title3 = "Frete Devoluções"
                                value3 = {brazilianMoney(financial.devolution_shipping_cost)}
                                icon = {transitIcon}
                                iconColor = {costColor}
                            />
                        </Row>
                        <Row>
                            <TripleCard
                                title1 = "Impostos"
                                value1 = "-"
                                title2 = "Taxa Administrativa"
                                value2 = "-"
                                title3 = "Total de Impostos e Taxas"
                                value3 = "-"
                                icon = {taxesIcon}
                                iconColor = {costColor}
                            />
                        </Row>
                    </Col>
                    <Col md={6}>
                        <GraphPieCard
                            title = "% de Custo sobre Receita"
                            data={costPieData}
                            valueFormatter = {(value) => brazilianMoney(value)}
                        />                        
                    </Col>
                </Row>
                <Row>
                    <GraphBarCard
                        categories={dailyGraphCategories}
                        seriesData={costGraphSeries}
                        title="Custos"
                        colors={[`rgb(${costColor})`]}
                        height={254}
                        stacked={true}
                        yAxisFormat="currency"
                        legendPosition="top"
                        tooltipFormat={(value) => brazilianMoney(value)}
                    />                                                            
                </Row>      
                    
            </Row>

            {/* Marketing */}
            <Row ref={sectionRefs.marketing} className="d-flex justify-content-center" style={{paddingTop: '30px', marginBottom: '50px'}}>

                <Row className="d-flex align-items-center mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-muted">Marketing</h5>
                        <div className="d-flex" style={{zIndex: 10}}>
                            <PredictedDeliveryRateCard averageDeliveryRate={predictedDeliveryRateFront} onSave={handleSaveDeliveryRate} canceledRate={logistics.canceled_rate} devolutionRate={logistics.devolution_rate} deliveryRate={logistics.delivery_rate}/> 
                                   
                            <DateFilter
                                color={marketingColor}
                                selectedValue={selectedPeriod}
                                onChange={handleDateChange}
                                customLabel={customDateLabel}
                            />  
                        </div>          
                    </div>                    
                </Row>

                <Row className="d-flex">
                    <Col md={7} className="d-flex flex-column h-100">
                        <Row>
                            <MainCard
                                title = "Investimento em Marketing"
                                value = {brazilianMoney(financial.total_invested)}
                                percentage = {financial.growth_total_invested}
                                icon = {marketingIcon}
                                bgColor = {marketingColor}
                                tooltip="Representa o valor total investido em anúncios."
                            />
                        </Row>
                        <Row>
                            <SecondaryDoubleCard
                                title1 = "CPA"
                                value1 = {brazilianMoney(financial.cpa)}
                                title2 = "CPA Real"
                                value2 = {brazilianMoney(financial.real_cpa)}
                                icon = {cpaIcon}
                                iconColor = {marketingColor}
                            />
                        </Row>
                        <Row>
                            <SecondaryCard
                                title = "CPA Real Previsto"
                                value = {brazilianMoney(predictedCPAFront)}
                                icon = {roasIcon}
                                type = "predicted"
                                tooltip="Representa o provável valor gasto em anúncios para gerar um pedido no site após todos os pedidos atingirem um status final."
                            />
                            <SecondaryCard
                                title = "ROAS Real Previsto"
                                value = {`${predictedRoasFront}x`}
                                icon = {roasIcon}
                                type = "predicted"
                                tooltip="Representa o provável retorno sobre o investimento em anúncios após todos os pedidos atingirem um status final."
                            />
                        </Row>
                        <Row>
                            <SecondaryDoubleCard
                                title1 = "ROAS"
                                value1 = {`${financial.roas}x`}
                                title2 = "ROAS Real"
                                value2 = {`${financial.real_roas}x`}
                                icon = {roasIcon}
                                iconColor = {marketingColor}
                            />
                        </Row>
                    </Col>
                    <Col md={5} className="d-flex flex-column h-100">
                        <MarketingGraphCard
                            data={{
                                labels: marketing_graph.map(item => item.name),
                                values: marketing_graph.map(item => item.value_invested),
                                colors: marketing_graph.map(item => item.color),
                            }}
                            valueFormatter={brazilianMoney}
                            title = "Investimento por Plataforma"
                        />
                    </Col>                 
                </Row>
                <Row>
                    <GraphBarCard
                        categories={dailyGraphCategories}
                        seriesData={marketingGraphSeries}
                        title="Marketing"
                        colors={[`rgb(${marketingColor})`]}
                        height={254}
                        stacked={true}
                        yAxisFormat="currency"
                        legendPosition="top"
                        tooltipFormat={(value) => brazilianMoney(value)}
                    />
                </Row>
                    
            </Row>

            </Col>
            </Row>
            
        </Fragment>
    )
}

export default Dashboard