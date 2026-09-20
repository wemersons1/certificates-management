
import { useState, useEffect } from "react";
import { useCache } from "./useCache";
import { useDebounce } from "./useDebounce";
import api from "../lib/api";
import moment from "moment";
import { brazilianMoney, formatDate } from "../lib/helper";
import { format } from "date-fns";

export interface Order {
  id: number;
  external_id: string;
  customer: string;
  distributionCompany?: string;
  address: string;
  status: string;
  total_order: string;
  created_at: string;
}

interface FilterOptions {
  searchTerm: string;
  startDate: Date | null;
  endDate: Date | null;
  filterStatus: string;
  filterTransportadora: string;
  filterOrderId: string;
  filterValueRange: string;
}

export function useOrdersData(selectedStoreId: number | null, cotacaoPesoColombiano: number) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const { 
    saveToCache, 
    getFromCache, 
    invalidateCache 
  } = useCache<Order[]>({
    expirationTimeMs: 2 * 60 * 60 * 1000, // 2 horas para dados normais
    emptyDataExpirationTimeMs: 5 * 60 * 1000, // 5 minutos para dados vazios
  });

  const fetchOrders = async (
    storeId: number,
    cotacao: number,
    searchTerm: string,
    startDate: Date | null,
    endDate: Date | null,
    forceRefresh = false
  ) => {
    if (!storeId || cotacao <= 0) {
      console.log("❌ ID da loja ou cotação inválidos");
      setIsLoading(false);
      setInitialLoad(false);
      return;
    }

    setIsLoading(true);

    try {
      const cacheKey = `dropi-orders-cache-${storeId}`;
      const cachedData = getFromCache(cacheKey, forceRefresh);

      if (cachedData) {
        setAllOrders(cachedData);
        setIsLoading(false);
        setInitialLoad(false);
        return;
      }

      console.log("⏳ Buscando novos dados da API...");
      let ordersCache: Order[] = [];
      let page = 1;
      let nextPageUrl = "/dropi-orders";

      // Função auxiliar para inverter a data no formato necessário para a API
      const invertDate = (date: Date): string => {
        return format(date, "MM/dd/yyyy");
      };

      do {
        const response = await api.get("/dropi-orders", {
          params: {
            per_page: 6000,
            page,
            name: searchTerm || undefined,
            start_date: startDate ? invertDate(startDate) : undefined,
            end_date: endDate ? invertDate(endDate) : undefined,
            client_store_id: storeId,
          },
        });

        const { data: ordersData, next_page_url } = response.data;

        const formattedOrders: Order[] = ordersData.map((item: any) => ({
          id: item.id,
          external_id: item.external_id,
          customer: `${item.customer.name} ${item.customer.surname}`,
          distributionCompany: item.distribution_company?.name,
          address: `${item.address_delivery.country}, ${item.address_delivery.city}, ${item.address_delivery.complement}`,
          status: item?.status?.category?.name,
          total_order: brazilianMoney(item.total_order * cotacao),
          created_at: formatDate(item.created_at_in_dropi),
        }));

        ordersCache = [...ordersCache, ...formattedOrders];

        nextPageUrl = next_page_url;
        page++;
      } while (nextPageUrl);

      // Atualiza a última vez que os dados foram atualizados
      setLastRefresh(new Date());
      
      // Salva no cache mesmo que esteja vazio (a função useCache tratará isso adequadamente)
      saveToCache(cacheKey, ordersCache);
      setAllOrders(ordersCache);
    } catch (error) {
      console.error("❌ Erro ao buscar pedidos:", error);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  // Função para forçar a atualização dos dados
  const refreshOrders = () => {
    if (selectedStoreId) {
      fetchOrders(selectedStoreId, cotacaoPesoColombiano, "", null, null, true);
    }
  };

  const filterOrders = (orders: Order[], filterOptions: FilterOptions) => {
    const {
      searchTerm,
      startDate,
      endDate,
      filterStatus,
      filterTransportadora,
      filterOrderId,
      filterValueRange,
    } = filterOptions;

    return orders.filter((order) => {
      const orderDate = moment(order.created_at, [
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "YYYY/MM/DD",
        "DD/MM/YYYY",
      ]).toDate();

      const dateInRange =
        (!startDate || orderDate.getTime() >= startDate.getTime()) &&
        (!endDate || orderDate.getTime() <= endDate.getTime());

      const orderValue = parseFloat(
        order.total_order.replace(/[^\d,]/g, "").replace(",", ".")
      );

      let valueInRange = true;
      if (filterValueRange) {
        const [min, max] = filterValueRange.split("-");
        if (max) {
          valueInRange = orderValue >= parseFloat(min) && orderValue <= parseFloat(max);
        } else if (min === "150+") {
          valueInRange = orderValue >= 150;
        } else {
          valueInRange = orderValue >= parseFloat(min);
        }
      }

      return (
        dateInRange &&
        (filterOrderId ? order.external_id.includes(filterOrderId) : true) &&
        (filterStatus ? order.status.toLowerCase() === filterStatus.toLowerCase() : true) &&
        (filterTransportadora ? order.distributionCompany === filterTransportadora : true) &&
        (!searchTerm || order.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
        valueInRange
      );
    });
  };

  return {
    allOrders,
    filteredOrders,
    setFilteredOrders,
    isLoading,
    initialLoad,
    fetchOrders,
    filterOrders,
    refreshOrders,
    lastRefresh
  };
}