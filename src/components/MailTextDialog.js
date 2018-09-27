import React from 'react';
import InputField from './InputField';
import {
    Button, Col, Row, Modal, ModalHeader, ModalBody,
    FormFeedback, Label, Input
} from 'reactstrap';
import { faSync } from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'
import { Editor } from '@tinymce/tinymce-react'
import { getError } from "../util";
import { mailTemplate } from '../api';

class MailTextDialog extends React.Component {
    state = {
        emails: "",
        phone: "",
        content: '',
        subject: "",
        type: "Email",
        tags: []
    };
    componentWillReceiveProps(newProps) {
        this.setState({ email: newProps.customer.email, phone: newProps.customer.phone_number });
        //close after request fulfilled
        if (this.props.sendingMessage.pending && newProps.sendingMessage.fulfilled)
            this.props.close();
    }
    handleFormInput = (field, data) => {
        this.setState({ [field]: data });
    };
    componentWillMount() {
        this.setState({ emails: [this.props.customer.email], phone: this.props.customer.phone_number });
    };
    setupEditor() {
        if (!this.editor) return;
        let tags = [...this.props.tags];
        //filter all quote.url tags no need for them inside 
        if (!this.props.quote)
            tags = tags.filter(tag => tag.tag !== "quote.url");
        tags.forEach(tag => {
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

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    }

    send() {
        //send mail api goes gere
        //recipients is expected as array
        const body = {
            subject: this.state.subject,
            template: this.state.content,
            recipients: this.state.emails
        }
        this.props.sendMessage(this.props.selectedCompanyId, this.props.appointmentId, body, this.state.type === "Email" ? true : false);
    }

    render() {
        const { emails, subject } = this.state;
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>
                    Contact {this.props.customer && (this.props.customer.first_name + " " + this.props.customer.last_name)}
                </ModalHeader>
                <ModalBody>
                    <Row className="send-email">
                        <Col className="d-flex input-row mb-2 p-0" md={12}>
                            <Col md={4} className="d-flex align-items-center">
                                <Label for="Type">
                                    Type:
                                </Label>
                            </Col>
                            <Col md={8}>
                                <Input type="select" onChange={(e) => this.setState({ type: e.target.value })}>
                                    <option>Email</option>
                                    <option>Text</option>
                                </Input>
                                <FormFeedback ></FormFeedback>
                            </Col>
                        </Col>
                        {this.state.type === "Text" && <InputField label="Phone Number: "
                            value={this.state.phone}
                            placeholder="Phone Number"
                            prepend="+1"
                            handleFormInput={this.handleFormInput}
                            name="phone"
                            error={this.error("phone_number")} />}

                        {this.state.type === "Email" && <InputField label="Recipient(s)"
                            value={emails}
                            handleFormInput={this.handleFormInput}
                            options={this.props.customers.map((customer) => ({
                                value: customer.email,
                                label: customer.email
                            }))}
                            name="emails"
                            error={this.error("recipients")}
                            type="multi-select" />}

                        {this.state.type === "Email" && <InputField label="Subject: "
                            value={subject}
                            error={this.error("subject")}
                            placeholder="Subject"
                            handleFormInput={this.handleFormInput}
                            name="subject" />}
                        <Col>
                            <Editor value={this.state.content}
                                init={{
                                    plugins: 'link image code autoresize lists',
                                    theme: "modern",
                                    mobile: {
                                        theme: 'mobile'
                                    },
                                    file_picker_types: 'file',
                                    toolbar: 'fontselect | undo redo | bold italic | alignleft aligncenter alignright | numlist bullist | image ',
                                    images_upload_handler: this.handleImageUpload,
                                    files_upload_handler: this.handleFileInput,
                                    setup: (editor) => {
                                        this.editor = editor;
                                        this.setupEditor();
                                    },
                                    font_formats: 'Verdana=Verdana,sans-serif;Tahoma=tahoma, geneva, sans-serif;Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace'
                                }}
                                onEditorChange={content => this.setState({ content })} />
                            <FormFeedback >{this.error("template")}</FormFeedback>
                        </Col>

                        <Col md={{ size: 4, offset: 8 }}>
                            <Button color="success" disabled={this.props.sendingMessage.pending} onClick={() => this.send()}
                                className="w-100 mt-3"> {this.props.sendingMessage.pending ? <Icon spin icon={faSync} /> : ''}Send {this.state.type === "Email" ? "Mail" : "Text"}</Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        )
    }
}

export default MailTextDialog;
