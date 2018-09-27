import React from 'react'
import {faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import PropTypes from 'prop-types'
import classSet from "react-classset";
import Icon from '@fortawesome/react-fontawesome'
import {Button, CardBody, Col, FormFeedback, Input, InputGroup, InputGroupAddon, InputGroupText, Row} from "reactstrap";
import PricingModel from "../../model/pricing";
import {getError} from "../../util";
import DraggableCard from "../DraggableCard";
import {InputField} from "../InputField";

InputField.propTypes = {
    handleFormInput: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    disabled: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired
};

class ServicePricing extends React.Component {

    handleFormInput = (prop, value) => {
        prop = `pricings.${this.props.index}.${prop}`;

        this.props.handleFormInput(prop, value);
    };

    handleTimeInput(field, value, prop, i) {
        let time;
        time = this.props.pricing.rules[i].duration % 60;
        if (prop === "hour") {
            time += value * 60;
        } else {
            time = this.props.pricing.rules[i].duration - time;
            time += Number(value);
        }
        this.handleFormInput(field, ~~time)
    }

    calculateMax(rule) {
        return rule.to * rule.value
    }

    error(name) {
        if (!this.props.error) return undefined;
        return getError(this.props.error.errors, name);
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
        return <DraggableCard delete={this.props.deletePricing}
                              reorder={this.props.reorder} reorderSave={this.props.reorderSave}
                              disabled={this.props.disabled} collapsed={this.props.pricing.id !== -1}
                              index={this.props.index} id={this.props.pricing.id}
                              header={<h5 className="service-title mb-0">{this.props.pricing.unit}</h5>}
                              deleteMessage="Delete this Pricing?" deleteTitle="Delete Pricing" mlauto={true}
                              className={this.props.pricing.id === -1 ? 'new-pricing' : ''}>
            <CardBody>
                <Row>
                    <InputField handleFormInput={this.handleFormInput}
                                label={"Pricing Type"} name={"type"}
                                value={this.props.pricing.type} disabled={this.props.disabled}
                                required
                                type="select" error={this.error("type")}>
                        {PricingModel.types.map(type =>
                            <option key={type.value} value={type.value}>{type.label}</option>
                        )}
                    </InputField>
                    <InputField handleFormInput={this.handleFormInput}
                                type="text"
                                disabled={this.props.disabled}
                                label={"Unit Name"} name={"unit"}
                                error={this.error("unit")}
                                required
                                value={this.props.pricing.unit}/>
                    <InputField handleFormInput={this.handleFormInput}
                                type="number"
                                error={this.error("maxvalue")}
                                required
                                label={"Max Limit"} name={"maxvalue"}
                                value={this.props.pricing.maxvalue}
                                disabled={this.props.disabled}/>
                    {this.props.pricing.type === "flat" && [
                        <InputField handleFormInput={this.handleFormInput}
                                    key="baseprice"
                                    type="number"
                                    prepend="$"
                                    required
                                    error={this.error("rules.0.value")}
                                    append="each"
                                    label={"Base Price"} name={"rules.0.value"}
                                    value={this.props.pricing.rules[0].value}
                                    disabled={this.props.disabled}/>,
                        <InputField handleFormInput={(a, b, c) => this.handleTimeInput(a, b, c, 0)}
                                    key="duration"
                                    required
                                    error={this.error("rules.0.duration")}
                                    label={"Duration"} name={"rules.0.duration"}
                                    value={this.props.pricing.rules[0].duration}
                                    disabled={this.props.disabled} type="time"/>
                    ]}
                    {(this.props.pricing.rules.length > 1 || this.props.pricing.type === "range") ?
                        <Col key="ruleLabel" md={4}>Price rules</Col> : null}
                    {this.props.pricing.rules.map((rule, i) => {
                        if (this.props.pricing.type === "flat" && i === 0) return null;
                        return [<Col key={i} md={8} className={classSet({
                            'offset-md-4': i > 1 || (this.props.pricing.type === "range" && i > 0),
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
                                {this.props.pricing.type === "flat" && <InputGroupAddon
                                    addonType="append"><InputGroupText>each(max: {this.calculateMax(rule)})</InputGroupText></InputGroupAddon>}
                            </InputGroup>
                            {this.props.pricing.type === "range" && [
                                <InputGroup key="h" style={{maxWidth: '120px'}}>
                                    <InputGroupAddon addonType="prepend">H</InputGroupAddon>
                                    <Input type="number"
                                           disabled={this.props.disabled}
                                           placeholder="Hour"
                                           invalid={this.error(`rules.${i}.duration`)}
                                           value={~~(rule.duration / 60) === 0 ? '' : ~~(rule.duration / 60)}
                                           onChange={e => this.handleTimeInput(`rules.${i}.duration`, e.target.value, "hour", i)}/>
                                </InputGroup>,
                                <InputGroup key="m" style={{maxWidth: '120px'}}>
                                    <InputGroupAddon addonType="prepend">M</InputGroupAddon>
                                    <Input type="number"
                                           disabled={this.props.disabled}
                                           placeholder="Min"
                                           invalid={this.error(`rules.${i}.duration`)}
                                           value={~~(rule.duration % 60) === 0 ? '' : ~~(rule.duration % 60)}
                                           onChange={e => this.handleTimeInput(`rules.${i}.duration`, e.target.value, "minute", i)}/>
                                </InputGroup>
                            ]}
                            <Button color="danger" onClick={() => this.props.removePricingRule(i)}><Icon
                                icon={faTrash}/></Button>
                        </Col>,
                            <Col md={8}
                                 className="offset-md-4 mb-2"><FormFeedback>{this.rowError(i)}</FormFeedback></Col>]
                    })}
                    <Col className="mb-2 offset-md-4" md={12}>
                        <Button color="success" onClick={this.props.addPricingRule}>Add Pricing Rule</Button>
                    </Col>
                    <Col md={8} className="offset-md-4"><Button color="success" onClick={this.props.savePricing}>Save
                        Pricing</Button></Col>
                </Row>
            </CardBody>
        </DraggableCard>
    }
}

ServicePricing.propTypes = {
    pricing: PropTypes.instanceOf(PricingModel).isRequired,
    handleFormInput: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired
};

export default ServicePricing;
