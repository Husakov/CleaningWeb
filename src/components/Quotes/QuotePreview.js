import React from 'react'
import { Table } from 'reactstrap';
import './QuotePreview.css';

class QuotePreview extends React.Component {
    state = {};
    calcuateTotalService = (services) => {
        let total = 0;
        services.forEach(service => {
            service.service_pricings.forEach(pricing => {
                total += Number(pricing.price);
            });
        })
        return total / 100;
    }
    calculateTotalAddon = (services) => {
        let total = 0;
        services.forEach(service => {
            service.add_ons.forEach(pricing => {
                total += Number(pricing.price);
            });
        })
        return total / 100;
    }

    calculateServiceDiscounts = (services) => {
        let total = 0;
        services.forEach(service => {
            if (service.discount) {
                if (service.discount.type === "f")
                    total += Number(service.discount.value);
                else {
                    let amount = 0;
                    service.service_pricings.forEach(pricing => amount += Number(pricing.price));
                    service.add_ons.forEach(pricing => amount += Number(pricing.price));
                    total += amount * Number(service.discount.value) / 100;
                }
            }
        });
        return total;
    }
    discountAmountAll = (services, discount) => {
        let total = 0;
        total += this.calcuateTotalService(services);
        total += this.calculateTotalAddon(services);
        discount = (total * Number(discount) / 100);
        return discount;
    }

    discountAmount(service) {
        let total = 0;
        service.service_pricings.forEach(pricing => {
            total += Number(pricing.price);
        });
        service.add_ons.forEach(addon => {
            total += Number(addon.price);
        });

        return total * service.discount_amount / 10000;
    }
    calcuateTax = (sub, tax) => {
        sub = sub + (sub * tax / 100);
        return sub;
    }
    netTotal() {
        let total = 0;
        total += this.calcuateTotalService(this.props.quote.appointment.appointment_services);
        total += this.calculateTotalAddon(this.props.quote.appointment.appointment_services);
        total -= this.calculateServiceDiscounts(this.props.quote.appointment.appointment_services);
        if (this.props.quote.appointment.discount.type === "f")
            total -= this.props.quote.appointment.discount.value;
        else
            total -= this.discountAmountAll(this.props.quote.appointment.appointment_services, this.props.quote.appointment.discount.value);
        total = this.calcuateTax(total, this.props.quote.appointment.tax);
        return total;
    }

    render() {
        const { quote, customers } = this.props;
        const date = quote.expiration.toDate();
        return (
            <div className="quote-preview">
                <div className="quote-preview-row">
                    <span className="key">Quote Title: </span>
                    <span className="value">{quote.title}</span>
                </div>
                <div className="quote-preview-row">
                    <span className="key">Customer Address: </span>
                    <span className="value">
                        {quote.appointment.address}
                    </span>
                </div>
                <div className="quote-preview-row">
                    <span className="key">Expiration Date: </span>
                    <span
                        className="value">{(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</span>
                </div>
                {this.props.quote.appointment.appointment_services.map((service, i) => {
                    return (
                        <div key={i}>
                            <Table size="sm mt-2">
                                <thead>
                                    <tr>
                                        <th className="pl-0" style={{ width: "40%" }}>{service.name}</th>
                                        <th style={{ width: "35%" }}>Quantity</th>
                                        <th className="pl-0" style={{ width: "25%" }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {service.service_pricings.map((pricing, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className="pl-0">{pricing.unit}</td>
                                                <td>{pricing.quantity ? pricing.quantity : 0}</td>
                                                <td className="pl-0">${pricing.price ? pricing.price / 100 : 0}</td>
                                            </tr>)
                                    })}
                                </tbody>
                            </Table>
                            <Table size="sm mt-2">
                                <thead>
                                    <tr>
                                        <th className="pl-0" style={{ width: "40%" }}>Add-on Type</th>
                                        <th style={{ width: "35%" }}>Quantity</th>
                                        <th className="pl-0" style={{ width: "25%" }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {service.add_ons.map((addon, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className="pl-0">{addon.title}</td>
                                                <td>{addon.quantity ? addon.quantity : 0}</td>
                                                <td className="pl-0">${addon.price ? addon.price / 100 : 0}</td>
                                            </tr>)
                                    })}
                                </tbody>
                            </Table>
                            <div className="quote-preview-total d-flex">
                                <span style={{ width: "75%" }}>Service Discount: </span>
                                {service.discount_type === "f" && "-"}<span
                                    style={{ width: "25%" }}>{service.discount_type === "f" ? "$" : null}{service.discount_amount}{service.discount_type === "p" ? "%: -$" + this.discountAmount(service) : null}</span>
                            </div>
                        </div>
                    )
                })}


                <div className="quote-preview-total d-flex first">
                    <span style={{ width: "75%" }}>Service Sub Total: </span>
                    <span style={{ width: "25%" }}>${this.calcuateTotalService(quote.appointment.appointment_services) ? this.calcuateTotalService(quote.appointment.appointment_services).toFixed(2) : "0.00"}</span>
                </div>
                <div className="quote-preview-total d-flex">
                    <span style={{ width: "75%" }}>AddOn Sub Total: </span>
                    <span style={{ width: "25%" }}>${this.calculateTotalAddon(quote.appointment.appointment_services) ? this.calculateTotalAddon(quote.appointment.appointment_services).toFixed(2) : "0.00"}</span>
                </div>
                <div className="quote-preview-total d-flex">
                    <span style={{ width: "75%" }}>Service Discounts Total: </span>
                    -<span style={{ width: "25%" }}>${this.calculateServiceDiscounts(quote.appointment.appointment_services) ? this.calculateServiceDiscounts(quote.appointment.appointment_services).toFixed(2) : "0.00"}</span>
                </div>
                <div className="quote-preview-total d-flex">
                    <span style={{ width: "75%" }}>Quote Discount: </span>
                    {quote.appointment.discount.type === "f" && "-"}<span style={{ width: "25%" }}>
                        {quote.appointment.discount.type === "f" ? "$" : null}{quote.appointment.discount.value}{quote.appointment.discount.type === "p" ? "%: -$" + this.discountAmountAll(quote.appointment.appointment_services, quote.appointment.discount.value).toFixed(2) : null}

                    </span>
                </div>
                <div className="quote-preview-total d-flex">
                    <span style={{ width: "75%" }}>Tax: </span>
                    <span style={{ width: "25%" }}>{quote.appointment.tax}%</span>
                </div>
                {this.props.depositEnabled && <div className="quote-preview-total d-flex">
                    <span style={{ width: "75%" }}>{quote.status === "Paid" ? "Paid Deposit: " : "Deposit: "}</span>
                    <span style={{ width: "25%" }}>{quote.status === "Paid" ? "-$" + Number(quote.appointment.deposit.amount / 100).toFixed(2) : "$" + Number(quote.appointment.deposit.amount / 100).toFixed(2)}</span>
                </div>}
                {
                    <div className="quote-preview-total d-flex">
                        <span style={{ width: "75%" }}>Net Total:</span>
                        <span style={{ width: "25%" }}>${this.props.quote.status === "Paid" ? this.netTotal().toFixed(2) - this.quote.appointment.deposit.amount : this.netTotal().toFixed(2)}</span>
                    </div>
                }
            </div>
        )
    }
}

export default QuotePreview;
