import {addToForm, diff} from "../util";
import PricingRuleModel from "./rule";

export default class AddonModel {
    id;
    title;
    service_id;
    maxvalue;
    unit;
    optional;
    rules;
    image;
    order;

    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.title = o.title;
            this.image = o.image;
            this.service_id = o.service_id;
            this.maxvalue = o.maxvalue;
            this.unit = o.unit;
            this.optional = o.optional;
            this.rules = o.rules ? o.rules.map(rule => new PricingRuleModel(rule)) : [new PricingRuleModel()];
            this.order = o.order;
        } else {
            this.id = -1;
            this.optional = false;
            this.service_id = arguments[0];
            this.unit = '';
            this.maxvalue = '';
            this.rules = [new PricingRuleModel()];
            this.order = arguments[1];
        }
    }

    getDiff(other) {
        const model = new AddonModel(diff(this, other));
        model.removedRules = [];
        this.rules.forEach(r1 => {
            const index = model.rules.findIndex(r2 => r1.id === r2.id);
            if (index === -1) {
                model.removedRules.push(r1.id);
            }
        });
    }

    serialize() {
        const model = new AddonModel(this);
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
