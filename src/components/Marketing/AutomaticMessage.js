import React from 'react'
import {
    Button,
    Col,
    Dropdown,
    DropdownMenu,
    DropdownToggle,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {getError} from "../../util";
import Icon from '@fortawesome/react-fontawesome'
import {faCaretDown, faSync} from "@fortawesome/fontawesome-free-solid/shakable.es";
import './AutomaticMessage.css';
import ReusableCard from '../Card'
import Toggle from '../Toggle';
import {Editor} from '@tinymce/tinymce-react'
import MailTemplate from "../../model/mailTemplate";
import MessageModel from "../../model/message";

function setDeepProp(obj, value, fields) {
    if (fields.length === 1) {
        obj[fields[0]] = value;
        return;
    }
    const prop = fields[0];
    fields.splice(0, 1);

    if (prop.indexOf('[]') !== -1) {
        return setDeepProp(obj[prop.substr(0, prop.length - 2)][0], value, fields)
    }
    return setDeepProp(obj[prop], value, fields);
}

class AutomaticMessage extends React.Component {
    state = {
        dropdownOpen: false,
        daysDropdown: false,
        enabled: false,
        selected: this.props.messageType === "email" ? new MailTemplate(this.props.message.email_template) : new MessageModel(this.props.message.sms_template),
        message: new MessageModel(this.props.message),
        services: [],
        preview: false,
    };

    componentDidMount() {
        const services = [...this.props.services];
        for (let i = 0; i < services.length; i++) {
            services[i].checked = false;
            if (this.state.message.services) {
                for (let j = 0; j < this.state.message.services.length; j++) {
                    if (services[i].id === this.props.message.services[j].id)
                        services[i].checked = true;
                }
            }
        }
        this.setState({services});
    }

    handleFormInput(field, data) {
        const message = this.state.message;
        if (field.indexOf(".") !== -1) {
            let fields = field.split(".");
            setDeepProp(message, data, fields);
        } else {
            message[field] = data;
        }
        this.setState({message})
    }


    setupEditor() {
        if (!this.editor) return;
        this.props.tags.forEach(tag => {
            const labels = tag.tag.split(".");
            let label = "";
            if (labels.length > 0) {
                labels.forEach((l, i) => {
                    if (i !== 0) label += " ";
                    label += l[0].toUpperCase();
                    label += l.substr(1);
                })
            } else {
                label = tag.tag;
            }
            this.editor.addMenuItem(tag.tag, {
                text: label,
                context: 'insert',
                onclick: () => {
                    this.editor.insertContent(`{${tag.tag}}`);
                }
            });
        })
    }

    handleInput(prop, value) {
        const selected = this.state.selected;
        selected[prop] = value;
        this.setState({selected});
    }

    saveMessage() {
        const services = [];
        const message = this.state.message;
        for (let i = 0; i < this.state.services.length; i++) {
            if (this.state.services[i].checked)
                services.push(Number(this.state.services[i].id))
        }
        message.service_ids = services;
        message.template_type_id = this.props.type.id;
        message.type = this.props.messageType;
        message.offset = message.offset ? message.offset : 0;
        if (this.props.messageType === "email")
            message.email_template_id = message.email_template ? message.email_template.id : this.props.templates[0] ? this.props.templates[0].id : null;
        else
            message.sms_template_id = message.sms_template ? message.sms_template.id : this.props.templates[0] ? this.props.templates[0].id : null;

        if (this.props.message.id === -1)
            this.props.createMessage(message.serialize(), this.props.user.companies[0].id, message.id);
        else
            this.props.createMessage(message, this.props.user.companies[0].id, message.id, this.props.index);
    }

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    }

    changeTemplate(id) {
        for (let i = 0; i < this.props.templates.length; i++) {
            if (this.props.templates[i].id == id) {
                this.handleFormInput(this.props.messageType === "email" ? "email_template" : "sms_template", this.props.templates[i]);
                this.setState({selected: this.props.templates[i]})
            }
        }
    }

    render() {

        const messageTime = [{key: "1 hour", value: 60},
            {key: "2 hours", value: 120},
            {key: "3 hours", value: 180},
            {key: "4 hours", value: 240},
            {key: "5 hours", value: 300},
            {key: "6 hours", value: 360},
            {key: "12 hours", value: 720},
            {key: "1 day", value: 1440},
            {key: "2 days", value: 2880},
            {key: "3 days", value: 4320},
            {key: "4 days", value: 5760},
            {key: "5 days", value: 7200},
            {key: "6 days  ", value: 8880},
            {key: "1 week", value: 10080},
            {key: "2 weeks", value: 20160},
            {key: "3 weeks", value: 30240},
            {key: "4 weeks", value: 40320},];
        const delayTime = [{key: "No delay", value: 0}, {key: "5 min.", value: 5},
            {key: "10 min.", value: 10}, {key: "15 min.", value: 15},
            {key: "30 min.", value: 30}, {key: "45 min.", value: 45}, {key: "1 h.", value: 60},];
        const serviceTimes = [
            {key: "1 month", value: 43200},
            {key: "2 months", value: 86400}, {key: "3 months", value: 131400},
            {key: "4 months", value: 175200}, {key: "5 months", value: 219000},
            {key: "6 months", value: 262800}, {key: "7 months", value: 306600},
            {key: "8 months", value: 350400}, {key: "9 months", value: 394200},
            {key: "10 months", value: 438000}, {key: "11 months", value: 481801},
            {key: "12 months", value: 525601}, {key: "24 months", value: 1051202}];
        return (
            <ReusableCard header={this.props.message.id === -1 ? "New Message" : this.props.message.name}
                          collapsed={this.props.open}
                          delete={() => this.props.message.id !== -1 ? this.props.deleteMessage(this.props.user.companies[0].id, this.props.message.id, this.props.index) : this.props.deleteLocalMessage()}
                          id={this.props.message.id}>
                <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Name</Label>
                    </Col>
                    <Col md={10}>
                        <FormGroup className="m-0">
                            <Input type="text"
                                   onChange={(e) => this.handleFormInput("name", e.target.value)}
                                   value={this.state.message.name ? this.state.message.name : ""}/>
                            <FormFeedback>{this.error("name")}</FormFeedback>
                        </FormGroup>
                    </Col>
                </Row>
                {this.props.type.before && <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Send</Label>
                    </Col>
                    <Col md={4}>
                        <Input type="select"
                               onChange={(e) => this.handleFormInput("offset", -e.target.value)}
                               value={-Number(this.state.message.offset)}>
                            {messageTime.map((time) => {
                                return (
                                    <option key={time.value}
                                            value={-time.value}
                                            className="messages-dropdown-item">{time.key}</option>
                                )
                            })}
                        </Input>
                        <FormFeedback/>
                    </Col>
                    <Col md={6}>
                        <Label style={{marginBottom: '0'}}>prior to each appointment</Label>
                    </Col>
                </Row>}

                {this.props.type.after && <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Send</Label>
                    </Col>
                    <Col md={4}>
                        <Input type="select" value={this.state.message.offset}
                               onChange={(e) => this.handleFormInput("offset", e.target.value)}
                        >
                            {serviceTimes.map((time) => {
                                return (
                                    <option key={time.value}
                                            value={time.value}
                                            className="messages-dropdown-item">{time.key}</option>
                                )
                            })}
                        </Input>
                        <FormFeedback/>
                    </Col>
                    <Col md={6}>
                        <Label style={{marginBottom: '0'}}>after last service</Label>
                    </Col>
                </Row>}
                <Row className="d-flex align-items-center mb-2">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Template</Label>
                    </Col>
                    <Col md={4}>
                        <FormGroup className="mb-0">
                            <Input type="select"
                                   value={this.props.messageType === "email" ? this.state.message.email_template ? this.state.message.email_template.id : 0 :
                                       this.state.message.sms_template ? this.state.message.sms_template.id : 0}
                                   onChange={(e) => {
                                       this.changeTemplate(e.target.value)
                                   }}>
                                {this.props.templates.map((template, i) => {
                                    return (
                                        <option
                                            value={template.id}
                                            key={template.id}
                                            className="messages-dropdown-item">{template.name}</option>
                                    )
                                })}
                            </Input>
                            <FormFeedback>{this.error(this.props.messageType === "email" ? "email_template_id" : "sms_template_id")}</FormFeedback>
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <Button
                            className="w-100"
                            style={{whiteSpace: 'normal'}}
                            onClick={() => {
                                this.setState({preview: !this.state.preview})
                            }}
                            color="info">Preview Template</Button>
                        <FormFeedback/>
                    </Col>
                </Row>
                {this.state.preview && <Editor value={this.state.selected.template}
                                               init={{
                                                   plugins: 'link image code autoresize lists',
                                                   theme: "modern",
                                                   mobile: {
                                                       theme: 'mobile'
                                                   },
                                                   file_picker_types: 'image',
                                                   toolbar: 'fontselect | undo redo | bold italic | alignleft aligncenter alignright | numlist bullist | image | code',
                                                   images_upload_handler: this.handleImageUpload,
                                                   selector: "textarea",
                                                   autoresize_max_height: 250,
                                                   setup: (editor) => {
                                                       this.editor = editor;
                                                       this.setupEditor();
                                                   },
                                                   font_formats: 'Verdana=Verdana,sans-serif;Tahoma=tahoma, geneva, sans-serif;Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace'
                                               }}
                                               onEditorChange={content => this.handleInput("template", content)}/>}
                {this.props.type.service && <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>For</Label>
                    </Col>
                    <Col md={4}>
                        <Dropdown
                            className="mb-2"
                            isOpen={this.state.dropdownOpen}
                            toggle={() => this.setState({dropdownOpen: !this.state.dropdownOpen})}>
                            <DropdownToggle
                                className="select-service-button">
                                Select Service
                                &nbsp;
                                <Icon icon={faCaretDown}/>
                            </DropdownToggle>
                            <DropdownMenu>
                                {this.state.services.map((service, i) => {
                                    return (
                                        <label key={service.id} className="services-dropdown">
                                            <input type="checkbox"
                                                   value={service.checked}
                                                   checked={service.checked}
                                                   onChange={() => {
                                                       let services = this.state.services;
                                                       services[i].checked = !services[i].checked;
                                                       this.setState({services});
                                                   }}/>&nbsp;<span>{service.name}</span>
                                        </label>
                                    )
                                })}
                            </DropdownMenu>
                        </Dropdown>
                        <FormFeedback/>
                    </Col>
                </Row>}
                {this.props.type.delay && <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Delay</Label>
                    </Col>
                    <Col md={4}>
                        <Input type="select"
                               onChange={(e) => this.handleFormInput("offset", e.target.value)}
                               value={this.state.message.offset ? this.state.message.offset : ""}>
                            {delayTime.map((time) => {
                                return (
                                    <option key={time.value}
                                            value={time.value}
                                            className="messages-dropdown-item">{time.key}</option>
                                )
                            })}
                        </Input>
                        <FormFeedback/>
                    </Col>
                </Row>}
                <Row className="d-flex mb-2 align-items-center">
                    <Col md={2}>
                        <Label style={{marginBottom: '0'}}>Status</Label>
                    </Col>
                    <Col md={4}>
                        <Toggle
                            inactiveText="Disabled"
                            activeText="Enabled"
                            onClick={() => {
                                this.handleFormInput("enabled", !this.state.message.enabled)
                            }}
                            value={this.state.message.enabled !== undefined ? this.state.message.enabled : false}
                        />
                        <FormFeedback/>
                    </Col>
                </Row>
                <Button disabled={this.props.request.pending} color="success" className="mr-2"
                        type="submit" onClick={() => this.saveMessage()}>
                    {this.props.request.pending ? <Icon spin icon={faSync}/> : ''}
                    Save Changes</Button>
            </ReusableCard>
        )
    }
}

export default AutomaticMessage;
