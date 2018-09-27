import { auth, settings as settingsApi } from "../api";
import { addToForm } from "../util";
import { toast } from "react-toastify";
import { chat } from './../api'
import moment from 'moment'

const initState = {
    pending: false,
    loaded: false,
    customers: [],
    messages: []
}
export default function (state = initState, action) {
    switch (action.type) {
        case "GET_CUSTOMERS_CHAT_PENDING":
            return { ...state, pending: true, loaded: false }
        case "GET_CUSTOMERS_CHAT_FULFILLED":
            console.log(action.payload)
            return { ...state, customers: action.payload, pending: false, loaded: true };
        case "GET_CUSTOMERS_CHAT_REJECTED":
            return { error: action.payload };
        case "GET_CUSTOMERS_CHAT_HISTORY_PENDING":
            return { ...state, pending: true, loaded: false }
        case "GET_CUSTOMERS_CHAT_HISTORY_FULFILLED":
            console.log(action.payload)
            return { ...state, messages: action.payload, pending: false, loaded: true };
        case "GET_CUSTOMERS_CHAT_HISTORY_REJECTED":
            return { error: action.payload };
        case "POST_MESSAGE_PENDING":
            return { ...state, pending: true, loaded: false }
        case "POST_MESSAGE_FULFILLED":
            console.log(action.payload)
            return { ...state, messages: state.messages.map(group => {
                console.log(moment(group.date).format('L'), moment(action.payload.created_at).format('L'))
                if (moment(group.date).format('L') === moment(action.payload.created_at).format('L'))
                    group.messages.push(action.payload)

                return group
            }), pending: false, loaded: true };
        case "POST_MESSAGE_REJECTED":
            return { error: action.payload };
        default:
            return state;
    }
}

export const getCustomers = (company_id) => ({
    type: "GET_CUSTOMERS_CHAT",
    payload: chat.getCustomers(company_id)
});

export const getCustomerChatHistory = (company_id, customer_id) => ({
    type: "GET_CUSTOMERS_CHAT_HISTORY",
    payload: chat.getCustomerChatHistory(company_id, customer_id)
});

export const sendMessage = (company_id, customer_id, message) => ({
    type: "POST_MESSAGE",
    payload: chat.sendMessage(company_id, customer_id, message)
});
