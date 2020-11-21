import React from 'react';

const Logo = (props) => {
  return (
    <img
      alt="Logo"
      src="/static/plug.png"
      {...props}
      style={{height:'50px',background:'#fff', border:'1px solid #000',borderRadius:'50%', padding:'5px'}}
    />
  );
};

export default Logo;
