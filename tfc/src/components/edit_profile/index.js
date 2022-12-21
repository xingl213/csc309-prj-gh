import React, {useState, useEffect} from 'react';
import "./style.css";
import { useNavigate } from 'react-router-dom';
import { Button, Form , Col, Input } from 'antd';


export const EditProfile = () => {
    

    let token = window.localStorage.getItem("token");
    // SHOULD I PREFILL THE VALUES? and get them?
    const [profile, setProfile] = useState(null);
    let navigate = useNavigate();
    useEffect(() => {
        let requestOptions = {
        method: 'GET',
        headers: new Headers({'Authorization': 'Bearer ' + token})
        };
        fetch('http://127.0.0.1:8000/accounts/profile/view/', requestOptions)
            .then(response => response.json())
            .then(data => setProfile(data));} ,[])

    const [username, setUserName] = useState('');
    const [pass, setPass] = useState('');
    const [pass2, setPass2] = useState(''); //how to handle passwords?
    const [email, setEmail] = useState('');
    const [phone_num, setPhone_num] = useState('');
    const [address, setAddress] = useState('');
    const [postal_code, setPostal_code] = useState('');
    const [province, setProvince] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatar64, setAvatar64] = useState('');
    const [updating, setUpdating] = useState(false)
    const [username_error, setUsernameError] = useState("");
    const [pass_error, setPassError] = useState("");
    const [pass2_error, setPass2Error] = useState("");
    const [email_error, setEmailError] = useState("");
    const [phonenum_error, setPhoneNumError] = useState("");
    const [address_error, setAddressError] = useState("");
    const [postalcode_error, setPostalCodeError] = useState("");
    const [province_error, setProvinceError] = useState("");
    const [avabool, setAvabool] = useState(false);

    useEffect(() => {
        console.log("making PATCH request with data")
        console.log(avatar64)
        if(avatar64){
        setUpdating(true);
        fetch('http://127.0.0.1:8000/accounts/profile/edit/', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token},
        body: JSON.stringify({
            username: username,
            password: pass,  // need pass1 and pass2 for the patch reequest to be send, need to prefill
            password2: pass2,
            email: email,
            profile:{
                phone_num: phone_num,
                address: address,
                postal_code: postal_code,
                province: province,
                avatar: avatar64
            },
            first_name: first_name,
            last_name: last_name
        })
        }).then((res) => {
            if(res.ok) {
                console.log('You have successfully created a profile!') // display this
                navigate("../profile/view/")
                }
            return res.json().then(text => {
                if(text[0] && text[0]["username"]){
                    setUsernameError(text[0]["username"]);
                }
                setPassError(text["password"]); // password1 != password2 does not raise error
                setPass2Error(text["password2"]);
                setEmailError(text["email"]);
                setAddressError(text['address']);
                setPostalCodeError(text['postal_code']);
                setProvinceError(text['province']);
                setPhoneNumError(text['phone_num']);
                if (text['non_field_errors']){
                    for( let i = 0; i < text['non_field_errors'].length; i++){
                        if (text['non_field_errors'][i]['password']){setPassError(text['non_field_errors'][i]['password']);}
                        if (text['non_field_errors'][i]['phone_num']){setPhoneNumError(text['non_field_errors'][i]['phone_num']);}
                        if (text['non_field_errors'][i]['province']){setProvinceError(text['non_field_errors'][i]['province']);}
                        if (text['non_field_errors'][i]['postal_code'])setPostalCodeError(text['non_field_errors'][i]['postal_code']);
                        if (text['non_field_errors'][i]['address']){setAddress(text['non_field_errors'][i]['address']);}
                        
                    }
                }
                setUpdating(false);
            })
    });
        console.log("made patch")
    }
    } , [avatar64, avabool]);

    function getBase64(file, cb) {
        if(avatar){
            console.log("IN BASE 64")
            console.log(avatar)
            let reader = new FileReader();
            reader.readAsDataURL(avatar);
            reader.onload = function () {
                cb(reader.result)
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }

    async function getFileFromUrl(url, name, defaultType = 'image/jpeg'){
        const response = await fetch(url);
        const data = await response.blob();
        return new File([data], name, {
          type: data.type || defaultType,
        });
      }
      

    useEffect(()=> {
        console.log("SETTING INITIAL")
        console.log(profile)
        if(profile){
        if(!username){setUserName(profile['username']);}
        if(!email) {setEmail(profile['email']); }
        if(!first_name){setFirstName(profile['first_name']);}
        if(!last_name){setLastName(profile['last_name']);}
        if(!phone_num){setPhone_num(profile['profile']['phone_num']);}
        if(!address){setAddress(profile['profile']['address']);}
        if(!postal_code){setPostal_code(profile['profile']['postal_code']);}
        if(!province){setProvince(profile['profile']['province']);}
        if(!avatar){getFileFromUrl(profile['profile']['avatar'], 'example.jpg').then(value=> {setAvatar(value)});
        }
    }
    }, [profile])

    const submit = (e) => {
        e.preventDefault();
        getBase64(avatar, (result) => {
            console.log("s")
            setAvatar64(result)
            setAvabool(!avabool);
            });
        
        console.log("NOPE")
    }

    if (updating){
        return ( <>
            <h1>updating...</h1>
        </>)
    }
    if (profile) { 
        console.log(province)
        if (avatar){
        return (
        <>
        <div className='editProfile'>
            <h1 style={{"text-align": "center"}}>Edit Profile</h1> 
            <br></br>
            <h3 style={{"margin-bottom": "3%", "text-align": "center"}}>Please enter password and confirm to edit profile information.</h3>
            <Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left" onSubmit={submit}>
                <Form.Item label="Username">
                <Input value={username}  onChange={(e) =>setUserName(e.target.value)} type = "text" id="username"/>
                {username_error && <div className="user_error"> {username_error} </div>}
                </Form.Item>
                <Form.Item label="Password">
                <Input value={pass}  onChange={(e) =>setPass(e.target.value)} type="password" id="password"/>
                {pass_error && <div className="pass_error"> {pass_error} </div>}
                </Form.Item>
                
                <Form.Item label="Repeat Password">
                <Input value={pass2} onChange={(e) =>setPass2(e.target.value)} type="password" id="password2"/>
                {pass2_error && <div className="pass2_error"> {pass2_error} </div>}
                </Form.Item>
                
                <Form.Item label="First Name">
                <Input value={first_name} onChange={(e) =>setFirstName(e.target.value)} type = "text" id="first_name"/>
                </Form.Item>
                
                <Form.Item label="Last Name">
                <Input value={last_name} onChange={(e) =>setLastName(e.target.value)} type = "text" id="last_name"/>
                </Form.Item>

                <Form.Item label="Email">
                <Input value={email} onChange={(e) =>setEmail(e.target.value)} type="email" id="email"/>
                {email_error && <div className="email_error"> {email_error} </div>}
                </Form.Item>

                <Form.Item label="Phone Number">
                <Input value={phone_num} onChange={(e) =>setPhone_num(e.target.value)} type="text" id="phone_num"/>
                {phonenum_error && <div className="phone_error"> {phonenum_error} </div>}
                </Form.Item>

                <Form.Item label="Address">
                <Input value={address} onChange={(e) =>setAddress(e.target.value)} type="text" id="address"/>
                {address_error && <div className="address_error"> {address_error} </div>}
                </Form.Item>

                <Form.Item label="Postal Code">
                <Input value={postal_code} onChange={(e) =>setPostal_code(e.target.value)} type="text" id="postal_code"/>
                {postalcode_error && <div className="post_error"> {postalcode_error} </div>}
                </Form.Item>

                <Form.Item label="Province">
                <Input value={province} onChange={(e) =>setProvince(e.target.value)} type="text" id="province"/>
                {province_error && <div className="province_error"> {province_error} </div>}
                </Form.Item>
                
                <Form.Item label="Avatar">
                <Input value={""} onChange={(e) =>setAvatar(e.target.files[0])} type="file" id="avatar" accept="image/jpeg,image/png,image/gif"/>
                </Form.Item>

                <Form.Item>
                <Col offset={10}><Button type="primary"  onClick={submit}>Save!</Button></Col>
                </ Form.Item>

                <Form.Item>
                <Col offset={10}><Button type="primary" onClick={() => navigate("../profile/view/")}>Exit</Button></Col>
                </Form.Item>
            </Form>
            </div>
        </>
        )
    }
}
    return ( <>
        <h1>still loading...</h1>
    </>)
}

export default EditProfile;