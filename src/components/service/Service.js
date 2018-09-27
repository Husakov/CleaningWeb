import React from 'react'
import PropTypes from 'prop-types'
import { Button, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Tooltip } from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import { faPlus } from "@fortawesome/fontawesome-free-solid/shakable.es";
import './service.css'
import classSet from 'react-classset'
import Toggle from "../Toggle";

import BasicInfoForm from "./BasicInfoForm";
import { connect } from "react-redux";
import ServiceModel from "../../model/service";
import AddonModel from "../../model/addon";
import PricingModel from "../../model/pricing";
import ServicePricing from "./ServicePricing";
import PricingRuleModel from "../../model/rule";
import { setDeepProp } from "../../util";
import ServiceAddon from "./ServiceAddon";
import ServiceDiscount from "./ServiceDiscount";
import DiscountModel from "../../model/discount";
import DraggableCard from "../DraggableCard";
import scrollToElement from "scroll-to-element";


class Service extends React.Component {

    handleImage = (e) => {
        const service = this.state.service;
        service.imageFile = e.target.files[0];
        this.setState({ service });
    };
    handleAddonImage = (e, i) => {
        const service = this.state.service;
        service.addons[i].imageFile = e.target.files[0];
        this.setState({ service });
    };
    restoreOldData = () => {
        this.setState({ service: { ...this.oldService } })
    };
    createNewAddon = () => {
        const service = this.state.service;
        service.addons.push(new AddonModel(service.id, service.addons.length));
        this.setState({ service });
        setTimeout(() => {
            scrollToElement('.new-addon', { offset: -126 })
        }, 100);
    };
    deleteAddon = (pricing) => {
        if (pricing.id === -1) {
            this.state.service.addons.pop();
            this.setState({});
        }
        else
            this.props.deleteAddon(pricing);
    };
    addAddonRule = (i) => {
        const service = this.state.service;
        service.addons[i].rules.push(new PricingRuleModel());
        this.setState({ service });
    };
    removeAddonRule = (i, j) => {
        const service = this.state.service;
        if (service.addons[i].rules[j].id) {
            service.addons[i].removedRules.push(service.addons[i].rules[j].id);
        }
        service.addons[i].rules.splice(j, 1);
        this.setState({ service });
    };
    createNewPricing = () => {
        const service = this.state.service;
        if (service.pricings.length > 0 && service.pricings[service.pricings.length - 1].id === -1) return;
        service.pricings.push(new PricingModel(service.id, service.pricings.length));
        this.setState({ service });
        setTimeout(() => {
            scrollToElement('.new-pricing', { offset: -126 })
        }, 100);
    };
    deletePricing = (pricing) => {
        if (pricing.id === -1) {
            this.state.service.pricings.pop();
            this.setState({});
        }
        else
            this.props.deletePricing(pricing);
    };
    addPricingRule = (i) => {
        const service = this.state.service;
        service.pricings[i].rules.push(new PricingRuleModel());
        this.setState({ service });
    };
    removePricingRule = (i, j) => {
        const service = this.state.service;
        if (service.pricings[i].rules[j].id) {
            service.pricings[i].removedRules.push(service.pricings[i].rules[j].id);
        }
        service.pricings[i].rules.splice(j, 1);
        this.setState({ service });
    };
    createNewDiscount = () => {
        const service = this.state.service;
        service.discounts.push(new DiscountModel(service.id, service.discounts.length));
        this.setState({ service });
        setTimeout(() => {
            scrollToElement('.new-discount', { offset: -126 })
        }, 100);
    };
    deleteDiscount = (discount) => {
        if (discount.id === -1) {
            this.state.service.discounts.pop();
            this.setState({});
        }
        else
            this.props.deleteDiscount(discount);
    };
    handleFormInput = (field, data) => {
        const service = this.state.service;
        if (field.indexOf(".") !== -1) {
            let fields = field.split(".");
            setDeepProp(service, data, fields);
        } else {
            service[field] = data;
        }
        this.setState({ service })
    };
    saveService = (e) => {
        e.preventDefault();
        console.log(this.state.service);
        this.props.serviceChanged(this.state.service.id === -1 ? this.state.service : this.props.service.getDiff(this.state.service));
    };
    isSendingRequest = () => {
        let sending = false;
        Object.keys(this.props).forEach(key => {
            if (this.props[key] === undefined) return;
            const sendingReq = this.props[key].sendingRequest;
            if (sendingReq !== undefined && sendingReq) {
                sending = true;
            }
        });
        return sending;
    };
    reorderDiscounts = (drag, hover) => {
        const service = this.state.service;
        const discount = service.discounts[drag];
        const discounts = service.discounts;
        discounts.splice(drag, 1);
        discounts.splice(hover, 0, discount);
        discounts.forEach((discount, i) => {
            discount.order = i;
        });
        this.setState({ service });
    };
    reorderAddons = (drag, hover) => {
        const service = this.state.service;
        const addon = service.addons[drag];
        const addons = service.addons;
        addons.splice(drag, 1);
        addons.splice(hover, 0, addon);
        addons.forEach((addon, i) => {
            addon.order = i;
        });
        this.setState({ service });
    };
    reorderPricings = (drag, hover) => {
        const service = this.state.service;
        const pricing = service.pricings[drag];
        const pricings = service.pricings;
        pricings.splice(drag, 1);
        pricings.splice(hover, 0, pricing);
        pricings.forEach((pricing, i) => {
            pricing.order = i;
        });
        this.setState({ service });
    };

    constructor(props) {
        super(props);
        this.state = {
            service: new ServiceModel(props.service),
            activeTab: 1,
            tooltipOpen: { 0: false, 1: false }
        };
        this.oldService = { ...props.service };
        this.stateIndex = props.stateIndex;
    }

    toggleTooltip(pos) {
        this.state.tooltipOpen[pos] = !this.state.tooltipOpen[pos];
        this.setState({});
    };

    toggleTab(pos) {
        if (this.state.service.id === -1 && pos > 0) return;
        this.setState({ activeTab: pos })
    }

    componentWillReceiveProps(props, content) {
        if (props.stateIndex > this.stateIndex) {
            this.stateIndex = props.stateIndex;
            this.oldService = new ServiceModel(props.service);
            this.setState({ service: new ServiceModel(props.service) })
        }
    }

    render() {
        const header = [
            <div key={0} className="service-color-tag mr-3" style={{ background: this.props.service.color }} />,
            <h5 key={1} className="service-title mb-0 ">{this.props.service.name}</h5>,
            <Toggle key={2}
                className="ml-auto"
                value={this.props.service.enabled && true}
                activeText="Enabled"
                inactiveText="Disabled"
                onClick={this.props.toggleService} />
        ];
        this.state.service.addons.sort((a, b) => a.order - b.order);
        return (
            <DraggableCard header={header}
                disabled={this.props.serviceState.sendingRequest}
                reorderSave={this.props.reorderServices}
                deleteMessage="Delete this Service?"
                deleteTitle="Delete Service" id={this.state.service.id}
                index={this.props.index} collapsed={this.props.service.id !== -1 && !this.props.open}
                delete={this.props.deleteService} reorder={this.props.orderService}
                className={this.props.className}>
                <Nav tabs className="pl-3 mt-3">
                    <NavItem>
                        <NavLink className={classSet({ active: this.state.activeTab === 1 })}
                            onClick={() => this.toggleTab(1)}>Basic Info</NavLink>
                    </NavItem>
                    <NavItem className={this.state.service.id === -1 ? 'disabled' : ''}
                        id={this.state.service.id === -1 ? "new-pricing-tab" : ""}>
                        <NavLink className={classSet({ active: this.state.activeTab === 2 })}
                            onClick={() => this.toggleTab(2)}>
                            Pricing
                        </NavLink>
                    </NavItem>
                    <NavItem className={this.state.service.id === -1 ? 'disabled' : ''}
                        id={this.state.service.id === -1 ? "new-addon-tab" : ""}>
                        <NavLink className={classSet({ active: this.state.activeTab === 3 })}
                            onClick={() => this.toggleTab(3)}>
                            Add-ons
                        </NavLink>
                    </NavItem>
                    <NavItem className={this.state.service.id === -1 ? 'disabled' : ''}
                        id={this.state.service.id === -1 ? "new-discount-tab" : ""}>
                        <NavLink className={classSet({ active: this.state.activeTab === 4 })}
                            onClick={() => this.toggleTab(4)}>
                            Frequency
                        </NavLink>
                    </NavItem>
                    {this.state.service.id === -1 && [
                        <Tooltip key={0} isOpen={this.state.tooltipOpen[0]}
                            placement="top" target="new-pricing-tab"
                            toggle={() => this.toggleTooltip(0)}>
                            Save the service first
                        </Tooltip>,
                        <Tooltip key={1} isOpen={this.state.tooltipOpen[1]}
                            placement="top" target="new-addon-tab"
                            toggle={() => this.toggleTooltip(1)}>
                            Save the service first
                        </Tooltip>,
                        <Tooltip key={2} isOpen={this.state.tooltipOpen[2]}
                            placement="top" target="new-discount-tab"
                            toggle={() => this.toggleTooltip(2)}>
                            Save the service first
                        </Tooltip>
                    ]}
                </Nav>
                <CardBody>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId={1}>
                            <BasicInfoForm disabled={this.isSendingRequest()}
                                restoreOldData={this.restoreOldData}
                                saveService={this.saveService}
                                service={this.state.service}
                                error={this.props.serviceState.error}
                                handleImage={this.handleImage}
                                handleFormInput={this.handleFormInput} />
                        </TabPane>
                        <TabPane tabId={2}>
                            <Button color="success" className="mb-2" onClick={this.createNewPricing}>
                                <Icon icon={faPlus} className="mr-2" />
                                New Pricing
                            </Button>
                            {this.state.service.pricings.map((pricing, i) =>
                                <ServicePricing pricing={pricing}
                                    key={pricing.id}
                                    index={i}
                                    error={this.props.pricing.error}
                                    reorder={this.reorderPricings}
                                    reorderSave={() => this.props.reorderPricings(this.state.service)}
                                    addPricingRule={() => this.addPricingRule(i)}
                                    handleFormInput={this.handleFormInput}
                                    disabled={this.props.pricing.sendingRequest}
                                    removePricingRule={j => this.removePricingRule(i, j)}
                                    savePricing={() => this.props.savePricing(pricing)}
                                    deletePricing={() => this.deletePricing(pricing)} />
                            )}
                        </TabPane>
                        <TabPane tabId={3}>
                            <Button color="success" className="mb-2 mr-3" onClick={this.createNewAddon}>
                                <Icon icon={faPlus} className="mr-2" />
                                New Add-on
                            </Button>
                            {this.state.service.addons.map((addon, i) =>
                                <ServiceAddon addon={addon}
                                    key={addon.id}
                                    index={i}
                                    error={this.props.addon.error}
                                    reorder={this.reorderAddons}
                                    reorderSave={() => this.props.reorderAddons(this.state.service)}
                                    addAddonRule={() => this.addAddonRule(i)}
                                    handleFormInput={this.handleFormInput}
                                    handleImage={e => this.handleAddonImage(e, i)}
                                    disabled={this.props.addon.sendingRequest}
                                    removeAddonRule={j => this.removeAddonRule(i, j)}
                                    saveAddon={() => this.props.saveAddon(addon)}
                                    deleteAddon={() => this.deleteAddon(addon)} />
                            )}
                        </TabPane>
                        <TabPane tabId={4}>
                            <Button color="success" className="mb-2 mr-3" onClick={this.createNewDiscount}>
                                <Icon icon={faPlus} className="mr-2" />
                                New Discount
                            </Button>
                            {this.state.service.discounts.map((discount, i) =>
                                <ServiceDiscount discount={discount}
                                    key={discount.id}
                                    index={i}
                                    reorder={this.reorderDiscounts}
                                    reorderSave={() => this.props.reorderDiscounts(this.state.service)}
                                    error={this.props.discount.error}
                                    handleFormInput={this.handleFormInput}
                                    disabled={this.props.discount.sendingRequest}
                                    saveDiscount={() => this.props.saveDiscount(discount)}
                                    deleteDiscount={() => this.deleteDiscount(discount)} />
                            )}
                        </TabPane>
                    </TabContent>
                </CardBody>
            </DraggableCard>)
    }
}

Service.propTypes = {
    service: PropTypes.object.isRequired,
    serviceChanged: PropTypes.func.isRequired,
    deleteService: PropTypes.func.isRequired,
    toggleService: PropTypes.func.isRequired,
    reorderServices: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        ...state.service
    }
}

export default connect(mapStateToProps)(Service)
