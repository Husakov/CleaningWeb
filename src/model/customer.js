import moment from "moment";
import {addToForm, diff} from "../util";
import PropertyModel from "./property";

export default class CustomerModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.image = o.image;
            this.id = o.id;
            this.first_name = o.first_name;
            this.last_name = o.last_name;
            this.email = o.email;
            this.password = o.password;
            this.area_code = o.area_code;
            this.phone_number = o.phone_number;
            this.date_of_birth = o.date_of_birth == "" ? "" : moment(o.date_of_birth);
            this.address = o.address?o.address:"";
            this.zip = o.zip?o.zip:"";
            this.type = o.type;
            this.preferred_staff_ids = o.preferred_staff_ids;
            this.preferred_team_ids = o.preferred_team_ids;
            this.company_id = o.company_id;
            this.alt_phone = o.alt_phone?o.alt_phone:"";
            this.city = o.city?o.city:"";
            this.labels = o.labels;
            this.notes = o.notes;
            this.address2 = o.address2?o.address2:"";
            this.customer_since = moment(o.customer_since);
            this.company_id = o.company_id;
            this.properties = o.properties ? o.properties.map(p => new PropertyModel(p)) : [];
            this.created_at = o.created_at ? o.created_at : new Date(new Date(2017, 0, 1).getTime() + Math.random() * (new Date(2018, 0, 1).getTime() - new Date(2017, 0, 1).getTime())).getTime();
        } else {
            this.image = '';
            this.id = -1;
            this.first_name = "";
            this.last_name = '';
            this.email = '';
            this.password = generateId(10);
            this.area_code = "1";
            this.phone_number = "";
            this.date_of_birth = '';
            this.address = "";
            this.zip = "";
            this.type = "guest";
            this.company_id = arguments[0];
            this.alt_phone = '';
            this.city = '';
            this.address2 = '';
            this.customer_since = moment();
            this.properties = [];
            this.preferred_staff_ids = [];
            this.preferred_team_ids = [];
            this.labels = [];
            this.notes = [];
        }
    }

    getDiff(other) {
        const model = new CustomerModel(diff(this, other));
        model.imageFile = other.imageFile;
        return model;
    }

    serialize() {
        const model = new CustomerModel(this);
        if (model.date_of_birth == "" || model.date_of_birth.format("YYYY-MM-DD") == "Invalid date") {
            delete model.date_of_birth
        } else {
            model.date_of_birth = model.date_of_birth.format("YYYY-MM-DD")
        }
        model.customer_since = model.customer_since.format('YYYY-MM-DD');
        if (this.imageFile === undefined) {
            model.imageurl = model.image;
            delete model.image;
            return model;
        }
        const data = new FormData();
        data.append("_method", "post");
        model.image = this.imageFile;
        Object.keys(model).map(key => {
            addToForm(data, key, model[key])
        });
        return data;
    }
}

function dec2hex(dec) {
    return ('0' + dec.toString(32)).substr(-2)
}

function generateId(len) {
    const arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
}
