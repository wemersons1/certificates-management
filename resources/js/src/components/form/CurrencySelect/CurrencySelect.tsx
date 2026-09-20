import { FC, useEffect, useState } from "react";
import Select from "react-select";
import api from "../../../lib/api";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface Currency {
  id: number;
  currency: string;
  is_active: boolean;
}

const CurrencySelect: FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Mapear moedas para exibir bandeiras
  const options = currencies.filter(currency => currency.is_active).map((currency) => {
    const flagUrls: { [key: string]: string } = {
      BRL: "https://flagcdn.com/w40/br.png", 
      COP: "https://flagcdn.com/w40/co.png", 
      USD: "https://flagcdn.com/w40/us.png",
      MXN: "https://flagcdn.com/w40/mx.png", 
      PAB: "https://flagcdn.com/w40/pa.png", 
      PEN: "https://flagcdn.com/w40/pe.png", 
      PYG: "https://flagcdn.com/w40/py.png", 
      EUR: "https://flagcdn.com/w40/eu.png", 
      CLP: "https://flagcdn.com/w40/cl.png", 
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
  placeholder="Selecione uma moeda"
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

export default CurrencySelect;
