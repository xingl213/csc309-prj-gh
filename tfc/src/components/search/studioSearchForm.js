import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Input, Col } from 'antd';

function SearchStudioForm() {
	const [studioName, setStudioName] = useState("");
	const [amenity, setAmenity] = useState("");
	const [className, setClassName] = useState("");
	const [coach, setCoach] = useState("");

	let navigate = useNavigate();

	const handleSubmit = () => {
		let studioNameQuery = "";
		if (studioName !== "") {
			studioNameQuery = `studio_name=${studioName}&`;
		}
		let amenityQuery = "";
		if (amenity !== "") {
			amenityQuery = `amenity=${amenity}&`;
		}
		let classNameQuery = "";
		if (className !== "") {
			classNameQuery = `class_name=${className}&`;
		}
		let coachQuery = "";
		if (coach !== "") {
			coachQuery = `coach=${coach}&`;
		}

		let queryString = "?" + studioNameQuery + amenityQuery + classNameQuery + coachQuery;
		// remove trailing & character
		if (queryString.substr(queryString.length - 1) === '&') {
			queryString = queryString.slice(0, -1);
		}

		navigate("/studios/search" + queryString);
	}

	return (
		<div style={{"margin": "5%"}}>
			<h1 style={{"text-align": "center"}}>Search Studios</h1>
			<h4 style={{"margin-bottom": "3%", "text-align": "center"}}>Note: Leave a field empty to match all</h4>
			<Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left">
				<Form.Item label="Studio Name">
					<Input placeholder="<studio_name>" onChange={e => {setStudioName(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Amenity">
					<Input placeholder="<amenity>" onChange={e => {setAmenity(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Class Name">
					<Input placeholder="<class_name>" onChange={e => {setClassName(e.target.value)}} />
				</Form.Item>
				<Form.Item label="Coach Name">
					<Input placeholder="<coach_name>" onChange={e => {setCoach(e.target.value)}} />
				</Form.Item>
				<Form.Item>
					<Col offset={7}><Button className="col-offset-12" type="primary" onClick={handleSubmit}>Search</Button></Col>
				</Form.Item>
			</Form>
		</div>
	);
}

export default SearchStudioForm;
