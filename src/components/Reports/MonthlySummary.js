import React, {Fragment} from 'react';
import {Table} from "reactstrap";
import './style.css';

export const makeHeaders = (title, span) => ({title, span});


class MonthlySummary extends React.Component{
    render(){
        const {headers, data} = this.props;
        return(
            <Fragment>
                <Table className="border reports-table" style={{width:'900px'}}>
                    <thead>
                    <tr style={{backgroundColor: "#AAAAAA"}}>
                        <th style={{backgroundColor:'White'}}>   </th>
                        {headers.map(header =>
                            <th colSpan={header.span} className="border-right">{header.title}</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(dataRow =>
                        <tr className="border-top">
                            {dataRow.reduce((ren, dataGroup) =>
                                [...ren, dataGroup.map((data, i) =>
                                    <td className={i + 1 === dataGroup.length ? "border-right" : ""}>{data()}</td>
                                )], [])}
                        </tr>
                    )}
                    </tbody>
                </Table>

            </Fragment>



        )
    }
}
export default MonthlySummary;