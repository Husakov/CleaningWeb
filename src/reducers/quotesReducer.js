import {customer as customerapi, quotes as quotesapi} from "../api";
import CustomerModel from '../model/customer';
import PropertyModel from "../model/property";
import { toast } from "react-toastify";

const initialState = {
    data: {
        total: -1,
        start: 0,
        end: -1,
        quotes: []
    },
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
        case "GET_QUOTES_PENDING":
            return {
                ...state,
                request: {fulfilled: false, pending: true}
            };
        case "GET_QUOTES_FULFILLED":
            return {
                ...state,
                data: action.payload,
                request: {pending: false, fulfilled: true}

            }
        case "GET_QUOTES_REJECTED":
            toast.error("An error occured, couldn't load quotes");
            return {
                ...state,
                data: action.payload,
                request: { pending: false, fulfilled: true }

            }

        case "CREATE_QUOTE_FULFILLED":
            let quotes = [...state.data.quotes];
            quotes.unshift(action.payload);
            quotes[0].quote_id=action.payload.id;
            quotes[0].total = action.payload.appointment.total;
            quotes[0].first_name = action.payload.customer.first_name;
            quotes[0].last_name = action.payload.customer.last_name;
            return {
                ...state,
                data: {...state.data, quotes},
                request: {...state.request, pending: false, rejected: false, fulfilled: true}
            };
        case "CREATE_QUOTE_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: {...state.request, pending: false, rejected: true, fulfilled: false}
            };
        case "CREATE_QUOTE_PENDING":
            return {
                ...state,
                request: {...state.request, pending: true, rejected: false, fulfilled: false}
            };
        case "DELETE_QUOTE_FULFILLED":
            quotes = [...state.data.quotes];
            let index = quotes.findIndex(quote => quote.quote_id === action.meta);
            quotes.splice(index, 1);
            return {
                ...state,
                data: {...state.data, quotes}
            };
        case "EDIT_QUOTE_PENDING":
            return {
                ...state,
                request: {...state.request, pending: true, rejected: false, fulfilled: false}
            };
        case "EDIT_QUOTE_FULFILLED":
            quotes = [...state.data.quotes];
            index = quotes.findIndex(quote => quote.quote_id === action.meta);
            quotes[index] = action.payload;
            quotes[index].quote_id=action.payload.id;
            quotes[index].total = action.payload.appointment.total;
            quotes[index].first_name = action.payload.customer.first_name;
            quotes[index].last_name = action.payload.customer.last_name;
            return {
                ...state,
                data: {...state.data, quotes},
                request: {...state.request, pending: false, rejected: false, fulfilled: true}
            };
        case "EDIT_QUOTE_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: {...state.request, pending: false, rejected: true, fulfilled: false}
            };
        case "GET_QUOTE_CUSTOMERS_FULFILLED":
            return {
                ...state,
                customers: action.payload,
            };
        case "CREATE_QUOTE_CUSTOMER_REJECTED":
            return {
                ...state,
                customerReq: {...state.customerReq, pending: false, rejected: false, fulfilled: false},
                customerErrors: action.payload.errors
            };
        case "CREATE_QUOTE_CUSTOMER_PENDING":
            return {
                ...state,
                customerReq: {...state.customerReq, pending: true, rejected: false, fulfilled: false}
            };
        case "CREATE_QUOTE_CUSTOMER_FULFILLED":
            let customers = [...state.customers];
            customers.push(action.payload);
            return {
                ...state,
                customers,
                customerReq: {...state.customerReq, pending: false, rejected: false, fulfilled: true}
            };
        case "ADD_PROPERTY_FULFILLED":
            customers = [...state.customers];
            index = customers.findIndex(customer=>customer.id===Number(action.payload.customer_id));
            customers[index].properties.push(action.payload);
            return {
                ...state,
                customers
            };
        case "SEND_MAIL_PENDING":
            return {
                ...state,
                emailReq: {...state.emailReq, pending: true, rejected: false, fulfilled: false}
            };
        case "SEND_MAIL_FULFILLED":
            quotes = [...state.data.quotes];
            index = quotes.findIndex(quote => quote.id === action.payload.id);
            quotes[index] = action.payload;
            return {
                ...state,
                emailReq: {...state.emailReq, pending: false, rejected: false, fulfilled: true},
                data: {...state.data, quotes},
            };
        case "SEND_MAIL_REJECTED":
            return {
                ...state,
                emailErrors: action.payload.errors,
                emailReq: {...state.emailReq, pending: false, rejected: true, fulfilled: false}
            };
        case "DELETE_ERRORS":
            return {
                ...state,
                errors: [],
                emailErrors: [],
                customerErrors: []
            };
        default:
            return state;
    }
}
export const deleteErrors = () => ({
    type: "DELETE_ERRORS"
});
export const createQuote = (id, quote) => ({
    type: "CREATE_QUOTE",
    payload: quotesapi.createQuote(id, quote)
});
export const getQuotes = (id, skip, limit, sort, filter, type) => ({
    type: "GET_QUOTES",
    payload: quotesapi.getQuotes(id, skip, limit, sort, filter, type)
});
export const deleteQuote = (company_id, id) => ({
    type: "DELETE_QUOTE",
    payload: quotesapi.deleteQuote(company_id, id),
    meta: id
});
export const editQuote = (company_id, id, quote) => ({
    type: "EDIT_QUOTE",
    payload: quotesapi.editQuote(company_id, id, quote),
    meta: id
});
export const getCustomers = (company_id) => ({
    type: "GET_QUOTE_CUSTOMERS",
    payload: quotesapi.getCustomers(company_id)
});
export const createCustomer = (customer) => ({
    type: "CREATE_QUOTE_CUSTOMER",
    payload: customerapi.create(new CustomerModel(customer))
});
export const addProperty = (id, property) => ({
    type: "ADD_PROPERTY",
    payload: quotesapi.addProperty(id, new PropertyModel(property)),
    meta: id
});

export const sendMail = (company_id, id, mail) => ({
    type: "SEND_MAIL",
    payload: quotesapi.sendMail(company_id, id, mail)
});
