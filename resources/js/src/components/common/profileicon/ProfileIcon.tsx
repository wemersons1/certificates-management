import React from 'react';

interface ProfileIconProps {
  name: string;
  color: string;
}

const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  const initials = nameParts[0][0] + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '');
  return initials.toUpperCase();
};

const ProfileIcon: React.FC<ProfileIconProps> = ({ name, color }) => {
  return (
    <div className = ""
      style={{
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        minWidth: '40px',
        minHeight: '40px',
        backgroundColor: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        overflow: 'hidden'
      }}
    >
      {getInitials(name)}
    </div>
  );
};

export default ProfileIcon;
