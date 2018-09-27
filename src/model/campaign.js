import moment from "moment";

export default class CampaignModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.company_id = o.company_id;
            this.email_template_id = o.email_template_id;
            this.time = o.time ? moment(o.time) : null;
            this.filters = o.filters;
            this.excluded_customers = o.excluded_customers;
            this.customer_count = o.customer_count;
        } else {
            this.id = -1;
            this.company_id = arguments[0];
            this.email_template_id = -1;
            this.time = null;
            this.filters = [];
            this.excluded_customers = [];
            this.customer_count = 0;
        }
    }

    serialize() {
        return this;
    }
}
