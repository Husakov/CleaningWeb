import {auth} from '../api'

const initialState = {
    sendingRequest: false,
    requestSent: false,
    requestFailed: false
};
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "USER_LOGIN_PENDING":
            return {
                ...state,
                sendingRequest: true,
                requestFailed: false
            };
        case "USER_LOGIN_FULFILLED":
            if (action.payload.error) {
                return {
                    ...state,
                    sendingRequest: false,
                    requestSent: false,
                    requestFailed: true
                }
            }
            localStorage.setItem("token", action.payload.access_token);
            return {
                ...state,
                sendingRequest: false,
                requestSent: true
            };
        case "USER_LOGIN_REJECTED":
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

export function login(email, password) {
    return {
        type: "USER_LOGIN",
        payload: auth.login(email, password)
    }
}
