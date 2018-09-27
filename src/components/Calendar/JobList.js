import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {loadQuotes} from "../../reducers/calendarReducer";
import {Col, Container, Row} from "reactstrap";
import './style.css'
import {DragSource} from 'react-dnd';

const calculatePrice = (appointment) => (
    appointment.services.reduce((sTotal, s) => {
        sTotal += s.service_pricings.reduce((pTotal, p) => {
            return pTotal + (p.quantity * p.price);
        }, 0);
        sTotal += s.add_ons.reduce((aTotal, a) => {
            return aTotal + (a.quantity * a.price);
        }, 0);
        return sTotal;
    }, 0)
);


class JobList extends React.Component {
    componentDidMount() {
        this.props.loadQuotes(this.props.user.selectedCompany.id)
    }

    render() {
        const {quotes, className} = this.props;
        return (
            <div className={className}>
                {quotes.map(quote =>
                    <JobItem quote={quote} key={quote.quote_id}/>
                )}
            </div>
        )
    }
}

const source = {
    beginDrag(props) {
        return {
            event: {quote: props.quote},
            anchor: "drop"
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        didDrop: monitor.didDrop(),
    }
}

const JobItem = DragSource('event', source, collect)(({quote, connectDragSource}) => connectDragSource(
    <div className="calendar-job-item" style={{borderLeftColor: "blue"}}>
        <Container fluid className="px-0">
            <Row className="p-2 mx-0">
                <Col className="p-0" xs={12}><p className="mb-0 font-weight-bold">{quote.title}</p></Col>
                <Col className="p-0" xs={12}><p
                    className="mb-0">{`${quote.first_name} ${quote.last_name}`}</p></Col>
                <Col className="p-0" xs={12}><p className="mb-0 text-right">${quote.total/100}</p></Col>
            </Row>
        </Container>
    </div>
));

function mapState(state) {
    return {
        user: state.user,
        quotes: state.calendar.quotes
    }
}

function mapActions(dispatch) {
    return bindActionCreators({loadQuotes}, dispatch);
}

export default connect(mapState, mapActions)(JobList);
