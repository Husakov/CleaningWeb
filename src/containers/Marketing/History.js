import React, {Fragment} from 'react';
import {Col, Row} from "reactstrap";
import {campaign as campaignApi, company as companyapi, customer, mailTemplate, staff as staffApi} from "../../api";
import {connect} from "react-redux";
import moment from "moment/moment";

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

const reduceStaffUsers = (teams) => teams.filter(team => team.id > 0).reduce((arr, team) => {

    team.users.filter(u => u.active).forEach(user => arr.push(user));
    return arr;
}, []).map(user => ({value: user.id, label: user.name}));

class History extends React.Component {
    state = {
        templates: [],
        services: [],
        labels: [],
        users: [],
        teams: [],
        cities: [],
        filter: {},
        filters: [],
        campaigns: [],
    };

    async componentDidMount() {
        const companyID = this.props.user.selectedCompany.id;
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
            campaignApi(companyID).list().then(c => c.filter(c => c.time === null || (c.time !== null && c.time.unix() < moment().unix())))
        ]);
        const template = templates.length > 0 ? templates[0].id : 0;
        this.setState({templates, services, labels, template, users, cities, campaigns});
    }

    getTemplate(email_template_id) {
        const template = this.state.templates.find(t => t.id === email_template_id);
        if (template == null) return "";
        return template.name;
    }

    render() {
        return (
            <Row className="pt-3">
                <Col md={8} className="offset-md-2">
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
                                    <Col xs={12}/>
                                    <Col xs={6}>
                                        <h5 className="mb-3"><strong>{campaign.customer_count} Customers
                                            Selected</strong></h5>
                                    </Col>
                                    <Col xs={6}>
                                        <h5 className="mb-3"><strong>15 Clients Viewed</strong></h5>
                                    </Col>
                                    <Col xs={12}>
                                        <h5 className="mb-0"><strong>Campaign
                                            Date: </strong>{campaign.time ? campaign.time.format("MM/DD/YYYY hh:mm A") : moment(campaign.created_at).format("MM/DD/YYYY hh:mm A")}
                                        </h5>
                                    </Col>
                                </Row>
                                <hr/>
                            </Fragment>
                        )
                    })}
                </Col>
            </Row>
        )
    }
}

function mapState(state) {
    return {
        user: state.user,
    }
}

export default connect(mapState)(History);
