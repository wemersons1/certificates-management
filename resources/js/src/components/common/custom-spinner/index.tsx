import React from "react";
import "./CustomSpinner.css";

interface CustomSpinnerProps {
  size?: number; // Permite ajustar o tamanho do spinner
  color?: string; // Permite alterar a cor principal
}

const CustomSpinner: React.FC<CustomSpinnerProps> = ({ size = 120, color = "#3c03cc" }) => {
  return (
    <div className="loading-logo"></div>
  );
};

export default CustomSpinner;
