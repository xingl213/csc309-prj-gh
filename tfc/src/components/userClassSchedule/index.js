import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'antd';
import { Collapse } from 'antd';
import './index.css';
import { RightSquareFilled } from '@ant-design/icons';

const { Panel } = Collapse;


const UserSchedule = () => {
    const [userSchedule, setUserSchedule] = useState({'results': [], 'next': null, 'previous': null});
    const [userId, setUserId] = useState(-1);
    const [classID, setClassId] = useState(-1);


    let token = window.localStorage.getItem("token");

    let prevButton;
    let nextButton;

    useEffect(() => {
        let requestOptions = {
            method: 'GET',
            headers: new Headers({'Authorization': 'Bearer ' + token})
        };
		fetch('http://127.0.0.1:8000/accounts/userid/', requestOptions)
		    .then(response => response.json())
            .then(data => setUserId(data))

        fetch("http://127.0.0.1:8000/accounts/classes/schedule/", requestOptions)
            .then(response => response.json())
            .then(data => setUserSchedule(data))
	}, [classID])

    const drop = (userId, classInstanceId, recurring) => {
        console.log(`User ${userId} wants to drop in class instance ${classInstanceId}`);
        fetch('http://127.0.0.1:8000/accounts/enroll/', {
            method: 'DELETE',
            headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',},
            body: JSON.stringify({
                user: userId,
                cls_instance: classInstanceId,
                recurring: recurring,
            })
        }).then(response => {
            if (response.ok) {
                alert(`Successfully dropped user ${userId} from class instance ${classInstanceId} (recurring: ${recurring})`);
                setClassId(classInstanceId);

            } else {
                alert(`Failed to drop user ${userId} from class instance ${classInstanceId} (recurring: ${recurring})`);
            }
        })
    }

    const nextPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (userSchedule.next !== null) {
            fetch(userSchedule.next, requestOptions)
			.then(response => response.json())
			.then(data => setUserSchedule(data));
        }
    }

    const previousPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (userSchedule.previous !== null) {
            fetch(userSchedule.previous, requestOptions)
			.then(response => response.json())
			.then(data => setUserSchedule(data));
        }
    }

    // let prevButton;
    // let nextButton;

    if (userSchedule.next !== null) {
        nextButton = <button className='buttonWrapperSchedule' onClick={nextPage}>Next</button>
    } else {
        nextButton = <></>
    }

    if (userSchedule.previous !== null) {
        prevButton = <button className='buttonWrapperSchedule' onClick={previousPage}>Previous</button>
    } else {
        prevButton = <></>
    } 

    // antd

    const [expandIconPosition, setExpandIconPosition] = useState('start');
    const onPositionChange = (newExpandIconPosition) => {
        setExpandIconPosition(newExpandIconPosition);
    };
    const onChange = (key) => {
        console.log(key);
    };

    return (
        <div className='scheduleContainer'>
            <h3>User Class Schedule</h3>
            <Collapse
                defaultActiveKey={['0']}
                onChange={onChange}
                expandIconPosition={expandIconPosition}
                >
                    {
                        userSchedule.results.map((classInstance, index)=> (
                                <Panel header={"Class: " + classInstance.cls.name} key={index}>
                                    <button className='buttonWrapperSchedule' onClick={() => {drop(userId, classInstance.id, true)}}>Drop all instances of this class</button>
                                    <button className='buttonWrapperSchedule' onClick={() => {drop(userId, classInstance.id, false)}}>Drop this instance only</button>
                                    <ul>
                                        <li>Capacity: {classInstance.cls.capacity}</li>
                                        <li>Coach: {classInstance.cls.coach}</li>
                                        <li>Description: {classInstance.cls.description}</li>
                                        <li>Start: {classInstance.start_datetime}</li>
                                        <li>End: {classInstance.end_datetime}</li>
                                        <li>Current Enrollment: {classInstance.num_enrolled}</li>
                                    </ul>
                                </Panel>
                        )
                        )
                    }
            </Collapse>
            {prevButton}
            {nextButton}
        </div>
    )

}

export default UserSchedule;