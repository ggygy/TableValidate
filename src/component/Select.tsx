import { FunctionComponent } from "react";

interface SelectProps {
    children: React.ReactNode
    width?: number
    placeholder: string
    defaultValue?: string
}

const Select: FunctionComponent<SelectProps> = ({ children, ...props }) => {
    return (
        <select {...props} className="form-input">
            <option label={props?.placeholder} value={props?.placeholder}>
                {props.placeholder}
            </option>
            {children}
        </select>
    )
}

/* 绑定静态属性   */
export const Option = function (props: {
    value: string | number
    children?: React.ReactNode
}) {
    return <option {...props} className="" label={props?.children as string}></option>
}

export default Select;
