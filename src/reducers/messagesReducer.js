import MessageModel from "../model/message";
import {automaticMessages as messagesapi} from '../api';
import {toast} from "react-toastify";

const initialState = {
    types: [],
    messages: [],
    errors: [],
    request: {fulfilled: false, pending: false, rejected: false}
};
export default function (state = initialState, action) {
    switch (action.type) {
        case "GET_MESSAGES_FULFILLED":
            return {
                ...state,
                messages: action.payload
            };
        //Local states
        case "CREATE_MESSAGE":
            const message = {id: -1, template_type_id: action.payload.type.id, type: action.payload.templateType};
            let messages = [...state.messages];
            if (messages.length === 0 || messages[messages.length - 1].id !== -1)
                messages.push(new MessageModel(message));
            else
                messages[messages.length - 1] = new MessageModel(message);
            return {
                ...state,
                messages,
                errors: []
            };
        case "GET_TEMPLATES_FULFILLED":
            return {
                ...state,
                types: action.payload.splice(0, 6)
            };
        case "SAVE_MESSAGE_FULFILLED":
            if (action.payload.errors) {
                return {
                    ...state,
                    errors: action.payload.errors,
                    request: {...state.request, pending: false, rejected: true, fulfilled: false}
                }
            }
            toast.success("Message Saved!");
            messages = [...state.messages];
            if (action.meta.message_id === -1)
                messages[messages.length - 1] = new MessageModel(action.payload);
            else
                messages[action.meta.index] = new MessageModel(action.payload);
            return {
                ...state,
                messages,
                errors: [],
                request: {...state.request, pending: false, rejected: false, fulfilled: true}
            };
        case "SAVE_MESSAGE_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: {...state.request, pending: false, rejected: true, fulfilled: false}
            };
        case "SAVE_MESSAGE_PENDING":
            return {
                ...state,
                request: {...state.request, pending: true, rejected: false, fulfilled: false}
            };
        case "DELETE_MESSAGE_FULFILLED":
            messages = [...state.messages];
            messages.splice(action.meta, 1);
            toast.success("Message Deleted!");
            return {
                ...state,
                messages
            };
        case "DELETE_LOCAL_MESSAGE":
            messages = [...state.messages];
            messages.pop();
            return {
                ...state,
                messages
            };
        default:
            return state;
    }
}

export const getMessages = (id) => ({
    type: "GET_MESSAGES",
    payload: messagesapi.getMessages(id),
});

export const createMessage = (type, templateType) => ({
    type: "CREATE_MESSAGE",
    payload: {type, templateType}
});

export const saveMessage = (body, id, message_id, index) => ({
    type: "SAVE_MESSAGE",
    payload: message_id === -1 ? messagesapi.createMessage(body, id) : messagesapi.saveMessage(body, id, message_id),
    meta: {message_id, index}
});

export const getTemplates = () => ({
    type: "GET_TEMPLATES",
    payload: messagesapi.getTemplates()
});

export const deleteLocalMessage = () => ({
    type: "DELETE_LOCAL_MESSAGE"
});
export const deleteMessage = (company_id, message_id, index) => ({
    type: "DELETE_MESSAGE",
    payload: messagesapi.deleteMessage(company_id, message_id),
    meta: index
});
