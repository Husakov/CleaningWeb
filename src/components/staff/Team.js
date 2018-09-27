import React, { Component } from 'react';

import { DragSource, DropTarget } from 'react-dnd';
import { Button, Card, CardBody, CardHeader, Collapse, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { findDOMNode } from 'react-dom'
import Icon from '@fortawesome/react-fontawesome'
import { faChevronDown, faCog, faThList, faTrash } from "@fortawesome/fontawesome-free-solid/shakable.es";

import User from './User';
import './Staff.css';
import { Preview } from "react-dnd-multi-backend";
import noUserImg from '../../user.png';

const teamSource = {
    beginDrag(props) {
        return {
            teamId: props.team.id,
            index: props.index
        }
    },
    endDrag(props) {
        props.saveReorderTeam()
    }
};
const cardTarget = {
    hover(props, monitor, component) {
        const dragUser = monitor.getItem().user;
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        if (monitor.getItemType() === "Team") {
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
            props.reorderTeam(hoverIndex, dragIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            monitor.getItem().index = hoverIndex
        }
        else {
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                props.hovering(null);

            }
            else
                props.hovering(hoverIndex);
        }
    },
    drop(props, monitor, component) {
        const dropIndex = props.index;
        const staffId = monitor.getItem().id;
        const teamId = props.team.id;
        const position = monitor.getItem().position;
        const dragIndex = monitor.getItem().index;
        // Time to actually perform the action
        props.moveStaff(position, dragIndex, dropIndex, staffId, teamId);
        props.hovering(null);
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
        didDrop: monitor.didDrop(),
        draggingItem: monitor.getItemType()
    }
}

class Team extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            popoverOpen: false,
            teamName: props.team.name,
            color: props.team.color
        }
    }

    togglePopover() {
        this.setState({ popoverOpen: !this.state.popoverOpen })
    }

    render() {
        return (
            this.props.connectDropTarget(this.props.connectDragPreview(
                <div className={this.props.hoverIndex === this.props.index ? "hover" : ""}>
                    <Card style={{ opacity: this.props.isDragging ? 0 : 1 }}>
                        <CardHeader
                            className="team-header"
                            key={this.props.team.id}>

                            <div className="team-name">
                                {this.props.team.id !== 0 &&
                                    this.props.connectDragSource(<div className="mr-2"><Icon className="drag-handle-team"
                                        icon={faThList} /></div>)
                                }
                                {this.props.team.id !== 0 && <div className="team-box-color"
                                    style={{ backgroundColor: this.props.team.color ? this.props.team.color : "white" }} />}
                                <h6>{this.props.team.name}</h6>
                            </div>
                            <div className="icons">
                                {this.props.team.id !== 0 && <button
                                    className="btn btn-info edit-team-button"
                                    onClick={(team) => this.props.openTeam(this.props.team)}>
                                    <Icon icon={faCog} />
                                </button>}

                                {this.props.team.id !== 0 &&
                                    <div>
                                        <Button
                                            onClick={() => this.togglePopover()}
                                            color="danger"
                                            id={"delete-button" + this.props.team.id}><Icon icon={faTrash} /></Button>
                                        <Popover target={"delete-button" + this.props.team.id}
                                            isOpen={this.state.popoverOpen} toggle={() => this.togglePopover()}>
                                            <PopoverHeader>Delete this Team?</PopoverHeader>
                                            <PopoverBody className="d-flex justify-content-between">
                                                <Button color="danger"
                                                    onClick={() => {
                                                        this.props.deleteTeam(this.props.team.id);
                                                        this.setState({ popoverOpen: false })
                                                    }}>
                                                    Yes
                                            </Button>
                                                <Button color="secondary"
                                                    onClick={() => this.togglePopover()}>
                                                    Cancel
                                            </Button>
                                            </PopoverBody>
                                        </Popover></div>}
                                <Button color="link" className={!this.state.isOpen ?
                                    'btn-round-border text-dark team-toggle-button' :
                                    'btn-round-border text-dark team-toggle-button fa-rotate-180'}
                                    onClick={() => this.setState({ isOpen: !this.state.isOpen })}><Icon
                                        icon={faChevronDown} /></Button>
                            </div>
                        </CardHeader>
                        <Collapse isOpen={this.state.isOpen}>
                            <CardBody className="single-team">
                                {this.props.team.users.map((user, j) => {
                                    if (user.active) {
                                        return (
                                            <User
                                                id={user.id}
                                                index={this.props.index}
                                                position={j}
                                                key={user.id}
                                                selectStaff={(user, team_position, user_position, team_id) => this.props.selectStaff(user, team_position, user_position, team_id)}
                                                team={this.props.team}
                                                user={user} />
                                        )
                                    }
                                })}
                                <Preview generator={(type, item, style) => {
                                    const user = item.user;
                                    return (
                                        <div className="staff"
                                            style={style}>
                                            <img src={user.image ? user.image : noUserImg} alt="staff" />
                                            <span>{user.name}</span>
                                        </div>
                                    )
                                }} />
                            </CardBody>
                        </Collapse></Card></div>)
            ))
    }
}

export default DropTarget(["Team", "Staff"], cardTarget, (connect) => ({ connectDropTarget: connect.dropTarget() }))
    ((DragSource("Team", teamSource, collect))(Team));
