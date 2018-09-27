import {diff} from "../util";

export default class MessageModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.name = o.name;
            this.time = o.time;
            this.template_type_id = o.template_type_id;
            if (o.offset === null)
                this.offset = 0;
            this.offset = o.offset;
            this.email_template = o.email_template;
            this.sms_template = o.sms_template;
            this.email_template_id = o.email_template_id;
            this.message_template_id = o.message_template_id;
            this.services = o.services;
            this.delayTime = o.delayTime;
            this.enabled = o.enabled;
            this.type = o.type;
        } else {
            this.id = -1;
            this.name = "";
            this.time = "1 hour";
            this.services = [];
            this.email_template = {id: 1};
            this.sms_template = {id: 1};
            this.delayTime = "1 hour";
            this.offset = 0;
            this.enabled = false;
        }
    }

    getDiff(other) {
        return new MessageModel(diff(this, other));

    }

    serialize() {
        return this;
    }
}
