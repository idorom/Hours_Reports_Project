import { getTimeDiff } from './Dates_times_handle'

export const isValidHourFormat = (value) => {
    const hourRegex = /^(0[0-9]|1[0-9]|2[0-3])$/;
    return !isNaN(value) && hourRegex.test(value);
};

export const isValidMinuteFormat = (value) => {
    const minuteRegex = /^(0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$/;
    
    return !isNaN(value) && minuteRegex.test(value);
};

export const isValidNumberFormat = (value) => {

    const numberRegex = /^(?:\d{0,2})?$/;
    return numberRegex.test(value);
};

export const isValidGapFormat = (value) => {
    return Number(value) >= 0 && Number(value) < 24;
};



export const handleNumbersUnder10 = (value) => {
    return value < 10 && value !== "" ? '0' + value : value;
};


export const isErrorOfMinutesFormat = (data, startmmRefs, endmmRefs) => {
    let hasErrors = false;
    const errorMassage = `כתוב בבקשה מספר בין 0-59 ערך של דק' לא חוקי`

    // Check for errors in startMinute or endMinute in any row
    hasErrors = data.map((row, index) => {
        return hasErrors === true ? hasErrors : ((!isValidMinuteFormat(startmmRefs[index + 1].value)) && (startmmRefs[index + 1].value.length === 2)) ||
            ((!isValidMinuteFormat(endmmRefs[index + 1].value)) && (endmmRefs[index + 1].value.length === 2));
    });
    return hasErrors ? errorMassage : undefined
};


export const isErrorOfStartLatestThanEnd = (errorTitle, id, data) => {
    let hasErrors = false;
    const errorMassage = "זמן הסיום צריך להיות מאוחר מזמן ההתחלה";
    
    if (id !== undefined)
        hasErrors = data[id - 1]?.isValidateTaskOnlyTimeStart() && data[id - 1]?.isValidateTaskOnlyTimeEnd() ? data[id - 1]?.isErrorStartTimelaterThanEnd() : false;
    else {
        // Check for errors in startMinute or endMinute in any row
        data.map((row) => {

            hasErrors ||= row?.isErrorStartTimelaterThanEnd();
        });
    }
    return hasErrors ? errorMassage : undefined
};


export const isErrorTasksWithRightFormat = (tableData) => {
    let hasErrors = false;
    const errorMassage = "לא ניתן לשמור את הדיווח כל עוד לא מולאו השדות כראוי"

    // Check for errors in startMinute or endMinute in any row
    tableData.map((task) => {
        hasErrors ||= !task.isValidateTask();
    });

    return hasErrors ? errorMassage : undefined
};


export const isErrorHourNotCorrect = (value) => {
    let hasErrors = false;
    const errorMassage = `ערך של דק' לא חוקי, כתוב בבקשה מספר בין 0-23`;

    hasErrors = !(Number(value) >= 0 && Number(value) < 24);

    return hasErrors ? errorMassage : undefined
};


export const isErrorOfAddingNewRow = (task) => {
    let hasErrors = false;
    const errorMassage = `לא ניתן להוסיף שורה חדשה כל עוד לא מולאו כל השדות בשורה כראוי`;

    hasErrors = hasErrors === true ? hasErrors : !task.isValidateTask();

    return hasErrors ? errorMassage : undefined

};


export const isListTasksEqual = (originalTasks, newTasks) => {
    let isSame = true;
    if (originalTasks?.length !== newTasks?.length && originalTasks?.length > 0)
        isSame = false;
    else
        for (let i = 0; i < originalTasks?.length; i++) {
            let originalTask = originalTasks[i];
            let newTask = newTasks[i];
            isSame &&= (originalTask?.getTaskName()?.getTaskID() === newTask?.getTaskName()?.getTaskID(), originalTask?.getLocation()?.getLocationID() === newTask?.getLocation()?.getLocationID(),
                originalTask?.getStartHour() === newTask?.getStartHour(), originalTask?.getStartMinute() === newTask?.getStartMinute(),
                originalTask?.getEndHour() === newTask?.getEndHour(), originalTask?.getEndMinute() === newTask?.getEndMinute(), originalTask?.getGap() === newTask?.getGap()
            );            
        }
    return isSame
};
