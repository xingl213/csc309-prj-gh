import React, {useState, useEffect} from 'react';
import CardInfo from '../cardInfo';
import Subscription from '../subscription';
import SubButton from '../SubscriptionButton';
import Profile from '../profile';
import UserSchedule from '../userClassSchedule';
import { Tabs } from 'antd';
import PaymentHistory from '../payment/paymentHistory';
import NextPayment from '../payment/nextPayment';
import "./tabstyle.css";


export const ProfileTab = () => {

    const items = [
        { label: 'Profile Info', key: 'item-1', children: <Profile />}, // remember to pass the key prop
        { label: 'Credit Card Info', key: 'item-2', children: <CardInfo /> },
        { label: 'Subscription Info', key: 'item-3', children: <SubButton /> },
        { label: 'Your Schedule', key: 'item-4', children: <UserSchedule/> },
        { label: 'Payment History', key: 'item-5', children: <PaymentHistory/> },
        { label: 'Next Payment', key: 'item-6', children: <NextPayment />},
      ];


    return (
        <> 
            <div className='tab'>
            <Tabs items={items} />
            </ div>
        </>
    );
    // need to fix avatar upload
        
}

export default ProfileTab;