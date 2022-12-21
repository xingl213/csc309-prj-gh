import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from '../navbar';
import './index.css';
import sample from '../../media/video/trimmed.mp4'
import SubscriptionPlans from '../subscriptionPlans';
const { Header, Content, Footer } = Layout;

const Home = () => {
  return (
        <div className='landingContainer'>
          <video className='videoTag' autoPlay loop muted>
              <source src={sample} type='video/mp4' />
          </video>
          <div className='landingContent'>
            <div className='name'>
              Toronto Fitness Club
            </div>
            <div className='smallParagraph'>
              The premier fitness club of Toronto.
            </div>
              <Link to="/accounts/signup/">
                <button className='btnWrapper'>
                  Sign Up
                </button>
              </Link>
          </div>
        </div>
  );
}
export default Home;
