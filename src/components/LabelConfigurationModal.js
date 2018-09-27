import React, {Component} from 'react';

import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Popover, PopoverBody, PopoverHeader, Row} from 'reactstrap';

import Select from '@kemoke/react-select';
import Icon from '@fortawesome/react-fontawesome';

import '../App.css';


import 'react-datepicker/dist/react-datepicker.css';
import InputField from "./InputField";
import {
    faArrowDown, faArrowUp, faDollarSign, faMinus, faPlus, faWindowClose,
    faWrench
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Note from "./Note";
import HtmlPreviewDialog from "../containers/HtmlPreviewDialog";


const groupByOptions = [
    {value: "hour", name: 'Hour'},
    {value: "day", name: 'Day'},
    {value: 'month', name: 'Month'},
    {value: 'year', name: 'Year'}

];

const dataSetOptions = [
    {value: 'customers', name: 'Customers'},
    {value: 'quotes', name: 'Quotes'},
    {value: 'appointments', name: 'Appointments'},
    {value: 'invoices', name: 'Invoices'}
];

const filterByOperators = [
    {value: '>', name: '>'},
    {value: '=', name: '='},
    {value: '<', name: '<'},
    {value: '!=', name: '!='},
];

const iconOptions = [
    {value: 'plus', name: 'Plus'},
    {value: 'dollar', name: 'Dollar'},
    {value: 'minus', name: 'Minus'},
    {value: 'arrowUp', name: 'Arrow Up'},
    {value: 'arrowDown', name: 'Arrow Down'},
    {value: 'wrench', name: 'Wrench'},
];

const valueMapOptions = {
    'customers': [{value: 'count', name: 'Count'}],
    'quotes': [{value: 'count', name: 'Count'}],
    'appointments': [{value: 'count', name: 'Count'}],
    'invoices': [{value: 'count', name: 'Count'}, {value: 'value', name: 'Value'}],
};

const filterFieldOptions = {
    'appointments': [
        {value: 'deposit', name: 'Deposit'},
        {value: 'tax', name: 'Tax'},
        {value: 'total', name: 'Total'},
    ],
    'quotes': [
        {value: 'tax', name: 'Tax'},
        {value: 'deposit', name: 'Deposit'},
        {value: 'discount_amount', name: 'Discount amount'}
    ],
    'invoices': [
        {value: 'amount', name: 'Amount'},
    ],
    'customers': [
        {value: 'area_code', name: 'Area Code'},
        {value: 'zip', name: 'ZIP Code'},
        {value: 'city', name: 'City'},
    ],
};

class LabelConfigurationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpened: props.modalOpened != undefined ? props.modalOpened : false,
            settings: props.settings,
            popoverOpen: false
        }

        this.toggle = this.toggle.bind(this);
        this.togglePopover = this.togglePopover.bind(this);
    }

    changeDataSet = (id, dataSet) => {

        let newSettings = {...this.state.settings};
        if(dataSet == null) newSettings.dataSet = 'customers';
        else newSettings.dataSet = dataSet.value;

        this.setState({settings: newSettings});
    };

    changeLabel = (id, label) => {
        let newSettings = {...this.state.settings};
        newSettings.label = label;

        this.setState({settings: newSettings});
    };
    changeIcon = (id, icon) => {

        let newSettings = {...this.state.settings};
        if(icon == null) newSettings.icon = 'plus';
        else newSettings.icon = icon.value;

        this.setState({settings: newSettings});

    };
    changeFilterByField = (id, filterByField) => {

        let newSettings = {...this.state.settings};
        if(filterByField == null) newSettings.filterByField = null;
        else newSettings.filterByField = filterByField.value;

        this.setState({settings: newSettings});
    };
    changeFilterByOperator = (id, filterByOperator) => {

        let newSettings = {...this.state.settings};
        if(filterByOperator == null) newSettings.filterByOperator = null;
        else newSettings.filterByOperator = filterByOperator.value;

        this.setState({settings: newSettings});


    };

    changeFilterByValue = (id, filterByValue) => {

        let newSettings = {...this.state.settings};
        if(filterByValue == null) newSettings.filterByValue = null;
        else newSettings.filterByValue = filterByValue;

        this.setState({settings: newSettings});
    };


    toggle() {
        this.setState({
            modalOpened: !this.state.modalOpened
        });
        this.props.changeModalOpened();
    }


    togglePopover(){
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    applyChanges(){
        let newSettings = {...this.state.settings};
        newSettings.modalOpened = false;
        this.setState({ settings: newSettings },() => {
            this.toggle();
            this.props.modifySettings(this.state.settings, true)
        });
    }

    saveChanges(){
        this.applyChanges();

    }

    render() {
        return (<div className="dragMeNot d-flex flex-column justify-content-between"
                     id={`label-config-${this.state.settings.id}`}>
            <Button color="primary" className="edit-label-button btn-gray" onClick={this.toggle}>
                <Icon icon={faWrench} />
            </Button>
            <Button color="primary mt-2" onClick={() => this.togglePopover()}  className="btn-gray edit-label-button">
                <Icon icon={faWindowClose} />
            </Button>
            <Modal isOpen={this.state.modalOpened} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>Edit Label</ModalHeader>
                <ModalBody>
                    <Row className="mb-2">

                        <div className="d-flex w-100">

                            <InputField label="Change Label"
                                        value={this.state.settings.label}
                                        handleFormInput={(a,b)=>{this.changeLabel(this.props.id, b)}}
                                        name="label"
                            />
                        </div>


                    </Row>

                    <Row className="mb-2">
                        <div className="d-flex w-100">
                            <div className="d-flex col-md-4">
                                <label>Icon</label>
                            </div>
                            <Select
                                className="w-100 col-md-8"
                                name="icon"
                                label="Icon"
                                labelKey="name"
                                value={this.state.settings.icon}
                                options={iconOptions}
                                onChange={(a)=>{this.changeIcon(this.props.id, a)}}

                            />


                        </div>
                    </Row>

                    <Row className="mb-2">
                        <div className="d-flex w-100">
                            <div className="d-flex col-md-4">
                                <label>Data Set</label>
                            </div>


                            <Select
                                className="w-100 col-md-8"
                                name="data_set"
                                label="Data Set"
                                value={this.state.settings.dataSet}
                                labelKey="name"
                                options={dataSetOptions}
                                onChange={(a)=>this.changeDataSet(this.props.id,a)}

                            />
                        </div>

                    </Row>





                    <Row className="mb-2">
                        <div className="d-flex w-100 mb-2">
                            <div className="d-flex col-md-4">
                                <label>Filter By</label>
                            </div>


                            <Select
                                className="w-100 col-md-3 pr-0"
                                name="filter_by"
                                label="Filter By"
                                value={this.state.settings.filterByField}
                                labelKey="name"
                                options={filterFieldOptions[this.state.settings.dataSet]}
                                onChange={(a)=>{this.changeFilterByField(this.props.id, a)}}

                            />

                            <Select
                                className="w-100 col-md-2 pr-0"
                                name="filter_by_operator"

                                value={this.state.settings.filterByOperator}
                                labelKey="name"
                                options={filterByOperators}
                                onChange={(a)=>{this.changeFilterByOperator(this.props.id, a)}}

                            />

                            <div className="d-flex w-100 col-md-3 p-0__input">

                                <InputField colRatio="0:12"
                                            value={this.state.settings.filterByValue}
                                            handleFormInput={(a,b)=>{this.changeFilterByValue(this.props.id, b)}}
                                            name="value"
                                />
                            </div>

                        </div>

                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.saveChanges()}>Save Changes</Button>

                    <Button color="secondary" onClick={this.toggle}>Close</Button>
                </ModalFooter>


            </Modal>

            <Popover target={'label-config-'+ this.state.settings.id}
                     isOpen={this.state.popoverOpen}
                     toggle={() => this.togglePopover()}>
                <PopoverHeader>Delete this label?</PopoverHeader>
                <PopoverBody className="d-flex justify-content-between note">
                    <Button color="danger"
                            onClick={() => {
                                this.props.removeLabel(this.state.settings.id)
                                this.setState({popoverOpen: false})
                            }}>
                        Yes
                    </Button>
                    <Button color="secondary"
                            onClick={() => this.togglePopover()}>
                        Cancel
                    </Button>
                </PopoverBody>
            </Popover>
        </div>);
    }

}

export default LabelConfigurationModal;
