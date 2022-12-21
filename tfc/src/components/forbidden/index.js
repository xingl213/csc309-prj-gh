import React from "react";
import { Link } from "react-router-dom";
import './index.css';

const Forbidden = () => {
    return (
        <div className='forbiddenContent'>
          <div className='name401'>
            401
          </div>
          <div className='smallParagraph401'>
            To view this content you must be logged in.
          </div>
            <Link to="/accounts/login/">
              <button className='btnWrapper401'>
                Login
              </button>
            </Link>
        </div>
    )
}

export default Forbidden;