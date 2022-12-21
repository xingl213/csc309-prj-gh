import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import './paymentHistory.css';

function PaymentHistory() {
	const [paymentList, setPaymentList] = useState([]);
	const [page, setPage] = useState(1);
	
	let token = window.localStorage.getItem("token")

	useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/accounts/payment-history/?page=${page}`, requestOptions)
			.then(response => response.json())
			.then(data => {
				if (data.length > 0) {
					setPaymentList(data);
				} else if (page === 1) {
					// alert("No payment history.");
				} else {
					alert("No earlier entries.");
					setPage(Math.max(page - 1, 1)); // set page back by 1
				}
			});
	}, [page])

	// for rendering as table with antd
	const columns = [{title: 'Date', dataIndex: 'date', key: 'date'}, {title: 'Amount', dataIndex: 'amount', key: 'amount'}, {title: 'Credit Card', dataIndex: 'credit_card_num', key: 'credit_card_num'}];

	return (
		<>
			<Table pagination={false} dataSource={paymentList} columns={columns} />
            <button className="buttonWrapperSchedule prevButton" onClick={() => {  
                setPage(Math.max(1, page - 1));  
                if (page == 1) {  
                    alert("These are the latest entries.");  
                }  
            }}>Previous page</button>  
            <button className="buttonWrapperSchedule nextButton" onClick={() => setPage(page + 1)}>Next page</button>  
		</>
	);
}

export default PaymentHistory;