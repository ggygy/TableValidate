import { FunctionComponent } from "react";

interface LabelProps {
    label: string;
    labelWidth: number;
    required: boolean;
    height: number;
    children: React.ReactNode;
}

const Label: FunctionComponent<LabelProps> = ({ children, label, labelWidth, required, height }) => {
    return (
        <div className="form-label"
            style={{ height: height + 'px' }}>
            <div
                className="form-label-name"
                style={{ width: `${labelWidth}px` }}>
                {required ? <span style={{ color: 'red' }} >*</span> : null}
                {label}:
            </div>  {children}
        </div>
    );
}

export default Label;