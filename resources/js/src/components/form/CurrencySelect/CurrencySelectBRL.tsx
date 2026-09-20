import { FC, useEffect, useState } from "react";
import Select from "react-select";
import api from "../../../lib/api";
import { useTranslation } from "react-i18next";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface Currency {
  id: number;
  currency: string;
}

const CurrencySelectBRL: FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await api.get("/currency");
        setCurrencies(response.data);
      } catch (error) {
        console.error("Erro ao carregar moedas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, []);

  const formattedCurrencies = currencies.filter((c) => c.id === 2);

  // Mapear moedas para exibir bandeiras
  const options = formattedCurrencies.map((currency) => {
    const flagUrls: { [key: string]: string } = {
      BRL: "https://flagcdn.com/w40/br.png", // Brasil
      COP: "https://flagcdn.com/w40/co.png", // Colômbia
      USD: "https://flagcdn.com/w40/us.png",
      CLP: "https://flagcdn.com/w40/cl.png", // Estados Unidos
    };

    return {
      value: currency.currency,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={flagUrls[currency.currency] || ""}
            alt={`${currency.currency} flag`}
            style={{
              width: "20px",
              height: "15px",
              marginRight: "10px",
            }}
          />
          {currency.currency}
        </div>
      ),
    };
  });

  return (
    <div className="mb-3">
      <label style={{ marginBottom: "8px", display: "block" }}></label>
      <Select
  options={options}
  value={options.find((option) => option.value === value)}
  onChange={(selectedOption) => onChange(selectedOption?.value || "")}
  isLoading={loading}
  placeholder={t("pages.setup.currency_placeholder")}
  styles={{
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#4712ab" : "#DCDCDC",
      "&:hover": {
        borderColor: "#4712ab",
        
        
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      height:"2x",
      display: "flex",
      alignItems: "center",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#007bff" : "#fff",
      borderRadius: "10px",
      color: state.isSelected ? "#fff" : "#495057",
      "&:hover": { backgroundColor: "#f8f9fa" },
    }),
  }}
/>
    </div>
  );
};

export default CurrencySelectBRL;
