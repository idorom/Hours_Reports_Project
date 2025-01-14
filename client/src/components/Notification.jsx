import React from 'react';
import './Notification.css';

const Notification = ({ className, content, width,type }) => {
    const notificationStyle = {
        width: width || 'auto' // Set width to 'auto' if not provided
    };

  return (
    type==='list' ?
    (
        <div className={`notification ${className}`} style={notificationStyle}>
            <ul>
                {content.map((error, index) => (
                    error!==undefined &&<li key={index}>{error}</li>
                ))}
            </ul>
        </div>
    )
    :
    (
        <div className={`notification ${className}`} style={notificationStyle}>
            {content}
        </div>
    )
  );
};

export default Notification;