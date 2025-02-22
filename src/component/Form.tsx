import { forwardRef, ReactNode, useImperativeHandle } from "react";
import { useForm } from "../utils/useForm";
import FormContext from "../context/FormContext";
import FormStore from "../utils/FormStore";
import { FormItemProps } from "./FormItem";

interface FormProps {
    form?: any
    onFinish?: (value: { [key: string]: string | number | null }) => void
    onFinishFailed?: () => void
    initialValues?: object
    children?: ReactNode
    FormItem?: React.FunctionComponent<FormItemProps>
}

const Form = forwardRef<Partial<FormStore>, FormProps>(({ form, onFinish, onFinishFailed, initialValues, children }, ref) => {
    /* 创建 form 状态管理实例 */
    const formInstance = useForm(form, initialValues)
    /* 抽离属性 -> 抽离 dispatch ｜ setCallback 这两个方法不能对外提供。  */
    const { setCallback, dispatch, ...providerFormInstance } = formInstance
    /* 向 form 中注册回调函数 */
    setCallback({
        onFinish,
        onFinishFailed
    })
    /* 提供 form 实例 */
    useImperativeHandle(ref, () => providerFormInstance, [providerFormInstance])
    /* 传递 */
    const RenderChildren = <FormContext.Provider value={formInstance}> {children} </FormContext.Provider>

    return (
        <form
            onReset={(e) => {
                e.preventDefault()
                e.stopPropagation()
                formInstance.resetFields() /* 重置表单 */
            }}
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                formInstance.submit()      /* 提交表单 */
            }}
        >
            {RenderChildren}
        </form>
    );
})

export default Form
