import { FC } from "react";

interface IconLogoCircleProps {
    icon: string,
    color?: string,
}

const IconLogoCircle:FC<IconLogoCircleProps> = ({icon, color = '84,10,245' }) => {
    return(
        <div style={{
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            backgroundColor: 'rgba(' + color +', 0.15)',
            color: 'rgba(' + color +', 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            overflow: 'hidden'
        }}>
            <i className={`${icon}`}></i>
        </div>
    )
}

export default IconLogoCircle