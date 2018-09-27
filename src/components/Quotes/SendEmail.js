import React from 'react';
import InputField from '../InputField';
import {Button, Col, Row} from 'reactstrap';
import {faSync} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'
import {Editor} from '@tinymce/tinymce-react'
import {mailTemplate} from '../../api';
import {getError} from "../../util";


class SendEmail extends React.Component {
    state = {
        emails: [],
        templates: [],
        content: '',
        subject: ''
    };
    changeTemplate = (field, id) => {
        const template = this.state.templates.find(t => t.id == id);
        this.setState({id: id, content: template.template, subject: template.subject});
    };
    handleFormInput = (field, data) => {
        this.setState({emails: data});
    };

    async componentWillMount() {
        const templates = await mailTemplate(this.props.user.selectedCompany.id).list();
        this.setState({templates, content: "{quote.url}", subject: this.props.quote.title, id: ""});
    };

    componentDidMount() {
        const customer = this.props.customers.find(customer => customer.id == this.props.selectedCustomer);
        this.setState({emails: [customer.email]})
    };

    setupEditor() {
        if (!this.editor) return;
        const tags = [...this.props.tags];
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
        this.props.sendMail(this.props.user.selectedCompany.id, this.props.quote.id, {
            subject: this.state.subject,
            template: this.state.content,
            recipients: this.state.emails
        })
    }

    render() {
        const {emails, subject} = this.state;
        return (
            <Row className="send-email">
                <InputField label="Recipient(s)"
                            value={emails}
                            handleFormInput={this.handleFormInput}
                            options={this.props.customers.map((customer) => ({
                                value: customer.email,
                                label: customer.email
                            }))}
                            name="emails"
                            error={this.error("recipients")}
                            type="multi-select"/>
                <InputField label="Subject"
                            value={subject}
                            error={this.error("subject")}
                            handleFormInput={this.handleFormInput}
                            name="subject"/>
                <InputField type="select"
                            label="Select Template"
                            value={this.state.id}
                            handleFormInput={this.changeTemplate}>
                    {this.state.templates.map((template, i) => {
                        return (
                            <option
                                value={template.id}
                                key={template.id} className="messages-dropdown-item">{template.name}</option>
                        )
                    })}
                </InputField>
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
                            onEditorChange={content => this.setState({content})}/>
                </Col>
                <Col md={{size: 4, offset: 8}}>
                    <Button color="success" disabled={this.props.request.pending} onClick={() => this.send()}
                            className="w-100 mt-3"> {this.props.request.pending ? <Icon spin icon={faSync}/> : ''} Send
                        Quote</Button>
                </Col>
            </Row>
        )
    }
}

export default SendEmail;
