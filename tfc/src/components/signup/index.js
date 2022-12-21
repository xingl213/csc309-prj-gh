import React, {useState, useEffect} from 'react';
import axios from '../../api/axios';
import { Button, Form, Input, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import "./signupstyle.css";

export const Signup = () => {
    const [username, setUserName] = useState('');
    const [pass, setPass] = useState('');
    const [pass2, setPass2] = useState('');
    const [email, setEmail] = useState('');
    const [phone_num, setPhone_num] = useState('');
    const [address, setAddress] = useState('');
    const [postal_code, setPostal_code] = useState('');
    const [province, setProvince] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [username_error, setUsernameError] = useState("");
    const [pass_error, setPassError] = useState("");
    const [pass2_error, setPass2Error] = useState("");
    const [email_error, setEmailError] = useState("");
    const [phonenum_error, setPhoneNumError] = useState("");
    const [address_error, setAddressError] = useState("");
    const [postalcode_error, setPostalCodeError] = useState("");
    const [province_error, setProvinceError] = useState("");
    const [avatar, setAvatar] = useState('');
    const [avatar64, setAvatar64] = useState('');
    let navigate = useNavigate();


    useEffect(() => {getBase64(avatar, (result) => {
        setAvatar64(result)
        });
    } , [avatar]);

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

    const submit = (e) => {
        e.preventDefault();
        console.log("making POST request with data")
        console.log(avatar64)


        fetch('http://127.0.0.1:8000/accounts/api/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: pass,
            password2: pass2,
            email: email,
            first_name: first_name,
            last_name: last_name,
            profile: {
                province:province,
                postal_code:postal_code,
                address:address,
                avatar: avatar64,
                phone_num: phone_num
            }
            })
        }).then((res) => {
            if(res.ok) {
                console.log("POSTED DATA")
                console.log('You have successfully created a profile!') // display this
                navigate("../login/")
            }
            return res.json().then(text => {
                console.log(text)
                setUsernameError(text["username"]);
                setPassError(text["password"]); // password1 != password2 does not raise error
                setPass2Error(text["password2"]);
                setEmailError(text["email"]);
                if (text[['non_field_errors']]){
                    setEmailError(text['non_field_errors'][0]["email"]);
                }
                if (text['profile']){
                    setAddressError(text["profile"]['address']);
                    setPostalCodeError(text["profile"]['postal_code']);
                    setProvinceError(text["profile"]['province']);
                    setPhoneNumError(text["profile"]['phone_num']);
                    if (text['profile']['non_field_errors']){
                    for( e in text['profile']['non_field_errors']){
                        // need to fix undefined from before
                        if (text['profile']['non_field_errors'][e]['address']){setAddressError(text["profile"]['non_field_errors'][e]['address']);}
                        if (text['profile']['non_field_errors'][e]['postal_code']){setPostalCodeError(text["profile"]['non_field_errors'][e]['postal_code']);}
                        if (text['profile']['non_field_errors'][e]['province']){setProvinceError(text["profile"]['non_field_errors'][e]['province']);}
                        if (text['profile']['non_field_errors'][e]['phone_num']){setPhoneNumError(text["profile"]['non_field_errors'][e]['phone_num']);}
                    }
                }
                }
                console.log(text['non_field_errors'])
                if (text['non_field_errors']){
                    for( e in text['non_field_errors']){
                        // need to fix undefined from before
                        if (text['non_field_errors'][e]['password']){setPassError(text['non_field_errors'][e]['password'] + '. Minimum eight characters, at least one letter, one number and one special character');}                    }
                }
                })
          })
}

    return (
    <>
        <div className='singup'>
        <h2 style={{"margin-bottom": "3%", "text-align": "center"}}>Signup!</h2>
        <Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left">
            <Form.Item label="Username">
            <Input value={username} onChange={(e) =>setUserName(e.target.value)} type = "text" id="username"/>
            {username_error && <div className="user_error"> {username_error} </div>}
            </Form.Item>

            <Form.Item label="Password">
            <Input value={pass} onChange={(e) =>setPass(e.target.value)} type="password" id="password"/>
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
            <Col offset={10}><Button type="primary" onClick={submit}>Sign up!</Button></ Col>
            </Form.Item>

            <Form.Item>
            <Col offset={10}><Button type ="primary" onClick={()=> navigate('../accounts/login/')}>Have an account? Log in here.</Button></Col>
            </Form.Item>
        </Form>
        
        </div>
    </>
    )
    
}

export default Signup;