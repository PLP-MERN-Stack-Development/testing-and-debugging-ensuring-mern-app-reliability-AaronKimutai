import React from 'react';

const Button = React.memo(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props
}) => {
  
  
  console.log(`Re-rendering Button: ${children}`);

  let variantClass = `btn-${variant}`;
  let sizeClass = `btn-${size}`;
  let disabledClass = disabled ? 'btn-disabled' : '';

  const classes = `btn ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props} 
    >
      {children}
    </button>
  );
}); 

export default Button;