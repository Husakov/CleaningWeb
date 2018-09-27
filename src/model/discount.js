import {diff} from "../util";

class DiscountModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.enabled = o.enabled;
            this.label = o.label;
            this.type = o.type;
            this.value = o.value;
            this.service_id = o.service_id;
            this.order = o.order;
        } else {
            this.id = -1;
            this.enabled = true;
            this.label = "";
            this.type = "f";
            this.value = 0;
            this.service_id = arguments[0];
            this.order = arguments[1];
        }
    }

    getDiff(other) {
        return new DiscountModel(diff(this, other));
    }
}

DiscountModel.types = [
    {label: "Flat", value: "f"},
    {label: "Percent", value: "p"}
];

export default DiscountModel
