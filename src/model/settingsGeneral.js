import { addToForm, diff } from '../util';

export default class SettingsGeneralModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const general = arguments[0];
            this.zipCodeRestrict = general.zipCodeRestrict ? general.zipCodeRestrict : false;
            this.zipCodes = general.zipCodes ? general.zipCodes : undefined;
            this.schedulingTimeInterval = general.schedulingTimeInterval ? general.schedulingTimeInterval : undefined;
            this.minAdvBookingTime = general.minAdvBookingTime ? general.minAdvBookingTime : undefined;
            this.maxAdvBookingTime = general.maxAdvBookingTime ? general.maxAdvBookingTime : undefined;
            this.lateCancelTime = general.lateCancelTime ? general.lateCancelTime : undefined;
            this.lateRescheduleTime = general.lateRescheduleTime ? general.lateRescheduleTime : undefined;
            this.currency = general.currency ? general.currency : '$';
            this.priceFormat = general.priceFormat ? general.priceFormat : undefined;
            this.symbolPosition = general.symbolPosition ? general.symbolPosition : '$*';
            this.taxVat = general.taxVat ? general.taxVat : false;
            this.deposit = general.deposit ? general.deposit : false;
            this.tyPage = general.tyPage ? general.tyPage : undefined;


        } else {
            this.zipCodeRestrict = false;
            this.zipCodes =  undefined;
            this.schedulingTimeInterval = undefined;
            this.minAdvBookingTime = undefined;
            this.maxAdvBookingTime = undefined;
            this.lateCancelTime = undefined;
            this.lateRescheduleTime =  undefined;
            this.currency = '$';
            this.priceFormat = undefined;
            this.symbolPosition = '$*';
            this.taxVat = false;
            this.deposit = false;
            this.tyPage = undefined;
        }
    }

    getDiff(other) {
        return new SettingsGeneralModel(diff(this, other));
    }

    serialize() {
        const model = new SettingsGeneralModel(this, true);
        if (this.imageFile === undefined && this.imageurl === undefined) {
            delete model.image;
            return this;
        }
        if (this.imageFile === undefined && this.imageurl !== undefined) {
            delete model.image;
            return model;
        }
        const data = new FormData();
        delete model.imageurl;
        model.image = this.imageFile;
        Object.keys(model).map(key => {
            addToForm(data, key, model[key])
        });
        return data;
    }
}
