import { FunctionComponent } from "react";

interface MessageProps {
    status: 'reject' | 'pendding' | 'resolve';
    message: string;
    required: boolean;
    name: string;
    value: string;
}
 
const Message: FunctionComponent<MessageProps> = ({ status , message , required , name , value }) => {
    let showMessage: string | null = ''
    let color = '#fff'
    if(required && !value && status === 'reject'  ){
        showMessage = `${name} 为必填项`
        color = 'red'
    }else if(status === 'reject'){
        showMessage = message
        color = 'red'
    }else if(status === 'pendding'  ){
        showMessage = null
    }else if( status === 'resolve' ){
        showMessage = '校验通过'
        color = 'green'
    }
    return <div className="form-message" >
       <span style={{ color }}>{showMessage}</span>
    </div>
}
 
export default Message;