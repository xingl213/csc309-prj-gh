import React, { useState, useEffect } from 'react';
import Map, { Marker, MapProvider } from 'react-map-gl';
import { Input, Card } from 'antd';
import pin from './pin.png'
import 'mapbox-gl/dist/mapbox-gl.css'; 
import './index.css'
import { Layout } from 'antd';
import Navbar from '../navbar';
import SearchBox from '../searchBox';
import { Link, Navigate, Redirect, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

Map.mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

const { Search } = Input;

const ClosestStudio = () => {

    let token = window.localStorage.getItem("token");

    const [studioLocations, setStudioLocations] = useState({results: [], next: "null", previous: "null"});
    const [postal_code, setPostalCode] = useState("M5S 1A4"); // uoft postal code
    const [coordinates, setCoordinates] = useState({'longitude': -79.3987, 'latitude': 43.6629});

    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);

    let resizeWindow = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
  
    useEffect(() => {
      resizeWindow();
      window.addEventListener("resize", resizeWindow);
      return () => window.removeEventListener("resize", resizeWindow);
    }, []);

    let navigate = useNavigate();

    useEffect(() => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
		fetch(`http://127.0.0.1:8000/studios/api/closest_studio/?` + new URLSearchParams({
            postal_code: postal_code
        }) , requestOptions)
			.then(response => {
                if (response.status === 401) {
                    navigate('/accounts/login/');
                }
                else if (response.ok) {
                    return response.json()
                } else {
                    alert("Enter a valid postal code");
                    return;
                }
            })
			.then(data => {
                if (data.results) {
                    setStudioLocations(data)
                }
            });
    }, [postal_code])

    useEffect(() => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
		fetch(`http://127.0.0.1:8000/studios/postal_converter/?` + new URLSearchParams({
            postal_code: postal_code
        }) , requestOptions)
			.then(response => {
                if (response.status === 401) {
                    navigate('/accounts/login/');
                }
                else if (response.ok) {
                    return response.json()
                } else {
                    alert("Enter a valid postal code");
                    return;
                }
            })
			.then(data => {
                if (data.longitude) {
                    setCoordinates({'longitude': data.longitude, 'latitude': data.latitude});
                }
            })
    }, [postal_code])

    useEffect(() => {
        <Marker longitude={coordinates.longitude} latitude={coordinates.latitude} anchor="center">
            <img src={pin} width="20" height="20"/>
        </Marker>
    }, [coordinates])

    function OnSearch(postal_code) {
        console.log(postal_code)

        setPostalCode(postal_code);
    }

    const nextPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (studioLocations.next !== "null") {
            fetch(studioLocations.next + new URLSearchParams({
            postal_code: postal_code
            }) , requestOptions)
			.then(response => response.json())
			.then(data => setStudioLocations(data));
        }
    }

    const previousPage = () => {
        let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		};
        if (studioLocations.previous !== "null") {
            fetch(studioLocations.previous + new URLSearchParams({
            postal_code: postal_code
            }) , requestOptions)
			.then(response => response.json())
			.then(data => setStudioLocations(data));
        }
    }

    let prevButton;
    let nextButton;

    if (typeof studioLocations !== 'undefined' && studioLocations.next) {
        nextButton = <button className='buttonWrapper' onClick={nextPage}>Next</button>
    } else {
        nextButton = <></>
    }

    if (typeof studioLocations !== 'undefined' && studioLocations.previous) {
        prevButton = <button className='buttonWrapper' onClick={previousPage}>Previous</button>
    } else {
        prevButton = <></>
    }

    return (
            <div className='contentContainer'>
                <MapProvider>
                    <div className="container">
                        <div className="mapWrapper">
                            <Map
                            initialViewState={{
                                longitude: coordinates.longitude,
                                latitude: coordinates.latitude,
                                zoom: 14
                            }}
                            mapStyle="mapbox://styles/mapbox/streets-v9"
                            onViewportChange={nextViewport =>
                                this.setState({ viewport: { ...nextViewport, width: "fit", height: "max-content" } })
                            }
                            id="baseMap"
                            >
                                {studioLocations.results.map((studioLocation, index)=> (
                                    <div key={index}>
                                        <Marker longitude={studioLocation.longitude} latitude={studioLocation.latitude} anchor="center">
                                            <img src={pin} width="20" height="20"/>
                                        </Marker>
                                    </div>
                                ))}
                                <Marker longitude={coordinates.longitude} latitude={coordinates.latitude} anchor="center">
                                    <img src={pin} width="20" height="20"/>
                                </Marker>
                            </Map>
                        </div>
                        <div className="searchWrapper">
                            <SearchBox key={coordinates} OnSearch={OnSearch} coordinates={coordinates}></SearchBox>
                            {studioLocations.results.map((studioLocation, index)=> (
                                <div key={index}>
                                    <Card title={studioLocation.name} bordered={false} style={{ width: 'auto' }}>
                                        <p>Phone Number: {studioLocation.phone_number}</p>
                                        <p>Postal Code: {studioLocation.postal_code}</p>
                                        <p>Distance: {Math.round(studioLocation.distance * 10) / 10} KM</p>
                                        <p><Link to={"/studios/" + studioLocation.id + "/info/"}>More Information</Link></p>
                                    </Card>
                                </div>
                            ))}
                            {prevButton}
                            {nextButton}
                        </div>
                    </div>
                </MapProvider>
            </div>
    )
}


export default ClosestStudio