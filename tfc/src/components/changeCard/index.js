import React, {useState, useEffect} from 'react';
// import "./style.css";
import { Button, Form,Col } from 'antd';
import { useNavigate } from 'react-router-dom';

export const ChangeCard = () => {
    const [cardnum, setCardNum] = useState('');
    const [cardcode, setCardCode] = useState('');
    const [cardexpr, setCardExpr] = useState('');
    const [userId, setUserId] = useState('');

    const [cardnumerror, setCardNumError] = useState('');
    const [cardcodeerror, setCardCodeError] = useState('');
    const [cardexprerror, setCardExprError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
	let token =   window.localStorage.getItem("token");
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
	}, [])


    function useSubmit(e) {
        // setting the errors to null
        e.preventDefault();

        setCardNumError('');
        setCardCodeError('');
        setCardExprError('');

        if (userId){
            console.log("SUBMIT")
            fetch('http://127.0.0.1:8000/accounts/profile/edit-payment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                user: userId, //TODO: FIX this to not include the user
                credit_card_num:cardnum ,
                card_code:cardcode , 
                card_expr:cardexpr
                })
            }).then((res) => {
                if(res.ok) {
                    console.log("POSTED DATA")
                    setSuccessMessage('You have successfully changed the payment information!') // display this
                    navigate("../profile/view/")
                }
                return res.json().then(text => {
                    console.log(text)
                    setCardCodeError(text['card_code']);
                    setCardExprError(text['card_expr']);
                    setCardNumError(text['credit_card_num']);
                    if(text['non_field_errors']) {
                        for( e in text['non_field_errors']){
                            // need to fix undefined from before or duplicates
                            if (text['non_field_errors'][e]['card_code']){setCardCodeError(text['non_field_errors'][e]['card_code']);}
                            if (text['non_field_errors'][e]['card_expr']){setCardExprError(text['non_field_errors'][e]['card_expr']);}
                            if (text['non_field_errors'][e]['credit_card_num']){setCardNumError(text['non_field_errors'][e]['credit_card_num']);}
                    
                        }
                    }
                    })
            })
        }
    }
    

    return (
        <> <div className='changeCard'>
            <h1 style={{"text-align": "center"}}>Change Card Information</h1>
            <Form labelCol={{span: 2, offset: 4}} wrapperCol={{span: 14}} labelAlign="left" onSubmit={useSubmit}>
            <Form.Item label="Card Number">
            <input value={cardnum} onChange={(e) =>setCardNum(e.target.value)} type = "text" id="cardnum"/>
            {cardnumerror && <div className="num_error"> {cardnumerror} </div>}
            </Form.Item>

            <Form.Item label="Card Code">
            <input value={cardcode} onChange={(e) =>setCardCode(e.target.value)} type="text" id="cardcode"/>
            {cardcodeerror && <div className="code_error"> {cardcodeerror} </div>}
            </Form.Item>

            <Form.Item label="Card Expiration">
            <input value={cardexpr} onChange={(e) =>setCardExpr(e.target.value)} type="text" id="cardexpr"/>
            {cardexprerror && <div className="expr_error"> {cardexprerror} </div>}
            </Form.Item>

            <Form.Item>
            <Col offset={10}><Button type="primary" onClick={useSubmit}>Save!</Button></Col>
            </Form.Item>
            
            <Form.Item>
            <Col offset={10}><Button type="primary" onClick={() =>{navigate("../profile/view/")}}>Exit</Button></Col>
            </Form.Item>
            </Form>
            </div>
        </>
    )
        
}

export default ChangeCard;