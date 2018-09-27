export default class PropertyModel {
    constructor() {
        if (arguments[0] instanceof Object) {
            const o = arguments[0];
            this.id = o.id;
            this.name = o.name;
        } else {
            this.id = -1;
            this.name = "";
        }
    }

    serialize() {
        return this;
    }
}
