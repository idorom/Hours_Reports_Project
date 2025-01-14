class Location {
    #locationID;
    #label;
    #value;

    constructor(locationID, locationName) {
        this.setLocationID(locationID);
        this.setLabel(locationName);
        this.setValue(locationName);
    }

    setLocationID(locationID) {
        this.#locationID = locationID;
    }

    setLabel(label) {
        this.#label = label;
    }
    
    setValue(value) {
        this.#value = value;
    }

    getLocationID() {
        return this.#locationID;
    }

    getLabel() {
        return this.#label;
    }

    getValue() {
        return this.#value;
    }

    toString() {
        return this.getLabel();
    }
}

export default Location;