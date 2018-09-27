import {addToForm, diff} from "../util";
import PricingModel from "./pricing";
import AddonModel from "./addon";
import DiscountModel from "./discount";

export default class ServiceModel {
    id;
    color;
    name;
    description;
    online;
    company_id;
    order;
    enabled;
    pricings;
    addons;
    image;

    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.color = o.color;
            this.name = o.name;
            this.description = o.description;
            this.image = o.image;
            this.online = o.online;
            this.company_id = o.company_id;
            this.order = o.order;
            this.enabled = o.enabled;
            if (!arguments[1]) {
                this.pricings = o.pricings ? o.pricings.map(p => new PricingModel(p)) : [];
                this.addons = o.addons ? o.addons.map(a => new AddonModel(a)) : [];
                this.discounts = o.discounts ? o.discounts.map(d => new DiscountModel(d)) : [];
            }
            this.discount_type = "f";
            this.discount_amount = 0;
            this.total = "";
        } else {
            this.id = -1;
            this.color = '#0088cc';
            this.name = '';
            this.description = '';
            this.image = '';
            this.online = false;
            this.company_id = arguments[1];
            this.order = arguments[0];
            this.enabled = false;
            this.pricings = [];
            this.addons = [];
            this.discounts = [];
        }
    }

    getDiff(other) {
        const model = new ServiceModel(diff(this, other));

        model.imageFile = other.imageFile;
        return model;

    }

    serialize() {
        const model = new ServiceModel(this, true);
        if (model.color !== undefined) {
            model.color = model.color.substr(1)
        }
        if (this.imageFile === undefined) {
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
