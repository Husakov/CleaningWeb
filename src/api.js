import { BASE_URL } from './config'
import ServiceModel from "./model/service";
import PricingModel from "./model/pricing";
import AddonModel from "./model/addon";
import DiscountModel from "./model/discount";
import CustomerModel from "./model/customer";
import PropertyModel from "./model/property";
import MailTemplate from "./model/mailTemplate";
import SMSTemplate from "./model/smsTemplate";
import CampaignModel from "./model/campaign";
import InvoiceModel from "./model/invoice";

export const DEFAULT_HEADERS = (formData) => {
    const headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };

    if (!formData) {
        headers['Content-Type'] = "application/json";
    }
    return headers;
};

const formatBody = (method, body) => {
    if (method === 'get') return {};
    if (body instanceof FormData) {
        if (method === "put") {
            body.set("_method", "put");
        } else {
            body.delete("_method");
        }
        return { body };
    } else
        return { body: JSON.stringify(body) }
};

const getMethod = (method, body) => {
    if (method === "put" && body instanceof FormData) {
        return "post";
    }
    return method;
};

class Request {
    execute = () => fetch(this.params.url + (this.params.method === "get" ? mapQuery(this.params.body) : ''), {
        method: getMethod(this.params.method, this.params.body),
        headers: { ...DEFAULT_HEADERS(this.params.body instanceof FormData), ...this.params.headers },
        ...formatBody(this.params.method, this.params.body)
    }).then(async (res) => {
        if (res.ok)
            return res;
        else
            throw { code: res.status, ...(await res.json()) };
    })

    constructor(method, url, body, headers) {
        this.params = { method, url, body, headers };
    }
}

function mapQuery(body) {
    if (Object.keys(body).length === 0) return '';
    let queryString = "?";
    let first = true;
    Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === null)
            return;
        if (body[key] instanceof Array) {
            body[key].forEach((item, i) => {
                if (!first) queryString += "&";
                first = false;
                queryString += `${key}[${i}]=${item}`
            });
        } else if (body[key] instanceof Object) {
            Object.keys(body[key]).forEach((k) => {
                if (body[key][k] instanceof Array) {
                    body[key][k].forEach((item, i) => {
                        if (!item || item === "") return;
                        if (!first) queryString += "&";
                        first = false;
                        queryString += `${key}[${k}][${i}]=${item}`
                    })
                } else {
                    if (!first) queryString += "&";
                    first = false;
                    queryString += `${key}[${k}]=${body[key][k]}`
                }
            })
        } else {
            if (!first) queryString += "&";
            first = false;
            queryString += `${key}=${body[key]}`
        }
    });
    return queryString;
}

const get = (url, body = {}, headers = {}) => new Request('get', url, body, headers);
const post = (url, body = {}, headers = {}) => new Request('post', url, body, headers);
const put = (url, body = {}, headers = {}) => new Request('put', url, body, headers);
const del = (url, body = {}, headers = {}) => new Request('delete', url, body, headers);

async function tokenRefreshHandler(request) {
    try {
        return await request.execute()
    } catch (err) {
        if (err.code !== 401) throw err;
        try {
            const refreshResponse = await (await post(`${BASE_URL}/auth/refresh`).execute()).json();

            localStorage.setItem("token", refreshResponse.access_token);
            return await request.execute()
        } catch (e) {
            throw { code: 401, message: "Session expired" };
        }
    }
}

const SERVICE_URL = `${BASE_URL}/service`;
const AUTH_URL = `${BASE_URL}/auth`;
const USER_URL = `${BASE_URL}/user`;
const ADDON_URL = `${BASE_URL}/addon`;
const PRICING_URL = `${BASE_URL}/pricing`;
const STAFF_URL = `${BASE_URL}/staff`;
const OFFTIME_URL = `${BASE_URL}/offday`;
const TEAM_URL = `${BASE_URL}/team`;
const COMPANY_URL = `${BASE_URL}/company`;
const DISCOUNT_URL = `${BASE_URL}/discount`;
const CUSTOMER_URL = `${BASE_URL}/customer`;
const IMAGE_URL = `${BASE_URL}/image`;
const QUOTE_URL = `${BASE_URL}/quote`;

const formatFilter = filter => filter.reduce((data, item) => {
    if (item.id === "created_at") {
        return { ...data, [item.id]: item.value.map(date => date.toISOString()) }
    }
    if (item.id === "expiration") {
        return { ...data, [item.id]: item.value.map(date => date.toISOString()) }
    }
    if (item.value instanceof Object && !(item.value instanceof Array)) {
        return { ...data, ...item.value };
    }
    return { ...data, [item.id]: item.value };
}, {});

const crud = (path, model) => ({
    create: (data) => tokenRefreshHandler(post(BASE_URL + path, data.serialize())).then(res => res.json()).then(res => new model(res)),
    update: (id, data) => tokenRefreshHandler(put(`${BASE_URL}${path}/${id}`, data.serialize())).then(res => res.json()).then(res => new model(res)),
    delete: (id) => tokenRefreshHandler(del(`${BASE_URL}${path}/${id}`)).then(res => res.json()).then(res => new model(res)),
    get: (id) => tokenRefreshHandler(get(`${BASE_URL}${path}/${id}`)).then(res => res.json()).then(res => new model(res)),
    list: () => tokenRefreshHandler(get(`${BASE_URL}${path}s`)).then(res => res.json()).then(res => res.map(r => new model(r)))
});
export const calendar = {
    getQuotes: (id) => tokenRefreshHandler(get(`${COMPANY_URL}/${id}/quotes`)).then(res => res.json())
}
export const company = {
    services: (company_id) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/services`)).then(res => res.json()).then(res => res.map(s => new ServiceModel(s))),
    customers: (company_id, skip, limit, sort, filter, type) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/customers`,
        {
            skip,
            limit,
            sort: sort.reduce((data, item) => ({ ...data, [item.id]: item.desc }), {}),
            search: formatFilter(filter),
            type
        })).then(res => res.json()).then(res => {
            res.customers = res.customers.map(s => new CustomerModel(s));
            return res;
        }),
    export: (companyID, type) => tokenRefreshHandler(get(`${COMPANY_URL}/${companyID}/export/${type}`, {}, { "Accept": "*" })),
    import: (companyID, form) => tokenRefreshHandler(post(`${COMPANY_URL}/${companyID}/import/csv`, form)).then(res => res.json()),
    customerCityList: (companyID) => tokenRefreshHandler(get(`${COMPANY_URL}/${companyID}/customers/cities`)).then(res => res.json()),
    edit: (companyID, dashboard) => tokenRefreshHandler(put(`${COMPANY_URL}/${companyID}`, { dashboard })).then(res => res.json())
};

export const invoices = {
    get: (company_id, skip, limit, sort, filter) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/invoices`,
        {
            skip,
            limit,
            sort: sort.reduce((data, item) => ({ ...data, [item.id]: item.desc }), {}),
            search: formatFilter(filter)
        })).then(res => res.json()).then(res => {
            res.invoices = res.invoices.map(i => new InvoiceModel(i));
            return res;
        }),
    delete: (company_id, invoice_id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/invoice/${invoice_id}`))
};

export const blockoff = (company_id) => ({
    create: (blockoff) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/blockofftime`, blockoff)).then(res => res.json()),
    update: (blockoff, id) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}/blockofftime/${id}`, blockoff)).then(res => res.json()),
    delete: (id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/blockofftime/${id}`)).then(res => res.json()),
});
export const appointment = (company_id, id, limit, sort, filter, type) => ({
    list: (from, to) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/appointments`, {
        from,
        to
    })).then(res => res.json()),
    get: (id) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/appointment/${id}`)).then(res => res.json()),
    createFromQuote: (quote_id, start_time, end_time, team_id, duration) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/quote/${quote_id}/toappointment`, {
        start_time,
        end_time,
        team_id,
        duration
    })).then(res => res.json()),
    create: (appointment) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/appointment`, appointment)).then(res => res.json()),
    update: (appointment, id) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}/appointment/${id}`, appointment)).then(res => res.json()),

    getAppointments: (id, limit, sort, filter, type) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/appointments/past`, {
        limit,
        sort: sort.reduce((data, item) => ({ ...data, [item.id]: item.desc }), {}),
        search: formatFilter(filter),
        type
    })).then(res => res.json()).then(res => {
        return res;
    }),
    getUpcoming: (id, limit, sort, filter, type) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/appointments/upcoming`, {
        limit,
        sort: sort.reduce((data, item) => ({ ...data, [item.id]: item.desc }), {}),
        search: formatFilter(filter),
        type
    })).then(res => res.json()).then(res => {
        return res;
    }),

    delete: (id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/appointment/${id}`)).then(res => res.json()),
    toQuote: (id) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/appointment/${id}/toquote`, appointment)).then(res => res.json()),
    sendMessage: (id, body) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/appointment/${id}/send_email`, body)).then(res => res.json())
});

export const mailTemplate = (company_id) => ({
    ...crud(`/company/${company_id}/emailtemplate`, MailTemplate),
    list: () => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/emailtemplates`)).then(res => res.json()).then(res => res.map(t => new MailTemplate(t))),
    tags: () => tokenRefreshHandler(get(`${BASE_URL}/templatetag/list`)).then(res => res.json())
});

export const smsTemplate = (company_id) => ({
    ...crud(`/company/${company_id}/smstemplate`, SMSTemplate),
    list: () => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/smstemplates`)).then(res => res.json()).then(res => res.map(t => new SMSTemplate(t)))
});

export const roles = {
    get: () => tokenRefreshHandler(get(`${BASE_URL}/role/list`)).then(res => res.json())
};

export const service = {
    ...crud('/service', ServiceModel),
    reorder: (services, company_id) => tokenRefreshHandler(post(`${SERVICE_URL}/reorder`, {
        services,
        company_id
    })).then(res => res.json())
};

export const pricing = {
    ...crud('/pricing', PricingModel),
    reorder: (pricings, service_id) => tokenRefreshHandler(post(`${PRICING_URL}/reorder`, {
        pricings,
        service_id
    })).then(res => res.json())
};

export const addon = {
    ...crud('/addon', AddonModel),
    reorder: (addons, service_id) => tokenRefreshHandler(post(`${ADDON_URL}/reorder`, {
        addons,
        service_id
    })).then(res => res.json())
};

export const customer = {
    ...crud('/customer', CustomerModel),
    getPermissions: (customer) => tokenRefreshHandler(get(`${CUSTOMER_URL}/${customer.id}/permissions`)).then(res => res.json()),
    savePermissions: (customer, permissions) => tokenRefreshHandler(put(`${CUSTOMER_URL}/${customer.id}/permissions`, { permissions })).then(res => res.json()),
    getNotes: (id) => tokenRefreshHandler(get(`${CUSTOMER_URL}/${id}/notes`)).then(res => res.json()),
    createNote: (id, note) => tokenRefreshHandler(post(`${CUSTOMER_URL}/${id}/note`, { note })).then(res => res.json()),
    deleteNote: (customer_id, note_id) => tokenRefreshHandler(del(`${CUSTOMER_URL}/${customer_id}/note/${note_id}`)).then(res => res.json()),
    editNote: (customer_id, note_id, note) => tokenRefreshHandler(put(`${CUSTOMER_URL}/${customer_id}/note/${note_id}`, note)).then(res => res.json()),
    getLabels: (id) => tokenRefreshHandler(get(`${COMPANY_URL}/${id}/labels`)).then(res => res.json()),
    createLabel: (id, name) => tokenRefreshHandler(post(`${CUSTOMER_URL}/${id}/label`, { name })).then(res => res.json()),
    deleteLabel: (id, label_id) => tokenRefreshHandler(del(`${CUSTOMER_URL}/${id}/label/${label_id}`)).then(res => res.json()),
};

export const property = (customerId) => ({
    ...crud(`/customer/${customerId}/property`, PropertyModel)
});

export const discount = {
    create: (discount) => tokenRefreshHandler(post(`${DISCOUNT_URL}/create`, discount)).then(res => res.json()).then(res => new DiscountModel(res)),
    update: (discount) => tokenRefreshHandler(post(`${DISCOUNT_URL}/edit`, { discount_id: discount.id, ...discount })).then(res => res.json()).then(res => new DiscountModel(res)),
    delete: (id) => tokenRefreshHandler(post(`${DISCOUNT_URL}/delete`, { discount_id: id })).then(res => res.json()).then(res => new DiscountModel(res)),
    reorder: (discounts, service_id) => tokenRefreshHandler(post(`${DISCOUNT_URL}/reorder`, {
        discounts,
        service_id
    })).then(res => res.json())
};

export const staff = {
    create: (staff) => tokenRefreshHandler(post(`${STAFF_URL}/create`, staff)).then(res => res.json()),
    list: (company_id) => tokenRefreshHandler(get(`${STAFF_URL}/list/${company_id}`)).then(res => res.json()),
    edit: (staff, staff_id) => tokenRefreshHandler(post(`${STAFF_URL}/edit/${staff_id}`, staff)).then(res => res.json()),
    delete: (staff_id) => tokenRefreshHandler(post(`${STAFF_URL}/delete/${staff_id}`)).then(res => res.json()),
    toggleService: (staff_id, service_id) => tokenRefreshHandler(post(`${STAFF_URL}/${staff_id}/toggle/${service_id}`)).then(res => res.json()),
    avatars: () => tokenRefreshHandler(get(`${BASE_URL}/avatar/list`)).then(res => res.json())
};
export const offtime = {
    create: (offtime, company_id) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/offday`, offtime)).then(res => res.json()),
    edit: (offtime, offtime_id, company_id) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}/offday/${offtime_id}`, offtime)).then(res => res.json()),
    delete: (company_id, offtime_id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/offday/${offtime_id}`)).then(res => res.json()),
    deleteAll: (company_id, user_id, time) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/offday/user/${user_id}`, time)).then(res => res.json()),
    repeatOff: (company_id, repeat) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/offday/repeat`, repeat)).then(res => res.json()),
    getOffDates: (user_id, from, to) => tokenRefreshHandler(get(`${OFFTIME_URL}/${user_id}?from=${from}&to=${to}`)).then(res => res.json()),
    getCompanyOffDays: (company_id, from, to) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/offdays?from=${from}&to=${to}`)).then(res => res.json()),
    getUserOffDays: (company_id, user_id, from, to) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/offday/${user_id}?from=${from}&to=${to}`)).then(res => res.json()),
    getTeamOffDays: (company_id, user_id, from, to) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/offdayteam?from=${from}&to=${to}&user_id=${user_id}`)).then(res => res.json())
}
export const team = {
    assignTo: (teamID, userID) => tokenRefreshHandler(post(`${TEAM_URL}/${teamID}/add/${userID}`)).then(res => res.json()),
    create: (team) => tokenRefreshHandler(post(`${TEAM_URL}/create`, team)).then(res => res.json()),
    delete: (team_id) => tokenRefreshHandler(post(`${TEAM_URL}/delete/${team_id}`)).then(res => res.json()),
    reorder: (team) => tokenRefreshHandler(post(`${TEAM_URL}/reorder`, team)).then(res => res.json()),
    edit: (team_id, team) => tokenRefreshHandler(post(`${TEAM_URL}/edit/${team_id}`, team)).then(res => res.json())
};

export const auth = {
    login: (email, password) => post(`${AUTH_URL}/login`, { email, password }).execute().then(res => res.json()),
    register: (data) => post(`${USER_URL}/register`, data).execute().then(res => res.json()),
    logout: () => post(`${AUTH_URL}/logout`).execute().then(res => res.json()),
    me: () => tokenRefreshHandler(post(`${AUTH_URL}/me`)).then(res => res.json())
};

export const image = {
    upload: (form) => tokenRefreshHandler(post(`${IMAGE_URL}/upload`, form)).then(res => res.json()),
    list: () => tokenRefreshHandler(get(`${IMAGE_URL}/all`)).then(res => res.json()),
    delete: id => tokenRefreshHandler(del(`${IMAGE_URL}/${id}`)).then(res => res.json())
};

export const automaticMessages = {
    getMessages: (id) => tokenRefreshHandler(get(`${COMPANY_URL}/${id}/automaticmessages`)).then(res => res.json()),
    createMessage: (body, id) => tokenRefreshHandler(post(`${COMPANY_URL}/${id}/automaticmessage`, body)).then(res => res.json()),
    deleteMessage: (company_id, message_id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/automaticmessage/${message_id}`)),
    saveMessage: (body, id, message_id) => tokenRefreshHandler(put(`${COMPANY_URL}/${id}/automaticmessage/${message_id}`, body)).then(res => res.json()),
    getTemplates: () => tokenRefreshHandler(get(`${BASE_URL}/templatetype/list`)).then(res => res.json()),
};


export const quotes = {
    estimateServicePricing: (service_id, pricing_id, quantity) => tokenRefreshHandler(get(`${QUOTE_URL}/estimate/service/${service_id}/pricing/${pricing_id}?quantity=${quantity}`)).then(res => res.json()),
    estimateAddonPricing: (service_id, addon_id, quantity) => tokenRefreshHandler(get(`${QUOTE_URL}/estimate/addon/${addon_id}?quantity=${quantity}`)).then(res => res.json()),
    createQuote: (company_id, quote) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/quote`, quote)).then(res => res.json()),
    getQuotes: (id, skip, limit, sort, filter, type) => tokenRefreshHandler(get(`${COMPANY_URL}/${id}/quotes`, {
        skip,
        limit,
        sort: sort.reduce((data, item) => ({ ...data, [item.id]: item.desc }), {}),
        search: formatFilter(filter),
        type
    })).then(res => res.json()).then(res => {
        //res.quotes = res.quotes.map(s => new QuoteModel(s));
        return res;
    }),
    getQuote: (company_id, id) => tokenRefreshHandler(get(`${COMPANY_URL}/${company_id}/quote/${id}`)).then(res => res.json()),
    deleteQuote: (company_id, id) => tokenRefreshHandler(del(`${COMPANY_URL}/${company_id}/quote/${id}`)).then(res => res.json()),
    editQuote: (company_id, id, quote) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}/quote/${id}`, quote)).then(res => res.json()),
    sendMail: (company_id, id, mail) => tokenRefreshHandler(post(`${COMPANY_URL}/${company_id}/quote/${id}/sendmail`, mail)).then(res => res.json()),
    getCustomers: (company_id) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/quotecustomers`)).then(res => res.json()),
    addProperty: (id, property) => tokenRefreshHandler(post(`${BASE_URL}/customer/${id}/property`, property)).then(res => res.json()),
    getAppointments: (company_id) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/appointments/past`)).then(res => res.json())
}

export const campaign = (companyID) => ({
    ...crud(`/company/${companyID}/campaign`, CampaignModel),
    filter: (filters) => tokenRefreshHandler(post(`${COMPANY_URL}/${companyID}/campaign/filter`, { filters })).then(res => res.json()).then(res => res.map(c => new CustomerModel(c)))
});

export const settings = {
    editCompanySettings: (company_id, company) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}`, company)).then(res => res.json()),
    editPaymentSettings: (company_id, payment) => tokenRefreshHandler(put(`${COMPANY_URL}/${company_id}/payment`, payment)).then(res => res.json()),
}

export const chat = {
    getCustomers: (company_id) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/customers/chat`)).then(res => res.json()),
    getCustomerChatHistory: (company_id, customer_id) => tokenRefreshHandler(get(`${BASE_URL}/company/${company_id}/customer/${customer_id}/history?skip=0&limit=20`)).then(res => res.json()),
    sendMessage: (company_id, customer_id, message) => tokenRefreshHandler(post(`${BASE_URL}/company/${company_id}/customer/${customer_id}/send_sms`, message)).then(res => res.json())
}