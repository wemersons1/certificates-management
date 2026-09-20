import { FC, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateFilterProps {
    color: string;
    onChange: (startDate: string, endDate: string, period: string) => void;
    selectedValue: string;
    customLabel: string; // Recebe o customLabel já formatado
}

const DateFilter: FC<DateFilterProps> = ({ color, onChange, selectedValue, customLabel }) => {
    const [selected, setSelected] = useState(selectedValue);
    const [showDateRange, setShowDateRange] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const dateRangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelected(selectedValue);
    }, [selectedValue]);

    // Detectar clique fora do DateRangePicker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
                setShowDateRange(false);
            }
        };
        
        if (showDateRange) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDateRange]);

    const handleSelect = (value: string) => {
        setSelected(value);

        let startDate, endDate, dateOption;
        switch (value) {
            case "Hoje":
                dateOption = "today";
                startDate = endDate = new Date().toISOString().split("T")[0];
                break;
            case "Ontem":
                dateOption = "yesterday";
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startDate = endDate = yesterday.toISOString().split("T")[0];
                break;
            case "7 dias":
                dateOption = "7days";
                startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0];
                endDate = new Date().toISOString().split("T")[0];
                break;
            case "30 dias":
                dateOption = "30days";
                startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
                endDate = new Date().toISOString().split("T")[0];
                break;
            case "Selecionar Período":
                setShowDateRange(true);
                return;
            default:
                dateOption = "custom";
                startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0];
                endDate = new Date().toISOString().split("T")[0];
        }

        onChange(startDate, endDate, dateOption);
    };

    const handleRangeChange = (ranges: any) => {
        setDateRange([ranges.selection]);
    };

    const applyDateRange = () => {
        const { startDate, endDate } = dateRange[0];
        
        // Passa as datas formatadas diretamente pelo onChange
        onChange(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
            "custom"
        );
        setShowDateRange(false); // Fecha o date picker após clicar em "Aplicar"
    };

    const buttonBaseStyle = {
        padding: '4px 12px',
        alignItems: 'center',
        borderColor: `rgb(${color})`,
    };

    const getButtonStyle = (value: string) => ({
        ...buttonBaseStyle,
        backgroundColor: selected === value ? `rgb(${color})` : 'transparent',
        color: selected === value ? '#fff' : `rgb(${color})`,
    });

    const containerStyle: React.CSSProperties = {
        zIndex: 10,
        position: 'relative',
        overflow: 'visible'
    };

    return (
        <div className="d-flex" style={containerStyle}>
            <Button
                onClick={() => handleSelect("Hoje")}
                variant='outline'
                style={getButtonStyle("Hoje")}
                className={selected === "Hoje" ? 'me-2' : 'me-2 bg-light'}
            >
                Hoje
            </Button>
            <Button
                onClick={() => handleSelect("Ontem")}
                variant='outline'
                style={getButtonStyle("Ontem")}
                className={selected === "Ontem" ? 'me-2' : 'me-2 bg-light'}
            >
                Ontem
            </Button>
            <Button
                onClick={() => handleSelect("7 dias")}
                variant='outline'
                style={getButtonStyle("7 dias")}
                className={selected === "7 dias" ? 'me-2' : 'me-2 bg-light'}
            >
                7 dias
            </Button>
            <Button
                onClick={() => handleSelect("30 dias")}
                variant='outline'
                style={getButtonStyle("30 dias")}
                className={selected === "30 dias" ? 'me-2' : 'me-2 bg-light'}
            >
                30 dias
            </Button>
            <Button
                onClick={() => handleSelect("Selecionar Período")}
                variant='outline'
                style={{
                    ...getButtonStyle("Selecionar Período"),
                    display: "flex",
                    alignItems: "center",
                }}
                className={selected === "Selecionar Período" ? '' : 'bg-light'}
            >
                <FaCalendarAlt className="me-1" />
                {customLabel} {/* Usa apenas o customLabel já formatado */}
            </Button>

            {showDateRange && (
                <div
                    ref={dateRangeRef}
                    style={{
                        position: 'fixed',
                        top: '20%',
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        zIndex: 20,
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <DateRangePicker
                        ranges={dateRange}
                        onChange={handleRangeChange}
                        rangeColors={[`rgb(${color})`]}
                        direction="horizontal"
                    />
                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="custom"
                            onClick={applyDateRange}
                            style={{
                                backgroundColor: `rgb(${color})`,
                                borderColor: `rgb(${color})`,
                                color: '#fff'
                            }}
                        >
                            Aplicar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateFilter;
