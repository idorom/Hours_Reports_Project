import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Calendar.css';

import { formatDate } from '../utils/Dates_times_handle'
import { now } from 'moment';

const Calendar = ({ onDateSelect, highlightDates = [] }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
        setSelectedDate(date);
        onDateSelect(date);
    };

 
    // Function to add a specific class to highlighted or selected dates
    const highlightDayClass = (date) => {
        const formattedDate = formatDate(date);
        const isSelected = formatDate(selectedDate) === formattedDate;
        const isHighlighted = highlightDates.includes(formattedDate);
        const isHighlighted_today = formatDate(new Date()) === formattedDate;

        // Priority: Selected date first, then highlighted dates
        if (isSelected) return "selected-date";
        if (isHighlighted_today) return "highlighted-date-today";
        if (isHighlighted) return "highlighted-date";
        return undefined;
    };

    return (
        <div className="calendar-container" dir="rtl">
            <div className="calendar-and-text">
                <div className="date-label">תאריך:</div>
                <div className="datepicker-wrapper">
                    <DatePicker
                        showIcon
                        toggleCalendarOnIconClick
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        todayButton="לחזור להיום"
                        className="calendar"
                        title="לחץ על מנת לבחור תאריך"
                        dayClassName={highlightDayClass} // Apply custom class to highlighted days
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 48 48"
                            >
                                <mask id="ipSApplication0">
                                    <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
                                        <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
                                        <path
                                            fill="#fff"
                                            d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                                        ></path>
                                    </g>
                                </mask>
                                <path
                                    fill="currentColor"
                                    d="M0 0h48v48H0z"
                                    mask="url(#ipSApplication0)"
                                ></path>
                            </svg>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default Calendar;