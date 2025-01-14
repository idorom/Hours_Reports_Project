import React, { useState, useRef, useEffect } from 'react';
import './TableTime.css';
import { getTimeEnd, getGapForCalc, isChangeTimeInSameDay, getTotalTimePerDay } from '../utils/Dates_times_handle'
import { isValidHourFormat, isValidMinuteFormat, handleNumbersUnder10, isValidNumberFormat, isErrorHourNotCorrect, isErrorOfAddingNewRow, isErrorOfStartLatestThanEnd } from '../utils/format_logic_handle'
import Task from "../models/Task.js";
import Select from 'react-select';

// Define tableDataRef outside the component
const tableDataRef = { current: [] };

// Define getTableTimeCurr outside the component
const getTableTimeCurr = () => {
    return tableDataRef.current;
};

const TimeTable = (props) => {
    const [tableData, setTableData] = useState([]);

    // Update the ref whenever tableData changes
    useEffect(() => {
        tableDataRef.current = tableData;
    }, [tableData]);

    const starthhRefs = useRef({});
    const startmmRefs = useRef({});
    const endhhRefs = useRef({});
    const endmmRefs = useRef({});
    const gapRefs = useRef({});

    const selectAllText = (ref) => {
        if (ref) {
            ref.select();
        }
    };

    const getTotalTimePerDayCalc = (timeArr) => {
        props.setTotalHoursPerCurrentDay(parseFloat(getTotalTimePerDay(timeArr)))
    }


    const [errors, setErrors] = useState([]);

    const handleCellValueChange = (errorTitle, id, value) => {
        let errorResult = errors;
        let errorResultPrev = errors;

        if (errorTitle === "isTasksValids") {
            let allTasksValidToSave = true;
            tableData.map((task) => (allTasksValidToSave &&= task.isValidateTask()))
            let error = !allTasksValidToSave ? "חלק מהנתונים בדיווח אינם תקינים, אנא תקן את השדות המסומנים באדום" : undefined;
            if (error !== undefined) {
                errorResult[0] = error;
            }
            else errorResult[0] = undefined;
        }
        else errorResult[0] = undefined;


        if (errorTitle === "isErrorOfAddingNewRow") {
            let error = isErrorOfAddingNewRow(tableData[id - 1]);
            if (error !== undefined) {
                errorResult[1] = error;
            }
            else errorResult[1] = undefined;
        }
        else errorResult[1] = undefined;

        if (errorTitle === "isErrorHourNotCorrect" && value.length === 2) {
            let error = isErrorHourNotCorrect(value);
            if (error !== undefined) {
                errorResult[2] = error;
            }
            else errorResult[2] = undefined;
        }
        else errorResult[2] = undefined;

        if (errorTitle === "isErrorOfStartLatestThanEndAllTable") {
            let error = isErrorOfStartLatestThanEnd("isErrorOfStartLatestThanEndAllTable", id, tableData);
            if (error !== undefined) {
                if (tableData[id - 1]?.isValidateTaskOnlyTimeStart() && tableData[id - 1]?.isValidateTaskOnlyTimeEnd())
                    errorResult[3] = error;
            }
            else errorResult[3] = undefined;
        }

        if (errorTitle === "isErrorOfNotTheSameDay") {
            let error = value > 24 ? "זמן הסיום צריך להיות מאוחר מזמן ההתחלה או שהדיווח חורג מגבול היממה" : undefined;
            if (error !== undefined) {
                errorResult[4] = error;
            }
        }
        else errorResult[4] = undefined;


        if (errorTitle === "isErrorHourNotCorrect") {
            let error = isErrorHourNotCorrect(value);
            if (error !== undefined) {
                errorResult[2] = error;
            }
            else errorResult[2] = undefined;
        }
        else errorResult[2] = undefined;

        props.updateErrors(errorResult.filter(error => error !== undefined))
        setErrors(errorResult)
        return errorResult;
    };


    const [tasksNames, setTasksNames] = useState([]);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        setTasksNames(props.taskNames || []);
    }, [props.taskNames]);


    useEffect(() => {
        setLocations(props.taskLocations || []);
    }, [props.taskLocations]);


    useEffect(() => {
        if (props.Taskslist && props.Taskslist.length > 0) {
            setTableData(props.Taskslist);
        } else {
            const defualtLocations = props.taskLocations.find(location => location.getLabel() === "משרד");
            const newTask = new Task(1, undefined, defualtLocations, '', '', '', '');
            setTableData([newTask]);
        }
    }, [props.Taskslist]);


    useEffect(() => {
        getTotalTimePerDayCalc(tableData);
        handleCellValueChange("isErrorOfStartLatestThanEndAllTable", undefined);
    }, [tableData]);

    useEffect(() => {
        if (props.isSubmittedStatus) {
            handleCellValueChange("isTasksValids")
        }
    }, [props.isSubmittedStatus])


    const handleAddRow = (id, EndHour, EndMinute) => {
        handleCellValueChange("isErrorOfAddingNewRow", id);

        if (isErrorOfAddingNewRow(tableData[id - 1])) return;

        let totalGap = isMoveToNextDay(tableData.length, 0.5, [...tableData], "add")

        if (totalGap >= 24) {
            handleCellValueChange("isErrorOfNotTheSameDay", id, totalGap)
            return;
        }

        setTableData((prevTableData) => {
            const rowIndex = prevTableData.findIndex(row => row.getID() === id);
            if (rowIndex === -1) return prevTableData;

            const defualtLocations = props.taskLocations.find(location => location.getLabel() === "משרד");


            // Create new row with initial values
            const newRow = new Task(id + 1, undefined, defualtLocations, handleNumbersUnder10(parseInt(EndHour)), handleNumbersUnder10(parseInt(EndMinute)), '', '');

            // Calculate end time for the new row
            let endTime = getTimeEnd(EndHour, EndMinute, getGapForCalc('0.5'));
            let endHour = handleNumbersUnder10(parseInt(endTime.substring(0, 2)));
            let endMinute = handleNumbersUnder10(parseInt(endTime.substring(3, 5)));
            newRow.setEndTime(endHour, endMinute);

            // Insert new row after the clicked row
            const updatedTableData = [...prevTableData.slice(0, rowIndex + 1), newRow, ...prevTableData.slice(rowIndex + 1)];

            // Update IDs and times for rows from the new row to the end
            for (let i = rowIndex + 1; i < updatedTableData.length; i++) {
                const prevRow = updatedTableData[i - 1];
                const gap = i === rowIndex + 1 ? getGapForCalc('0.5') : updatedTableData[i].getGap();
                const end = getTimeEnd(prevRow.getEndHour(), prevRow.getEndMinute(), gap);

                let startHour = prevRow.getEndHour();
                let startMinute = prevRow.getEndMinute();
                let endHour = handleNumbersUnder10(parseInt(end.substring(0, 2)));
                let endMinute = handleNumbersUnder10(parseInt(end.substring(3, 5)));

                updatedTableData[i] = new Task(i + 1, updatedTableData[i].getTaskName(), updatedTableData[i].getLocation(), startHour, startMinute, endHour, endMinute, gap);
            }
            return updatedTableData;
        });
    };

    const handleDeleteRow = (id) => {
        setTableData((prevTableData) => {
            const rowIndex = prevTableData.findIndex(row => row.getID() === id);
            if (rowIndex === -1) return prevTableData;

            // Insert new row after the clicked row
            const updatedTableData = [...prevTableData.slice(0, rowIndex), ...prevTableData.slice(rowIndex + 1)];

            for (let i = rowIndex; i < updatedTableData.length; i++) {
                if (i !== 0) {
                    let startHour = updatedTableData[i - 1].getEndHour();
                    let startMinute = updatedTableData[i - 1].getEndMinute();
                    updatedTableData[i].setStartTime(startHour, startMinute);
                }

                updatedTableData[i].setID(updatedTableData[i].getID() - 1);
            }
            return updatedTableData;
        });
    }

    const updateRef = (value, fieldType, id) => {
        switch (fieldType) {
            case 'hh_start':
                starthhRefs[id].value = value;
                break;
            case 'mm_start':
                startmmRefs[id].value = value;
                break;
            case 'hh_end':
                endhhRefs[id].value = value;
                break;
            case 'mm_end':
                endmmRefs[id].value = value;
                break;
            case 'gap':
                gapRefs[id].value = value;
                break;
        }
    };


    const isMoveToNextDay = (id, value, dataTable, fieldType, onBlur) => {
        let coppyTable = [];

        for (let i = 0; i < dataTable.length; i++) {
            let t = dataTable[i]
            coppyTable[i] = new Task(t.getID(), null, null, t.getStartHour(), t.getStartMinute(), t.getEndHour(), t.getEndMinute(), i === id - 1 ? t.getGap() : undefined);
        }



        let task = coppyTable?.[id - 1]
        if (fieldType.endsWith('start')) {
            let gap_old = task.getGap();
            task.handleInputChangeStart(value + "", fieldType, onBlur);
            if (gap_old !== task.getGap())
                task.setGap(gap_old);
        } else if (fieldType.endsWith('end')) {
            task.handleInputChangeEnd(value + "", fieldType, onBlur);
            task.calculateGap();
        }
        else if (fieldType === 'gap') {
            task.setGap(value);
        }
        else if (fieldType === 'add') {
            coppyTable = [...coppyTable, new Task(dataTable.length, null, null, null, null, null, null, value)]
            task = coppyTable?.[dataTable.length - 1]
        }

        return isChangeTimeInSameDay(coppyTable, id - 1, task.getGap(), task.isValidateTaskOnlyTime(), fieldType);
    }


    const handleInputChangeStart = (id, field, value, fieldType, onBlur) => {
        if (!isValidNumberFormat(value)) return;

        handleCellValueChange();

        let task = tableData?.[id - 1];

        let totalGap = isMoveToNextDay(id, value, [...tableData], fieldType, onBlur)

        if (totalGap >= 24) {
            handleCellValueChange("isErrorOfNotTheSameDay", id, totalGap)
            task.handleInputChangeStart("", fieldType);
            updateRef("", fieldType, task.getID());
            return;
        }

        if (fieldType === 'hh_start') {
            handleCellValueChange("isErrorHourNotCorrect", task.getID(), value)
            task.handleInputChangeStart(value, fieldType, onBlur);
            updateRef(task.getStartHour(), fieldType, task.getID());

            if (!isValidHourFormat(value) && value.length === 2) return;

            if (starthhRefs?.[task.getID()].value.length === 2) {
                const nextField = startmmRefs && startmmRefs[task.getID()];
                if (nextField && nextField.focus) nextField.focus();
            }
        } else if (fieldType === 'mm_start') {
            task.handleInputChangeStart(value, fieldType, onBlur);
            updateRef(task.getStartMinute(), fieldType, task.getID());
            if (startmmRefs?.[task.getID()].value.length === 2) {
                const nextField = endhhRefs && endhhRefs[task.getID()];
                if (nextField && nextField.focus) nextField.focus();
            }
        }


        if ((isValidHourFormat(task.getEndHour()) && isValidMinuteFormat(task.getEndMinute()) && (task.getEndHour() + "").length === 2 && (task.getEndMinute() + "").length === 2)) {
            task.setStartTime(task.getStartHour(), task.getStartMinute());
            for (let i = id; i < tableData.length; i++) {
                let PrevTask = tableData?.[i - 1];
                let nextTask = tableData?.[i];
                
                nextTask.setStartTime(PrevTask.getEndHour(), PrevTask.getEndMinute())
                updateRef(nextTask.getStartHour(), 'hh_start', nextTask.getID());
                updateRef(nextTask.getStartMinute(), 'mm_start', nextTask.getID());
                updateRef(nextTask.getEndHour(), 'hh_end', nextTask.getID());
                updateRef(nextTask.getEndMinute(), 'mm_end', nextTask.getID());
                updateRef(nextTask.getGap(), 'gap', nextTask.getID());

                if (nextTask.getGap() <= 0) {
                    nextTask.setGap(getGapForCalc('0.5'));
                    updateRef(getGapForCalc('0.5'), 'gap', nextTask.getID());
                }
            }
        }

        getTotalTimePerDayCalc(tableData);
        handleCellValueChange("isErrorOfStartLatestThanEndAllTable", id);
        setTableData([...tableData]);
    };



    const handleInputChangeEnd = (id, field, value, fieldType, onBlur) => {
        if (!isValidNumberFormat(value)) return;

        let task = tableData?.[id - 1];
        let totalGap = isMoveToNextDay(id, value, [...tableData], fieldType, onBlur);

        if (totalGap >= 24) {
            handleCellValueChange("isErrorOfNotTheSameDay", id, totalGap)
            task.handleInputChangeEnd("", fieldType);
            updateRef("", fieldType, task.getID());
            return;
        }

        if (fieldType === 'hh_end') {
            handleCellValueChange("isErrorHourNotCorrect", task.getID(), value)
            task.handleInputChangeEnd(value, fieldType, onBlur);
            updateRef(task.getEndHour(), fieldType, task.getID());

            if (!isValidHourFormat(value) && value.length === 2) return;

            if (endhhRefs?.[id].value.length === 2) {
                const nextField = endmmRefs && endmmRefs[id];
                if (nextField && nextField.focus) nextField.focus();
            }
        } else if (fieldType === 'mm_end') {
            task.handleInputChangeEnd(value, fieldType, onBlur);
            updateRef(task.getEndMinute(), fieldType, task.getID());
            if (endmmRefs?.[id].value.length === 2) {
                const nextField = endhhRefs && (id + 1 < tableData.length ? endhhRefs[id + 1] : null);
                if (nextField && nextField.focus) nextField.focus();
            }
        }


        if ((isValidHourFormat(task.getEndHour()) && isValidMinuteFormat(task.getEndMinute()) && (task.getEndHour() + "").length === 2 && (task.getEndMinute() + "").length === 2)) {
            task.calculateGap();
            for (let i = id; i < tableData.length; i++) {
                let PrevTask = tableData?.[i - 1];
                let nextTask = tableData?.[i];

                nextTask.setStartTime(PrevTask.getEndHour(), PrevTask.getEndMinute());
                updateRef(nextTask.getStartHour(), 'hh_start', nextTask.getID());
                updateRef(nextTask.getStartMinute(), 'mm_start', nextTask.getID());
                updateRef(nextTask.getEndHour(), 'hh_end', nextTask.getID());
                updateRef(nextTask.getEndMinute(), 'mm_end', nextTask.getID());

                if (nextTask.getGap() <= 0) {
                    nextTask.setGap(getGapForCalc('0.5'));
                    updateRef(getGapForCalc('0.5'), 'gap', nextTask.getID());
                }
            }
        }

        getTotalTimePerDayCalc(tableData);
        handleCellValueChange("isErrorOfStartLatestThanEndAllTable", id);
        setTableData([...tableData]);
    };


    const handleGap = (id, value) => {
        let task = tableData?.[id - 1];

        let totalGap = isMoveToNextDay(id, value, [...tableData], "gap");

        if (totalGap >= 24) {
            handleCellValueChange("isErrorOfNotTheSameDay", id, totalGap)
            task.setGap("");
            updateRef("", "gap", task.getID());
            return;
        }


        task.setGap(value);
        updateRef(task.getGap(), 'gap', task.getID());
        updateRef(task.getEndHour(), 'hh_end', task.getID());
        updateRef(task.getEndMinute(), 'mm_end', task.getID());

        if ((isValidHourFormat(task.getEndHour()) && isValidMinuteFormat(task.getEndMinute()) && (task.getEndHour() + "").length === 2 && (task.getEndMinute() + "").length === 2)) {
            for (let i = id; i < tableData.length; i++) {
                let PrevTask = tableData?.[i - 1];
                let nextTask = tableData?.[i];

                nextTask.setStartTime(PrevTask.getEndHour(), PrevTask.getEndMinute());
                updateRef(nextTask.getStartHour(), 'hh_start', nextTask.getID());
                updateRef(nextTask.getStartMinute(), 'mm_start', nextTask.getID());
                updateRef(nextTask.getEndHour(), 'hh_end', nextTask.getID());
                updateRef(nextTask.getEndMinute(), 'mm_end', nextTask.getID());

                if (nextTask.getGap() <= 0) {
                    nextTask.setGap(getGapForCalc('0.5'));
                    updateRef(getGapForCalc('0.5'), 'gap', nextTask.getID());
                }
            }
        }

        // Trigger re-render to update the input fields
        setTableData([...tableData]);
        handleCellValueChange("isErrorHourNotCorrect", task.getID(), value)
    };


    const handleInputChange = (rowId, column, value) => {
        const updatedRows = tableData.map(row => {
            if (row.getID() === rowId) {
                if (column === 'selectedTask') {
                    row.setTaskName(value);
                } else if (column === 'selectedLocation') {
                    row.setLocation(value);
                }
            }
            return row;
        });
        setTableData(updatedRows);
    };

    return (
        <div className="time-table-container">
            <table className="time-table" >
                <thead>
                    <tr>
                        <th className="heading" >משימה</th>
                        <th className="heading" >מקום</th>
                        <th className="heading" >שעת התחלה</th>
                        <th className="heading" >שעת סיום</th>
                        <th className="heading" >משך המשימה </th>
                        <th className="heading" >פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.getID()} style={{ backgroundColor: '#f2f2f2' }}>
                            <td>
                                <Select
                                    value={tasksNames.find(task => {
                                        const taskName = row.getTaskName();
                                        return taskName && typeof taskName.getTaskID === 'function' && task?.getTaskID() === taskName?.getTaskID();
                                    }) || null}
                                    onChange={(selectOption) => {
                                        handleInputChange(row.getID(), 'selectedTask', selectOption);
                                    }}
                                    options={tasksNames}
                                    isSearchable={true}
                                    menuPortalTarget={document.body}
                                    className={`my-custom-select ${props.isSubmittedStatus
                                        ? (row?.isTaskNameValidFormat() ? 'is-valid' : 'is-invalid')
                                        : (row?.countNumChangesOnField("TaskName") > 1
                                            ? (row?.isTaskNameValidFormat() ? 'is-valid' : 'is-invalid')
                                            : 'is-valid')}`}
                                    classNamePrefix="my-custom-select" // Sets prefix for nested elements
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            border: props.isSubmittedStatus
                                                ? (row?.isTaskNameValidFormat() ? '1px solid #ccc' : '2px solid red')
                                                : (row?.countNumChangesOnField("TaskName") > 1 ? (row?.isTaskNameValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                        }),
                                    }}
                                    getOptionLabel={(option) => option.toString()}
                                    getOptionValue={(option) => option.getTaskID()}
                                    isDisabled={props.isDateCurrentMonth}
                                />
                            </td>
                            <td>
                                <Select
                                    value={locations.find(location => {
                                        const loc = row.getLocation();
                                        return loc && typeof loc.getLocationID === 'function' && location?.getLocationID() === loc?.getLocationID();
                                    }) || null}
                                    onChange={(selectOption) => {
                                        handleInputChange(row.getID(), 'selectedLocation', selectOption);
                                    }}
                                    options={locations}
                                    isSearchable={true}
                                    menuPortalTarget={document.body}
                                    className={`my-custom-select ${props.isSubmittedStatus
                                        ? (row?.isTaskNameValidFormat() ? 'is-valid' : 'is-invalid')
                                        : (row?.countNumChangesOnField("TaskName") > 1
                                            ? (row?.isTaskNameValidFormat() ? 'is-valid' : 'is-invalid')
                                            : 'is-valid')}`}
                                    classNamePrefix="my-custom-select" // Sets prefix for nested elements
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            border: props.isSubmittedStatus
                                                ? (row?.isLocationValidFormat() ? '1px solid #ccc' : '2px solid red')
                                                : (row?.countNumChangesOnField("Location") > 1 ? (row?.isLocationValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                        }),
                                    }}
                                    getOptionLabel={(option) => option.toString()}
                                    getOptionValue={(option) => option.getLocationID()}
                                    isDisabled={props.isDateCurrentMonth}
                                />
                            </td>
                            <td dir='ltr'>
                                <input
                                    dir='rtl'
                                    type="text"
                                    value={row.getStartHour()}
                                    disabled={row.getID() !== 1 || props.isDateCurrentMonth ? true : false}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        handleInputChangeStart(row.getID(), 'startHour', newValue, 'hh_start', false);
                                    }}
                                    onBlur={(e) => {
                                        const { value } = e.target;
                                        if (value.length === 1) {
                                            handleInputChangeStart(row.getID(), 'startHour', value, 'hh_start', true);
                                        }
                                    }}
                                    placeholder="hh"
                                    ref={(input) => (starthhRefs[row.getID()] = input)}
                                    onFocus={() => selectAllText(starthhRefs[row.getID()])}
                                    style={{
                                        border: props.isSubmittedStatus
                                            ? (row?.isStartHourValidFormat() ? '1px solid #ccc' : '2px solid red')
                                            : (row?.countNumChangesOnField("startHour") > 0 ? (row?.isStartHourValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                    }}
                                    className='start-hour-input'
                                />
                                <span>:</span>
                                <input dir='rtl'
                                    type="text"
                                    value={row.getStartMinute()}
                                    disabled={row.getID() !== 1 || props.isDateCurrentMonth ? true : false}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        handleInputChangeStart(row.getID(), 'startMinute', newValue, 'mm_start', false);
                                    }}
                                    onBlur={(e) => {
                                        const { value } = e.target;
                                        if (value.length === 1) {
                                            handleInputChangeStart(row.getID(), 'startMinute', value, 'mm_start', true);
                                        }
                                    }}
                                    placeholder="mm"
                                    ref={(input) => (startmmRefs[row.getID()] = input)}
                                    onFocus={() => selectAllText(startmmRefs[row.getID()])}
                                    style={{
                                        border: props.isSubmittedStatus
                                            ? (row?.isStartMinuteValidFormat() ? '1px solid #ccc' : '2px solid red')
                                            : (row?.countNumChangesOnField("startMinute") > 0 ? (row?.isStartMinuteValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                    }}
                                    className="start-minute-input"
                                />
                            </td>
                            <td dir='ltr'>
                                <input dir='rtl'
                                    type="text"
                                    value={row.getEndHour()}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        handleInputChangeEnd(row.getID(), 'endHour', newValue, 'hh_end', false);

                                    }}
                                    onBlur={(e) => {
                                        const { value } = e.target;
                                        if (value.length === 1) {
                                            handleInputChangeEnd(row.getID(), 'endHour', value, 'hh_end', true);
                                        }
                                    }}
                                    placeholder="hh"
                                    ref={(input) => (endhhRefs[row.getID()] = input)}
                                    onFocus={() => selectAllText(endhhRefs[row.getID()])}
                                    style={{
                                        border: props.isSubmittedStatus
                                            ? (row?.isEndHourValidFormat() ? '1px solid #ccc' : '2px solid red')
                                            : (row?.countNumChangesOnField("endHour") > 0 ? (row?.isEndHourValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                    }}
                                    className="end-hour-input"
                                    disabled={props.isDateCurrentMonth}
                                />
                                <span>:</span>
                                <input dir='rtl'
                                    type="text"
                                    value={row.getEndMinute()}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        handleInputChangeEnd(row.getID(), 'endMinute', newValue, 'mm_end', false);
                                    }}
                                    onBlur={(e) => {
                                        const { value } = e.target;
                                        if (value.length === 1) {
                                            handleInputChangeEnd(row.getID(), 'endMinute', value, 'mm_end', true);
                                        }
                                    }}
                                    placeholder="mm"
                                    ref={(input) => (endmmRefs[row.getID()] = input)}
                                    onFocus={() => selectAllText(endmmRefs[row.getID()])}
                                    style={{
                                        border: props.isSubmittedStatus
                                            ? (row?.isEndMinuteValidFormat() ? '1px solid #ccc' : '2px solid red')
                                            : (row?.countNumChangesOnField("endMinute") > 0 ? (row?.isEndMinuteValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                    }}
                                    className="end-minute-input"
                                    disabled={props.isDateCurrentMonth}
                                />
                            </td>
                            <td >
                                <input
                                    type="number"
                                    value={row.getGap()}
                                    onChange={(e) => handleGap(row.getID(), e.target.value)}
                                    step="1.0"
                                    ref={(input) => (gapRefs[row.getID()] = input)}
                                    onFocus={() => selectAllText(gapRefs[row.getID()])}
                                    style={{
                                        border: props.isSubmittedStatus
                                            ? (row?.isGapValidFormat() ? '1px solid #ccc' : '2px solid red')
                                            : (row?.countNumChangesOnField("gap") > 0 ? (row?.isGapValidFormat() ? '1px solid #ccc' : '2px solid red') : '1px solid #ccc')
                                    }}
                                    className="gap-input"
                                    disabled={props.isDateCurrentMonth}
                                />
                            </td>
                            <td style={{ width: '9ch', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={() => handleAddRow(row.getID(), endhhRefs[row.getID()].value, endmmRefs[row.getID()].value)}
                                        style={{
                                            backgroundColor: '#4CAF50', // Green button with good contrast
                                            borderRadius: '35%',
                                            width: "2.8vh",
                                            height: "2.8vh",
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: '0',
                                            cursor: 'pointer',
                                        }}
                                        disabled={props.isDateCurrentMonth}
                                        title="לחץ על מנת להוסיף משימה"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5vh" height="2.5vh" fill="white" viewBox="0 0 16 16">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleDeleteRow(row.getID())}
                                        style={{
                                            backgroundColor: '#D32F2F', // Darker red for improved contrast
                                            borderRadius: '35%',
                                            width: "2.8vh",
                                            height: "2.8vh",
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: '0',
                                            cursor: 'pointer',
                                        }}
                                        disabled={tableData.length === 1 || props.isDateCurrentMonth}
                                        title="לחץ על מנת להסיר משימה"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5vh" height="2.5vh" fill="white" viewBox="0 0 16 16">
                                            <path d="M11.5 8a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1 0-1h6.5a.5.5 0 0 1 .5.5z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );
};

export { TimeTable, getTableTimeCurr };