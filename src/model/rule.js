import {diff} from "../util";

export default class PricingRuleModel {
    from;
    to;
    value;
    duration;
    service_pricing_id;
    add_on_id;

    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.from = o.from;
            this.to = o.to;
            this.value = o.value;
            this.duration = o.duration;
            this.service_pricing_id = o.service_pricing_id;
            this.add_on_id = o.add_on_id;
        } else {
            this.from = '';
            this.to = '';
            this.value = '';
            this.duration = '';
            this.service_pricing_id = null;
            this.add_on_id = null;
        }
    }

    getDiff(other) {
        return new PricingRuleModel(diff(this, other))
    }

}
