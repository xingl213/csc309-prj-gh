import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Divider, List, Typography } from 'antd';
import NotFound from '../notFound/index.js';
import './index.css'

const Amenities = () => {

    const [studioAmenities, setStudioAmenties] = useState({'results': [], 'next': "null", 'previous': "null"});
    const [responseOk, setResponseOk] = useState(true);

    let token = window.localStorage.getItem("token");
    const { studioId } = useParams();

    let navigate = useNavigate();

    useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/studios/${studioId}/amenities/`, requestOptions)
            .then(response => {
                if (response.status === 401) {
                    navigate("/accounts/login");
                }
                else if (response.ok) {
                    return response.json()
                } else {
                    setResponseOk(false);
                }
            })
			.then(data => setStudioAmenties(data)); // [1].image_b64.substring(2, data.results[1].image_b64.length - 1)
	}, [])

    const nextPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (studioAmenities.next !== "null") {
            fetch(studioAmenities.next, requestOptions)
			.then(response => response.json())
			.then(data => setStudioAmenties(data));
        }
    }

    const previousPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (studioAmenities.previous !== "null") {
            fetch(studioAmenities.previous, requestOptions)
			.then(response => response.json())
			.then(data => setStudioAmenties(data));
        }
    }

    let prevButton;
    let nextButton;

    if (typeof studioAmenities !== 'undefined' && studioAmenities.next) {
        nextButton = <button className='buttonWrapperAmenity' onClick={nextPage}>Next</button>
    } else {
        nextButton = <></>
    }

    if (typeof studioAmenities !== 'undefined' && studioAmenities.previous) {
        prevButton = <button className='buttonWrapperAmenity' onClick={previousPage}>Previous</button>
    } else {
        prevButton = <></>
    } 

    return (
        <> {responseOk ?
            <div className='amenityContainer'>
            <Divider orientation="left">Amenities</Divider>
            <List
            bordered
            dataSource={studioAmenities.results}
            renderItem={(amenity, index) => (
                <List.Item>
                <Typography.Text mark>
                    <ul>
                        <li>Type: {amenity.type}</li>
                        <li>Number: {amenity.numbers}</li>
                    </ul>
                </Typography.Text>
                </List.Item>
            )}
            />
            {prevButton}
            {nextButton}
            </div>
        : <NotFound/>
        }
        </>
    )

}

export default Amenities;