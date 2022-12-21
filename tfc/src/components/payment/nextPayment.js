import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

function NextPayment() {
	const [nextPayment, setNextPayment] = useState([]);
	let token = window.localStorage.getItem("token");

	useEffect(() => {
		let requestOptions = {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token})
		};
		fetch(`http://127.0.0.1:8000/accounts/future-payment/`, requestOptions)
			.then(response => response.json())
			.then(data => setNextPayment(data));
	}, [])

	// for rendering as table with antd
	const columns = [{title: 'Date', dataIndex: 'date', key: 'date'}, {title: 'Amount', dataIndex: 'amount', key: 'amount'}, {title: 'Credit Card', dataIndex: 'credit_card_num', key: 'credit_card_num'}];

	return (
		<>
			<Table pagination={false} dataSource={nextPayment} columns={columns} />
		</>
	);
}

export default NextPayment;