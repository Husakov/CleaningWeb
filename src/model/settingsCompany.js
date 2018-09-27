import { addToForm, diff } from '../util';

export default class SettingsCompanyModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const company = arguments[0];
            this.name = company.name ? company.name : undefined;
            this.website = company.website ? company.website : undefined;
            this.email = company.email ? company.email : undefined;
            this.phone_number = company.phone_number ? company.phone_number : undefined;
            this.address = company.address ? company.address : undefined;
            this.city = company.city ? company.city : undefined;
            this.country = company.country ? company.country : undefined;
            this.code = company.code ? company.code : undefined;
            this.state = company.state ? company.state : undefined;
            this.zip = company.zip ? company.zip : undefined;
            this.timetable = company.timetable;
            this.logo = undefined;
            this.showLogo = company.showLogo ? company.showLogo : undefined;
            this.showAddress = company.showAddress ? company.showAddress : undefined;

        } else {
            this.name = undefined;
            this.website = undefined;
            this.email = undefined;
            this.phone_number = undefined;
            this.address = undefined;
            this.city = undefined;
            this.country = undefined;
            this.code = undefined;
            this.state = undefined;
            this.zip = undefined;
            this.timetable = undefined;
            this.logo = undefined;
            this.showLogo = undefined;
            this.showAddress = undefined;
        }
    }

    getDiff(other) {
        return new SettingsCompanyModel(diff(this, other));
    }

    serialize() {
        const model = new SettingsCompanyModel(this, true);
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
