import moment from 'moment';


export const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${year}-${month}-${day}`;
};

export const getTimeDiff = (startHour, startMinute, endHour, endMinute) => {
    let start_time = "01/01/2000 " + startHour + ":" + startMinute + ":00";
    let end_time = "01/01/2000 " + endHour + ":" + endMinute + ":00";

    return getDiff(start_time, end_time);
}

export const getDiff = (start_time, end_time) => {

    const diff = moment.utc(moment.utc(end_time, "DD/MM/YYYY HH:mm:ss").diff(moment.utc(start_time, "DD/MM/YYYY HH:mm:ss")));
    let diffInHours = diff.hours() + (diff.minutes() / 60);

    if (moment.utc(end_time, "DD/MM/YYYY HH:mm:ss").isBefore(moment.utc(start_time, "DD/MM/YYYY HH:mm:ss"))) {
        diffInHours = -diffInHours;
    }

    if (diffInHours > 24) {
        diffInHours = diffInHours - 24;
    }

    return diffInHours.toFixed(2);
}


export const getTotalTimePerDay = (tasksPerDay, indexOfChange, newGap) => {
    let count = 0.0;
    if (tasksPerDay) {
        tasksPerDay.map((obj, index) => {
            // Summary of the current tasks time

            if (index === indexOfChange)
                count += parseFloat(newGap);
            // Summary of the plan time change for the tasks
            else
                count += obj?.getGap() ? parseFloat(obj.getGap()) : 0;
        });
    }
    return count.toFixed(2);
}

export const getTimeEnd = (timeHour, timeMinute, gap) => {
    let time = "01/01/2000 " + timeHour + ":" + timeMinute + ":00";
    let HhMm = getTimeFromDecimal(gap);
    
    let result = moment(Date.parse(time)).add(parseInt(HhMm[0]), "h").add(parseInt(HhMm[1]), "m").format("HH.mm");
    return result;
}



export const getEndOfDayTime = (tasksPerDay, indexOfChange, newGap, firstTaskTime) => {
    if (!tasksPerDay[0]) return;

    let totalGapPerDay = getTotalTimePerDay(tasksPerDay, indexOfChange, newGap);
    let result = firstTaskTime + totalGapPerDay;

    return result;
};

export const isChangeTimeInSameDay = (tasksPerDay, fieldType) => {
    let firstTaskTimeStr = "01/01/2000 " + tasksPerDay[0]?.getStartHour() + ":" + tasksPerDay[0]?.getStartMinute() + ":00";
    let firstTaskTime = moment(firstTaskTimeStr, "DD/MM/YYYY HH:mm:ss");

    let firstTaskTime1 = parseFloat(tasksPerDay[0]?.getStartHour()) + (parseFloat(tasksPerDay[0]?.getStartMinute()) / 60);
    let totalGap = 0;

    for (let i = 0; i < tasksPerDay.length; i++) {
        totalGap += fieldType === "add" ?
            parseFloat(tasksPerDay[i].getGap()) :
            tasksPerDay[i].isValidateTaskOnlyTime() ?
                parseFloat(tasksPerDay[i].getGap()) :
                tasksPerDay[i].isValidateTaskOnlyTimeStart() && tasksPerDay[i].isValidateTaskOnlyTimeEnd()  ?
                    0 :
                    parseFloat(tasksPerDay[i].getGap()) 
    }
    let newEndTime = firstTaskTime1 + totalGap;

    return newEndTime
};


// }

export const getManyDays = (timeHour, timeMinute, gap) => {
    let time = "01/01/2000 " + timeHour + ":" + timeMinute + ":00";
    let HhMm = getTimeFromDecimal(gap);
    let result = moment(Date.parse(time)).add(parseInt(HhMm[0]), "h").add(parseInt(HhMm[1]), "m").format('Do');

    return result !== "1st" ? 1 : 0
}


export const getReduceTime = (timeHour, timeMinute, gap, isEnd) => {
    let time = "01/01/2000 " + timeHour + ":" + timeMinute + ":00";
    let HhMm = getTimeFromDecimal(gap);
    
    return moment(Date.parse(time)).subtract(parseInt(HhMm[0]), "h").subtract(parseInt(HhMm[1]), "m").format("HH.mm");
}


export const getGapForCalc = (gap) => {

    let newGap = [];
    newGap[0] = '0'
    newGap[1] = '0'

    let gapArr = (gap + "").split('.')
    gapArr[1] = gapArr[1] === null || gapArr[1] === undefined || gapArr[1] === '' ? '00' : gapArr[1]


    newGap[0] = gapArr[0]
    newGap[1] = gapArr[1]

    if (gapArr[1] === null || gapArr[1] === undefined || gapArr[1] === '')
        newGap[1] = gapArr[1] === null || gapArr[1] === undefined || gapArr[1] === '' ? '0' : gapArr[1]

    let result = newGap[0] + '.' + newGap[1];
    return newGap[1].length < 2 ? result + '0' : result;
}



export const getTimeFromDecimal = (decimalNum) => {
    let hours = Math.floor(decimalNum);
    let minutes = Math.round((decimalNum - hours) * 60);
    let result = hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    return result.split(":")
}

