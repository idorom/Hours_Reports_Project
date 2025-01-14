class TaskName {
    #taskID;
    #label;
    #value;

    constructor(taskID, taskName) {
        this.setTaskID(taskID);
        this.setLabel(taskName);
        this.setValue(taskName);
    }

    setTaskID(taskID) {
        this.#taskID = taskID;
    }

    setLabel(label) {
        this.#label = label;
    }

    setValue(value) {
        this.#value = value;
    }

    toString() {
        return this.getLabel();
    }

    getTaskID() {
        return this.#taskID;
    }

    getLabel() {
        return this.#label;
    }

    getValue() {
        return this.#value;
    }
}

export default TaskName;