import React from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import InputField from "../InputField";

const chartTypes = [
    {key: "line", label: "Line Chart"},
    {key: "bar", label: "Bar Chart"},
    {key: "pie", label: "Pie Chart"}
];

const dataType = (label, api, filter, options) => ({label, api, filter, options});

const dataTypes = [
    dataType("New Clients", "company.customers", {})
];

class ChartDialog extends React.Component {

    handleFormInput = (field, value) => {
        this.setState({[field]: value});
    };

    render() {
        const {isOpen, toggle} = this.props;
        const {type, disabled} = this.state;
        return (
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    Chart Element Options
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <InputField handleFormInput={this.handleFormInput}
                                    type="select"
                                    disabled={disabled}
                                    label={"Chart Type"} name={"type"}
                                    required
                                    value={type}>
                            {chartTypes.map(type =>
                                <option value={type.key}>{type.label}</option>
                            )}
                        </InputField>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="success">Save</Button>
                </ModalFooter>
            </Modal>
        )
    }
}
