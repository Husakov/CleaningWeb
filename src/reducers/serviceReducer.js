import {
    addon as addonapi,
    company as companyapi,
    discount as discountapi,
    pricing as pricingapi,
    service as serviceapi
} from "../api";
import ServiceModel from "../model/service";
import {toast} from "react-toastify";

const initialState = {
    services: [],
    serviceState: {
        sendingRequest: false,
        requestSent: false,
        requestFailed: false,
        error: null
    },
    pricing: {
        sendingRequest: false,
        requestSent: false,
        requestFailed: false,
        error: null
    },
    addon: {
        sendingRequest: false,
        requestSent: false,
        requestFailed: false,
        error: null
    },
    discount: {
        sendingRequest: false,
        requestSent: false,
        requestFailed: false,
        error: null
    },
    stateIndex: 0
};

function pendingState(state, prop) {
    return {
        ...state,
        [prop]: {
            ...(state[prop]),
            sendingRequest: true,
            requestSent: false,
            requestFailed: false,
            error: null
        }
    }
}

function errorState(state, prop, error) {
    return {
        ...state,
        [prop]: {
            sendingRequest: false,
            requestSent: false,
            requestFailed: true,
            error: error
        }
    }
}

function fullfilledState(state, prop, extra) {
    return {
        ...state,
        ...extra,
        stateIndex: state.stateIndex + 1,
        [prop]: {
            ...state[prop],
            sendingRequest: false,
            requestSent: true
        }
    }
}

export default function (state = initialState, action) {
    switch (action.type) {
        //List Service States
        case "LIST_SERVICE_PENDING":
            return pendingState(state, 'serviceState');
        case "LIST_SERVICE_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'serviceState', action.payload);
            }
            return fullfilledState(state, 'serviceState', {
                services: action.payload
            });
        case "LIST_SERVICE_REJECTED":
            return errorState(state, 'serviceState', action.payload);
        //Save Service States
        case "SAVE_SERVICE_PENDING":
            return pendingState(state, 'serviceState');
        case "SAVE_SERVICE_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'serviceState', action.payload);
            }
            toast.success("Service Saved!");
            let services = [...state.services];
            services[action.payload.order] = action.payload;
            return fullfilledState(state, 'serviceState', {services});
        case "SAVE_SERVICE_REJECTED":
            return errorState(state, 'serviceState', action.payload);
        //Delete Service States
        case "DELETE_SERVICE_PENDING":
            return pendingState(state, 'serviceState');
        case "DELETE_SERVICE_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'serviceState', action.payload.error)
            }
            toast.success("Service Deleted!");
            services = [...state.services];
            services.splice(action.payload.order, 1);
            services.forEach((service, i) => {
                service.order = i;
            });
            return fullfilledState(state, 'serviceState', {services});
        case "DELETE_SERVICE_REJECTED":
            return errorState(state, 'serviceState', action.payload);
        //Reorder service states
        case "REORDER_SAVE_FULFILLED":
            services = [...state.services];
            let service = services.find(s => s.id === action.payload[0].service_id);

            switch (action.model) {
                case "ADDON":
                    service.addons = action.payload;
                    break;
                case "DISCOUNT":
                    service.discounts = action.payload;
            }
            return {...state, services, stateIndex: state.stateIndex + 1};
        case "REORDER_SAVE_ADDON_FULFILLED":
            services = [...state.services];
            service = services.find(s => s.id === action.payload[0].service_id);
            service.addons = action.payload;
            return {...state, services, stateIndex: state.stateIndex + 1};
        case "REORDER_SAVE_DISCOUNT_FULFILLED":
            services = [...state.services];
            service = services.find(s => s.id === action.payload[0].service_id);
            service.discounts = action.payload;
            return {...state, services, stateIndex: state.stateIndex + 1};
        case "REORDER_SAVE_PRICING_FULFILLED":
            services = [...state.services];
            service = services.find(s => s.id === action.payload[0].service_id);
            service.pricings = action.payload;
            return {...state, services, stateIndex: state.stateIndex + 1};
        case "TOGGLE_SERVICE_FULFILLED":
            services = [...state.services];
            service = services.find(s => s.id === action.payload.id);
            service.enabled = action.payload.enabled;
            return {...state, services, stateIndex: state.stateIndex + 1};
        case "SAVE_PRICING_PENDING":
            return pendingState(state, 'pricing');
        case "SAVE_PRICING_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'pricing', action.payload)
            }
            toast.success("Service Pricing Saved!");
            services = [...state.services];
            service = services.find(s => s.id === action.payload.service_id);
            let idx = service.pricings.findIndex(p => p.id === action.payload.id);
            if (idx !== -1) {
                service.pricings.splice(idx, 1, action.payload);
            } else {
                service.pricings.push(action.payload);
            }
            return fullfilledState(state, 'pricing', {services});
        case "SAVE_PRICING_REJECTED":
            return errorState(state, 'pricing', action.payload);
        case "DELETE_PRICING_PENDING":
            return pendingState(state, 'pricing');
        case "DELETE_PRICING_FULFILLED":
            toast.success("Service Pricing Deleted!");
            services = [...state.services];
            service = services.find(s => s.id === action.payload.service_id);
            idx = service.pricings.findIndex(p => p.id === action.payload.id);
            service.pricings.splice(idx, 1);
            return fullfilledState(state, 'pricing', {services});
        case "SAVE_ADDON_PENDING":
            return pendingState(state, "addon");
        case "SAVE_ADDON_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'addon', action.payload)
            }
            toast.success("Service Add-on Saved!");
            services = [...state.services];
            service = services.find(s => s.id == action.payload.service_id);
            idx = service.addons.findIndex(p => p.id == action.payload.id);
            if (idx !== -1)
                service.addons.splice(idx, 1, action.payload);
            else
                service.addons.push(action.payload);
            return fullfilledState(state, 'addon', {services});
        case "SAVE_ADDON_REJECTED":
            return errorState(state, 'addon', action.payload);
        case "DELETE_ADDON_PENDING":
            return pendingState(state, "addon");
        case "DELETE_ADDON_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'addon', action.payload)
            }
            toast.success("Service Add-on Deleted!");
            services = [...state.services];
            service = services.find(s => s.id == action.payload.service_id);
            idx = service.addons.findIndex(p => p.id == action.payload.id);
            service.addons.splice(idx, 1);
            return fullfilledState(state, 'addon', {services});
        case "DELETE_ADDON_REJECTED":
            return errorState(state, 'addon', action.payload);
        case "SAVE_DISCOUNT_PENDING":
            return pendingState(state, "discount");
        case "SAVE_DISCOUNT_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'discount', action.payload)
            }
            toast.success("Service Discount Saved!");
            services = [...state.services];
            service = services.find(s => s.id === action.payload.service_id);
            idx = service.discounts.findIndex(d => d.id === action.payload.id);
            if (idx !== -1)
                service.discounts.splice(idx, 1, action.payload);
            else
                service.discounts.push(action.payload);
            return fullfilledState(state, "discount", {services});
        case "SAVE_DISCOUNT_REJECTED":
            return errorState(state, 'discount', action.payload);
        case "DELETE_DISCOUNT_PENDING":
            return pendingState(state, 'discount');
        case "DELETE_DISCOUNT_FULFILLED":
            if (action.payload.error) {
                return errorState(state, 'discount', action.payload)
            }
            toast.success("Service Discount Deleted!");
            services = [...state.services];
            service = services.find(s => s.id === action.payload.service_id);
            idx = service.discounts.findIndex(p => p.id === action.payload.id);
            service.discounts.splice(idx, 1);
            return fullfilledState(state, 'discount', {services});
        case "DELETE_DISCOUNT_REJECTED":
            return errorState(state, 'discount', action.payload);
        //Local states
        case "CREATE_SERVICE":
            return {
                ...state,
                services: [...state.services, new ServiceModel(state.services.length, action.company_id)]
            };
        case "REORDER_SERVICE":
            services = [...state.services];
            const dragService = services[action.drag];
            services.splice(action.drag, 1);
            services.splice(action.hover, 0, dragService);
            services.forEach((service, i) => {
                service.order = i;
            });
            return {
                ...state,
                services
            };
        case "DELETE_LOCAL_SERVICE":
            services = [...state.services];
            services.pop();
            return {...state, services};
        default:
            return state;
    }
}

export const save = (service) => ({
    type: "SAVE_SERVICE",
    payload: service.id === -1 ? serviceapi.create(service) : serviceapi.update(service.id, service)
});

export const create = (company_id) => ({
    type: "CREATE_SERVICE",
    company_id
});

export const reorder = (drag, hover) => ({
    type: "REORDER_SERVICE",
    drag,
    hover
});

export const saveReorder = (services, company_id) => ({
    type: "REORDER_SAVE",
    payload: serviceapi.reorder(services, company_id)
});

export const getList = (company_id) => ({
    type: "LIST_SERVICE",
    payload: companyapi.services(company_id)
});

export const deleteService = (service) => ({
    type: "DELETE_SERVICE",
    payload: serviceapi.delete(service.id)
});

export const deleteLocal = (service) => ({
    type: "DELETE_LOCAL_SERVICE",
    service: service
});

export const toggleService = (service) => ({
    type: "TOGGLE_SERVICE",
    payload: serviceapi.update(service.id, new ServiceModel({enabled: !service.enabled}, true))
});

export const savePricing = (pricing) => ({
    type: "SAVE_PRICING",
    payload: pricing.id === -1 ? pricingapi.create(pricing) : pricingapi.update(pricing.id, pricing)
});

export const deletePricing = (pricing) => ({
    type: "DELETE_PRICING",
    payload: pricingapi.delete(pricing.id)
});

export const saveAddon = (addon) => ({
    type: "SAVE_ADDON",
    payload: addon.id === -1 ? addonapi.create(addon) : addonapi.update(addon.id, addon)
});

export const deleteAddon = (addon) => ({
    type: "DELETE_ADDON",
    payload: addonapi.delete(addon.id)
});

export const saveDiscount = (discount) => ({
    type: "SAVE_DISCOUNT",
    payload: discount.id === -1 ? discountapi.create(discount) : discountapi.update(discount)
});

export const deleteDiscount = (discount) => ({
    type: "DELETE_DISCOUNT",
    payload: discountapi.delete(discount.id)
});

export const saveReorderDiscount = (discount, company_id) => ({
    type: "REORDER_SAVE_DISCOUNT",
    model: "DISCOUNT",
    payload: discountapi.reorder(discount, company_id)
});

export const saveReorderAddon = (addon, company_id) => ({
    type: "REORDER_SAVE_ADDON",
    payload: addonapi.reorder(addon, company_id)
});

export const saveReorderPricing = (pricing, company_id) => ({
    type: "REORDER_SAVE_PRICING",
    payload: pricingapi.reorder(pricing, company_id)
});
