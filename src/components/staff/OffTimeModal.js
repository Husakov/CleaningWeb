import React from 'react';
import {Alert, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import './OffTimeModal.css';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Repeat from './Repeat';
// import Note from '../Note';

const OffTimeModal = ({
                          startDate,
                          endDate,
                          predefinedLabel,
                          predefinedRange,
                          handleChangeStart,
                          handleChangeEnd,
                          saveModal,
                          toggleModal,
                          deleteModal,
                          modal,
                          editMode,
                          radioBtn,
                          disabled,
                          onRadioChange,
                          note,
                          noteLength,
                          onChangeNote,
                          addNote,
                          showNote,
                          showWarning,
                          notePreview,
                          // offtimeDates,
                          highlight,
                          //repeat
                          radioDays,
                          firstWeek,
                          repeat,
                          repeatNumber,
                          repeatType,
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
    return (
        <div className='offtime-modal'>
            <Modal size='lg' isOpen={modal} toggle={toggleModal} className='off-time--modal'>
                <ModalHeader toggle={toggleModal}>
                    {editMode ? 'Edit Off Time' : 'Create Off Time'}
                </ModalHeader>
                <ModalBody>
                    <div className='offtime-modal__body'>
                        <div className='modal__sidebar'>
                            <div className='sidebar__ranges'>
                                <ul className='datepicker__predefined-ranges'>
                                    <li
                                        className={predefinedLabel === 'Today' ? 'predefined-ranges--background' : ''}
                                        onClick={() => predefinedRange('Today')}
                                    >
                                        Today
                                    </li>
                                    <li
                                        className={predefinedLabel === 'Yesterday' ? 'predefined-ranges--background' : ''}
                                        onClick={() => predefinedRange('Yesterday')}
                                    >
                                        Yesterday
                                    </li>
                                    <li
                                        className={predefinedLabel === 'Tomorrow' ? 'predefined-ranges--background' : ''}
                                        onClick={() => predefinedRange('Tomorrow')}
                                    >
                                        Tomorrow
                                    </li>
                                    <li
                                        className={predefinedLabel === 'Custom' ? 'predefined-ranges--background' : ''}
                                        onClick={() => predefinedRange('Custom')}
                                    >
                                        Custom
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className='modal__main'>
                            <div className="main--row">
                                <div className="main__picker1">
                                    <p>From:</p>
                                    <DatePicker
                                        inline
                                        selected={startDate}
                                        // selectsStart
                                        startDate={startDate}
                                        onChange={handleChangeStart}
                                        timeFormat="hh:mm A"
                                        timeIntervals={15}
                                        dateFormat="MM/DD/YYYY hh:mm A"
                                        timeCaption="time"
                                        showTimeSelect
                                        // excludeDates={offtimeDates ? [...offtimeDates] : []}
                                        highlightDates={[{
                                            "highlight-dates": highlight ? [
                                                ...highlight.map(date => moment(date))
                                            ] : []
                                        }]}
                                    />
                                </div>
                                <div className="main__picker2">
                                    <p>To:</p>
                                    <DatePicker
                                        inline
                                        selected={endDate}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        onChange={handleChangeEnd}
                                        minTime={moment(startDate).add(15, 'm')}
                                        maxTime={moment().hours(23).minutes(59)}
                                        timeFormat="hh:mm A"
                                        timeIntervals={15}
                                        dateFormat="MM/DD/YYYY hh:mm A"
                                        timeCaption="time"
                                        showTimeSelect
                                        // excludeDates={offtimeDates ? [...offtimeDates] : []}
                                        highlightDates={[{
                                            "highlight-dates": highlight ? [
                                                ...highlight.map(date => moment(date))
                                            ] : []
                                        }]}
                                    />
                                </div>
                            </div>
                            <div className="picker--selection">
                                <small>
                                    Currently selected offtime:
                                    <time
                                        dateTime={`MM/DD/YYYY hh:mm A`}> {startDate.format('MM/DD/YYYY hh:mm A')}</time> -
                                    <time dateTime={`MM/DD/YYYY hh:mm A`}> {endDate.format('MM/DD/YYYY hh:mm A')}</time>
                                </small>
                            </div>
                            <div className="main--row">
                                <div className="repeat-offtime">
                                    <Repeat
                                        endDate={endDate}
                                        startDate={startDate}
                                        radioDays={radioDays}
                                        repeat={repeat}
                                        repeatNumber={repeatNumber}
                                        repeatType={repeatType}
                                        firstWeek={firstWeek}
                                        repeatOn={repeatOn}
                                        repeatEndTime={repeatEndTime}
                                        toggleRadioDays={toggleRadioDays}
                                        toggleFirstWeek={toggleFirstWeek}
                                        toggleRepeat={toggleRepeat}
                                        toggleRepeatNumber={toggleRepeatNumber}
                                        toggleRepeatType={toggleRepeatType}
                                        toggleRepeatOn={toggleRepeatOn}
                                        handleChangeEndTime={handleChangeEndTime}
                                        highlightDates={highlight}
                                    />
                                </div>
                            </div>
                            <div className="main--row">
                                <div className="main__note">
                                    <Input type="textarea"
                                           value={note}
                                           maxLength="50"
                                           disabled={showNote}
                                           onChange={(e) => onChangeNote(e)}/>
                                    <div>
                                        <span>{noteLength}/50</span>
                                        <Button className="add-note__button"
                                                color="success"
                                            // disabled={showNote}
                                                onClick={() => {
                                                    addNote()
                                                }}>{!showNote ? 'Add Note' : 'Edit'}</Button>
                                    </div>
                                </div>
                            </div>
                            <div className='modal--warning'>
                                {notePreview && <Alert color='warning'>
                                    Note: {notePreview}
                                </Alert>}
                                {showWarning && !editMode && <Alert color="danger">
                                    Warning: Picking date range which includes days from already created offtime will
                                    overwrite that offtime with currently selected one.
                                    You can continue if you don't mind overwritting offtime.
                                </Alert>}
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={saveModal}>Save</Button>{' '}
                    {editMode && <Button color="danger" onClick={deleteModal}>Delete</Button>}
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default OffTimeModal;
