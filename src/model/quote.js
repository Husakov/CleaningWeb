import moment from "moment";
import { diff } from "../util";

import CustomerModel from "./customer";

export default class QuoteModel {
    constructor(deposit_amount, tax_percent) {
        if (arguments[0] instanceof Object &&!(arguments[0] instanceof Number)) {
            const o = arguments[0];
            this.id = o.id;
            this.title = o.title;
            this.expiration = moment(o.expiration);
            this.appointment = this.removePivotObjects(o.appointment);
            this.customer = new CustomerModel(o.customer);
            this.appointment_id = o.appointment_id;
        } else {
            this.id = -1;
            this.title = "";
            this.appointment_id = -1;
            this.expiration = moment();
            this.appointment = {
                appointment_services: [{
                    service_id: -1,
                    service_pricings: [],
                    add_ons: [],
                    discount_id: undefined,
                }],
                address: "",
                customer_id: null,
                deposit: {
                    amount: deposit_amount*100
                },
                discount: {
                    label: "Quote Discount",
                    type: "f",
                    value: 0
                },
                tax: tax_percent
            };
            this.quote_pricings = [];
            this.customer = new CustomerModel();
        }
    }
    removePivotObjects(appointment) {
        let services = [];

        //if appointment_services not created error occurs
        if (appointment.appointment_services)
            services = [...appointment.appointment_services];
        delete appointment.status;
        delete appointment.start_time;
        delete appointment.end_time;
        delete appointment.duration;
        services.forEach((service, i) => {
            service.service_pricings.forEach((pricing, j) => {
                if (pricing.pivot) {
                    Object.assign(services[i].service_pricings[j], {
                        quantity: pricing.pivot.quantity,
                        price: pricing.pivot.price
                    })
                    delete services[i].service_pricings[j].pivot;
                }
            });
            service.add_ons.forEach((pricing, j) => {
                if (pricing.pivot) {
                    Object.assign(services[i].add_ons[j], {
                        quantity: pricing.pivot.quantity,
                        price: pricing.pivot.price
                    })
                    delete services[i].add_ons[j].pivot;
                }
            });
        });

        return { ...appointment, appointment_services: services };
    }
    getDiff(other) {
        return new QuoteModel(diff(this, other));
    }
}
