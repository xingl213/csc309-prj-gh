import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Collapse } from 'antd';
import './classInstanceSearch.css';

function SearchClassInstance() {
	const [userId, setUserId] = useState(-1);
	const [classInstances, setClassInstances] = useState([]);
	const [page, setPage] = useState(1);

	let token = window.localStorage.getItem("token");
	const { studioId } = useParams();

	const [searchParams, setSearchParams] = useSearchParams();

	const { Panel } = Collapse;

	let navigate = useNavigate();

	useEffect(() => {
		fetch('http://127.0.0.1:8000/accounts/userid/', {
					method: 'GET',
					headers: {'Authorization': 'Bearer ' + token}
				})
					.then(response => response.json())
					.then(data => {setUserId(data)});

		let className = searchParams.get("class_name");
		let coach = searchParams.get("coach");
		let date = searchParams.get("date");
		let startTime = searchParams.get("start_time");
		let endTime = searchParams.get("end_time");

		let classNameQuery = "";
		if (className !== null) {
			classNameQuery = `class_name=${className}&`;
		}
		let coachQuery = "";
		if (coach !== null) {
			coachQuery = `coach=${coach}&`;
		}
		let dateQuery = "";
		if (date != null) {
			dateQuery = `date=${date}&`;
		}
		let startTimeQuery = "";
		if (startTime != null) {
			startTimeQuery = `start_time=${startTime}&`;
		}
		let endTimeQuery = "";
		if (endTime != null) {
			endTimeQuery = `end_time=${endTime}&`;
		}

		let queryString = classNameQuery + coachQuery + dateQuery + startTimeQuery + endTimeQuery;
		// remove trailing & character
		if (queryString.substr(queryString.length - 1) === '&') {
			queryString = queryString.slice(0, -1);
		}

		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/studios/${studioId}/search?page=${page}&` + queryString, requestOptions)
			.then(response =>{
				if (response.ok){
					response.json().then(data => {
						if (data.length > 0) {
							setClassInstances(data);
						} 
						else if (page == 1) {
							alert("No matching results. Please try a different query");
							navigate(`/studios/${studioId}/search-form/`);
						} else {
							alert("You've reached the last page.");
							setPage(Math.max(1, page - 1)); // set page back to last page
						}
					});
				}
				else if(response.status === 400){
					response.json().then(text => {
						console.log("Errrorrr")
						console.log(text)
						if (text){
						// for(let i = 0; i < text.length; i++){
							if(text[0]['date']){alert(text[0]['date'])}
							if(text[0]['start_time']){alert(text[0]['start_time'])}
							if(text[0]['end_time']){alert(text[0]['end_time'])}
							// need to fix undefined from before
						// }
						navigate(`../${studioId}/search-form/`)
					}
					})
				}
			}
					)
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
                <h3>Class Search Results</h3>
                <Collapse
                    defaultActiveKey={['0']}
                    onChange={onChange}
                    expandIconPosition={expandIconPosition}
                    >
                        {
                            classInstances.map((classInstance, index)=> (
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
            {classInstances.length > 0 &&
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

export default SearchClassInstance;
