import React, {Component} from 'react';

import {
    Button,
    Container,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row
} from 'reactstrap';

import Select from '@kemoke/react-select';


import 'react-datepicker/dist/react-datepicker.css';
import InputField from "./InputField";
import moment from "moment";


const groupByOptions = [
    {value: "hour", name: 'Hour'},
    {value: "day", name: 'Day'},
    {value: 'month', name: 'Month'},
    {value: 'year', name: 'Year'}

];

const chartTypeOptions = [
    {value: 'line', name: 'Line'},
    {value: 'bar', name: 'Bar'},
    {value: 'pie', name: 'Pie'},
];

const colorOptions = [
    {value: '#ff0000', name: 'Red'},
    {value: '#00aa00', name: 'Green'},
    {value: '#0000ff', name: 'Blue'},
    {value: '#000000', name: 'Black'},
    {value: '#919190', name: 'Gray'},
    {value: '#ffef00', name: 'Yellow'},
    {value: '#ff8616', name: 'Orange'},
    {value: '#591f00', name: 'Brown'},
    {value: '#ff54a0', name: 'Pink'},
    {value: '#990ca6', name: 'Purple'},

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

const valueMapOptions = {
    'customers': [{value: 'count', name: 'Count'}],
    'quotes': [{value: 'count', name: 'Count'}],
    'appointments': [{value: 'count', name: 'Count'}],
    'invoices': [{value: 'count', name: 'Count'}, {value: 'value', name: 'Value'}],
};

const filterFieldOptions = {
    'appointments': [
        {value: 'created_at', name: 'Appointment date'},
        {value: 'start_time', name: 'Booked date'},
        {value: 'customer', name: 'Booked by'},
        {value: 'status', name: 'Status'},
        {value: 'total', name: 'Amount'},
        {value: 'team_id', name: 'Team'},
        {value: 'staff_id', name: 'Staff'},
        //service?
    ],
    'quotes': [
        {value: 'created_at', name: 'Date'},
        {value: 'total', name: 'Quote amount'},
        {value: 'status', name: 'Status'},
        //service, deposit amount?
    ],
    'invoices': [
        {value: 'status', name: 'Status'},
        {value: 'created_at', name: 'Date'},
        {value: 'amount', name: 'Amount'},
        //Service
    ],
    'customers': [
        {value: 'city', name: 'City'},
        //Last appointment date, service, tag?
    ],
};

class ConfigurationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpened: props.modalOpened != undefined ? props.modalOpened : false,
            settings: props.settings,
            popoverOpen: false
        };


        this.toggle = this.toggle.bind(this);
        this.togglePopover = this.togglePopover.bind(this);
    }

    changeTrash = () => {
        let newSettings = {...this.state.settings};
        newSettings.trash = moment();

        this.setState({settings: newSettings});
    }

    changeEndDate = (id, endDate) => {
        let newSettings = {...this.state.settings};
        newSettings.endDate = endDate;

        this.setState({settings: newSettings});
    };
    changeDataSet = (id, dataSet) => {

        let newSettings = {...this.state.settings};
        if(dataSet == null) newSettings.dataSet = 'customers';
        else newSettings.dataSet = dataSet.value;

        this.setState({settings: newSettings});
    };
    changeStartDate = (id, startDate) => {
        let newSettings = {...this.state.settings};
        newSettings.startDate = startDate;

        this.setState({settings: newSettings});
    };

    changeLabel = (id, label) => {
        let newSettings = {...this.state.settings};
        newSettings.label = label;

        this.setState({settings: newSettings});
    };
    changeGroupBy = (id, groupBy) => {

        let newSettings = {...this.state.settings};
        if(groupBy == null) newSettings.groupBy = 'month';
        else newSettings.groupBy = groupBy.value;

        this.setState({settings: newSettings});

    };
    changeValueMap = (id, valueMap) => {
        let newSettings = {...this.state.settings};
        if(valueMap == null) newSettings.valueMap = 'count';
        else newSettings.valueMap = valueMap.value;

        this.setState({settings: newSettings});

        this.changeTrash();


    };
    changeIcon = (id, icon) => {

        let newSettings = {...this.state.settings};
        if(icon == null) newSettings.icon = 'plus';
        else newSettings.icon = icon.value;

        this.setState({settings: newSettings});

    };
    changeFilterByField = (id, filterByField) => {

        let newSettings = {...this.state.settings};

        let newFilterByField = null;
        if(filterByField == null) newFilterByField = null;
        else newFilterByField = filterByField.value;

        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].filterByField = newFilterByField;

        this.setState({settings: newSettings});

    };
    changeFilterByOperator = (id, filterByOperator) => {

        let newSettings = {...this.state.settings};

        let newFilterByOperator = null;
        if(filterByOperator == null) newFilterByOperator = null;
        else newFilterByOperator = filterByOperator.value;

        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].filterByOperator = newFilterByOperator;

        this.setState({settings: newSettings});


    };

    changeChartType = (id, chartType) => {
        let newSettings = {...this.state.settings};
        if(chartType == null) newSettings.chartType = 'line';
        else newSettings.chartType = chartType.value;

        this.setState({settings: newSettings});
    };

    changeFilterByValue = (id, filterByValue) => {

        let newSettings = {...this.state.settings};

        let newFilterByValue = null;
        if(filterByValue == null) newFilterByValue = null;
        else newFilterByValue = filterByValue;

        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].filterByValue = newFilterByValue;

        this.setState({settings: newSettings});
    };

    changeFilterColor = (id, color) => {

        let newSettings = {...this.state.settings};
        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].color = color.value;

        this.setState({settings: newSettings});
    };

    changeFilterDataSet = (id, dataSet) => {

        let newSettings = {...this.state.settings};
        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].dataSet = dataSet.value;

        this.setState({settings: newSettings});
    };

    changeFilterLabel = (id, label) => {

        let newSettings = {...this.state.settings};
        newSettings.filters[newSettings.filters.findIndex(item=>item.id==id)].label = label;

        this.setState({settings: newSettings});
    };




    removeFilter = (id) => {
        let newSettings = {...this.state.settings};

        newSettings.filters.splice(newSettings.filters.findIndex(item=>item.id==id), 1);

        this.setState({settings: newSettings});
    };

    addFilter = () => {
        let newSettings = {...this.state.settings};

        const biggestID = newSettings.filters.reduce((max, item) => parseInt(item.id) > max ? parseInt(item.id) : max, 0);

        let newID = parseInt(biggestID) + 1;

        newSettings.filters.push({
            id: newID,
            color: '#000000',
            dataSet: 'customers',
            filterByField: null,
            filterByOperator: '>',
            filterByValue: 0,
            label: 'New Filter',
        });

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

        return (<div className={`dragMeNot`} id={`chart-config-${this.state.settings.id}`}>
            <Button color="primary" onClick={this.toggle}>{this.state.settings.labelName}</Button>
            <Button color="primary ml-2" onClick={() => this.togglePopover()}>Remove Chart</Button>
            <Modal isOpen={this.state.modalOpened} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>{this.state.settings.labelName}</ModalHeader>
                <ModalBody>
                    <Row className="mb-2">

                        <div className="d-flex w-100">

                            <InputField label="Change Label"
                                        value={this.state.settings.label}
                                        handleFormInput={(a,b)=>{this.changeLabel(this.state.settings.id, b)}}
                                        name="label"
                            />
                        </div>


                    </Row>

                    <Row className="mb-2">
                        <div className="d-flex w-100">
                            <div className="d-flex col-md-4">
                                <label>Chart Type</label>
                            </div>


                            <Select
                                className="w-100 col-md-8"
                                name="chart_type"
                                label="Chart Type"
                                value={this.state.settings.chartType != null ?
                                    this.state.settings.chartType :
                                    'line'}
                                labelKey="name"
                                options={chartTypeOptions}
                                onChange={(a)=>this.changeChartType(this.state.settings.id,a)}

                            />
                        </div>

                    </Row>
                    <Row>
                        <InputField type="date" label="Start Date"
                                    name="start_date"
                                    required
                                    handleFormInput={(a,b)=>{this.changeStartDate(this.state.settings.id,b)}}
                                    value={this.state.settings.startDate}
                        />
                    </Row>
                    <Row>
                        <InputField type="date" label="End Date"
                                    name="end_date"
                                    required
                                    value={this.state.settings.endDate}
                                    handleFormInput={(a,b)=>{this.changeEndDate(this.state.settings.id,b)}}
                        />
                    </Row>
                    <Row className="mb-2">
                        <div className="d-flex w-100">
                            <div className="d-flex col-md-4">
                                <label>Group By</label>
                            </div>
                            <Select
                                className="w-100 col-md-8"
                                name="group_by"
                                label="Group By"
                                labelKey="name"
                                value={this.state.settings.groupBy}
                                options={groupByOptions}
                                onChange={(a)=>{this.changeGroupBy(this.state.settings.id, a)}}

                            />


                        </div>
                    </Row>

                    <Row className="mb-2">
                        <div className="d-flex w-100">
                            <div className="d-flex col-md-4">
                                <label>Value Map</label>
                            </div>


                            <Select
                                className="w-100 col-md-8"
                                name="value_map"
                                label="Value Map"
                                value={this.state.settings.valueMap}
                                labelKey="name"
                                options={valueMapOptions[this.state.settings.dataSet]}
                                onChange={(a)=>{this.changeValueMap(this.state.settings.id, a)}}

                            />
                        </div>

                    </Row>
                    <Row>
                        <div className="col-md-4">
                            <label>Filters</label>
                        </div>
                        <div className="col-md-4 offset-md-4 mb-2 w-100">
                            <Button onClick={() => this.addFilter()} color="success" className="w-100">Add Filter</Button>
                        </div>
                    </Row>

                    <Container>
                        {this.state.settings.filters.map(filter => {
                            return (
                                <div className="border p-2">

                                    <Row className="mb-2">

                                        <div className="d-flex w-100">

                                            <InputField label="Change Label"
                                                        value={filter.label}
                                                        handleFormInput={(a,b)=>{this.changeFilterLabel(filter.id, b)}}
                                                        name="label"
                                            />
                                        </div>


                                    </Row>

                                    <Row className="mb-2">
                                        <div className="d-flex w-100">
                                            <div className="d-flex col-md-4">
                                                <label>Color</label>
                                            </div>
                                            <Select
                                                className="w-100 col-md-8"
                                                name="color"
                                                label="Color"
                                                labelKey="name"
                                                value={filter.color}
                                                options={colorOptions}
                                                onChange={(a)=>{this.changeFilterColor(filter.id, a)}}

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
                                                value={filter.dataSet}
                                                labelKey="name"
                                                options={dataSetOptions}
                                                onChange={(a)=>this.changeFilterDataSet(filter.id,a)}

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
                                                value={filter.filterByField}
                                                labelKey="name"
                                                options={filterFieldOptions[filter.dataSet]}
                                                onChange={(a)=>{this.changeFilterByField(filter.id, a)}}

                                            />

                                            <Select
                                                className="w-100 col-md-2 pr-0"
                                                name="filter_by_operator"

                                                value={filter.filterByOperator}
                                                labelKey="name"
                                                options={filterByOperators}
                                                onChange={(a)=>{this.changeFilterByOperator(filter.id, a)}}

                                            />
                                            <div className="d-flex w-100 col-md-3 p-0__input">
                                                <InputField colRatio="0:12"

                                                            value={filter.filterByValue}
                                                            handleFormInput={(a,b)=>{this.changeFilterByValue(filter.id, b)}}
                                                            name="value"
                                                            marginBottom="0"
                                                />

                                            </div>


                                        </div>

                                    </Row>
                                    <Row>
                                        <div className="d-flex w-100 col-md-4  pr-2">
                                            <Button color="danger" onClick={() => this.removeFilter(filter.id)}>Remove Filter</Button>
                                        </div>
                                    </Row>
                                </div>
                            );
                        })}
                    </Container>


                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.saveChanges()}>Save Changes</Button>

                    <Button color="secondary" onClick={() => this.toggle()}>Close</Button>
                </ModalFooter>
            </Modal>
            <Popover target={'chart-config-'+ this.state.settings.id}
                     isOpen={this.state.popoverOpen}
                     toggle={() => this.togglePopover()}>
                <PopoverHeader>Delete this chart?</PopoverHeader>
                <PopoverBody className="d-flex justify-content-between note">
                    <Button color="danger"
                            onClick={() => {
                                this.props.removeChart(this.state.settings.id)
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

export default ConfigurationModal;
