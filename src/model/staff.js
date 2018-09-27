import {addToForm, diff} from '../util';

export default class StaffModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const user = arguments[0];
            this.id = user.id;
            this.active = user.active;
            if (user.pivot)
                this.team_id = user.pivot.team_id;
            if (user.teams && user.teams.length > 0)
                this.team_id = user.teams[0].pivot.team_id;
            if (user.team_id)
                this.team_id = user.team_id;
            this.name = user.name;
            this.description = user.description;
            this.phone_number = user.phone_number;
            this.email = user.email;
            this.password = user.password;
            this.role_id = user.role_id;
            this.team_position = user.team_position;
            this.user_position = user.user_position;
            this.services = user.services;
            this.pay_rate = user.pay_rate;
            this.pay_rate_type = user.pay_rate_type;
            this.image = user.image;
            this.imageurl = user.image;
            this.company_id = user.company_id;
        } else {
            this.team_id = 0;
            this.name = undefined;
            this.description = undefined;
            this.active = false;
            this.phone = undefined;
            this.email = undefined;
            this.password = undefined;
            this.role_id = 1;
            this.services = [];
            this.pay_rate = undefined;
            this.pay_rate_type = "hourly";
            this.active = false;
        }
    }

    getDiff(other) {
        return new StaffModel(diff(this, other));
    }

    serialize() {
        const model = new StaffModel(this, true);
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
