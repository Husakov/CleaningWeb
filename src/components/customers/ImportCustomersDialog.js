import React from 'react';
import {Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {company} from "../../api";
import {connect} from "react-redux";
import sampleFile from './samplefile.csv';
import classnames from "classnames";
import Spinner from 'react-spinkit';
import moment from "moment/moment";

class ImportCustomersDialog extends React.Component {

    state = {
        response: null,
        processing: false,
        loaded: false
    };
    handleChange = e => {
        this.setState({file: e.target.files[0], loaded: true});
    };
    getFailed = () => {
        const data = this.state.response.Failed.reduce((data, line) => data + line + "\n", "");

        const url = URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `customers-failed-${moment().format("MM-DD-YYYY")}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    async import() {
        const form = new FormData();
        form.append("file", this.state.file);
        this.setState({processing: true});
        try {
            const response = await company.import(this.props.user.selectedCompany.id, form);
            this.setState({response, processing: false});
        } catch (e) {
            this.setState({response: {Error: e.message}, processing: false})
        }
    }

    render() {
        const {toggle, isOpen} = this.props;
        return (
            <Modal toggle={toggle} isOpen={isOpen}>
                <ModalHeader toggle={toggle}>Import Customers</ModalHeader>
                <ModalBody className="position-relative" style={{minHeight: 100}}>
                    <Row>
                        <Col xs={12}>
                            <Input type="file" onChange={this.handleChange}/>
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-around p-4">
                        {this.state.response && Object.keys(this.state.response).filter(key => key !== "Failed").map((key, i) =>
                            <h5 key={i} className="mb-0"><strong>{key}: </strong>{this.state.response[key]}</h5>
                        )}
                    </Row>
                    <Button className={classnames({
                        "d-none": true,
                        "d-block": this.state.response && this.state.response.Fail > 0
                    })} color="link" onClick={this.getFailed}>Download Failed Customer CSV</Button>
                    <div className={classnames({
                        "position-absolute w-100 h-100 align-items-center justify-content-center flex-column bg-white": true,
                        "d-none": !this.state.processing,
                        "d-flex": this.state.processing
                    })} style={{top: 0, left: 0}}>
                        <Spinner name="circle"/>
                        <h5 className="mb-0 mt-2">This may take a few minutes</h5>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <a className="btn btn-link" href={sampleFile} download="sample.csv">Download sample file</a>
                    <Button color="success" onClick={() => this.import()} disabled={!this.state.loaded}>Import</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

function mapState(state) {
    return {
        user: state.user
    }
}

export default connect(mapState)(ImportCustomersDialog);
