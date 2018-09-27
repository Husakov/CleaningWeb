export default class MailTemplate {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.name = o.name;
            this.subject = o.subject;
            this.company_id = o.company_id;
            this.template = o.template;
        } else {
            this.id = -1;
            this.name = "";
            this.subject = "";
            this.company_id = arguments[0];
            this.template = "";
        }
    }

    serialize() {
        return this;
    }
}
