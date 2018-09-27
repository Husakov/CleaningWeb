import moment from "moment";
import { diff } from "../util";
import CustomerModel from "./customer";

export default class AppointmentModel {
    constructor(start_time, end_time, team_id, staff_id, deposit_amount, tax_percent) {
        if (arguments[0] instanceof Object && !(arguments[0] instanceof Date)) {
            const o = arguments[0];
            this.id = o.id;
            this.customer_id = o.customer_id;
            this.tax = o.tax;
            this.deposit = o.deposit;
            this.customer = new CustomerModel(o.customer);
            this.appointment_services = this.removePivotObjects(o.appointment_services);
            this.address = o.address;
            this.appointment_id = o.appointment_id;
            this.discount = o.discount ? o.discount : {
                discount_amount: 0,
                discount_type: "f",
                discount_label: ""
            };
            this.start_time = moment(o.start_time);
            this.end_time = moment(o.end_time);
            this.duration = o.duration;
            this.total = o.total;
            this.note = o.note ? o.note : "";
            this.team_id = o.team_id;
            this.staff_id=o.staff_id;
            this.deposit = o.deposit ? o.deposit : { amount: 0 };
            this.status = o.status;
            this.require_signature = o.require_signature;
            this.generate_quote = false;
            this.invoice = o.invoice;
            this.repeat_id = o.repeat_id;
            this.repeating = o.repeating;
        } else {
            this.id = -1;
            this.appointment_services = [{
                service_id: -1,
                service_pricings: [],
                add_ons: [],
                discount_id: undefined,
            }];
            this.customer_id = null;
            this.tax = tax_percent;
            this.deposit = 0;
            this.address = "";
            this.customer = new CustomerModel();
            this.discount = {
                value: 0,
                type: "f",
                label: "Appointment Discount"
            };
            this.note = "";
            this.duration = 0;
            this.total = 0;
            this.start_time = moment(start_time);
            this.end_time = moment(end_time);
            this.team_id = team_id;
            this.staff_id = staff_id;
            this.deposit = {
                amount: deposit_amount*100,
                paid: false
            };
            this.status = "Confirmed";
            this.require_signature = false;
            this.generate_quote = false;
        }
    }

    removePivotObjects(appointment_services = []) {
        let services = [...appointment_services];
        services.forEach((service, i) => {
            if (service.service_pricings) {
                service.service_pricings.forEach((pricing, j) => {
                    if (pricing.pivot) {
                        Object.assign(services[i].service_pricings[j], {
                            quantity: pricing.pivot.quantity,
                            price: pricing.pivot.price
                        });
                        delete services[i].service_pricings[j].pivot;
                    }
                });
            }
            if (service.add_ons) {
                service.add_ons.forEach((pricing, j) => {
                    if (pricing.pivot) {
                        Object.assign(services[i].add_ons[j], {
                            quantity: pricing.pivot.quantity,
                            price: pricing.pivot.price
                        });
                        delete services[i].add_ons[j].pivot;
                    }
                });
            }
        });
        return services;
    }

    getDiff(other) {
        return new AppointmentModel(diff(this, other));
    }
}
