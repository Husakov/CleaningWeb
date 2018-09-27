import React,{Fragment} from 'react'
import {Table} from 'reactstrap'
import './style.css'

export const makeHeader1 = (title, span) => ({title, span});


class FinancialTableView1 extends React.Component{
    render() {
        const {title, headers, subheaders, data} = this.props;
        return (
            <Fragment>
                <h4 className="text-muted">{title}</h4>
                <Table className="border reports-table">
                    <thead>
                    <tr style={{backgroundColor: "#AAAAAA"}}>
                        {headers.map(header =>
                            <th colSpan={header.span} className="border-right">{header.title}</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="border-bottom">
                        {subheaders.reduce((ren, headerGroup) =>
                            [...ren, headerGroup.map((header, i) =>

                                    <tr className={i + 1 === headerGroup.length ? "border-right" : ""}><th>{header}</th></tr>
                                    )], [])}
                    </tr>
                    {data.map(dataRow =>
                        <tr className="border-top">
                            {dataRow.reduce((ren, dataGroup) =>
                                [...ren, dataGroup.map((data, i) =>
                                    <tr className={i + 1 === dataGroup.length ? "border-right" : ""}><th>{data()}</th></tr>
                                )], [])}
                        </tr>
                    )}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

export default FinancialTableView1;