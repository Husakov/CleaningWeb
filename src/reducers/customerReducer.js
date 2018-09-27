import {company, customer as customerapi} from "../api";
import {toast} from "react-toastify";

const initState = {
    data: {
        total: -1,
        start: 0,
        end: -1,
        customers: []
    },
    permissions: [],
    error: undefined,
    loading: false,
    creating: false,
    deleting: false
};

export default function (state = initState, action) {
    let data;
    let idx;
    switch (action.type) {
        case "GET_CUSTOMERS_PENDING":
            return {...state, loading: true, error: undefined};
        case "GET_CUSTOMERS_FULFILLED":
            return {...state, data: action.payload, loading: false};
        case "GET_CUSTOMERS_REJECTED":
            return {...state, loading: false, error: undefined};
        case "SAVE_CUSTOMER_PENDING":
            return {...state, creating: true, error: undefined};
        case "SAVE_CUSTOMER_FULFILLED":
            if (action.error) {
                return {...state, creating: false, error: action.payload};
            }
            toast.success("Customer Saved!");
            data = {...state.data};
            data.customers = [...data.customers];
            idx = data.customers.findIndex(c => c.id === action.payload.id);
            if (idx === -1) {
                data.customers.push(action.payload)
            } else {
                data.customers.splice(idx, 1, action.payload)
            }
            return {...state, data, creating: false, error: undefined};
        case "SAVE_CUSTOMER_REJECTED":
            return {...state, creating: false, error: action.payload};
        case "DELETE_CUSTOMER_REJECTED":
            return {...state, deleting: false, error: undefined};
        case "DELETE_CUSTOMER_PENDING":
            return {...state, deleting: true, error: undefined};
        case "DELETE_CUSTOMER_FULFILLED":
            toast.success("Customer Deleted!");
            data = {...state.data};
            data.customers = [...data.customers];
            idx = data.customers.findIndex(c => c.id === action.payload.id);
            if (idx !== -1) {
                data.customers.splice(idx, 1)
            }
            return {...state, data, deleting: false, error: undefined};
        case "CLEAR_ERRORS":
            return {...state, error: undefined};
        default:
            return state;
    }
}



export const getCustomers = (id, skip, limit, sort, filter, type) => ({
    type: "GET_CUSTOMERS",
    payload: company.customers(id, skip, limit, sort, filter, type)
});

export const saveCustomer = (customer) => ({
    type: "SAVE_CUSTOMER",
    payload: customer.id === -1 ? customerapi.create(customer) : customerapi.update(customer.id, customer)
});

export const deleteCustomer = (id) => ({
    type: "DELETE_CUSTOMER",
    payload: customerapi.delete(id)
});

export const clearErrors = () => ({
    type: "CLEAR_ERRORS"
});
