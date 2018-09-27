import React,{Component} from 'react';
import { Col, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, FormFeedback, Collapse, Card, ListGroupItem, CardBody } from 'reactstrap';
import Toggle from '../../components/Toggle';

class Appearance extends Component{
    constructor(props) {
        super(props);
        this.state = {
            title: 'Appearance',
            general: {},
        }
    }
    handleChange = (value, type) => {
        let comp = { ...this.state.general };
        comp[type] = value;
        this.setState({ general: { ...comp } });
    }
    render(){
        const { general } = this.state;
     return(
      <div>
         <form>
             <FormGroup row className='d-flex align-items-center'>
                 <Label for="sg-showLogo" sm={4}>Show coupons input on checkout:</Label>
                 <Col sm={6}>
                     <div className='d-flex align-items-center'>
                         <Toggle
                             className=''
                             value={general.zipRestrict ? general.zipRestrict : false}
                             activeText={'Enabled'}
                             inactiveText={'Disabled'}
                             onClick={() => this.handleChange(general.zipRestrict = !general.zipRestrict)}
                         />
                     </div>
                 </Col>
             </FormGroup>
             <FormGroup row className='d-flex align-items-center'>
                 <Label for="sg-showLogo" sm={4}>Hide faded already booked time slots:</Label>
                 <Col sm={6}>
                     <div className='d-flex align-items-center'>
                         <Toggle
                             className=''
                             value={general.zipRestrict1 ? general.zipRestrict1 : false}
                             activeText={'Enabled'}
                             inactiveText={'Disabled'}
                             onClick={() => this.handleChange(general.zipRestrict1 = !general.zipRestrict1)}
                         />
                     </div>
                 </Col>
             </FormGroup>
             <FormGroup row className='d-flex align-items-center'>
                 <Label for="sg-showLogo" sm={4}>Guest user checkout:</Label>
                 <Col sm={6}>
                     <div className='d-flex align-items-center'>
                         <Toggle
                             className=''
                             value={general.zipRestrict2 ? general.zipRestrict2 : false}
                             activeText={'Enabled'}
                             inactiveText={'Disabled'}
                             onClick={() => this.handleChange(general.zipRestrict2 = !general.zipRestrict2)}
                         />
                     </div>
                 </Col>
             </FormGroup>
             <FormGroup row className='d-flex align-items-center'>
                 <Label for="sg-showLogo" sm={4}>Existing & New User Checkout:</Label>
                 <Col sm={6}>
                     <div className='d-flex align-items-center'>
                         <Toggle
                             className=''
                             value={general.zipRestrict3 ? general.zipRestrict3 : false}
                             activeText={'Enabled'}
                             inactiveText={'Disabled'}
                             onClick={() => this.handleChange(general.zipRestrict3 = !general.zipRestrict3)}
                         />
                     </div>
                 </Col>
             </FormGroup>



         </form>
      </div>
     )
    }
}

export default Appearance;