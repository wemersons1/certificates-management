import { FC } from "react";

interface EffectivenessBadgeProps {
    value: number; 
    type: "rate" | "effectiveness";
}

const EffectivenessBadge: FC<EffectivenessBadgeProps> = ({ value, type}) => {
    let backgroundColor = "";
    let textColor = "";

    if (type == "rate"){
        if (value >= 65) {
            backgroundColor = "rgb(38,191,148)";
            textColor = "#fff";
        } else if (value >= 50) {
            backgroundColor = "rgba(38,191,148, 0.15)";
            textColor = "rgb(38,191,148)";
        } else if (value >= 40) {
            backgroundColor = "rgba(245,184,73, 0.15)";
            textColor = "rgb(245,184,73)";
        } else {
            backgroundColor = "rgba(230,83,60, 0.15)";
            textColor = "rgb(230,83,60)";
        }
    }
    else {
        if (value >= 75) {
            backgroundColor = "rgb(38,191,148)";
            textColor = "#fff";
        } else if (value >= 65) {
            backgroundColor = "rgba(38,191,148, 0.15)";
            textColor = "rgb(38,191,148)";
        } else if (value >= 50) {
            backgroundColor = "rgba(245,184,73, 0.15)";
            textColor = "rgb(245,184,73)";
        } else {
            backgroundColor = "rgba(230,83,60, 0.15)";
            textColor = "rgb(230,83,60)";
        }
    }
    
    return (
        <span
            className="d-inline-flex align-items-center rounded"
            style={{ backgroundColor, color: textColor, padding: "2px 6px" }}
        >
            <span className="fw-semibold">{`${value}%`}</span>
        </span>
    );
};

export default EffectivenessBadge;
