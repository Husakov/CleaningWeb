import moment from "moment";

export default class InvoiceModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.company_id = o.company_id;
            this.customer_id = o.customer_id;
            this.appointment_id = o.appointment_id;
            this.status = o.status;
            this.amount = o.amount;
            this.url = o.url;
            this.created_at = o.created_at;
            this.updated_at = o.updated_at;
            this.appointment = o.appointment;
            this.company = o.company;
            this.customer = o.customer;
        } else {
            this.id = -1;
            this.company_id = arguments[0];
            this.customer_id = arguments[1];
            this.appointment_id = -1;
            this.status = "";
            this.amount = 0;
            this.url = "";
            this.created_at = moment();
            this.updated_at = moment();
            this.appointment = null;
            this.company = null;
            this.customer = null;
        }
    }
}
