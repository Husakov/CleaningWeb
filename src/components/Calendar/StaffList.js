import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {loadStaff} from "../../reducers/calendarReducer";
import noUserImg from '../../user.png';
import {DragSource} from "react-dnd";

class StaffList extends React.Component {
    componentDidMount() {
        this.props.loadStaff(this.props.user.selectedCompany.id)
    }

    render() {
        return (
            <div className={this.props.className}>
                {this.props.staff.map(user =>
                    <StaffItem staff={user} key={user.id}/>
                )}
            </div>
        );
    }
}

const source = {
    beginDrag(props) {
        return {
            staff: props.staff,
            anchor: "drop",
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

const StaffItem = DragSource('staff', source, collect)(({staff, connectDragSource}) => connectDragSource(
    <div className="card flex-row m-2 p-1 align-items-center calendar-staff-item">
        <img src={staff.image ? staff.image : noUserImg} className="rounded-circle mr-2" width="30" height="30"/>
        <h5 className="m-0">{staff.name}</h5>
    </div>
));

function mapState(state) {
    return {
        user: state.user,
        staff: state.calendar.staff
    }
}

function mapActions(dispatch) {
    return bindActionCreators({loadStaff}, dispatch);
}

export default connect(mapState, mapActions)(StaffList);
