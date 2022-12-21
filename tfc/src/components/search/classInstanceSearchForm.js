import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Input, Col } from 'antd';

function SearchClassInstanceForm() {
	const [className, setClassName] = useState("");
	const [coach, setCoach] = useState("");
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	const { studioId } = useParams();

	let navigate = useNavigate();

	const handleSubmit = () => {
		let classNameQuery = "";
		if (className !== "") {
			classNameQuery = `class_name=${className}&`;
		}
		let coachQuery = "";
		if (coach !== "") {
			coachQuery = `coach=${coach}&`;
		}
		let dateQuery = "";
		if (date !== "") {
			dateQuery = `date=${date}&`;
		}
		let startTimeQuery = "";
		if (startTime !== "") {
			startTimeQuery = `start_time=${startTime}&`;
		}
		let endTimeQuery = "";
		if (endTime !== "") {
			endTimeQuery = `end_time=${endTime}&`;
		}

		let queryString = "?" + classNameQuery + coachQuery + dateQuery + startTimeQuery + endTimeQuery;
		// remove trailing & character
		if (queryString.substr(queryString.length - 1) === '&') {
			queryString = queryString.slice(0, -1);
		}

		navigate(`/studios/${studioId}/search` + queryString);
	}

	return (
		<div style={{"margin": "5%"}}>
			<h1 style={{"text-align": "center"}}>Search Classes</h1>
			<h4 style={{"margin-bottom": "3%", "text-align": "center"}}>Note: Leave a field empty to match all</h4>
			<Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left">
				<Form.Item label="Class Name">
					<Input placeholder="<class_name>" onChange={e => {setClassName(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Coach Name">
					<Input placeholder="<coach_name>" onChange={e => {setCoach(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Date">
					<Input placeholder="YYYY-MM-DD" onChange={e => {setDate(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Start Time">
					<Input placeholder="integer from 0-23" onChange={e => {setStartTime(e.target.value)}} />
				</Form.Item>
				<Form.Item label="End Time">
					<Input placeholder="integer from 0-23" onChange={e => {setEndTime(e.target.value)}} />
				</Form.Item>
				<Form.Item>
					<Col offset={7}><Button className="col-offset-12" type="primary" onClick={handleSubmit}>Search</Button></Col>
				</Form.Item>
			</Form>
		</div>
	);
}

export default SearchClassInstanceForm;
