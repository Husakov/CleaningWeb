import {diff} from "../util";
import PricingRuleModel from "./rule";

class PricingModel {
    id = -1;
    optional;
    service_id;
    unit;
    maxvalue;
    rules;
    type;
    order;

    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.optional = o.optional;
            this.service_id = o.service_id;
            this.unit = o.unit;
            this.maxvalue = o.maxvalue;
            this.rules = o.rules ? o.rules.map(rule => new PricingRuleModel(rule)) : [new PricingRuleModel()];
            this.type = o.type;
            this.removedRules = o.removedRules ? o.removedRules : [];
            this.order = o.order;
        } else {
            this.id = -1;
            this.optional = false;
            this.service_id = arguments[0];
            this.unit = '';
            this.maxvalue = '';
            this.rules = [new PricingRuleModel()];
            this.type = "flat";
            this.removedRules = [];
            this.order = arguments[1];
        }
    }

    getDiff(other) {
        return new PricingModel(diff(this, other));
    }

    serialize() {
        return this;
    }
}

PricingModel.types = [
    {
        label: "Flat Pricing",
        value: "flat"
    },
    {
        label: "Range Pricing",
        value: "range"
    }
];

export default PricingModel;
