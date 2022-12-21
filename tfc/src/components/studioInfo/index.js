import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import Forbidden from '../forbidden/index.js';
import NotFound from '../notFound/index.js';
import { Card } from 'antd';
import './index.css'
import { SearchOutlined, ScheduleOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';

const Info = () => {
    const [studioInfo, setStudioInfo] = useState({'name': "a", address: "a", phone_number: "a", directions: "a"});
    const [responseOk, setResponseOk] = useState(true);

    let token = window.localStorage.getItem("token");
	const { studioId } = useParams();

	useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/studios/${studioId}/info/`, requestOptions)
			.then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    console.log("bye");
                    setResponseOk(false);
                }
            })
			.then(data => setStudioInfo(data));
	}, [])

    return (
        <>  {responseOk ?
            <div className='cardContainer'>
                    {console.log(responseOk)}
                <h3>{studioInfo.name} Information</h3>
                <Card
                    title={studioInfo.name}
                    bordered={false}
                    style={{
                    width: 800
                    }}
                >
                    <p><b>Address: </b> {studioInfo.address}</p>
                    <p><b>Postal Code: </b> {studioInfo.postal_code}</p>
                    <p><b>Phone Number: </b> {studioInfo.phone_number}</p>
                    <p><b>Directions: </b> <a href={studioInfo.directions} target="_blank">{studioInfo.directions}</a> </p>

                    <div className='buttonContainer'>
                        <Link to={"/studios/" + studioId + "/images/"}>
                            <button className='buttonWrapperInfo'>
                                    Images <PictureOutlined/>
                            </button>
                        </Link>
                        <Link to={"/studios/" + studioId + "/amenities/"}>
                            <button className='buttonWrapperInfo'>
                                    Amenities <PlusOutlined />
                            </button>
                        </Link>
                        <Link to={"/studios/" + studioId + "/classes/schedule/"}>
                            <button className='buttonWrapperInfo'>
                                    Class Schedule <ScheduleOutlined />
                            </button>
                        </Link>
                        <Link to={"/studios/" + studioId + "/search-form/"}>
                            <button className='buttonWrapperInfo'>
                                    Search Classes <SearchOutlined />
                            </button>
                        </Link>
                    </div>

                </Card>
                <div className='spacer'></div>
            </div>
            : <NotFound/>
            }
        </>
    );

};

export default Info;