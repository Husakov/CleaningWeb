import React from "react";
import moment from 'moment';
import {Input} from 'reactstrap';
import './Repeat.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Repeat = ({
                    startDate,
                    endDate,
                    highlightDates,
                    radioDays,
                    repeat,
                    repeatNumber,
                    repeatType,
                    firstWeek,
                    repeatOn,
                    repeatEndTime,
                    toggleRadioDays,
                    toggleFirstWeek,
                    toggleRepeat,
                    toggleRepeatNumber,
                    toggleRepeatType,
                    toggleRepeatOn,
                    handleChangeEndTime
                }) => {
    let options = [];
    for (let i = 1; i < 13; i++) {
        options.push(
            <option key={i}>{i}</option>
        )
    }
    return (
        <div className='Repeat'>
            <div className="Repeat--row">
                <div className="Repeat--prefix">
                    <Input type="select" name="select" id="" onChange={(e) => toggleRepeat(e)}>
                        <option>No Repeat</option>
                        <option>Repeat</option>
                    </Input>
                </div>
                {repeat && <div className="Repeat--picks">
                    <div className='Repeat--picks-repeat-every'>
                        <span>every</span>
                        <Input type="select" name="select" id="" onChange={(e) => toggleRepeatNumber(e)}>
                            {options}
                        </Input>
                        <Input type="select" name="select" id="" onChange={(e) => toggleRepeatType(e)}>
                            <option>{repeatNumber === '1' ? 'week' : 'weeks'}</option>
                            <option>{repeatNumber === '1' ? 'month' : "months"}</option>
                        </Input>
                    </div>
                </div>}
            </div>
            {repeat && (repeatType === 'weeks' || repeatType === 'week' || repeatType === "w") &&
            <div className="Repeat--row">
                <div className="Repeat--prefix">
                    On
                </div>
                <div className="Repeat--picks">
                    <div className="Repeat--radio-days">
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Su' value={radioDays.Su}
                                   checked={radioDays.Su} id='Sunday'/>
                            <label htmlFor="Sunday">Su</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Mo' value={radioDays.Mo}
                                   checked={radioDays.Mo} id='Monday'/>
                            <label htmlFor="Monday">Mo</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Tu' value={radioDays.Tu}
                                   checked={radioDays.Tu} id='Tuesday'/>
                            <label htmlFor="Tuesday">Tu</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='We' value={radioDays.We}
                                   checked={radioDays.We} id='Wednesday'/>
                            <label htmlFor="Wednesday">We</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Th' value={radioDays.Th}
                                   checked={radioDays.Th} id='Thursday'/>
                            <label htmlFor="Thursday">Th</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Fr' value={radioDays.Fr}
                                   checked={radioDays.Fr} id='Friday'/>
                            <label htmlFor="Friday">Fr</label>
                        </div>
                        <div className="radio-day">
                            <input onChange={(e) => toggleRadioDays(e)} type="checkbox" name='Sa' value={radioDays.Sa}
                                   checked={radioDays.Sa} id='Saturday'/>
                            <label htmlFor="Saturday">Sa</label>
                        </div>
                    </div>
                </div>
            </div>}
            {repeat && (repeatType === 'weeks' || repeatType === 'week' || repeatType === 'w') &&
            <div className="Repeat--row">
                <div className="Repeat--prefix">
                    <span>Include</span>
                </div>
                <div className="Repeat--picks">
                    <div className='radio-day'>
                        <input onChange={(e) => toggleFirstWeek(e)} type="checkbox" name='fw' value={firstWeek}
                               checked={firstWeek} id='firstWeek'/>
                        <label htmlFor="firstWeek">First Week</label>
                    </div>
                </div>
            </div>}
            {repeat && (repeatType === 'months' || repeatType === 'month' || repeatType === 'm') &&
            <div className="Repeat--row">
                <div className="Repeat--prefix">
                    Monthly
                </div>
                <div className="Repeat--picks">
                    <Input type="select" name="select" id="" onChange={(e) => toggleRepeatOn(e)}>
                        <option value='day'> on {moment(startDate).format('dddd')} </option>
                        <option value='date'>
                            on {moment(startDate).format('D')}
                            {Number(moment(startDate).format('D')) > 2 ? 'th' : (Number(moment(startDate).format('D')) === 1 ? 'st' : 'nd')}
                        </option>
                    </Input>
                </div>
            </div>}
            {repeat && <div className="Repeat--row">
                <div className="Repeat--prefix">
                    Repeat until
                </div>
                <div className='Repeat--picks'>
                    <DatePicker
                        selected={moment(repeatEndTime, 'YYYY-MM-DD hh:mm A')}
                        startDate={moment(repeatEndTime, 'YYYY-MM-DD hh:mm A')}
                        minDate={moment(endDate).add(1, 'days')}
                        onChange={handleChangeEndTime}
                        // minTime={moment(endDate).add(15, 'm')}
                        // maxTime={moment().hours(23).minutes(59)}
                        timeFormat="hh:mm A"
                        timeIntervals={15}
                        dateFormat="MM/DD/YYYY hh:mm A"
                        timeCaption="time"
                        showTimeSelect
                        showMonthDropdown
                        // excludeDates={offtimeDates ? [...offtimeDates] : []}
                        highlightDates={[{
                            "highlight-dates": highlightDates ? [
                                ...highlightDates.map(date => moment(date))
                            ] : []
                        }]}
                    />
                </div>
            </div>}
        </div>
    )
};

export default Repeat;
