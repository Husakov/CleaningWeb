import React from 'react'
import {faChevronDown, faThList, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import classSet from "react-classset";
import {Button, CardHeader, Collapse, Popover, PopoverBody, PopoverHeader} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import {findDOMNode} from "react-dom";
import PropTypes from 'prop-types';
import {DragSource, DropTarget} from 'react-dnd'
import scrollToElement from "scroll-to-element";

export const ServiceType = "service";

const source = {
    beginDrag(props) {
        return {
            index: props.index
        }
    },
    endDrag(props) {
        props.reorderSave()
    }
};

const target = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        if (dragIndex === hoverIndex) {
            return
        }
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return
        }

        // Time to actually perform the action
        props.reorder(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
        didDrop: monitor.didDrop(),
    }
}


class DraggableCard extends React.Component {
    toggleCollapse = () => {
        if (this.state.collapsed) {
            setTimeout(() => {
                scrollToElement(this.ref, {offset: -126})
            }, 400);
        }
        this.setState({collapsed: !this.state.collapsed});
    };

    constructor(props) {
        super(props);
        this.state = {
            collapsed: props.collapsed === true,
            deletePopoverOpen: false
        };
        this.num = ~~(Math.random() * 100000000);
    }

    render() {
        const {header, connectDragSource, connectDropTarget, connectDragPreview} = this.props;
        return connectDropTarget(connectDragPreview(
            <div ref={e => this.ref = e} className={"card mb-2 " + this.props.className}
                 style={{opacity: this.props.isDragging ? 0 : 1}}>
                <CardHeader className="d-flex align-items-center px-3 py-2">
                    {connectDragSource(<span className="drag-handle mr-2"><Icon icon={faThList}/></span>)}
                    {header}
                    <Popover placement="left"
                             isOpen={this.state.deletePopoverOpen}
                             target={`deletePopover_${this.num}_${this.props.id}`}
                             toggle={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                        <PopoverHeader>{this.props.deleteMessage}</PopoverHeader>
                        <PopoverBody className="d-flex justify-content-between">
                            <Button color="danger"
                                    onClick={this.props.delete}>
                                Yes
                            </Button>
                            <Button color="secondary"
                                    onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}>
                                Cancel
                            </Button>
                        </PopoverBody>
                    </Popover>
                    <Button color="danger"
                            id={`deletePopover_${this.num}_${this.props.id}`}
                            className={"mx-3" + (this.props.mlauto ? " ml-auto" : '')}
                            onClick={() => this.setState({deletePopoverOpen: !this.state.deletePopoverOpen})}
                            disabled={this.props.disabled}
                            title={this.props.deleteTitle}><Icon icon={faTrash}/></Button>
                    <Button color="link" className={classSet({
                        'btn-round-border text-dark': true,
                        'fa-rotate-180': !this.state.collapsed
                    })} onClick={this.toggleCollapse}><Icon icon={faChevronDown}/></Button>
                </CardHeader>
                <Collapse isOpen={!this.state.collapsed}>
                    {this.props.children}
                </Collapse>
            </div>
        ))
    }
}

DraggableCard.propTypes = {
    className: PropTypes.string,
    id: PropTypes.number.isRequired,
    collapsed: PropTypes.bool,
    disabled: PropTypes.bool,
    header: PropTypes.node.isRequired,
    deleteMessage: PropTypes.string.isRequired,
    deleteTitle: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    index: PropTypes.number.isRequired,
    reorder: PropTypes.func.isRequired,
    reorderSave: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
    mlauto: PropTypes.bool
};

export default DropTarget(ServiceType, target, (connect) => ({connectDropTarget: connect.dropTarget()}))(
    DragSource(ServiceType, source, collect)(DraggableCard))
