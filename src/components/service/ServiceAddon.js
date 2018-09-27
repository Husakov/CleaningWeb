import React from 'react'
import {
    Button,
    ButtonDropdown,
    CardBody,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormFeedback,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Row
} from "reactstrap";
import {faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import classSet from "react-classset";
import {InputField} from "../InputField";
import ImageInput from "../ImageInput/ImageInput";
import {absoluteUrl, getError} from "../../util";
import Icon from '@fortawesome/react-fontawesome';
import './ServiceAddon.css';
import DraggableCard from "../DraggableCard";

const icon = (title, icon) => ({title, icon: `/icons/ct-icon-${icon}.png`});

const icons = [
    icon("Inside Fridge", 'fridge'),
    icon("Inside Oven", 'oven'),
    icon("Inside Windows", 'inside-window'),
    icon("Carpet Cleaning", 'carpet'),
    icon("Green Cleaning", 'green-cleaning'),
    icon("Pets Care", 'pets'),
    icon("Tiles Cleaning", 'tiles'),
    icon("Wall Cleaning", 'wall-cleaning'),
    icon("Laundry", 'laundry'),
    icon("Basement Cleaning", 'basement')
];

export default class ServiceAddon extends React.Component {

    handleSampleImage = (icon) => {
        this.setState({preview: icon.icon});
        this.handleFormInput('image', absoluteUrl(icon.icon));
        this.props.addon.imageFile = undefined;
    };
    handleFormInput = (prop, value) => {
        prop = `addons.${this.props.index}.${prop}`;

        this.props.handleFormInput(prop, value);
    };
    handleImage = (e) => {
        let reader = new FileReader();
        const image = e.target.files[0];
        this.props.addon.imageFile = e.target.files[0];
        reader.readAsDataURL(image);

        reader.onloadend = () => {
            this.setState({
                preview: reader.result
            });
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            preview: props.addon.image
        };
    }

    handleTimeInput(field, value, prop, i) {
        let time;
        time = this.props.addon.rules[i].duration % 60;
        if (prop === "hour") {
            time += value * 60;
        } else {
            time = this.props.addon.rules[i].duration - time;
            time += Number(value);
        }
        this.handleFormInput(field, ~~time)
    }

    error(name) {
        if (!this.props.error) return undefined;
        return getError(this.props.error.errors, name);
    }

    calculateMax(rule) {
        return rule.to * rule.value
    }

    rowError(i) {
        const props = [
            'from',
            'to',
            'value',
            'duration'
        ];
        for (const prop in props) {
            let error = this.error(`rules.${i}.${props[prop]}`);
            if (error !== undefined) return error;
        }
        return undefined;
    }

    render() {
        const header = [
            <img key={0} src={this.props.addon.image} className="addon-image mr-2"/>,
            <h5 key={1} className="service-title mb-0 ">{this.props.addon.title}</h5>
        ];
        return <DraggableCard header={header} id={this.props.addon.id} index={this.props.index}
                              collapsed={this.props.addon.id !== -1} disabled={this.props.disabled}
                              reorder={this.props.reorder} reorderSave={this.props.reorderSave}
                              delete={this.props.deleteAddon}
                              deleteMessage="Delete this Add-on?" deleteTitle="Delete addon"
                              mlauto={true} className={this.props.addon.id === -1 ? 'new-addon' : ''}>
            <CardBody>
                <Row>
                    <InputField handleFormInput={this.handleFormInput}
                                label="Name" name="title"
                                value={this.props.addon.title}
                                disabled={this.props.disabled}
                                required
                                error={this.error('title')}
                                type="text"/>
                    <Col md={4}>Image<span className="text-danger">*</span></Col>
                    <Col md={8} className="offset-md-4 d-flex align-items-center">
                        <ImageInput value={this.state.preview} onChange={this.handleImage}/>
                        <h5 className="mx-2">or</h5>
                        <ButtonDropdown isOpen={this.state.iconDropdown}
                                        toggle={() => this.setState({iconDropdown: !this.state.iconDropdown})}
                                        direction="down">
                            <DropdownToggle caret>
                                Sample Image
                            </DropdownToggle>
                            <DropdownMenu className="sample-icon-menu">
                                {icons.map((icon, i) => (
                                    <DropdownItem key={i} className="sample-icon-item"
                                                  onClick={() => this.handleSampleImage(icon)}>
                                        <img src={icon.icon}/>
                                        <span>{icon.title}</span>
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </ButtonDropdown>
                    </Col>
                    <Col md={8} className="offset-md-4 mb-2"><FormFeedback>{this.error("image")}</FormFeedback></Col>
                    <InputField handleFormInput={this.handleFormInput}
                                label="Max Amount" name="maxvalue"
                                value={this.props.addon.maxvalue}
                                disabled={this.props.disabled}
                                error={this.error('maxvalue')}
                                required
                                type="text"/>
                    <InputField handleFormInput={this.handleFormInput}
                                type="number"
                                prepend="$"
                                error={this.error("rules.0.value")}
                                append="each"
                                required
                                label={"Base Price"} name={"rules.0.value"}
                                value={this.props.addon.rules[0].value}
                                disabled={this.props.disabled}/>
                    <InputField handleFormInput={(a, b, c) => this.handleTimeInput(a, b, c, 0)}
                                error={this.error("rules.0.duration")}
                                label={"Duration"} name={"rules.0.duration"}
                                required
                                value={this.props.addon.rules[0].duration}
                                disabled={this.props.disabled} type="time"/>
                    {this.props.addon.rules.length > 1 ? <Col key="ruleLabel" md={4}>Price rules</Col> : null}
                    {this.props.addon.rules.map((rule, i) => {
                        if (i === 0) return null;
                        return [<Col key={`${i}_${0}`} md={8} className={classSet({
                            'offset-md-4': i > 1,
                            'd-flex input-row': true
                        })}>
                            <Input type="number" placeholder="From"
                                   value={rule.from}
                                   invalid={this.error(`rules.${i}.from`)}
                                   style={{maxWidth: '100px'}}
                                   onChange={(e) => this.handleFormInput(`rules.${i}.from`, e.target.value)}/>
                            <Input type='number' placeholder="To"
                                   value={rule.to}
                                   invalid={this.error(`rules.${i}.to`)}
                                   style={{maxWidth: '100px'}}
                                   onChange={e => this.handleFormInput(`rules.${i}.to`, e.target.value)}/>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                                <Input type="number" placeholder="Price"
                                       value={rule.value}
                                       invalid={this.error(`rules.${i}.value`)}
                                       onChange={e => this.handleFormInput(`rules.${i}.value`, e.target.value)}/>
                                <InputGroupAddon addonType="append">
                                    <InputGroupText>each(max: {this.calculateMax(rule)})</InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
                            <Button color="danger" onClick={() => this.props.removeAddonRule(i)}><Icon
                                icon={faTrash}/></Button>
                        </Col>,
                            <Col key={`${i}_${1}`} md={8}
                                 className="offset-md-4 mb-2"><FormFeedback>{this.rowError(i)}</FormFeedback></Col>]
                    })}
                    <Col className="mb-2 offset-md-4" md={12}>
                        <Button color="success" onClick={this.props.addAddonRule}>Add Pricing Rule</Button>
                    </Col>
                    <Col md={8} className="offset-md-4"><Button color="success" onClick={this.props.saveAddon}>Save
                        Add-on</Button></Col>
                </Row>
            </CardBody>
        </DraggableCard>
    }
}
