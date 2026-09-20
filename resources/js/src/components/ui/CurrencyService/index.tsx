import axios from "axios";

export interface CurrencyData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  data: number[];
}

const generateRandomData = (baseValue: number): number[] => {
  return Array.from({ length: 7 }, () =>
    parseFloat((baseValue * (1 + Math.random() * 0.02 - 0.01)).toFixed(2))
  );
};

export const fetchCurrencyData = async (): Promise<CurrencyData[]> => {
  try {
    const response = await axios.get(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL"
    );

    const data = response.data;

    return [
      {
        label: "Dólar",
        value: `R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}`,
        change: `${parseFloat(data.USDBRL.pctChange).toFixed(2)}%`,
        positive: parseFloat(data.USDBRL.pctChange) >= 0,
        data: generateRandomData(parseFloat(data.USDBRL.bid)),
      },
      {
        label: "Euro",
        value: `R$ ${parseFloat(data.EURBRL.bid).toFixed(2)}`,
        change: `${parseFloat(data.EURBRL.pctChange).toFixed(2)}%`,
        positive: parseFloat(data.EURBRL.pctChange) >= 0,
        data: generateRandomData(parseFloat(data.EURBRL.bid)),
      },
      {
        label: "Bitcoin",
        value: `R$ ${parseFloat(data.BTCBRL.bid).toLocaleString("pt-BR")}`,
        change: `${parseFloat(data.BTCBRL.pctChange).toFixed(2)}%`,
        positive: parseFloat(data.BTCBRL.pctChange) >= 0,
        data: generateRandomData(parseFloat(data.BTCBRL.bid)),
      },
      {
        label: "Ethereum",
        value: `R$ ${parseFloat(data.ETHBRL.bid).toLocaleString("pt-BR")}`,
        change: `${parseFloat(data.ETHBRL.pctChange).toFixed(2)}%`,
        positive: parseFloat(data.ETHBRL.pctChange) >= 0,
        data: generateRandomData(parseFloat(data.ETHBRL.bid)),
      },
    ];
  } catch (error) {
    console.error("Erro ao buscar dados das moedas:", error);
    return [];
  }
};
