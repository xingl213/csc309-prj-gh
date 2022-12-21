import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, CalendarOutlined, ScheduleOutlined, EditOutlined, EyeOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import styles from './index.css';

const Navbar = () => {
    let navigate = useNavigate();
    const handleOnClick = () => {
        window.localStorage.removeItem('token');
        navigate("/");
        window.location.reload();
    }

    const [userId, setUserId] = useState(-1);

    let token = window.localStorage.getItem("token");

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

    let loginLogout;

    if (!isNaN(parseFloat(userId)) && !isNaN(userId - 0) && userId !== -1) {
        loginLogout = <Link onClick={handleOnClick} to="/"><Menu.Item>Logout</Menu.Item></Link>
    } else {
        loginLogout = <Link to="/accounts/login/"><Menu.Item>Login</Menu.Item></Link>
    }

    return (
        <Menu mode="horizontal">  
            <Link to="/">  
                <Menu.Item className={styles.tfc}>  
                    TFC  
                </Menu.Item>  
            </Link>   
            <Link to="/accounts/profile/view/">  
                <Menu.Item>  
                    My Profile  
                </Menu.Item>  
            </Link>    
            <Link to="/studios/search-form/">  
                <Menu.Item>  
                    Search Studios  
                </Menu.Item>  
            </Link>  
            <Link to="/studios/closest_studio">  
                <Menu.Item>  
                    Studios Near Me  
                </Menu.Item>  
            </Link>
            {loginLogout}  
        </Menu>
        )
    };
export default Navbar;