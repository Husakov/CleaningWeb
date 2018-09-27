import React from 'react'
import {Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Row} from "reactstrap";
import './AutomaticMessages.css';
import Icon from '@fortawesome/react-fontawesome'
import {faPlus} from "@fortawesome/fontawesome-free-solid/shakable.es";
import AutomaticMessage from '../../components/Marketing/AutomaticMessage';
import scrollToElement from 'scroll-to-element'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    createMessage,
    deleteLocalMessage,
    deleteMessage,
    getMessages,
    getTemplates,
    saveMessage
} from '../../reducers/messagesReducer';
import classSet from "react-classset";
import {getList} from "../../reducers/serviceReducer";
import {mailTemplate, smsTemplate} from '../../api';

class AutomaticMessages extends React.Component {
    state = {
        dropdownOpen: false,
        daysDropdown: false,
        time: "1 hour",
        enabled: false,
        templateTab: 0,
        created: false,
        mailTemplates: [],
        smsTemplates: []
    };
    createNewMessage = (type) => {
        const messages = [...this.props.messages];
        this.props.create(type, this.state.templateTab > 0 ? "sms" : "email");
        setTimeout(() => {
            scrollToElement('.new-message', {align: 'top'})
        }, 100);
        this.setState({created: true})
    };

    async componentDidMount() {
        this.props.getServices(this.props.user.companies[0].id);
        this.props.getMessages(this.props.user.companies[0].id);
        this.props.getTemplates();
        const mailTemplates = await mailTemplate(this.props.user.selectedCompany.id).list();
        const smsTemplates = await smsTemplate(this.props.user.selectedCompany.id).list();
        const tags = await mailTemplate(this.props.user.companies[0].id).tags();
        this.setState({mailTemplates, smsTemplates, tags});
    }

    toggleTab(pos) {
        this.setState({tabOpen: pos});
    }

    toggleMessagesTab(pos) {
        this.setState({templateTab: pos, created: false});
    }

    render() {
        const i = 0;
        const messageTime = [
            "1 hour", "2 hours", "3 hours", "4 hours", "6 hours",
            "12 hours", "1 day", "2 days", "3 days", "4 days", "5 days", "6 days",
            "1 week", "2 weeks", "3 weeks", "4 weeks"];
        return (
            <Row className="templates">
                <Col md={2} className="template-list">
                    <Nav tabs>
                        <NavItem className="w-50 text-center">
                            <NavLink className={classSet({active: this.state.templateTab === 0})}
                                     onClick={() => this.toggleMessagesTab(0)}>E-Mail</NavLink>
                        </NavItem>
                        <NavItem className="w-50 text-center">
                            <NavLink className={classSet({active: this.state.templateTab === 1})}
                                     onClick={() => this.toggleMessagesTab(1)}>Text</NavLink>
                        </NavItem>
                    </Nav>
                    <Dropdown
                        isOpen={this.state.dropdownOpen}
                        toggle={() => this.setState({dropdownOpen: !this.state.dropdownOpen})}>
                        <DropdownToggle
                            className="mt-3"
                            caret color="success">
                            <Icon icon={faPlus}/> Action
                        </DropdownToggle>
                        <DropdownMenu>
                            {this.props.types.map((type) => {
                                return (
                                    <DropdownItem
                                        onClick={() => {
                                            this.createNewMessage(type);
                                        }}
                                        key={type.id}
                                        className="messages-dropdown-item">{type.name}</DropdownItem>
                                )
                            })}
                        </DropdownMenu>
                    </Dropdown>
                </Col>

                {this.state.templateTab === 0 && <Col md={10}>
                    <Col className="automatic-messages mt-3" md={{size: 6, offset: 3}}>
                        {this.props.types.length > 0 && this.props.messages.map((message, i) => {
                            if (message.type === "email") {
                                return (
                                    <AutomaticMessage
                                        errors={this.props.errors}
                                        key={message.id}
                                        templates={this.state.mailTemplates}
                                        tags={this.state.tags}
                                        user={this.props.user}
                                        className={message.id === -1 ? "new-message" : ""}
                                        services={this.props.services}
                                        type={this.props.types[message.template_type_id - 1]}
                                        createMessage={(body, id, message_id, index) =>
                                            this.props.saveMessage(body, id, message_id, index)}
                                        deleteMessage={(company_id, message_id, index) =>
                                            this.props.deleteMessage(company_id, message_id, index)}
                                        deleteLocalMessage={() => this.props.deleteLocalMessage()}
                                        index={i}
                                        messageType={this.state.templateTab > 0 ? "sms" : "email"}
                                        message={message}
                                        request={this.props.request}
                                        open={this.state.created && i === (this.props.messages.length - 1)}/>)
                            }
                        })}
                    </Col>
                </Col>}
                {this.state.templateTab === 1 && <Col md={10}>
                    <Col className="automatic-messages mt-3" md={{size: 6, offset: 3}}>
                        {this.props.types.length > 0 && this.props.messages.map((message, i) => {
                            if (message.type === "sms") {
                                return (
                                    <AutomaticMessage
                                        key={message.id}
                                        templates={this.state.smsTemplates}
                                        errors={this.props.errors}
                                        tags={this.state.tags}
                                        user={this.props.user}
                                        className={message.id === -1 ? "new-message" : ""}
                                        services={this.props.services}
                                        type={this.props.types[message.template_type_id - 1]}
                                        createMessage={(body, id, message_id, index) =>
                                            this.props.saveMessage(body, id, message_id, index)}
                                        index={i}
                                        deleteMessage={(company_id, message_id, index) =>
                                            this.props.deleteMessage(company_id, message_id, index)}
                                        deleteLocalMessage={() => this.props.deleteLocalMessage()}
                                        messageType={this.state.templateTab > 0 ? "sms" : "email"}
                                        message={message}
                                        request={this.props.request}
                                        open={this.state.created && i === (this.props.messages.length - 1)}/>)
                            }
                        })}
                    </Col>
                </Col>}
            </Row>
        )
    }
}

const mapStateToProps = state => ({
    types: state.message.types,
    user: state.user,
    messages: state.message.messages,
    services: state.service.services,
    errors: state.message.errors,
    request: state.message.request
});
const mapDispatchToProps = dispatch => {
    return bindActionCreators({
            getMessages,
            create: createMessage,
            getServices: getList,
            getTemplates,
            saveMessage,
            deleteMessage,
            deleteLocalMessage
        },
        dispatch
    );
};
export default connect(mapStateToProps, mapDispatchToProps)(AutomaticMessages)
