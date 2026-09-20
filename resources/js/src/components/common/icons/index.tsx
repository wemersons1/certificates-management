import React from 'react';

type IconType = 'signOut' | 'store' | 'tag' | 'user';

interface IconProps {
  type: IconType;
}

const icons = {
  signOut: <i className="las la-sign-out-alt"></i>,
  store: <i className="las la-store-alt"></i>,
  tag: <i className="las la-tag"></i>,
  user: <i className="las la-user"></i>,
};

const Icon: React.FC<IconProps> = ({ type }) => {
  return icons[type] || null;
};

export default Icon;
