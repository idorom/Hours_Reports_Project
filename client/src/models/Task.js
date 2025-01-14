import { getTimeDiff, getTimeEnd } from '../utils/Dates_times_handle'
import { isValidHourFormat, isValidMinuteFormat, isValidGapFormat } from '../utils/format_logic_handle'
import Location from "./Location.js"
import TaskName from "./TaskName.js"

class Task {
  #id = { value: null, count: -1 };
  #taskName = { value: null, count: -1 };;
  #location = { value: null, count: -1 };;
  #startHour = { value: null, count: -1 };;
  #startMinute = { value: null, count: -1 };;
  #endHour = { value: null, count: -1 };;
  #endMinute = { value: null, count: -1 };;
  #gap = { value: null, count: -1 };;

  constructor(id, taskName, location, startHour, startMinute, endHour, endMinute,gap) {
    this.setID(id);
    this.setTaskName(taskName);
    this.setLocation(location);
    this.setStartHour(startHour);
    this.setStartMinute(startMinute);
    this.setEndHour(endHour);
    this.setEndMinute(endMinute);
    gap!==undefined ? this.setGap(gap) : this.calculateGap();
  }

  setID(id) {
    ++this.#id.count;
    this.#id.value = id;
  }

  setTaskName(taskName) {
    ++this.#taskName.count;
    this.#taskName.value = taskName;
  }

  setLocation(location) {
    ++this.#location.count;
    this.#location.value = location;
  }

  setStartHour(hour) {
    ++this.#startHour.count;
    this.#startHour.value = hour + "";
  }

  setStartMinute(minute) {
    ++this.#startMinute.count;
    this.#startMinute.value = minute + "";
  }


  setEndHour(hour) {
    ++this.#endHour.count;
    this.#endHour.value = hour + "";
  }

  setEndMinute(minute) {
    ++this.#endMinute.count;
    this.#endMinute.value = minute + "";
  }

  setGap(gap1) {
    ++this.#gap.count;
    this.#gap.value = isValidGapFormat(gap1) ? parseFloat(gap1) : "";
    
    if (isValidGapFormat(this.#gap.value) && Number(this.#gap.value) > 0)
      this.updateStartTime(this.#startHour.value, this.#startMinute.value, this.#gap.value);
  }

  calculateGap() {
    if (isValidHourFormat(this.#startHour.value) && this.#startHour.value.length === 2 && isValidMinuteFormat(this.#startMinute.value) && this.#startMinute.value.length === 2
      && isValidHourFormat(this.#endHour.value) && this.#endHour.value.length === 2 && isValidMinuteFormat(this.#endMinute.value) && this.#endMinute.value.length === 2) {

      this.setGap(getTimeDiff(this.#startHour.value, this.#startMinute.value, this.#endHour.value, this.#endMinute.value));

    }
    else
      this.setGap("")
  }

  setStartTime(startHour, startMinute) {
    this.setStartHour(startHour + "");
    this.setStartMinute(startMinute + "");
    this.updateStartTime(startHour, startMinute, this.#gap.value);
  }

  setEndTime(endHour, endMinute) {
    this.setEndHour(endHour);
    this.setEndMinute(endMinute);
  }

  getID() {
    return this.#id.value;
  }

  getTaskName() {
    return this.#taskName.value;
  }

  getLocation() {
    return this.#location.value;
  }

  getStartHour() {
    return this.#startHour.value;
  }

  getStartMinute() {
    return this.#startMinute.value;
  }

  getEndHour() {
    return this.#endHour.value;
  }

  getEndMinute() {
    return this.#endMinute.value;
  }

  getGap() {
    return this.#gap.value;
  }


  handleTimeInput(time, onBlur, isMinute, formerValue) {
    const singleDigitPattern = isMinute ? /^[6-9]+$/ : /^[3-9]+$/;

    if (time.length === 1 && singleDigitPattern.test(time)) {
      time = `0${time}`;
    }
    if (onBlur && time.length === 1) {
      time = `0${time}`;
    }
    if (time.length === 2 && !isMinute) {
      time = isValidHourFormat(time) && time.length === 2 ? time : formerValue;
    }
    return time;
  }

  handleInputChangeStart(value, fieldType, onBlur) {
    let updatedValue = value;

    if (fieldType === 'hh_start') {
      this.setStartHour(this.handleTimeInput(updatedValue, onBlur, false, this.getStartHour()));
    } else if (fieldType === 'mm_start') {

      this.setStartMinute(this.handleTimeInput(updatedValue, onBlur, true));
    }
    this.updateStartTime(this.#startHour.value, this.#startMinute.value, this.#gap.value);
  }

  updateStartTime(startHour, startMinute, gap1) {
    if (!(isValidHourFormat(startHour) && isValidMinuteFormat(startMinute) && startHour.length === 2 && startMinute.length === 2))
      return;

    if (isValidGapFormat(gap1) && Number(gap1) > 0) {
      let newEnd = getTimeEnd(startHour, startMinute, gap1);
      this.setEndHour(newEnd.substring(0, 2));
      this.setEndMinute(newEnd.substring(3, 5));
    }
    else if (!(isValidGapFormat(gap1)) && (isValidHourFormat(this.#endHour.value) && isValidMinuteFormat(this.#endMinute.value) && this.#endHour.value.length === 2 && this.#endMinute.value.length === 2)) {
      this.calculateGap();
    }
  }

  handleInputChangeEnd(value, fieldType, onBlur) {
    let updatedValue = value;
    if (fieldType === 'hh_end') {
      this.setEndHour(this.handleTimeInput(updatedValue, onBlur, false, this.getEndHour()));
    } else if (fieldType === 'mm_end') {
      this.setEndMinute(this.handleTimeInput(updatedValue, onBlur, true));
    }

    if (!(this.isEndHourValidFormat() && this.isEndMinuteValidFormat()))
      return;

    if (isValidGapFormat(this.#gap.value) && !(isValidHourFormat(this.#startHour.value) && isValidMinuteFormat(this.#startMinute.value) && this.#startHour.value.length === 2 && this.#startMinute.value.length === 2)) {

    }
    else if (isValidGapFormat(this.#gap.value) && (isValidHourFormat(this.#startHour.value) && isValidMinuteFormat(this.#startMinute.value) && this.#startHour.value.length === 2 && this.#startMinute.value.length === 2)) {
      this.calculateGap();
    }
  }


  countNumChangesOnField(fieldName) {
    let count = 0;
    switch (fieldName) {
      case 'TaskName':
        count = this.#taskName.count;
        break;
      case 'Location':
        count = this.#location.count;
        break;
      case 'startHour':
        count = this.#startHour.count;
        break;
      case 'startMinute':
        count = this.#startMinute.count;
        break;
      case 'endHour':
        count = this.#endHour.count;
        break;
      case 'endMinute':
        count = this.#endMinute.count;
        break;
      case 'gap':
        count = this.#gap.count;
        break;
    }
    return count
  }

  isTaskNameValidFormat() {
    return this.#taskName.value instanceof TaskName && this.#taskName.value !== ""
  }

  isLocationValidFormat() {
    return this.#location.value instanceof Location && this.#location.value.length !== ""
  }

  isStartHourValidFormat() {
    return isValidHourFormat(this.#startHour.value) && this.#startHour.value.length === 2
  }

  isStartMinuteValidFormat() {
    return isValidMinuteFormat(this.#startMinute.value) && this.#startMinute.value.length === 2
  }

  isEndHourValidFormat() {
    return isValidHourFormat(this.#endHour.value) && this.#endHour.value.length === 2
  }

  isEndMinuteValidFormat() {
    return isValidMinuteFormat(this.#endMinute.value) && this.#endMinute.value.length === 2
  }

  isGapValidFormat() {
    return isValidGapFormat(this.#gap.value) && this.#gap.value !== ""
  }

  isValidateTask() {
    return (this.isTaskNameValidFormat() && this.isLocationValidFormat() && this.isStartHourValidFormat() && this.isStartMinuteValidFormat() &&
      this.isEndHourValidFormat() && this.isEndMinuteValidFormat() && this.isGapValidFormat());
  }

  isValidateTaskOnlyTime() {
    return (this.isStartHourValidFormat() && this.isStartMinuteValidFormat() && this.isEndHourValidFormat() && this.isEndMinuteValidFormat() && this.isGapValidFormat());
  }

  isValidateTaskOnlyTimeStart() {
    return (this.isStartHourValidFormat() && this.isStartMinuteValidFormat() );
  }

  isValidateTaskOnlyTimeEnd() {
    return (this.isEndHourValidFormat() && this.isEndMinuteValidFormat());
  }

  getTimeDiffEndStart(){
    return getTimeDiff(this.#startHour.value, this.#startMinute.value, this.#endHour.value, this.#endMinute.value)
  }

  isTaskEmpty() {
    return (this.#taskName.value===undefined && 
      this.#startHour.value==='' && this.#startMinute.value===''  &&
      this.#endHour.value===''  && this.#endMinute.value===''  && this.#endMinute.gap===undefined );
  }


  isErrorStartTimelaterThanEnd() {
    return this.getStartHour() > this.getEndHour() ? true: this.getStartHour() === this.getEndHour() ? this.getStartMinute() > this.getEndMinute() ? true : false: false;
  }

}
export default Task;