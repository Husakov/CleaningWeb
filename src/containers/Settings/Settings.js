import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Card, CardTitle, CardText, Button } from 'reactstrap';
import Icon from '@fortawesome/react-fontawesome'
import {
    faBuilding,
    faCog,
    faMoneyBillAlt,
    faStreetView
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import './Settings.css';
import SettingsCompany from './SettingsCompany';
import SettingsGeneral from './SettingsGeneral';
import SettingsPayment from './SettingsPayment';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectCompany, editCompany, editPayment, getData } from '../../reducers/userReducer'
import Appearance from "./Appearance";
import EmailNotifications from "./EmailNotifications";
import EmailTemplates from "./EmailTemplates";
import Advanced from "./Advanced";

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'settings',
            view: 'company'
        }
    }

    editCompany = (company_id, company) => {
        this.props.editCompany(company_id, company);
    }

    render() {
        const { view } = this.state;
        return (
            <div className='Settings'>
                <div className="Settings--nav">
                    <ListGroup>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'company' })}
                            tag="li"
                            action>
                            <Icon icon={faBuilding} />
                            <span> Company</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'general' })}
                            tag="li"
                            action>
                            <Icon icon={faCog} />
                            <span> General</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'payment' })}
                            tag="li"
                            action>
                            <Icon icon={faMoneyBillAlt} />
                            <span> Payment</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'Appearance' })}
                            tag="li"
                            action>
                            <Icon icon={faStreetView} />
                            <span> Appearance</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'EmailNotification' })}
                            tag="li"
                            action>
                            <Icon icon={faStreetView} />
                            <span> Email Notification</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'EmailTemplates' })}
                            tag="li"
                            action>
                            <Icon icon={faStreetView} />
                            <span> Email Templates</span>
                        </ListGroupItem>
                        <ListGroupItem
                            onClick={() => this.setState({ view: 'Advanced' })}
                            tag="li"
                            action>
                            <Icon icon={faStreetView} />
                            <span> Advanced</span>
                        </ListGroupItem>
                        {/*<ListGroupItem tag="li" action>Porta ac consectetur ac</ListGroupItem>*/}
                        {/*<ListGroupItem tag="li" action>Vestibulum at eros</ListGroupItem>*/}
                    </ListGroup>
                </div>
                <div className="Settings--view">
                    {view === 'company' && <SettingsCompany
                        timetable={this.props.user.selectedCompany.timetable}
                        editCompany={this.editCompany}
                        company={this.props.user.selectedCompany}
                        pending={this.props.user.pending}
                        loaded={this.props.user.loaded}
                    />}
                    {view === 'general' && <SettingsGeneral />}
                    {view === 'payment' && <SettingsPayment
                        editPayment={this.props.editPayment}
                        company={this.props.user.selectedCompany}
                        pending={this.props.user.pending}
                        loaded={this.props.user.loaded}
                    />}
                    {view === 'Appearance' && <Appearance />}
                    {view === 'EmailNotification' && <EmailNotifications/>}
                    {view === 'EmailTemplates' && <EmailTemplates/>}
                    {view ==='Advanced' && <Advanced/>}
                </div>
            </div>
        )
    }
}

function mapState(state) {
    return {
        user: state.user,
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({
        selectCompany,
        editCompany,
        editPayment,
    }, dispatch)
}

export default connect(mapState, mapDispatch)(Settings)