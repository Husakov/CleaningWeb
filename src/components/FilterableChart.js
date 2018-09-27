import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Bar, Line, Pie} from 'react-chartjs-2';
import * as classnames from "classnames";
import moment from "moment";
import './filterableChart.css';

const chartTypes = {
    "line": Line,
    "bar": Bar,
    "pie": Pie
};

const defaultTimeMapping = (item) => item.created_at;

const defaultValueMapping = () => {
    return 1;
};

const colors = [
    "#5CBAE6",
    "#B6D957",
    "#FAC364",
    "#FAC364",
    "#D998CB",
    "#F2D249",
    "#93B9C6",
    "#CCC5A8",
    "#52BACC",
    "#DBDB46",
    "#98AAFB"
];

const sumValue = (item) => {
    return item.amount;
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

};

class FilterableChart extends Component {
    state = {
        data: null,
        popovers: {}
    };

    constructor(props){
        super(props);

        this.getValueMap = this.getValueMap.bind(this);
    }

    getValueMap(valueMap) {
        switch (valueMap) {
            case 'count':
                return defaultTimeMapping;
            case 'value':
                return sumValue;
            default:
                return defaultTimeMapping;
        }
    }

    generateVisibleDataSet = () => {
        let {timeMapping = defaultTimeMapping, valueMapping, filtersNew, label, timeRange, groupBy} = this.props;
        if(filtersNew == undefined) return;
        const dates = [];
        const currDate = moment(timeRange[0]);
        const lastDate = moment(timeRange[1]);
        while (currDate.diff(lastDate) < 0) {
            dates.push(moment(currDate));
            currDate.add(1, groupBy);
        }
        const data = {
            labels: dates.map(date => {
                switch (groupBy) {
                    case "hour":
                        return date.format("hh:mm A");
                    case "day":
                        return date.format("dddd MM/YY");
                    case "month":
                        return date.format("MMM YY");
                    case "year":
                        return date.format("YYYY");
                }
            }),
            datasets: filtersNew.map(currentFilter =>{
                return {
                    label: currentFilter.label,
                    data: dates.map(date => {
                        if(currentFilter.dataSet != undefined) {
                            return currentFilter.dataSet.reduce((sum, item) => {
                                const itemTime = moment(timeMapping(item));
                                if (itemTime >= date.startOf(groupBy) && itemTime <= date.endOf(groupBy)) {
                                    if (valueMapping == 'value') {
                                        if (item.amount == undefined) return;
                                        sum += parseInt(item.amount);
                                    } else sum += 1;
                                }
                                return parseInt(sum);
                            }, 0)
                        }
                    }),
                    fill: false,
                    backgroundColor: currentFilter.color,
                    borderColor: currentFilter.color
                }
            }),

        };

        this.setState({timeRange, data})
    };
    onChange = e => {
        this.setState({[e.target.name]: e.target.value});
    };
    onChangeDate = (i, val) => {

        const timeRange = [...this.state.timeRange];
        timeRange[i] = val;

        this.setState({timeRange});
    };

    componentDidMount() {
        this.generateVisibleDataSet(true);
    }

    componentDidUpdate(oldProps) {
        if (JSON.stringify(this.props.dataSet) !== JSON.stringify(oldProps.dataSet)) {
            this.generateVisibleDataSet(true);
        }
        if (this.props.groupBy !== oldProps.groupBy) {
            this.generateVisibleDataSet();
        }
        if (this.props.filters !== oldProps.filters) {
            this.generateVisibleDataSet();
        }

        if (this.props.trash !== oldProps.trash) {
            this.generateVisibleDataSet();
        }
        if (this.props.timeRange[0] !== oldProps.timeRange[0] || this.props.timeRange[1] !== oldProps.timeRange[1]) {
            this.generateVisibleDataSet();
        }
    }

    render() {
        const {chartType = "line", className = ""} = this.props;
        const {data} = this.state;
        const ChartElement = chartTypes[chartType];
        return (
            <div className={classnames({
                [className]: true,
                "w-100 h-100 pb-5": true
            })}>
                {data && <ChartElement data={data} options={chartOptions}/>}
            </div>
        )
    }
}

FilterableChart.propTypes = {
    dataSet: PropTypes.array,
    timeMapping: PropTypes.func,
    //valueMapping: PropTypes.string,
    chartType: PropTypes.oneOf(["line", "bar", "pie"]),
    label: PropTypes.string.isRequired
};

export default FilterableChart;
