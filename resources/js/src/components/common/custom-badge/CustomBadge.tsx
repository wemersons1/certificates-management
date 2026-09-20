import { FC } from "react";

interface CustomBadgeProps {
    value: number | string;
    background: string;
}

const CustomBadge: FC<CustomBadgeProps> = ({ value, background }) => {
    const backgroundColor = `rgba(${background}, 0.15)`;
    const textColor = `rgb(${background})`; 
    

    
    return (
        <div
            className="d-inline-flex align-items-center rounded"
            style={{ backgroundColor: backgroundColor, color: textColor, padding: "2px 6px" }}
        >
            <span className="fw-semibold">{`${value}`}</span>
        </div>
    );
}

export default CustomBadge;
