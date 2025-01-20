import { useRef, useState } from "react";
import FormStore, { type FormInstance } from "./FormStore";


export function useForm(form: object, defaultFormValue = {}) {
    const formRef = useRef<FormInstance | null>(null)
    const [, forceUpdate] = useState({})

    if (!formRef.current) {
        if(form){
            formRef.current = form as FormInstance /* 如果已经有 form，那么复用当前 form  */
        }else { /* 没有 form 创建一个 form */
          const formStoreCurrent = new FormStore(() => forceUpdate({}), defaultFormValue)
          /* 获取实例方法 */
          formRef.current = formStoreCurrent.getForm()
        }
    }

    return formRef.current
}