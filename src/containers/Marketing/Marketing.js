import React from 'react'
import {Container, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import Templates from "./Templates";
import AutomaticMessages from './AutomaticMessages';
import Campaigns from "./Campaigns";
import History from "./History";

const tabs = ['History', 'Templates', 'Campaigns', 'Automatic Messages'];

class Marketing extends React.Component {
    state = {
        tabOpen: 0,
        templateStateIndex: 0
    };

    toggleTab(pos) {
        this.setState({tabOpen: pos});
    }

    render() {
        return (
            <Container fluid className="marketing-container">
                <Nav tabs className="mt-3">
                    {tabs.map((tab, i) =>
                        <NavItem key={i}>
                            <NavLink active={this.state.tabOpen === i}
                                     onClick={() => this.toggleTab(i)}>
                                {tab}
                            </NavLink>
                        </NavItem>
                    )}
                </Nav>
                <TabContent activeTab={this.state.tabOpen}>
                    <TabPane tabId={0}>
                        <History/>
                    </TabPane>
                    <TabPane tabId={1}>
                        <Templates
                            notifyTemplatesChanged={() => this.setState({templateStateIndex: (++this.state.templateStateIndex)})}/>
                    </TabPane>
                    <TabPane tabId={2}>
                        <Campaigns templateStateIndex={this.state.templateStateIndex}/>
                    </TabPane>
                    <TabPane tabId={3}>
                        <AutomaticMessages/>
                    </TabPane>
                </TabContent>
            </Container>
        )
    }
}

export default Marketing;
