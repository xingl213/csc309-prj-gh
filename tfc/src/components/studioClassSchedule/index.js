import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Collapse } from 'antd';
import './index.css';

function StudioSchedule() {
    const [userId, setUserId] = useState(-1);
    const [schedule, setSchedule] = useState([]);
    const [page, setPage] = useState(1);

    let token = window.localStorage.getItem("token");
    const { studioId } = useParams();

    const { Panel } = Collapse;

    let navigate = useNavigate();

    useEffect(() => {
        fetch('http://127.0.0.1:8000/accounts/userid/', {
                    method: 'GET',
                    headers: {'Authorization': 'Bearer ' + token}
                })
                    .then(response => response.json())
                    .then(data => {setUserId(data)});

        let requestOptions = {
            method: 'GET',
            headers: new Headers({'Authorization': 'Bearer ' + token})
        };
        fetch(`http://127.0.0.1:8000/studios/${studioId}/classes/schedule/?page=${page}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setSchedule(data);
                } else if (page == 1) {
                    alert("No schedule for this studio");
                    navigate(`/studios/${studioId}/info/`);
                } else {
                    alert("You've reached the last page.");
                    setPage(Math.max(1, page - 1)); // set page back to last page
                }
            });
    }, [page])


    const enroll = (userId, classInstanceId, recurring) => {
        console.log(`User ${userId} wants to enroll in class instance ${classInstanceId}`);
        fetch('http://127.0.0.1:8000/accounts/enroll/', {
            method: 'POST',
            headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',},
            body: JSON.stringify({
                user: userId,
                cls_instance: classInstanceId,
                recurring: recurring,
            })
        }).then(response => {
            if (response.ok) {
                alert(`Successfully enrolled user ${userId} in class instance ${classInstanceId} (recurring: ${recurring})`);
            } else {
                alert(`Failed to enroll user ${userId} in class instance ${classInstanceId} (recurring: ${recurring})`);
            }
            window.location.reload();
        })
    }

    // using the ant d component

    const [expandIconPosition, setExpandIconPosition] = useState('start');
    const onPositionChange = (newExpandIconPosition) => {
        setExpandIconPosition(newExpandIconPosition);
    };
    const onChange = (key) => {
        console.log(key);
    };


    return (
        <>
            <div className='scheduleContainer'>
                <h3>Studio Schedule</h3>
                <Collapse
                    defaultActiveKey={['0']}
                    onChange={onChange}
                    expandIconPosition={expandIconPosition}
                    >
                        {
                            schedule.map((classInstance, index)=> (
                                    <Panel header={classInstance.class.name + " | " + classInstance.start_datetime.slice(0, 10)} key={index}>
                                        {!classInstance.enrolled &&
                                            <div>
                                                <button className='buttonWrapperSchedule' onClick={() => {enroll(userId, classInstance.id, true)}}>Enroll all future instances</button>
                                                <button className='buttonWrapperSchedule' onClick={() => {enroll(userId, classInstance.id, false)}}>Enroll this instance only</button>
                                            </div>
                                        }
                                        <ul>
                                            <li>Enrolled: {classInstance.num_enrolled} / {classInstance.class.capacity}</li>
                                            <li>Coach: {classInstance.class.coach}</li>
                                            <li>Description: {classInstance.class.description}</li>
                                            <li>Start: {classInstance.start_datetime.slice(0, 10) + " " + classInstance.start_datetime.slice(11)}</li>
                                            <li>End: {classInstance.end_datetime.slice(0, 10) + " " + classInstance.end_datetime.slice(11)}</li>
                                        </ul>
                                    </Panel>
                            )
                            )
                        }
                </Collapse>
            </div>
            {schedule.length > 0 &&
                <div>
                    <button className="buttonWrapperSchedule prevButton" onClick={() => {
                        setPage(Math.max(1, page - 1));
                        if (page == 1) {
                            alert("This is the first page.");
                        }
                    }}>Previous page</button>
                    <button className="buttonWrapperSchedule nextButton" onClick={() => setPage(page + 1)}>Next page</button>
                </div>
            }
        </>
    );
}

export default StudioSchedule;