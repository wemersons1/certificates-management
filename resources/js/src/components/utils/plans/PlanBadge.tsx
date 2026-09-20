import { FC } from "react";

interface PlanBadgeProps {
    name: string;
}

const PlanBadge:FC <PlanBadgeProps> = ({name}) => {
    return(
            <span style={{
              background: "linear-gradient(90deg, rgba(84, 10, 245, 1) 0%, rgba(73, 182, 245, 1) 100%)",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "2px 10px",
              fontSize: "14px"
            }}>
              {name}                            
            </span>
    )
}

export default PlanBadge