import { FC } from "react";


interface LogoImageProps {
    imageSrc: string; // O caminho da imagem
    altText?: string; // Texto alternativo opcional para acessibilidade
}


const LogoImage: FC<LogoImageProps> = ({ imageSrc, altText = "Logo" }) => {
    return (
        <div className="d-flex rounded-circle overflow-hidden" style={{ width: "35px", height: "35px" }}>
            <img src={imageSrc} alt={altText} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
    );
};

export default LogoImage;
