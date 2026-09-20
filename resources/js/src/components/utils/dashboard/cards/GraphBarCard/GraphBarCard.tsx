import React, { FC } from "react";
import { Card, Col } from "react-bootstrap";
import BarChart from "../../charts/BarChart/BarChart";

interface GraphBarCardProps {
  categories: string[];
  seriesData: Array<{ name: string; data: number[] }>;
  title?: string;
  height?: number;
  stacked?: boolean;
  yAxisFormat?: 'currency' | 'percent' | 'number';
  colors?: string[];
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipFormat?: (value: number) => string;
  selectOptions?: { value: string | number; label: string }[];
  onSelectChange?: (selectedValue: string) => void; 
  defaultSelected?: string
}

const GraphBarCard: FC<GraphBarCardProps> = ({
  categories,
  seriesData,
  title = "Resumo Financeiro",
  height = 600,
  stacked = true,
  yAxisFormat = "currency",
  colors = ['#1E90FF', '#32CD32'],
  legendPosition = "top",
  tooltipFormat = (value) => `R$ ${value.toFixed(2)}`,
  selectOptions = [],
  onSelectChange,
  defaultSelected,
  
}) => {
  return (
    <Col>
      <Card className="custom-card" style={{ borderRadius: '12px', height: '414px' }}>
        <Card.Header className="d-flex justify-content-between">
          <Card.Title>{title}</Card.Title>
          {selectOptions.length > 0 && ( // Renderiza o select apenas se houver opções
            <select
              className="form-select"
              style={{ maxWidth: "200px" }}
              value={defaultSelected}
              onChange={(e) =>
                onSelectChange && onSelectChange(e.target.value) // Chama o callback se definido
              }
            >
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <BarChart
            categories={categories}
            seriesData={seriesData}
            height={height}
            stacked={stacked}
            yAxisFormat={yAxisFormat}
            colors={colors}
            legendPosition={legendPosition}
            tooltipFormat={tooltipFormat}
          />
        </Card.Body>
      </Card>
    </Col>
  );
};

export default GraphBarCard;
