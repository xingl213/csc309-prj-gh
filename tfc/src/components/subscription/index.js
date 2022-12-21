import React, {useState, useEffect} from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import "./style.css";



export const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState(null);
    const [subs, setSubs] = useState(null);

    let navigate = useNavigate();

	// replace hard-coded token
    // need to get user profile id
    // need to get the latest subscription information
	let token = window.localStorage.getItem("token")
    const [cardInfo, setCardInfo] = useState("card loading");
    

    useEffect(() => {
		let requestOptions = {
            method: 'GET',
            headers: new Headers({'Authorization': 'Bearer ' + token})
        };
        fetch(`http://127.0.0.1:8000/accounts/profile/edit-payment/`, requestOptions)
            .then(response => response.json())
            .then(data => setCardInfo(data)).catch(error => console.log('No paymend info'));
        fetch('http://127.0.0.1:8000/accounts/all_subscriptions/',  {
			method: 'GET',
			headers: {'Authorization': 'Bearer ' + token}
		})
			.then(response => response.json())
			.then(data => setSubs(data));
	}, [])
	useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch('http://127.0.0.1:8000/accounts/subscription/change/', requestOptions)
			.then(response => {
                if (response.ok){
                    return response.json()
                }
                console.log(response)
            })
			.then(data => setSubscription(data));
	}, [])

    if (subscription && subs){
        let display_sub = null;
        for (let i = 0; i < subs.length; i++){
            if( subs[i]['id'] === subscription['to_subscription_plan']){
                display_sub = subs[i];
            }
        }
        if (!subscription['to_subscription_plan']){
            return (
                <>
                <div className='sub'>
                    <p>No Subscription added</p>
                    {/* <Button onClick={() =>{navigate("../edit-subscription/")}}>Add Subscription!</Button> */}
                    </div>
                </>
            )
        }

        let intervalStr;
        if (display_sub.interval === "M") {
            intervalStr = "Monthly";
        } else if (display_sub.interval === "Y") {
            intervalStr = "Yearly";
        } else {
            intervalStr = "Daily";
        }
        let statusStr;
        if (subscription.status === 'S') {
            statusStr = "Subscribed";
        } else {
            statusStr = "Canceled";
        }
        return (
            <>
                <div className='sub'>
                <label htmlFor='to_subscription_plan'>Subscription Plan:</label> 
                <p id='to_subscription_plan'>{display_sub['id']}</p>

                <label htmlFor='interval'>Interval:</label> 
                <p id='interval'>{intervalStr}</p>

                <label htmlFor='price'>Price:</label> 
                <p id='price'>${display_sub['price']}</p>

                <label htmlFor='status'>Status:</label> 
                <p id='status'>{statusStr}</p>

                </div>
            </>
        );
    }
    if(cardInfo!== "card loading"){
    return (
        <>
        <div className='sub'>
            {error && <div className="error"> {error} </div>}
            <Button type="primary" onClick={()=>{navigate("../edit-payment/")}}> Add credit card!</Button>
            </div>
            
        </>
    ) 
    }
    return (
        <>
        <div className='sub'>
            <h1>Loading...</h1>
            </div>
            
        </>
    )
        
}

export default Subscription;