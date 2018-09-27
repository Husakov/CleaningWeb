import {
    faArrowDown, faArrowUp, faDollarSign, faMinus, faPlus,
    faWrench
} from "@fortawesome/fontawesome-free-solid/shakable.es";

export const diff = (o1, o2) => Object.keys(o2).reduce((obj, key) => {
    if (key === "id") return {...obj, id: o1.id};
    if (o1[key] instanceof Array && o2[key] instanceof Array) {
        return {...obj, [key]: o2[key]}
    }
    if (o1[key] instanceof Object) return {...obj, [key]: diff(o1[key], o2[key])};
    if (o1[key] === o2[key]) return obj;
    return {
        ...obj,
        [key]: o2[key]
    }
}, {});

export function mapObject(target, source) {
    Object.keys(target).forEach(key => {
        target[key] = source[key];
    });
}

export function addToForm(form, key, value) {
    if (value !== undefined && value !== null) {
        if (value == true) {
            form.append(key, 1)
        } else if (value == false) {
            form.append(key, 0)
        } else if (value instanceof Array) {
            value.forEach((item, i) => {
                addToForm(form, `${key}[${i}]`, item)
            })
        } else if (value instanceof File) {
            form.append(key, value)
        } else if (value instanceof Object) {
            Object.keys(value).forEach(aKey => {
                addToForm(form, `${key}[${aKey}]`, value[aKey])
            })
        } else {
            form.append(key, value)
        }
    }
}

let a;

export function absoluteUrl(url) {
    if (!a) a = document.createElement('a');
    a.href = url;

    return a.href;
}

export function setDeepProp(obj, value, fields) {
    if (fields.length === 1) {
        obj[fields[0]] = value;
        return;
    }
    const prop = fields[0];
    fields.splice(0, 1);
    return setDeepProp(obj[prop], value, fields);
}

export function getError(errors, name) {
    if (errors == null || errors === undefined) return undefined;
    if (errors[name] === null || errors[name] === undefined) return undefined;
    return errors[name][0];
}

let debounceTimeout;

export function debounce(func, wait) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, wait);
    return debounceTimeout;
}

export function colorLuminance(hexValue) {
    const red = parseInt(hexValue.substr(1, 2), 16) / 255;
    const green = parseInt(hexValue.substr(3, 2), 16) / 255;
    const blue = parseInt(hexValue.substr(5, 2), 16) / 255;

    return 0.299 * red + 0.587 * green + 0.114 * blue;
}

export function formatNumber(phone_number) {
    const phoneNum = phone_number;
    if (phoneNum == null) return "";
    let display = "";
    if (phoneNum.length >= 3) {
        display += "(";
        display += phoneNum.substr(0, 3);
        display += ")"
    }
    if (phoneNum.length >= 6) {
        display += " " + phoneNum.substr(3, 3);
    }
    if (phoneNum.length > 6) {
        display += "-" + phoneNum.substr(6);
    }
    return display;
}


export const IconMap = [
    {value: 'plus', icon: faPlus},
    {value: 'minus', icon: faMinus},
    {value: 'dollar', icon: faDollarSign},
    {value: 'arrowUp', icon: faArrowUp},
    {value: 'arrowDown', icon: faArrowDown},
    {value: 'wrench', icon: faWrench},
];
