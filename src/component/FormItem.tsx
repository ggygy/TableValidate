/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneElement, FunctionComponent, isValidElement, ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import FormContext from "../context/FormContext";
import Message from "./Message";
import Label from "./Label";

/**
 * 表单项的属性接口
 */
export interface FormItemProps {
    /**
     * 表单单元项的键
     */
    name: string;
    /**
     * 表单单元项的子元素
     */
    children: ReactNode;
    /**
     * 表单标签属性
     */
    label: string;
    /**
     * 表单标签宽度
     */
    labelWidth: number;
    /**
     * 表单单元项的高度
     * @default 50
     */
    height?: number;
    /**
     * 是否为必填项
     * @default false
     */
    required?: boolean;
    /**
     * 表单验证规则
     */
    rules?: {
        rule: ((value: any) => boolean) | RegExp
        message: string
    };
    /**
     * 收集字段值变更的方法
     * @default 'onChange'
     */
    trigger?: string;
    /**
     * 验证校验触发的方法
     * @default 'onChange'
     */
    validateTrigger?: string;
}

const FormItem: FunctionComponent<FormItemProps> = ({
    name,
    children,
    label,
    height = 24,
    labelWidth,
    required = false,
    rules = { rule: () => true, message: '' },
    trigger = 'onChange',
    validateTrigger = 'onChange'
}) => {
    const formInstance = useContext(FormContext)
    const { rule, message } = rules
    const { registerValidateFields, dispatch, unRegisterValidate } = formInstance
    const [, forceUpdate] = useState({})

    const onStoreChange = useMemo(() => {
        /* 管理层改变 => 通知表单项 */
        const onStoreChange = {
            changeValue() {
                forceUpdate({})
            }
        }
        return onStoreChange
    }, [])

    useEffect(() => {
        /* 注册表单项 */
        registerValidateFields(name, onStoreChange, { value: '', rule, required, message })
        return () => {
            /* 卸载表单项 */
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            name && unRegisterValidate(name)
        }
    }, [name, rules, required, registerValidateFields, onStoreChange, unRegisterValidate])

    /* 使表单控件变成可控制的 */
    const getControlled = (child: ReactElement) => {
        const mergeChildrenProps = { ...child.props }
        if (!name) return mergeChildrenProps
        /* 改变表单单元项的值 */
        const handleChange = (e: any) => {
            const value = e.target.value
            /* 设置表单的值 */
            dispatch({ type: 'setFieldsValue' }, name, { value, rule, required, message })
        }
        mergeChildrenProps[trigger] = handleChange
        if (required || rules) {
            /* 验证表单单元项的值 */
            mergeChildrenProps[validateTrigger] = (e: any) => {
                /* 当改变值和验证表单，用统一一个事件 */
                if (validateTrigger === trigger) {
                    handleChange(e)
                }
                /* 触发表单验证 */
                dispatch({ type: 'validateFieldValue' }, name)
            }
        }
        /* 获取 value */
        mergeChildrenProps.value = dispatch({ type: 'getFieldValue' }, name) || ''
        return mergeChildrenProps
    }

    let renderChildren
    if (isValidElement(children)) {
        /* 获取 | 合并 ｜ 转发 | =>  props  */
        renderChildren = cloneElement(children, getControlled(children))
    } else {
        renderChildren = children
    }

    return (
        <>
            <Label
                height={height}
                label={label}
                labelWidth={labelWidth}
                required={required}
            >
                {renderChildren}

            </Label>
            <Message
                name={name}
                {...dispatch({ type: 'getFieldModel' }, name)}
            />
        </>);
}

export default FormItem;