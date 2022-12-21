import React, {useState, useEffect} from 'react';
import "./style.css";
import { Button, Card} from 'antd';
import { useNavigate } from 'react-router-dom';



export const CardInfo = () => {
    const [cardInfo, setCardInfo] = useState(null);
    let navigate = useNavigate();

	// replace hard-coded token
    // need to get user profile id
	let token = window.localStorage.getItem("token");

    useEffect(() => {
		let requestOptions = {
            method: 'GET',
            headers: new Headers({'Authorization': 'Bearer ' + token})
        };
        fetch(`http://127.0.0.1:8000/accounts/profile/edit-payment/`, requestOptions)
            .then(response => response.json())
            .then(data => setCardInfo(data)).catch(error => console.log('No paymend info'));
	}, [])

    console.log(cardInfo)
    if (cardInfo){
        if (cardInfo['credit_card_num'] == ''){
            return (
                <>
                    <h1>Card Information</h1>
                    <p>No Card added</p>
                    <Button type="primary" onClick={()=>{navigate("../edit-payment/")}}>Edit!</Button>
                </>
            )
        }
        return (
            <>
                <div className='cardInfo'>
                    <Card
                    bordered={false}
                    style={{
                    width: 700
                    }}
                >
                <p id='credit_card_num'><b>Card number: </b>{cardInfo['credit_card_num']}</p>
                
                <p id='card_code'><b>Card code: </b>{cardInfo['card_code']}</p>

                <p id='card_expr'><b>Card expiration: </b>{cardInfo['card_expr']}</p>
                <Button type="primary" onClick={() =>{navigate("../edit-payment/")}}>Edit</Button>
                </Card>
                </div>
            </>
        );
        // need to fix avatar upload
    }
        
}

export default CardInfo;