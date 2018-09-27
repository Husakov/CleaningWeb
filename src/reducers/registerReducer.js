import {auth} from "../api";

const initialState = {
    sendingRequest: false,
    requestSent: false,
    requestFailed: false
};
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "USER_REGISTER_PENDING":
            return {
                ...state,
                sendingRequest: true
            };
        case "USER_REGISTER_FULFILLED":
            if (action.payload.error) {
                return {
                    ...state,
                    sendingRequest: false,
                    requestSent: false,
                    requestFailed: true
                }
            }
            return {
                ...state,
                sendingRequest: false,
                requestSent: true
            };
        case "USER_REGISTER_REJECTED":
            return {
                ...state,
                sendingRequest: false,
                requestSent: false,
                requestFailed: true
            };
        default:
            return state;
    }
}

export function register(body) {
    return {
        type: "USER_REGISTER",
        payload: auth.register(body)
    }
}
