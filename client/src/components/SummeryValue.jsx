import React from 'react';
import './SummeryValue.css'; // Import the CSS file for styling

const SummeryValue = (props) => {
  return (
    <div className="SummeryValue">
      <div className="centered">{props.title}</div>
      <textfield disabled className="valueText">{props.value}</textfield>
    </div>
  );
};

export default SummeryValue;