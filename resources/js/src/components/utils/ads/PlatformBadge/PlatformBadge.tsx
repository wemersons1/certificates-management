import { FC } from "react";

interface PlatformBadgeProps {
    name: string;
}


const PlatformBadge: FC<PlatformBadgeProps> = ({name}) => {

    const platformColors: { [key: string]: string } = {
        Facebook: '8,109,255',
        TikTok: '19,19,29',
        Google: '250,189,13',
        Kwai: '255,79,15',
        Influencer: '160, 36, 237',
        Outros: '3, 166, 85'
    };

    const platformIcons: { [key: string]: string } = {
        Facebook: 'bx bxl-facebook-circle',
        TikTok: 'bx bxl-tiktok',
        Google: 'bx bxl-google',
        Kwai: '#FFA500',
      };

    const color = platformColors[name] || '#6c757d';
    //const icon = platformIcons[name];
    return(        
        <div className="d-inline-flex align-items-center rounded" style={{ backgroundColor: `rgba(${color},0.15)`, color: `rgb(${color})`, padding: "2px 6px"}}>
            {/*}<i className={`${icon} fs-16 me-1`}></i>{*/}
            <span className="fw-semibold">{name}</span>
        </div>
    )
}


export default PlatformBadge