import React from "react";
import { Link } from "react-router-dom";
import './index.css';

const NotFound = () => {
    return (
        <div className='notFoundContent'>
          <div className='name404'>
            404
          </div>
          <div className='smallParagraph404'>
            The page you were looking for does not exist.
          </div>
            <Link to="/">
              <button className='btnWrapper404'>
                Home
              </button>
            </Link>
        </div>
    )
}

export default NotFound;