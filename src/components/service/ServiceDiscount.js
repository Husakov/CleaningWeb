import React from 'react'
import {Button, CardBody, Col, Row} from "reactstrap";
import {InputField} from "../InputField";
import DiscountModel from "../../model/discount";
import Toggle from "../Toggle";
import {getError} from "../../util";
import DraggableCard from "../DraggableCard";

export default class ServiceDiscount extends React.Component {

    handleFormInput = (prop, value) => {
        prop = `discounts.${this.props.index}.${prop}`;

        this.props.handleFormInput(prop, value);
    };

    error(name) {
        if (!this.props.error) return undefined;
        return getError(this.props.error.errors, name);
    }

    render() {
        return <DraggableCard disabled={this.props.disabled} delete={this.props.deleteDiscount}
                              reorder={this.props.reorder} reorderSave={this.props.reorderSave}
                              collapsed={this.props.discount.id !== -1} index={this.props.index}
                              id={this.props.discount.id} header={<h5 className="mb-0">{this.props.discount.label}</h5>}
                              deleteMessage="Delete this Frequency?" deleteTitle="Delete Frequency"
                              mlauto={true} className={this.props.discount.id === -1 ? 'new-discount' : ''}>
            <CardBody>
                <Row>
                    <InputField handleFormInput={this.handleFormInput}
                                label="Name" name="label"
                                value={this.props.discount.label} disabled={this.props.disabled}
                                error={this.error("label")}
                                required
                                type="text"/>
                    <InputField handleFormInput={this.handleFormInput}
                                label={"Discount Type"} name={"type"}
                                value={this.props.discount.type} disabled={this.props.disabled}
                                error={this.error("type")}
                                required
                                type="select">
                        {DiscountModel.types.map(type =>
                            <option key={type.value} value={type.value}>{type.label}</option>
                        )}
                    </InputField>
                    <InputField handleFormInput={this.handleFormInput}
                                label="Value" name="value"
                                required
                                error={this.error("value")}
                                prepend={this.props.discount.type === "f" ? "$" : "%"}
                                value={this.props.discount.value} disabled={this.props.disabled}
                                type="number"/>
                    <Col md={4}>
                        Online Booking
                        <span className="text-danger">*</span>
                    </Col>
                    <Col md={8} className="mb-2">
                        <Toggle activeText="Enabled" inactiveText="Disabled"
                                value={this.props.discount.enabled}
                                onClick={() => this.handleFormInput('enabled', !this.props.discount.enabled)}/>
                    </Col>
                    <Col md={8} className="offset-md-4">
                        <Button color="success" onClick={this.props.saveDiscount}>Save
                            Discount</Button></Col>
                </Row>
            </CardBody>
        </DraggableCard>
    }
}
