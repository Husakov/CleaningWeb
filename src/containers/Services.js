import React from 'react'
import {Button, Card, CardHeader, Container} from "reactstrap";
import Service from "../components/service/Service";
import Icon from '@fortawesome/react-fontawesome'
import {faPlus} from "@fortawesome/fontawesome-free-solid/shakable.es";
import scrollToElement from 'scroll-to-element'
import withDragDropContext from "../dnd-context";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    create,
    deleteAddon,
    deleteDiscount,
    deleteLocal,
    deletePricing,
    deleteService,
    getList,
    reorder,
    save,
    saveAddon,
    saveDiscount,
    savePricing,
    saveReorder,
    saveReorderAddon,
    saveReorderDiscount,
    saveReorderPricing,
    toggleService
} from '../reducers/serviceReducer';

class Services extends React.Component {

    loaded = false;
    created = false;
    stateIndex = 0;
    state = {
        created: false
    };

    createNewService = () => {
        const services = this.props.services;
        if (services.length === 0 || services[services.length - 1].id !== -1) {
            this.props.create(this.props.user.selectedCompany.id);
        }
        setTimeout(() => {
            scrollToElement('.new-service', {align: 'top'})
        }, 100);
        this.setState({created: true})
    };
    savePricing = pricing => {
        pricing.rules[0].from = 1;
        if (pricing.rules.length > 1) {
            pricing.rules[0].to = pricing.rules[1].from - 1;
        } else {
            pricing.rules[0].to = pricing.maxvalue;
        }
        pricing.rules.forEach((rule, i) => {
            if (i === 0) return;
            if (rule.duration === '') {
                rule.duration = pricing.rules[0].duration;
            }
        });
        this.props.savePricing(pricing);
    };
    saveAddon = addon => {
        addon.rules[0].from = 1;
        if (addon.rules.length > 1) {
            addon.rules[0].to = addon.rules[1].from - 1;
        } else {
            addon.rules[0].to = addon.maxvalue;
        }
        addon.rules.forEach((rule, i) => {
            if (i === 0) return;
            if (rule.duration === '') {
                rule.duration = addon.rules[0].duration;
            }
        });
        this.props.saveAddon(addon);
    };
    saveDiscount = discount => {
        this.props.saveDiscount(discount)
    };
    reorderDiscounts = service => {
        this.props.saveReorderDiscount(
            service.discounts.reduce((map, s, i) => ({...map, [s.id]: i}), {}),
            service.id
        )
    };
    reorderAddons = service => {
        this.props.saveReorderAddon(
            service.addons.reduce((map, s, i) => ({...map, [s.id]: i}), {}),
            service.id
        )
    };
    reorderPricings = service => {
        this.props.saveReorderPricing(
            service.pricings.reduce((map, s, i) => ({...map, [s.id]: i}), {}),
            service.id
        )
    };

    componentDidMount() {
        if (this.props.user.companies !== undefined && !this.loaded) {
            this.loaded = true;
            this.props.getList(this.props.user.selectedCompany.id);
        }
    }

    componentWillReceiveProps(props, content) {
        if (props.user.companies !== undefined && !this.loaded) {
            this.loaded = true;
            this.props.getList(props.user.companies[0].id);
        }
        if (props.stateIndex > this.stateIndex) {
            this.stateIndex = props.stateIndex;
        }
    }

    toggleService(service) {
        this.props.toggleService(service);
    }

    deleteService(service) {
        if (service.id === -1)
            this.props.deleteLocal(service);
        else
            this.props.deleteService(service);
        this.created = false;
    }

    reorderServices() {
        this.props.saveReorder(
            this.props.services.reduce((map, s, i) => ({...map, [s.id]: i}), {}),
            this.props.user.selectedCompany.id
        )
    }

    render() {
        return (
            <Container>
                <Card className="mb-3">
                    <CardHeader className="d-flex align-items-center">
                        <h4 className="mb-0">Active Services: {this.props.services.filter(s => s.enabled).length}</h4>
                        <Button color="success" className="ml-auto" onClick={this.createNewService}>
                            <Icon icon={faPlus} className="mr-2"/>
                            Add New Service
                        </Button>
                    </CardHeader>
                </Card>
                {this.props.services.map((service, i) =>
                    <Service
                        index={i}
                        open={this.state.created && i === (this.props.services.length - 1)}
                        toggleService={() => this.toggleService(service)}
                        className={service.id === -1 ? "new-service" : ""}
                        serviceChanged={(newService) => this.props.save(newService)}
                        deleteService={() => this.deleteService(service)}
                        key={service.id}
                        orderService={this.props.reorder}
                        reorderServices={() => this.reorderServices()}
                        service={service}
                        savePricing={this.savePricing}
                        deletePricing={this.props.deletePricing}
                        saveAddon={this.saveAddon}
                        deleteAddon={this.props.deleteAddon}
                        saveDiscount={this.saveDiscount}
                        deleteDiscount={this.props.deleteDiscount}
                        reorderDiscounts={(s) => this.reorderDiscounts(s)}
                        reorderAddons={(s) => this.reorderAddons(s)}
                        reorderPricings={s => this.reorderPricings(s)}/>
                )}
            </Container>
        )
    }
}

const mapStateToProps = state => ({...state.service, user: state.user});
const mapDispatchToProps = dispatch => {
    return bindActionCreators({
            save, create, reorder, getList, deleteService, deleteLocal, saveReorder, toggleService,
            savePricing, deletePricing, saveAddon, deleteAddon, saveDiscount, deleteDiscount, saveReorderDiscount,
            saveReorderAddon, saveReorderPricing
        },
        dispatch
    );
};
export default connect(mapStateToProps, mapDispatchToProps)(withDragDropContext(Services))
