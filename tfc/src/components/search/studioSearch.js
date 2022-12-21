import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Col } from 'antd';
import './studioSearch.css';

function SearchStudio() {
	const [studios, setStudios] = useState([]);
	const [page, setPage] = useState(1);
	let token = window.localStorage.getItem("token");

	const [searchParams, setSearchParams] = useSearchParams();

	let navigate = useNavigate();

	useEffect(() => {
		let studioName = searchParams.get("studio_name");
		let amenity = searchParams.get("amenity");
		let className = searchParams.get("class_name");
		let coach = searchParams.get("coach");

		let studioNameQuery = "";
		if (studioName !== null) {
			studioNameQuery = `studio_name=${studioName}&`;
		}
		let amenityQuery = "";
		if (amenity !== null) {
			amenityQuery = `amenity=${amenity}&`;
		}
		let classNameQuery = "";
		if (className !== null) {
			classNameQuery = `class_name=${className}&`;
		}
		let coachQuery = "";
		if (coach !== null) {
			coachQuery = `coach=${coach}&`;
		}

		let queryString = studioNameQuery + amenityQuery + classNameQuery + coachQuery;
		// remove trailing & character
		if (queryString.substr(queryString.length - 1) === '&') {
			queryString = queryString.slice(0, -1);
		}

		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/studios/search?page=${page}&` + queryString, requestOptions)
			.then(response => {
				if (response.ok) {
					return response.json();
				} else if (response.status === 401) {
					navigate("/accounts/login/");
				}
			})
			.then(data => {
				if (data.length > 0) {
					setStudios(data);
				} else if (page == 1) {
					alert("No matching results. Please try a different query");
					navigate("/studios/search-form/");
				} else {
					alert("You've reached the last page.");
					setPage(Math.max(1, page - 1)); // set page back to last page
				}
			});
	}, [page])

	// for antd rendering
	const { Meta } = Card;

	return (
		<>
			{studios.map(studio => (
				<div>
					<Link to={"/studios/" + studio.id + "/info/"}>
						<Card style={{"float": "left", "width": "30%", "margin": "1.6%"}} hoverable cover={<img style={{"height": "230px"}} src={'http://127.0.0.1:8000' + studio.main_image} />} >
							<Meta title={studio.name} description={studio.address} />
						</Card>
					</Link>
				</div>
			))}
			{studios.length > 1 &&
				<div>
					<button className="buttonWrapperSchedule" onClick={() => {
						setPage(Math.max(1, page - 1));
						if (page == 1) {
							alert("This is the first page.");
						}
					}}>Previous page</button>
					<button className="buttonWrapperSchedule" onClick={() => setPage(page + 1)}>Next page</button>
				</div>
			}
		</>
	);
}

export default SearchStudio;
