import React from "react";

interface WhatsAppChatProps {
  phoneNumber: string; 
  message?: string; 
  position?: "left" | "right"; 
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  phoneNumber,
  message = "Olá! Preciso de ajuda.",
  position = "right",
}) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const containerStyles: React.CSSProperties = {
    position: "fixed",
    bottom: "20px",
    [position]: "10px",
    zIndex: 998,
    paddingBottom: "50px",
  };

  const iconStyles: React.CSSProperties = {
    width: "60px",
    height: "60px",
    //borderRadius: "50%",
    //boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
  };

  return (
    <div style={containerStyles}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          style={iconStyles}
        />
      </a>
    </div>
  );
};

export default WhatsAppChat;
