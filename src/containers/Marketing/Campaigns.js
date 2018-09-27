import React, {Fragment} from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    Container,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormFeedback,
    Input,
    Label,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row,
} from "reactstrap";
import InputField from "../../components/InputField";
import {campaign as campaignApi, company as companyapi, customer, mailTemplate, staff as staffApi} from "../../api";
import {connect} from "react-redux";
import {faPlus, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome';
import DatePicker from "react-datepicker";
import moment from "moment";
import {getStaff} from "../../reducers/staffReducer";
import {bindActionCreators} from "redux";
import CampaignModel from "../../model/campaign";
import {toast} from "react-toastify";
import HtmlPreviewDialog from "../HtmlPreviewDialog";
import {debounce} from "../../util";
import CustomerListDialog from "../../components/CustomerListDialog";

const multiSelectFilter = (label, name, options = null) => ({handleInput, state, deleteFilter}) => {
    if (options === null) {
        options = name.split(".")[0];
    }
    return (
        <InputField handleFormInput={handleInput} value={state.filter[name]} name={name}
                    label={label} type="multi-select" options={state[options]} inject={
            <Button color="danger" onClick={() => deleteFilter(name)} className="border-4px ml-1"><Icon
                icon={faTrash}/></Button>
        }/>
    )
};

const comparisonFilter = (label, name, date = false, exact = false) => ({handleInput, state, deleteFilter}) => {
    if (state.filter[name] === undefined || state.filter[name] === null) {
        const value = date ? moment() : '';
        state.filter[name] = {type: "=", value}
    }
    return (
        <Fragment>
            <Col md={4} className="d-flex align-items-center">
                <Label for={name} className="mb-0">{label}</Label>
            </Col>
            <Col md={8} className="d-flex">
                {!exact &&
                <Input type="select" name={name} style={{width: "auto"}}
                       onChange={e => handleInput(name, {...state.filter[name], type: e.target.value})}
                       value={state.filter[name].type}>
                    <option value="=">=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                </Input>
                }
                <div style={{flex: "1"}}>
                    {date ?
                        <DatePicker selected={state.filter[name].value}
                                    onChange={date => handleInput(name, {...state.filter[name], value: date})}
                                    className="form-control"/>
                        :
                        <Input type="text"
                               onChange={e => handleInput(name, {...state.filter[name], value: e.target.value})}
                               value={state.filter[name].value}/>
                    }
                </div>
                <Button color="danger" onClick={() => deleteFilter(name)} className="border-4px ml-1"><Icon
                    icon={faTrash}/></Button>
            </Col>
            <Col md={8} className="offset-md-4 mb-2"><FormFeedback/></Col>
        </Fragment>
    )
};

const textFilter = (label, name) => ({handleInput, state, deleteFilter}) => (
    <Fragment>
        <InputField handleFormInput={handleInput} value={state.filter[name]}
                    name={name} label={label} type="text" inject={
            <Button color="danger" onClick={() => deleteFilter(name)} className="border-4px ml-1"><Icon icon={faTrash}/></Button>
        }/>
    </Fragment>
);

const booleanFilter = (label, name) => ({handleInput, state, deleteFilter}) => (
    <Fragment>
        <InputField handleFormInput={handleInput} value={state.filter[name]}
                    name={name} label={label} type="toggle" inject={
            <Button color="danger" onClick={() => deleteFilter(name)} className="border-4px ml-1"><Icon icon={faTrash}/></Button>
        }/>
    </Fragment>
);


let i = 0;

const filterEntry = (name, creator) => ({id: i++, name, creator});

const filterTypes = {
    "labels.id": filterEntry("Add Tag Filter", multiSelectFilter("Filter by Tags", "labels.id")),
    "services.id": filterEntry("Add Service Filter", multiSelectFilter("Filter by Services", "services.id")),
    "customers.customer_since": filterEntry("Add Customer Since Filter", comparisonFilter("Filter by Customer Since", "customers.customer_since", true)),
    "ignore.last_service_date": filterEntry("Add Last Service Date Filter", comparisonFilter("Filter by Last Service Date", "ignore.last_service_date", true)),
    "ignore.next_service_date": filterEntry("Add Next Service Date Filter", comparisonFilter("Filter by Next Service Date", "ignore.next_service_date", true)),
    "customers.city": filterEntry("Add City Filter", multiSelectFilter("Filter by City", "customers.city", "cities")),
    "customers.date_of_birth": filterEntry("Add Birthday Filter", comparisonFilter("Filter by Birthday", "customers.date_of_birth", true, true)),
    "users.id": filterEntry("Add Staff Preference Filter", multiSelectFilter("Filter by Preferred Staff", "users.id")),
    "customers.type": filterEntry("Add Customer Hub Registration Filter", booleanFilter("Filter by Customer Hub Registration", "customers.type"))
};

const reduceStaffUsers = (teams) => teams.filter(team => team.id > 0).reduce((arr, team) => {

    team.users.filter(u => u.active).forEach(user => arr.push(user));
    return arr;
}, []).map(user => ({value: user.id, label: user.name}));


function renderValue(data) {
    const labels = data.split(".").reduce((data, label) => [...data, ...label.split("_")], []);
    let label = "";
    labels.forEach((l, i) => {
        if (i !== 0) label += " ";
        label += l[0].toUpperCase();
        label += l.substr(1);
    });
    return label;
}

class Campaigns extends React.Component {
    state = {
        selectedCampaign: new CampaignModel(this.props.user.selectedCompany.id),
        template: 0,
        templates: [],
        services: [],
        labels: [],
        users: [],
        teams: [],
        cities: [],
        filter: {},
        filters: [],
        campaigns: [],
        cancelPopovers: {},
        addFilterOpen: false,
        sendNow: "true",
        sendTime: moment(),
        previewModalOpen: false,
        customers: [],
        excluded: {},
        customerListOpen: false
    };

    togglePreview = () => {
        this.setState({previewModalOpen: !this.state.previewModalOpen})
    };
    handleFormInput = (prop, value) => {
        const filter = {...this.state.filter};
        filter[prop] = value;
        this.setState({filter});
        debounce(() => {
            this.updateSelectedCustomers();
        }, 300);
    };
    selectCampaign = (selectedCampaign) => {
        const campaign = selectedCampaign;

        let filters = campaign.filters.reduce((filters, filter) => {
            const key = `${filter.table}.${filter.column}`;
            if (filters[key] === undefined) {
                filters[key] = filterTypes[key];
            }
            return filters;
        }, {});
        filters = Object.keys(filters).map(key => filters[key]);
        const excluded = campaign.excluded_customers.reduce((data, id) => ({...data, [id]: true}), {});
        const filter = campaign.filters.reduce((obj, filter) => {
            const key = `${filter.table}.${filter.column}`;
            if (obj[key] !== undefined) {
                if (!(obj[key] instanceof Array)) {
                    const val = obj[key];
                    obj[key] = [val];
                }
                obj[key].push(filter.value);
            } else {
                obj[key] = filter.value;
            }
            return obj;
        }, {});
        const sendNow = campaign.time === null;
        let sendTime;
        if (!sendNow) {
            sendTime = moment(campaign.time);
        } else {
            sendTime = moment();
        }
        const template = campaign.email_template_id === -1 ? this.state.template : campaign.email_template_id;
        this.setState({
            filters,
            filter,
            sendNow,
            sendTime,
            template,
            selectedCampaign,
            excluded
        }, () => this.updateSelectedCustomers());
    };
    createCampaign = async () => {
        let campaign = this.state.selectedCampaign;
        campaign.email_template_id = this.state.template;
        if (this.state.sendNow !== "true") {
            campaign.time = new Date(this.state.sendTime);
        } else {
            delete campaign.time;
        }
        campaign.filters = Object.keys(this.state.filter).reduce((filters, key) => {
            const [table, column] = key.split(".");
            if (table === 'ignore') return filters;
            let value = this.state.filter[key];
            let operator = "=";
            if (key === "customers.type") {
                value = [value ? "registered" : "guest"];
            } else if (!(value instanceof Array)) {
                if (value instanceof Object) {
                    operator = value.type;
                    value = [value.value];
                } else {
                    value = [value];
                }
            }
            const filter = {
                table,
                column,
                operator,
                values: value
            };
            filters.push(filter);
            return filters;
        }, []);
        campaign.excluded_customers = Object.keys(this.state.excluded);
        campaign.customer_count = this.state.customers.length - Object.keys(this.state.excluded).length;

        try {
            let response;
            if (campaign.id === -1) {
                response = await campaignApi(this.props.user.selectedCompany.id).create(campaign);
            } else {
                response = await campaignApi(this.props.user.selectedCompany.id).update(campaign.id, campaign);
            }
            const {campaigns} = this.state;
            if (campaign.id === -1) {
                if (response.time !== null)
                    campaigns.splice(0, 0, response);
            } else {
                const idx = campaigns.findIndex(c => c.id === campaign.id);
                campaigns.splice(idx, 1, response);
            }
            this.setState({campaigns});
            toast.success("Campaign created successfully!");
        } catch (e) {
            toast.error(e.message);

        }
    };
    selectCustomer = (id) => {
        const {excluded} = this.state;
        if (excluded[id] === undefined) {
            excluded[id] = true;
        } else {
            delete excluded[id];
        }
        this.setState({excluded});
    };

    async componentDidUpdate(prevProps) {
        if (this.props.templateStateIndex !== prevProps.templateStateIndex) {
            const templates = await mailTemplate(this.props.user.selectedCompany.id).list();
            const template = templates.length > 0 ? templates[0].id : 0;
            this.setState({templates, template});
        }
    }

    async componentDidMount() {
        const companyID = this.props.user.selectedCompany.id;
        this.props.getStaff(companyID);
        const [templates, services, labels, users, cities, campaigns] = await Promise.all([
            mailTemplate(companyID).list(),
            companyapi.services(companyID).then(s => s.map(service => ({
                value: service.id,
                label: service.name
            }))),
            customer.getLabels(companyID).then(t => t.map(tag => ({
                value: tag.id,
                label: tag.name
            }))),
            staffApi.list(companyID).then(staff => reduceStaffUsers(staff)),
            companyapi.customerCityList(companyID).then(c => c.map(city => ({value: city.city, label: city.city}))),
            campaignApi(companyID).list().then(c => c.filter(c => c.time !== null && c.time.unix() > moment().unix()))
        ]);
        const template = templates.length > 0 ? templates[0].id : 0;
        this.setState({
            templates,
            services,
            labels,
            template,
            users,
            cities,
            campaigns
        }, () => this.updateSelectedCustomers());
    }

    insertFilter(filter) {
        const filters = [...this.state.filters];
        filters.push(filter);
        this.setState({filters}, () => this.updateSelectedCustomers());
    }

    deleteFilter(prop, idx) {
        const filters = [...this.state.filters];
        const filter = {...this.state.filter};
        delete filter[prop];
        filters.splice(idx, 1);
        this.setState({filters, filter}, () => this.updateSelectedCustomers());
    }

    async updateSelectedCustomers() {
        const filters = Object.keys(this.state.filter).reduce((filters, key) => {
            const [table, column] = key.split(".");
            if (table === 'ignore') return filters;
            let value = this.state.filter[key];
            let operator = "=";
            if (key === "customers.type") {
                value = [value ? "registered" : "guest"];
            } else if (!(value instanceof Array)) {
                if (value instanceof Object) {
                    operator = value.type;
                    value = [value.value];
                } else {
                    value = [value];
                }
            }
            const filter = {
                table,
                column,
                operator,
                values: value
            };
            filters.push(filter);
            return filters;
        }, []);
        const customers = await campaignApi(this.props.user.selectedCompany.id).filter(filters);
        this.setState({customers})
    }

    getTemplate(email_template_id) {
        const template = this.state.templates.find(t => t.id === email_template_id);
        if (template == null) return "";
        return template.name;
    }

    togglePopover(pos) {
        const {cancelPopovers} = this.state;
        if (cancelPopovers[pos])
            delete cancelPopovers[pos];
        else
            cancelPopovers[pos] = true;
        this.setState({cancelPopovers});
    }

    async cancelCampaign(campaign, i) {
        const {campaigns} = this.state;
        await campaignApi(this.props.user.selectedCompany.id).delete(campaign.id);
        this.togglePopover(i);
        campaigns.splice(i, 1);
        this.setState({campaigns});
    }

    render() {
        const selectedTemplate = this.state.templates.find(t => t.id == this.state.template);
        return (
            <Row style={{height: "calc(100vh - 184px)"}}>
                <Col md={4} className="customer-actions" style={{height: "100%", overflowY: "auto"}}>
                    <h3 className="text-center mt-2">Upcoming campaigns</h3>
                    <hr/>
                    <Button color="success"
                            onClick={() => this.selectCampaign(new CampaignModel(this.props.user.selectedCompany.id))}><Icon
                        icon={faPlus}/> Add new Campaign</Button>
                    <hr/>
                    {this.state.campaigns.map((campaign, i) => {
                        const filters = campaign.filters.reduce((data, filter) => {
                            let key = filter.column;
                            let value = filter.value;
                            if (filter.column === "id") {
                                key = filter.table;
                                value = this.state[key].find(v => v.value === parseInt(value, 10));
                                if (value) {
                                    value = value.label;
                                } else {
                                    value = "";
                                }
                            }
                            if (data[key] === undefined) {
                                data[key] = [];
                            }
                            data[key].push(value);
                            return data;
                        }, {});
                        return (
                            <Fragment key={campaign.id}>
                                <Row className="p-3">
                                    <Col lg={6}>
                                        <h5 className="mb-3">
                                            <strong>Template: </strong> {this.getTemplate(campaign.email_template_id)}
                                        </h5>
                                    </Col>
                                    {Object.keys(filters).map(filter =>
                                        <Col lg={6} key={filter}>
                                            <h5 className="mb-3">
                                                <strong>{renderValue(filter)}: </strong> {filters[filter].map((f, i) =>
                                                `${i !== 0 ? ", " : ""}${f}`
                                            )}</h5>
                                        </Col>
                                    )}
                                    <Col xs={12}>
                                        <h5 className="mb-3"><strong>{campaign.customer_count} Clients Selected</strong>
                                        </h5>
                                    </Col>
                                    <Col xs={12}>
                                        <h5 className="mb-3"><strong>Campaign
                                            Date: </strong>{campaign.time.format("MM/DD/YYYY hh:mm A")}</h5>
                                    </Col>
                                    <Col xs={12}>
                                        <ButtonGroup>
                                            <Button color="success"
                                                    onClick={() => this.selectCampaign(campaign)}>Edit</Button>
                                            <Button id={`delete${i}`} color="danger"
                                                    onClick={() => this.togglePopover(i)}>Cancel</Button>
                                            <Popover placement="right"
                                                     isOpen={this.state.cancelPopovers[i]}
                                                     target={`delete${i}`}
                                                     toggle={() => this.togglePopover(i)}>
                                                <PopoverHeader>Cancel this Campaign?</PopoverHeader>
                                                <PopoverBody className="d-flex justify-content-between">
                                                    <Button color="danger"
                                                            onClick={() => this.cancelCampaign(campaign, i)}>
                                                        Yes
                                                    </Button>
                                                    <Button color="secondary"
                                                            onClick={() => this.togglePopover(i)}>
                                                        No
                                                    </Button>
                                                </PopoverBody>
                                            </Popover>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                                <hr/>
                            </Fragment>
                        )
                    })}
                </Col>
                <Col md={8} className="mt-4">
                    <Container>
                        <Row className="pb-3 border-bottom">
                            <InputField handleFormInput={(prop, value) => this.setState({template: value})}
                                        name="template"
                                        label="Template"
                                        type="select" value={this.state.template}>
                                {this.state.templates.map(template =>
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                )}
                            </InputField>
                            <Col md={8} className="offset-md-4 mb-2">
                                <Button color="primary" onClick={this.togglePreview}>Preview Template</Button>
                            </Col>
                            {this.state.filters.map(({creator: Filter}, i) =>
                                <Filter key={i} handleInput={this.handleFormInput} state={this.state}
                                        deleteFilter={prop => this.deleteFilter(prop, i)}/>
                            )}
                            <Col md={8} className="offset-md-4 mb-2">
                                <Dropdown isOpen={this.state.addFilterOpen}
                                          toggle={() => this.setState({addFilterOpen: !this.state.addFilterOpen})}>
                                    <DropdownToggle caret color="success">
                                        <Icon icon={faPlus}/> Add Filter
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {Object.keys(filterTypes).map(key => filterTypes[key]).filter(ft => this.state.filters.findIndex(f => f.id === ft.id) === -1).map(filterType =>
                                            <DropdownItem key={filterType.id}
                                                          onClick={() => this.insertFilter(filterType)}>
                                                {filterType.name}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </Col>
                            <Col md={4} className="align-items-center d-flex">
                                {this.state.customers.length - Object.keys(this.state.excluded).length} Customers
                                Selected
                            </Col>
                            <Col md={8}>
                                <Button color="primary"
                                        onClick={() => this.setState({customerListOpen: !this.state.customerListOpen})}>View
                                    Selected Customers</Button>
                            </Col>
                        </Row>
                        <Row className="py-3">
                            <Button color="success"
                                    onClick={this.createCampaign}>{this.state.selectedCampaign.id !== -1 ? "Edit Campaign" : "Create Campaign"}</Button>
                            <div className="ml-auto d-flex align-items-center">
                                <span>When to send</span>
                                <Input type="select" style={{width: "auto"}} className="mx-2"
                                       value={this.state.sendNow}
                                       onChange={e => this.setState({sendNow: e.target.value})}>
                                    <option value="true">Now</option>
                                    <option value="false">Later</option>
                                </Input>
                                {this.state.sendNow === "false" &&
                                <DatePicker selected={this.state.sendTime} popperPlacement="left"
                                            onChange={date => this.setState({sendTime: date})}
                                            className="form-control" showTimeSelect dateFormat="LLL"/>
                                }
                            </div>
                        </Row>
                    </Container>
                </Col>
                <HtmlPreviewDialog toggle={this.togglePreview}
                                   isOpen={this.state.previewModalOpen}
                                   title="Preview Template"
                                   data={selectedTemplate ? selectedTemplate.template : ""}/>
                <CustomerListDialog isOpen={this.state.customerListOpen}
                                    toggle={() => this.setState({customerListOpen: !this.state.customerListOpen})}
                                    customers={this.state.customers} checked={this.state.excluded}
                                    selectCustomer={this.selectCustomer}/>
            </Row>
        )
    }
}

function mapState(state) {
    return {
        user: state.user,
        staff: state.staff.staff
    }
}

function mapActions(dispatch) {
    return bindActionCreators({getStaff}, dispatch)
}

export default connect(mapState, mapActions)(Campaigns);
