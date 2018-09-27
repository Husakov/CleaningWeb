import React, {Fragment} from 'react'
import {Editor} from '@tinymce/tinymce-react'
import {
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Nav,
    NavItem,
    NavLink,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row
} from "reactstrap";
import './Templates.css'
import {faPlus, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'
import MailTemplate from "../../model/mailTemplate";
import {connect} from "react-redux";
import {image as imageapi, mailTemplate, smsTemplate} from '../../api'
import classSet from "react-classset";
import SMSTemplate from "../../model/smsTemplate";
import {toast} from "react-toastify";

const EMAIL = 0;
const SMS = 1;

class Templates extends React.Component {
    state = {
        templates: [],
        tags: [],
        selected: {},
        deletePopoverOpen: false,
        templateTab: 0,
        tagDropdownOpen: false
    };
    handleImageUpload = async (blobInfo, success, failure) => {
        const form = new FormData();
        form.append("image", blobInfo.blob());
        try {
            const res = await imageapi.upload(form);
            success(res.location);
        } catch (err) {
            failure(JSON.stringify(failure));
        }
    };
    toggleTagDropdown = () => {
        this.setState({tagDropdownOpen: !this.state.tagDropdownOpen})
    };

    async setupTemplates(type) {
        this.setState({selected: {}});
        if (type === EMAIL) {
            this.api = mailTemplate(this.props.user.selectedCompany.id);
            this.model = MailTemplate;
        } else {
            this.api = smsTemplate(this.props.user.selectedCompany.id);
            this.model = SMSTemplate;
        }
        const templates = await this.api.list();

        this.setState({templates});
        this.setupEditor();
    }

    async componentDidMount() {
        this.setupTemplates(this.state.templateTab);
        const tags = await mailTemplate(this.props.user.selectedCompany.id).tags();
        this.setState({tags});
    }

    toggleTemplateTab(pos) {
        this.setState({templateTab: pos});
        this.setupTemplates(pos);
    }

    setupEditor() {
        if (!this.editor) return;
        this.state.tags.forEach(tag => {
            const labels = tag.tag.split(".").reduce((data, label) => [...data, ...label.split("_")], []);
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

    createTemplate() {
        this.selectTemplate(this.props.user.selectedCompany.id)
    }

    selectTemplate(template) {
        this.setState({selected: new this.model(template)});
        this.unchangedTemplate = template;
    }

    resetTemplate() {
        if (!this.unchangedTemplate) return;
        this.setState({selected: new this.model(this.unchangedTemplate)})
    }

    async saveTemplate() {
        const templates = this.state.templates;
        const selected = this.state.selected;
        let response;
        if (selected.id === -1) {
            response = await this.api.create(selected);
            templates.push(response);
            toast.success("Template added!")
        } else {
            response = await this.api.update(selected.id, selected);
            const idx = templates.findIndex(t => t.id === response.id);
            templates.splice(idx, 1, response);
            toast.success("Template edited!");
        }
        this.unchangedTemplate = response;
        this.setState({templates, selected: new this.model(response)});
        this.props.notifyTemplatesChanged(templates);
    }

    async removeTemplate() {
        if (this.state.selected.id === -1)
            this.setState({selected: null, deletePopoverOpen: false});
        else {
            const templates = this.state.templates;
            const selected = this.state.selected;
            await this.api.delete(selected.id);
            toast.success("Template removed!");
            const idx = templates.findIndex(t => t.id === selected.id);
            templates.splice(idx, 1);
            this.setState({templates, selected: {}, deletePopoverOpen: false});
            this.props.notifyTemplatesChanged(templates);
        }
    }

    handleInput(prop, value) {
        const selected = this.state.selected;
        selected[prop] = value;
        this.setState({selected});
    }

    render() {
        return (
            <Row className="templates">
                <Col md={2} className="customer-actions">
                    <Nav tabs>
                        <NavItem className="w-50 text-center">
                            <NavLink className={classSet({active: this.state.templateTab === 0})}
                                     onClick={() => this.toggleTemplateTab(0)}>E-Mail</NavLink>
                        </NavItem>
                        <NavItem className="w-50 text-center">
                            <NavLink className={classSet({active: this.state.templateTab === 1})}
                                     onClick={() => this.toggleTemplateTab(1)}>Text</NavLink>
                        </NavItem>
                    </Nav>
                    <Button color="success" className="mt-2 mb-1" onClick={() => this.createTemplate()}><Icon
                        icon={faPlus}/> Add New Template</Button>
                    {this.state.templates.map(template =>
                        <Button key={template.id} color="link" className="px-2 py-0 w-100 text-left"
                                onClick={() => this.selectTemplate(template)}>{template.name}</Button>
                    )}
                </Col>
                {this.state.selected.id && <Col md={10} className="editor-container">
                    <div className="my-2 d-block">
                        <Button color="success" className="mr-2" onClick={() => this.saveTemplate()}>Save</Button>
                        <Button color="primary" className="mr-2" onClick={() => this.resetTemplate()}>Discard
                            Changes</Button>
                        <Button id="deleteTemplatePopover" color="danger" className="mr-2"
                                onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}><Icon
                            icon={faTrash}/> Delete</Button>
                        <Popover placement="left"
                                 isOpen={this.state.deletePopoverOpen}
                                 target="deleteTemplatePopover"
                                 toggle={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                            <PopoverHeader>Delete this Template?</PopoverHeader>
                            <PopoverBody className="d-flex justify-content-between">
                                <Button color="danger"
                                        onClick={() => this.removeTemplate()}>
                                    Yes
                                </Button>
                                <Button color="secondary"
                                        onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                                    Cancel
                                </Button>
                            </PopoverBody>
                        </Popover>
                    </div>
                    <div className="d-flex">
                        <div className="d-flex flex-column mr-2">
                            <h5 className="mb-2 d-flex align-items-center" style={{height: "38px"}}>Name</h5>
                            {this.state.templateTab === 0 &&
                            <h5 className="mb-0 d-flex align-items-center" style={{height: "38px"}}>Subject</h5>}
                        </div>
                        <div className="d-flex flex-column">
                            <Input className="mb-2"
                                   type="text"
                                   value={this.state.selected.name}
                                   onChange={e => this.handleInput("name", e.target.value)}/>
                            {this.state.templateTab === 0 &&
                            <Input type="text"
                                   value={this.state.selected.subject}
                                   onChange={e => this.handleInput("subject", e.target.value)}/>
                            }
                        </div>
                    </div>
                    <Row className="mb-2">
                        <Col>
                            {this.state.templateTab === 1 &&
                            <Dropdown toggle={this.toggleTagDropdown} isOpen={this.state.tagDropdownOpen}>
                                <DropdownToggle caret color="primary">Insert Variable</DropdownToggle>
                                <DropdownMenu>
                                    {this.state.tags.map(tag => {
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
                                        return <DropdownItem
                                            onClick={() => this.handleInput("template", `${this.state.selected.template}{${tag.tag}}`)}>{label}</DropdownItem>
                                    })}
                                </DropdownMenu>
                            </Dropdown>}
                        </Col>
                    </Row>
                    {this.state.templateTab === 0 ?
                        <Editor value={this.state.selected.template}
                                init={{
                                    plugins: 'link image code autoresize lists',
                                    theme: "modern",
                                    mobile: {
                                        theme: 'mobile'
                                    },
                                    file_picker_types: 'image',
                                    toolbar: 'fontselect | undo redo | bold italic | alignleft aligncenter alignright | numlist bullist | image | code',
                                    images_upload_handler: this.handleImageUpload,
                                    setup: (editor) => {
                                        this.editor = editor;
                                        this.setupEditor();
                                    },
                                    font_formats: 'Verdana=Verdana,sans-serif;Tahoma=tahoma, geneva, sans-serif;Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace'
                                }}
                                onEditorChange={content => this.handleInput("template", content)}/>
                        :
                        <Fragment>
                            <Input type="textarea" value={this.state.selected.template}
                                   maxLength="160" rows="10"
                                   onChange={e => this.handleInput("template", e.target.value)}/>
                            <span>{this.state.selected.template.length}/160</span>
                        </Fragment>
                    }
                </Col>}
            </Row>
        )
    }
}

function mapState(state) {
    return {
        user: state.user
    }
}

export default connect(mapState)(Templates);
