import React, {useState, useEffect} from 'react';
import Subscription from '../subscription';
import { Button, Card , Space } from 'antd';
//import { useNavigate } from 'react-router-dom';
import "./style.css";

export const SubscriptionPlans = () => {
    const [subs, setSubs] = useState(null);
	let token =  window.localStorage.getItem("token")
    //let navigate = useNavigate();

    useEffect(() => {
	
		fetch('http://127.0.0.1:8000/accounts/all_subscriptions/',  {
			method: 'GET',
			headers: {'Authorization': 'Bearer ' + token}
		})
			.then(response => response.json())
			.then(data => setSubs(data));
        //fix this for setting the current value of sub to cancel
    
	}, [])

    
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
    if(subs){
        for (const i in subs) {
            let time = null;
            if(subs[i]['interval'] === "M"){
                time = 'Monthly';
            }
            if(subs[i]['interval'] === "Y"){
                time ='Yearly';
            }
            if(subs[i]['interval'] === "D"){
                time ='Daily';
            }
            arr.push(<li key={i} value={subs[i]['id']}>{`Subscription plan ${subs[i]['id']}: ${time} payments of \$${subs[i]['price']}`}</li>)
        }
    return (
        <>
        <div className='changeSub'>
            <h1>The subscription plans we offer</h1>
            <br></br>
                <ul>{arr}</ul>
            </div>          
        </>
        )
    }// button should take to credit card change
        
}

export default SubscriptionPlans;