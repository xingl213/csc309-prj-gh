import React, {useEffect} from 'react';
import { Button } from 'antd';



export const Logout = () => {
    

    function useSubmit() {
        console.log("LOGGING OUT")
        window.localStorage.removeItem('token');
    }
    
    useEffect(() => {
        console.log("This is called when component mounts") }, [])
    
    return (
    <>
        <Button type='primary' onClick={useSubmit}>Logout</Button>
    </>
    )
    
}

export default Logout;