import {appointment} from "../api";


const initialState = {
    dataUpcoming:[],
    data: [],
    errors: [],
    customers: [],
    request: {fulfilled: false, pending: false, rejected: false},
    emailReq: {fulfilled: false, pending: false, rejected: false},
    customerReq: {fulfilled: false, pending: false, rejected: false},
    customerErrors: [],
    emailErrors: []
};
export default function (state = initialState, action) {
    switch (action.type) {

        case "GET_APPOINTMENTS_REJECTED":

            return {
                ...state,
                data: action.payload,
                request: { pending: false, fulfilled: true }
            };
        case "GET_APPOINTMENTS_FULFILLED":
            return {
                ...state,
                data: action.payload,
            };

            case "GET_UPCOMING_REJECTED":

        return {
            ...state,
            dataUpcoming: action.payload,
            request: { pending: false, fulfilled: true }
        };
        case "GET_UPCOMING_FULFILLED":
            return {
                ...state,
                dataUpcoming: action.payload,
            };


            default:
                return state;
    }
}



export const getAppointments = (company_id,id,limit,sort,filter,type) => ({
    type: "GET_APPOINTMENTS",
    payload: appointment(company_id).getAppointments(id, limit,sort, filter,type)
});

export const getUpcoming = (company_id,id,limit,sort,filter,type) => ({
    type: "GET_UPCOMING",
    payload: appointment(company_id).getUpcoming(id, limit,sort, filter,type)
});