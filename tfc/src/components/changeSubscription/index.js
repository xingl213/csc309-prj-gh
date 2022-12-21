import React, {useState, useEffect} from 'react';
import Subscription from '../subscription';
import { Button, Card , Space, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import "./style.css";

export const ChangeSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [subscription_c, setSubscription_c] = useState(null);
    const [subs, setSubs] = useState(null);
    const [error, setError] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [userId, setUserId] = useState('');
    const [submitB, setSubmitB] = useState(false);
	let token =  window.localStorage.getItem("token")
    let navigate = useNavigate();

    useEffect(() => {
		fetch('http://127.0.0.1:8000/accounts/userid/', {
			method: 'GET',
			headers: {'Authorization': 'Bearer ' + token}
		})
			.then(response => response.json()
			.then(data => {
                console.log("USER ID IS")
                console.log(data);
                setUserId(data)}));

		fetch('http://127.0.0.1:8000/accounts/all_subscriptions/',  {
			method: 'GET',
			headers: {'Authorization': 'Bearer ' + token}
		})
			.then(response => response.json())
			.then(data => setSubs(data));
        //fix this for setting the current value of sub to cancel
        fetch('http://127.0.0.1:8000/accounts/subscription/',  {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        })
            .then(response => response.json())
            .then(data => {
                setSubscription(data)
                setSubscription_c(data)});
    
	}, [])
    
    // have to get user
    useEffect(() => {
        console.log("VALUUEUEUE")
        console.log(subscription)
        console.log(typeof subscription)
        if (typeof subscription === "number" && userId){
            console.log(subscription)
            console.log("SUBMIT")
            fetch('http://127.0.0.1:8000/accounts/subscription/change/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                user: userId,
                to_subscription_plan:subscription ,
                status:"S" , 
                })
            }).then((res) => {
                if(res.ok) {
                    console.log("POSTED DATA")
                    navigate("../profile/view/")
                }
                return res.json().then(text => {
                    console.log(text)
                    setError('Add credit card information to add subscription')
                    navigate("../profile/view/")
                    })
            })
            // force page to render
        }
     }, [submitB]);
    
    function setter() {
        console.log(subscription)
        console.log("GGGG")
        console.log(submitB)
        setSubmitB(!submitB)
        //navigate("../profile/view/")
    }

    function set_cancelation_sub(){
        console.log("SET CANCELATION");
        console.log("KEY IS")
        console.log(subscription_c)
        console.log(typeof subscription_c !== null)
        if (subscription_c && userId){
        console.log("CANCEL")
		fetch('http://127.0.0.1:8000/accounts/subscription/change/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            user: userId,
            to_subscription_plan:subscription_c['id'] ,
            status:"C" , 
            })
        }).then((res) => {
            if(res.ok) {
                console.log("POSTED DATA")
                navigate("../profile/view/")
            }
            else{
            return res.json().then(text => {
                console.log(text)
                setCancelError("Subscription is already canceled!")
                })
            }
          })
        }     
    
    }

    
    if (subs === null){
        return ( 
            <>
            <div className='changeSub'>
                <h1>still loading...</h1>
            </ div>
            </>
        )
    }
    let arr = []
    const { Option } = Select

    if(subs && userId &&subscription&&subscription_c){
        for (const i in subs) {
            let interval;
            if (subs[i].interval === "M") {
                interval = "Month";
            } else if (subs[i].interval === "Y") {
                interval = "Year";
            } else { // === "D"
                interval = "Day";
            }
        arr.push({value: subs[i]['id'], label: "$" + `${subs[i]['price']} per ${interval}`})
    }

    return (
        <><div className='changeSub'>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card title="Current Subscription Plan">
                <Subscription /> 
                <Button type='primary' onClick={set_cancelation_sub}> Cancel!</Button>
                {cancelError && <div className="cancelError">
                {cancelError} 
            </div>}  
            </Card>
           
            <Card title="Change Subscription Plan">
            <Select id="sub_id" onSelect= {(v) =>{console.log("VVV"); console.log(v);setSubscription(v)}}options={arr}></Select>
            <br></br>
            <br></br>
            <div>
            <Button type = "primary" onClick={setter}>Save!</Button></div>
            <div>
                <br></br>
            <Button type = "primary" onClick={() =>{navigate("../profile/view/")}}>Exit</Button></div>
            {error && <div className="error">
                {error} 
                <Button > Add credit card!</Button>
                
            </div>} 
            </Card> 
            </ Space>
            
            </div>          
        </>
        )
    }// button should take to credit card change
        
}

export default ChangeSubscription;