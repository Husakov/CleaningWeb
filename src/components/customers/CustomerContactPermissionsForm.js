import React from 'react'
import {Row} from "reactstrap";
import InputField from "../InputField";

class CustomerContactPermissionsForm extends React.Component {

    render() {
        return (
            <Row>
                {this.props.permissions.map(permission =>
                    <InputField key={permission.id}
                                handleFormInput={this.props.handleInput}
                                label={`${permission.name} ${permission.type}`}
                                type="toggle"
                                colRatio="8:4"
                                name={`${permission.id}`}
                                value={permission.enabled}
                                disabled={this.props.disabled}/>
                )}
            </Row>
        )
    }
}

export default CustomerContactPermissionsForm;
