import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import CustomerModel from "../model/customer";
import PropTypes from 'prop-types';
import CustomerInfoForm from "../components/customers/CustomerInfoForm";
import {setDeepProp} from "../util";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {clearErrors, saveCustomer} from "../reducers/customerReducer";
import {getStaff} from "../reducers/staffReducer";

class CreateCustomerDialog extends React.Component {
    toggle = () => {
        this.setState({customer: new CustomerModel(this.props.customer ? this.props.customer : this.props.user.selectedCompany.id)});
        this.props.clearErrors();
        this.props.toggle();
    };
    handleFormInput = (field, data) => {
        const customer = new CustomerModel(this.state.customer);
        if (field.indexOf(".") !== -1) {
            const fields = field.split(".");
            setDeepProp(customer, data, fields);
        } else {
            customer[field] = data;
        }
        this.setState({customer});
    };
    saveCustomer = () => {
        this.props.saveCustomer(this.props.customer ? this.props.customer.getDiff(this.state.customer) : this.state.customer);
    };

    constructor(props) {
        super(props);
        this.state = {
            customer: new CustomerModel(props.customer ? props.customer : props.user.companies[0].id)
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.creating === true && newProps.creating === false && !newProps.error) {
            this.setState({customer: new CustomerModel(this.state.customer)});
            this.props.clearErrors();
            this.props.toggle();
        }
    }

    componentDidMount() {
        this.props.getStaff(this.props.user.selectedCompany.id);
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.toggle}>
                <ModalHeader
                    toggle={this.toggle}>{this.props.customer ? "Edit Customer" : "Create new Customer"}</ModalHeader>
                <ModalBody>
                    <CustomerInfoForm handleFormInput={this.handleFormInput}
                                      customer={this.state.customer}
                                      disabled={this.props.creating}
                                      staffList={this.props.staff}
                                      errors={this.props.error ? this.props.error.errors : undefined}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={this.saveCustomer}>Save</Button>
                    <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

CreateCustomerDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

function mapState(state) {
    return {
        creating: state.customer.creating,
        error: state.customer.error,
        user: state.user,
        staff: state.staff.staff
    }
}

function mapActions(dispatch) {
    return bindActionCreators({saveCustomer, clearErrors, getStaff}, dispatch)
}

export default connect(mapState, mapActions)(CreateCustomerDialog);
