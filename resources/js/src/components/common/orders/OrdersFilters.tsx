import React from "react";
import { Row, Col } from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface OrderFiltersProps {
  statusOptions: Array<{ value: string | number | null; label: string }>;
  valueRangeOptions: Array<{ value: string | null; label: string }>;
  carrierOptions: Array<{ value: string; label: string; image: string | null }>;
  filterStatus: string | null | number;
  setFilterStatus: (status: string | null | number) => void;
  filterTransportadora: string | null | number;
  setFilterTransportadora: (carrier: string | null) => void;
  filterValueRange: string | null | number;
  setFilterValueRange: (range: string | null) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  customStyles: any;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  statusOptions,
  valueRangeOptions,
  carrierOptions,
  filterStatus,
  setFilterStatus,
  filterTransportadora,
  setFilterTransportadora,
  filterValueRange,
  setFilterValueRange,
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
  customStyles,
}) => {
  const [startDate, endDate] = dateRange;

  const formatOptionLabel = ({ label, image }: { label: string; image: string | null }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {image ? (
        <img
          src={image}
          alt={label}
          style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 10 }}
        />
      ) : (
        <i className="las la-globe" style={{ fontSize: 24, marginRight: 10 }}></i>
      )}
      {label}
    </div>
  );

  return (
    <Row className="mb-3 justify-content-end">
      <Col xs={2}>
        <Select
          className="custom-select"
          options={statusOptions}
          value={statusOptions.find((option) => option.value === filterStatus)}
          onChange={(selectedOption) => setFilterStatus(selectedOption?.value || "")}
          placeholder="Todos os Status"
          styles={customStyles}
        />
      </Col>
      <Col xs={3}>
        <Select
          className="custom-select"
          options={carrierOptions}
          value={carrierOptions.find((option) => option.value === filterTransportadora) || null}
          onChange={(selectedOption) => {
            setFilterTransportadora(selectedOption?.value === "all" ? "" : selectedOption?.value || "");
          }}
          placeholder="Todas as Transportadoras"
          styles={customStyles}
          formatOptionLabel={formatOptionLabel}
        />
      </Col>
      <Col xs={2}>
        <Select
          className="custom-select"
          options={valueRangeOptions}
          value={valueRangeOptions.find((option) => option.value === filterValueRange)}
          onChange={(selectedOption) => setFilterValueRange(selectedOption?.value || "")}
          placeholder="Selecione uma faixa de valores"
          styles={customStyles}
        />
      </Col>
      <Col xs={3}>
        <DatePicker
          selected={startDate}
          onChange={(update: [Date | null, Date | null]) => {
            setDateRange(update);
            if (update[0] && update[1]) {
              console.log(
                "Intervalo selecionado:",
                format(update[0], "dd/MM/yyyy") + " - " + format(update[1], "dd/MM/yyyy")
              );
            }
          }}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          isClearable
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          placeholderText="Selecione um intervalo de datas"
          className="form-control custom-datepicker"
        />
      </Col>
      <Col xs={2}>
        <input
          type="text"
          className="form-control custom-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar..."
          style={{ borderColor: "rgb(179, 179, 179)" }}
        />
      </Col>
    </Row>
  );
};

export default OrderFilters;
