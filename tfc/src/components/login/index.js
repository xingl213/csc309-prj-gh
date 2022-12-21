import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, Input, Col } from 'antd';



export const Login = () => {
    const [user, setUserName] = useState('');
    const [pwd, setPass] = useState('');
    const [userError, setUserError] = useState('');
    const [pwdError, setPwdError] = useState('')
    const [detailError, setDetailError] = useState('');

    let navigate = useNavigate();

    async function useLogin() {

        fetch('http://127.0.0.1:8000/accounts/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: user,
            password:pwd, 
            })
        }).then((res) => {
            res.json().then( text => {
                if (res.ok) {
                    console.log("POSTED DATA")
                        console.log("success");
                        const tkn = text['access'];
                        window.localStorage.setItem("token", tkn)
                        setUserError('');
                        setPwdError(''); 
                        setDetailError('');
                      // force rerender
                        navigate("/accounts/profile/view");
                    // force reload
                        window.location.reload();
                }
                else {
                    console.log("failure")
                    console.log(text)
                    setUserError(text["username"]);
                    setPwdError(text["password"]); 
                    setDetailError(text["detail"]);
                }
            }
            )})
    }


    async function useSubmit(e) {
        e.preventDefault();
        console.log("making POST request for login")
        const token = await useLogin().then(console.log("returning access token to user"));
        console.log("TOKEN ACCESS IS")
        console.log(window.localStorage.getItem('token'))
    }
    
    useEffect(() => {
        console.log("This is called when component mounts") }, [])
    
    return (
    <> <div className='login'>
        <h2 style={{"margin-bottom": "3%", "text-align": "center"}}>Login!</h2>
        <Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left" onSubmit={useSubmit}>
            {/* <label htmlFor="username">username</label> */}
            <Form.Item label="Username">
            <Input value={user} onChange={(e) =>setUserName(e.target.value)} type = "text" id="username"/>
            {userError && <div className="userError"> {userError} </div>}
            </Form.Item>

            <Form.Item label="Password">
            <Input value={pwd} onChange={(e) =>setPass(e.target.value)} type="password" id="password"/>
            {pwdError && <div className="pwdError"> {pwdError} </div>}
            {detailError && <div className="detailError"> {detailError} </div>}
            </Form.Item>

            <Form.Item>
            <Col offset={12}><Button type="primary" onClick={useSubmit}>Log In!</Button></Col>
            </Form.Item>

            <Form.Item>
            <Col offset={12}><Link to="/accounts/signup/"><Button type="primary" >Don't have an account? Register here!</Button></Link></Col>
            </Form.Item>
        </Form>
        </div>
    </>
    )
    // Link to signup

    
}

export default Login;