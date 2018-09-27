import moment from "moment";

export default class BlockOffModel {
    constructor(start_time, end_time, team_id, staff_id) {
        if (arguments[0] instanceof Object && !(arguments[0] instanceof Date)) {
            const o = arguments[0];
            this.id = o.id;
            this.start_time = moment(o.start_time);
            this.end_time = moment(o.end_time);
            this.team_id = o.team_id;
            this.user_id = o.user_id;
            this.note = o.note ? o.note : "";
            this.color = o.color;
            this.repeat = o.repeat;
        }
        else {
            this.id = -1;
            this.start_time = moment(start_time);
            this.end_time = moment(end_time);
            this.team_id = team_id;
            this.user_id = staff_id;
            this.note = "";
            this.color = "#323232";
            this.repeat = false;
        }
    }
}
