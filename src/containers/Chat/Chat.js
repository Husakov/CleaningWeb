import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button } from 'reactstrap';
import './Chat.css';
import Chats from './Chats'
import Messages from './Messages'
import moment from 'moment'
import * as _ from 'lodash'
import { getCustomers, getCustomerChatHistory, sendMessage } from './../../reducers/chatReducer'

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeChat: 1,
            messages: [],
            customers: [],
            msgText: ''
        }
    }
    componentDidMount() {
        this.props.getCustomers(this.props.user.companies[0].id);
    }
    componentWillReceiveProps(newProps) {
        if (this.props.customers.length !== newProps.customers.length)
            this.props.getCustomerChatHistory(this.props.user.companies[0].id, newProps.customers[0].id)
    }
    selectChat = (id) => {
        console.log(id)
        this.setState({
            activeChat: id
        })
        this.props.getCustomerChatHistory(this.props.user.companies[0].id, id)
    }

    newMessage = () => {
        console.log('new message')
    }

    sendMessage = () => {
        this.props.sendMessage(this.props.user.companies[0].id, this.state.activeChat, { body: this.state.msgText })
        this.setState(prevState => ({
            msgText: ''
        }))
    }
    onInputChange = (evt) => {
        this.setState({
            msgText: evt.target.value
        })
    }


    render() {
        return (
            <div className='chat'>
                <div className="chats">
                    <Chats chats={this.props.customers} activeChat={this.state.activeChat} onSelectChat={this.selectChat} />
                </div>
                <div className="messages">
                    {
                        this.props.customers.length < 1
                            ? <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}><p>Loading ...</p></div>
                            : <Messages chatPerson={this.props.customers.filter(customer => customer.id === this.state.activeChat)[0]} messages={this.props.messages} />
                    }
                </div>
                <div className="form">
                    <textarea value={this.state.msgText} onChange={this.onInputChange}></textarea>
                    <div className="form-info">
                        <span>Message Size {this.state.msgText.length}, Number of Messages {Math.ceil(this.state.msgText.length / 160)}</span>
                        <Button color="primary" onClick={this.sendMessage} disabled={this.state.msgText.length <= 0}>Send Message</Button>
                    </div>
                </div>
            </div>
        )
    }
}

function mapState(state) {
    return {
        user: state.user,
        pending: state.chat.pending,
        customers: state.chat.customers,
        messages: state.chat.messages
    }
}

function mapActions(dispatch) {
    return bindActionCreators({ getCustomers, getCustomerChatHistory, sendMessage }, dispatch);
}

export default connect(mapState, mapActions)(Chat)