export default class SMSTemplate {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.name = o.name;
            this.company_id = o.company_id;
            this.template = o.template;
        } else {
            this.id = -1;
            this.name = "";
            this.company_id = arguments[0];
            this.template = "";
        }
    }

    serialize() {
        return this;
    }
}
