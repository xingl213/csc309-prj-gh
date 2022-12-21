import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'antd';
import './index.css'
import NotFound from '../notFound';

const Images = () => {

    const [studioImages, setStudioImages] = useState([{'image_b64': 'fake'}]);
    const [studioName, setStudioName] = useState("");
    const [responseOk, setResponseOk] = useState(true);

    let navigate = useNavigate();


    let token = window.localStorage.getItem("token");
    const { studioId } = useParams();

    useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/studios/${studioId}/images/`, requestOptions)
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
			.then(data => setStudioImages(data.results)); // [1].image_b64.substring(2, data.results[1].image_b64.length - 1)
	}, [])

    useEffect(() => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
        fetch(`http://127.0.0.1:8000/studios/${studioId}/id_to_name/`, requestOptions)
			.then(response => response.json())
			.then(data => setStudioName(data.studio_name));
	}, [studioId])

    return (
        <> {responseOk ?
            <div className='imageContainer'>
                <h3>{studioName} Images</h3>
                <Carousel autoplay>
                    {studioImages.map(image => (
                        <img key={image.image_b64} src={"data:image/jpeg;base64," + image.image_b64.substring(2, image.image_b64.length - 1)}></img>
                    )
                    )}
                </Carousel>
            </div>
        : <NotFound/>
        }</>
    )
}

export default Images