import React, { useState, useEffect, useRef } from "react";
import "./HourReportPage.css";
import Calendar from "../components/Calendar.jsx";
import { TimeTable, getTableTimeCurr } from "../components/TableTime.jsx";
import { formatDate } from "../utils/Dates_times_handle.jsx";
import { isErrorTasksWithRightFormat, isListTasksEqual } from "../utils/format_logic_handle.jsx";
import SummeryValue from "../components/SummeryValue.jsx";
import Notification from "../components/Notification.jsx";
import apiService from "../utils/api"; // Import the API service

import Task from "../models/Task.js";
import TaskName from "../models/TaskName.js";
import Location from "../models/Location.js";



function HourReportPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [formerDate, setFormerDate] = useState(formatDate(new Date()));
  const [user, setUser] = useState([]);
  const [tasksByDate, setTasksByDate] = useState([]);
  const [originalTaskslist, setOriginalTaskslist] = useState([]);
  const [taskNames, setTaskNames] = useState([]);
  const [taskNamesLocations, setTaskLocations] = useState([]);
  const [totalHoursPerCurrentMonth, setTotalHoursPerCurrentMonth] = useState(0);
  const [totalHoursPerCurrentDay, setTotalHoursPerCurrentDay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittedStatus, setIsSubmittedStatus] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [isReloadPage, setIsReloadPage] = useState(false);
  const [errors, setErrors] = useState([]);
  const [approveUpload, setApproveUpload] = useState(false);
  const hasLoadedRef = useRef(false); // To prevent double loading
  const [isDateCurrentMonth, setIsDateCurrentMonth] = useState(false);
  const [highlightDates, sethHighlightDates] = useState([]);


  const updateErrors = (newErrors) => {
    setErrors(newErrors);
  };


  const reloadDataPerDayPerUser = async () => {
    if (user.length > 0 && selectedDate) {
      try {
        const data = await apiService.getWorkerData(user[0]?.EmployeeID, selectedDate);
        const formattedTasks = data?.toDayData.map((item) => (
          new Task(
            item.LineNum,
            new TaskName(item.taskID, item.displayName),
            new Location(item.locationID, item.locationName),
            (item.startHour + "").length === 1 ? "0" + item.startHour : item.startHour,
            (item.startMinute + "").length === 1 ? "0" + item.startMinute : item.startMinute,
            (item.endHour + "").length === 1 ? "0" + item.endHour : item.endHour,
            (item.endMinute + "").length === 1 ? "0" + item.endMinute : item.endMinute,
            item.gap
          )
        ));

        setTasksByDate([{ date: selectedDate, tasks: formattedTasks }]);
        setOriginalTaskslist(formattedTasks); // Save the original tasks list


        const taskNamesArray = data?.TasksNameData.map((item) => (new TaskName(item.taskID, item.displayName)));
        setTaskNames(taskNamesArray);

        setIsDateCurrentMonth((new Date(selectedDate).getMonth() + 1) !== (new Date().getMonth() + 1));

        const locationsArray = data?.locationsNameData.map((item) => (new Location(item.locationID, item.locationName)));
        setTaskLocations(locationsArray);
        console.log(data?.TasksDates)
        const TasksDates = data?.TasksDates.map((item) => (formatDate(new Date(item.date))));
        console.log(TasksDates)
        sethHighlightDates(TasksDates);

        setTotalHoursPerCurrentMonth(data?.totalHoursPerCurrentMonth[0].totalHoursPerCurrentMonth + 0);

      } catch (error) {
        console.error("Error reloading data:", error);
      }
    }
    setFormerDate(selectedDate);
  };


  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("מחוק מחוק")
        const tokenDetails = await apiService.getTokenDetails();
        const email = tokenDetails?.email; // Extract email from the token
        if (!hasLoadedRef.current && email) {  // Only fetch data once
          apiService.getAllData(email)
            .then((data) => {
              setUser(data);
              hasLoadedRef.current = true;  // Mark as loaded to prevent refetch
            })
            .catch((error) => console.error("Error fetching user data:", error));
        }
      } catch (error) {
        console.error("Error getting token details:", error);
      }
    };
    loadUserData();
  }, []); // Empty dependency array to load data only once


  useEffect(() => {
    reloadDataPerDayPerUser();
    setSubmittedStatus(null);
    updateErrors([]);
  }, [selectedDate, user]);



  useEffect(() => {
    if (isReloadPage && isListTasksEqual(originalTaskslist, getTableTimeCurr())) {
      setIsReloadPage(false);
      setApproveUpload(false);
      return;
    }
    setIsReloadPage(false);
    setSubmittedStatus(null);

    const currentTasks = getTableTimeCurr();
    if (formerDate !== selectedDate || (formerDate === selectedDate && currentTasks?.[0]?.isTaskEmpty()) || (formerDate === selectedDate && currentTasks?.length > 1)) {
      setIsSubmittedStatus(false);
    }
  }, [getTableTimeCurr()]);



  const handleDateSelect = (date) => {
    setSelectedDate(formatDate(date));
  };



  const tasksForSelectedDate = selectedDate ? tasksByDate.find((entry) => entry.date === selectedDate)?.tasks || [] : [];

  const handleUpdateData = async (currentTableData, originalTaskslistParsed, command) => {
    let isSuccess = false;

    setIsLoading(true);

    try {
      await apiService.deleteAddRows(
        originalTaskslistParsed,
        currentTableData
      );

      isSuccess = true;

      await reloadDataPerDayPerUser();

      setIsLoading(false);
      setSubmittedStatus(isSuccess ? true : false);

      if (command === "delete") {
        setIsSubmittedStatus(false);
        setErrors([]);
      }

    } catch (err) {
      setIsLoading(false);
      setSubmittedStatus(isSuccess ? true : false);
    }
  };



  const handleAddData = async () => {
    setIsSubmittedStatus(true);
    setIsReloadPage(true);

    if (isErrorTasksWithRightFormat(getTableTimeCurr()) || errors.length > 0) {
      setApproveUpload(true);
      return;
    }

    const currentTableData = getTableTimeCurr().map((task) => ({
      ...task,
      date: new Date(selectedDate).toISOString().slice(0, 10),
      startHour: parseInt(task.getStartHour()),
      startMinute: parseInt(task.getStartMinute()),
      endHour: parseInt(task.getEndHour()),
      endMinute: parseInt(task.getEndMinute()),
      gap: parseFloat(task.getGap()).toFixed(2),
      ownerID: parseInt(user[0]?.EmployeeID),
      taskID: parseInt(task.getTaskName()?.getTaskID()),
      LineNum: parseInt(task.getID()),
      selectedTask: task.getTaskName(),
      locationID: parseInt(task?.getLocation()?.getLocationID()),
    }));



    const originalTaskslistParsed = originalTaskslist.map((task) => ({
      ...task,
      date: new Date(selectedDate).toISOString().slice(0, 10),
      ownerID: parseInt(user[0]?.EmployeeID),
    }));
    await handleUpdateData(currentTableData, originalTaskslistParsed, "update");
  };



  const handleDeleteData = async () => {
    const currentTableData = [];
    setIsReloadPage(false);

    const originalTaskslistParsed = getTableTimeCurr().map((obj) => ({
      ...obj,
      date: new Date(selectedDate).toISOString().slice(0, 10),
      ownerID: parseInt(user[0]?.EmployeeID),
    }));

    await handleUpdateData(currentTableData, originalTaskslistParsed, "delete");
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="HourReportPage-background">
        {!user ? <div>Loading...</div>
          :
          <div className="container">
            <p className="p">ברוך הבא: {user[0]?.firstName} {user[0]?.surName}</p>

            <Calendar className="calendar" onDateSelect={handleDateSelect} highlightDates={highlightDates} />

            <TimeTable
              className="time-table"
              Taskslist={tasksForSelectedDate}
              taskNames={taskNames}
              taskLocations={taskNamesLocations}
              updateErrors={updateErrors}
              errors={errors}
              setTotalHoursPerCurrentDay={setTotalHoursPerCurrentDay}
              isSubmittedStatus={isSubmittedStatus}
              isDateCurrentMonth={isDateCurrentMonth}
            />

            {/* Display errors */}
            {errors[0] && (
              <Notification
                className="notification failure"
                content={errors}
                width="26vw"
                type="list"
              />
            )}

            <div className="ParentComponent">
              <SummeryValue
                value={totalHoursPerCurrentDay}
                title={"שעות סך הכל היום: "}
              />
              <SummeryValue
                value={totalHoursPerCurrentMonth}
                title={"שעות מדווחות בחודש הנוכחי: "}
              />
            </div>

            <button
              className="submitChanges submitChangesDelete"
              onClick={handleDeleteData}
              disabled={isLoading || isDateCurrentMonth}
              title="לחץ על מנת למחוק את הדיווח ביום זה"
            >
              מחיקת היום
            </button>

            <button
              className="submitChanges submitChangesSave"
              onClick={handleAddData}
              disabled={isLoading || isDateCurrentMonth}
              title="לחץ על מנת לשמור את הדיווח"
            >
              שמירה
            </button>

            {isSubmittedStatus && (submittedStatus !== null && (
              <Notification
                className={submittedStatus ? "notification success" : "notification failure"}
                content={submittedStatus ? "השמירה הושלמה בהצלחה" : "השמירה נכשלה"}
                width={submittedStatus ? "14vw" : "16vw"}
                type="msg"
              />
            ))}
          </div>
        }
      </div>
    </>
  );
}

export default HourReportPage;
