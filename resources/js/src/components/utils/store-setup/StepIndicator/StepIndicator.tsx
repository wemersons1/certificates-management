import React from "react";
import { RiMapPinLine, RiMoneyDollarCircleLine, RiCheckLine } from "react-icons/ri";
import styles from './StepIndicator.module.css'; // Importando o CSS como módulo

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { icon: <RiMapPinLine /> },
    { icon: <RiMoneyDollarCircleLine /> },
    { icon: <RiCheckLine /> },
  ];

  return (
    <div className={styles.stepIndicator}>
      <ul className={styles.steps}>
        {steps.map((step, index) => (
          <li 
            key={index} 
            className={`${styles.step} ${index < currentStep ? styles.completed : ''} ${index === currentStep ? styles.active : ''}`}>
            <div className={styles.icon}>{step.icon}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StepIndicator;
