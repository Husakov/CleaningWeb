import React from 'react';
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import Parser from 'html-react-parser';

class HtmlPreviewDialog extends React.Component {

    render() {
        const {data, url} = this.props;
        return (
            <Modal toggle={this.props.toggle} isOpen={this.props.isOpen} size="lg">
                <ModalHeader toggle={this.props.toggle}>
                    {this.props.title}
                </ModalHeader>
                <ModalBody style={{minHeight: 400}}>
                    {data ? (
                        <div style={{width: "100%", minHeight: "100%"}}>
                            {Parser(data)}
                        </div>
                    ) : <iframe src={url} frameBorder="0" sandbox=""
                                style={{width: "100%", height: 1000}}
                                onLoad={this.onLoad}
                                ref={e => this.iframe = e}/>}
                </ModalBody>
            </Modal>
        )
    }
}

export default HtmlPreviewDialog;
