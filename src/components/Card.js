import React from 'react'
import {Button, Card, CardBody, CardHeader, Collapse, Popover, PopoverBody, PopoverHeader} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import {faChevronDown, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import classSet from "react-classset";

class ReusableCard extends React.Component {
    state = {
        collapsed: this.props.collapsed === true
    };
    toggleCollapse = () => {
        this.setState({collapsed: !this.state.collapsed});
    };

    render() {
        return (
            <Card className="mb-2">
                <CardHeader className="d-flex align-items-center justify-content-between" style={{height: "40px"}}>
                    {this.props.header}
                    <Popover placement="left"
                             isOpen={this.state.deletePopoverOpen}
                             target={`deletePopover_${this.props.id}`}
                             toggle={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                        <PopoverHeader>Delete this Message?</PopoverHeader>
                        <PopoverBody className="d-flex justify-content-between">
                            <Button
                                onClick={this.props.delete}
                                color="danger">
                                Yes
                            </Button>
                            <Button color="secondary"
                                    onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                                Cancel
                            </Button>
                        </PopoverBody>
                    </Popover>
                    <div className="d-flex align-items-center justify-content-center">
                        <Button color="danger"
                                style={{height: "25px", width: "25px", fontSize: "12px"}}
                                className="mr-3 d-flex align-items-center justify-content-center"
                                id={`deletePopover_${this.props.id}`}
                                onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}
                        ><Icon icon={faTrash}/></Button>
                        <Button color="link"
                                style={{height: "25px", width: "25px", fontSize: "12px"}}
                                className={classSet({
                                    'btn-round-border text-dark d-flex align-items-center justify-content-center"': true,
                                    'fa-rotate-180': this.state.collapsed
                                })} onClick={this.toggleCollapse}><Icon icon={faChevronDown}/></Button>
                    </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapsed}>
                    <CardBody>
                        {this.props.children}
                    </CardBody>
                </Collapse>
            </Card>
        )
    }
}

export default ReusableCard;
