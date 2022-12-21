import Subscription from '../subscription';
import "./style.css";
import { Button, Card} from 'antd';
import { useNavigate } from 'react-router-dom';



export const SubButton = () => {
    let navigate = useNavigate();


    return (
        <> <div className='SubButton'
        style={{
            position: 'absolute', 
            left: '50%', 
            top: '50%',
            transform: 
            'translate(-50%, 0%)'
        }}>
            <Card
                    bordered={false}
                    style={{
                    width: 700
                    }}
                >
            <Subscription />
            <Button type = "primary" onClick={() =>{navigate("../edit-subscription/")}}>Edit</Button>
            </Card>
        </div>
        </>
    );
    // need to fix avatar upload
        
}

export default SubButton;