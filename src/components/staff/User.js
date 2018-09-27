import React, {Component} from 'react';

import {DragSource} from 'react-dnd';

import noUserImg from '../../user.png';

const cardSource = {
    beginDrag(props) {
        return {
            index: props.index,
            position: props.position,
            id: props.id,
            user: props.user
        }
    },
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        didDrop: monitor.didDrop(),
    }
}

class User extends Component {
    render() {
        const {user, index, position} = this.props;
        return (
            this.props.connectDragSource(
                <div className="staff-wrapper">
                    <div className="staff"
                         onClick={(user, team_position, user_position, team_id) => this.props.selectStaff(this.props.user,
                             index, position)}>
                        <img src={user.image ? user.image : noUserImg} alt="staff"/>
                        <span>{user.name}</span>
                    </div>
                </div>
            ));
    }
}

export default (DragSource("Staff", cardSource, collect)(User));
