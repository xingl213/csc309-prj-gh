import React, {useState, useEffect} from 'react';
import "./profilestyle.css";
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';



export const Profile = () => {

    let navigate = useNavigate();
    const [profile, setProfile] = useState(null);

	let token = window.localStorage.getItem("token");
    
	useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/accounts/profile/view/`, requestOptions)
			.then(response => {
                if (response.ok){
                    response.json().then(data => setProfile(data));
                }
            
                if (response.status == 401){
                    console.log("UNAUTHORIIIZED")
                    navigate('../login/')
                }
            }
            )
	}, [])


    if (profile){
        console.log(profile)
        return (
            <>
                <div className='profile' >
                <Card
                    title={profile.username}
                    bordered={false}
                    style={{
                    width: 700,
                    }}
                >
                <img id='avatar' src={profile['profile']['avatar']} width="128" height="128"></img>
                <p id='username'> <b>Username: </b>{profile['username']}</p>
                
                <p id='first_name'><b>First name: </b>{profile['first_name']}</p>

                <p id='last_name'><b>Last name: </b>{profile['last_name']}</p>

                <p id='email'><b>Email: </b>{profile['email']}</p>

                <p id='phone_num'><b>Phone number: </b>{profile['profile']['phone_num']}</p>

                <p id='address'><b>Address: </b>{profile['profile']['address']}</p>

                <p id='postal_code'><b>Postal code: </b>{profile['profile']['postal_code']}</p>

                <p id='province'><b>Province: </b>{profile['profile']['province']}</p>
                
                <Button type='primary'onClick={() =>{navigate("../profile/edit/")}}>Edit Profile</Button>
                </Card>
                </ div>

                
            </>
        );
        // need to fix avatar upload
    }
        
}

export default Profile;