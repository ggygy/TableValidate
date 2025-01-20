/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_batchedUpdates } from "react-dom"

export type IValidate = {
    value?: string | number | null,
    rule: ((value: any) => boolean) | RegExp,
    required?: boolean,
    status?: string,
    message: string,
}

type IFormCallback = {
    onFinish?: (value: { [key: string]: string | number | null }) => void
    onFinishFailed?: () => void
}

/* 对外接口  */
export const formInstanceApi: (keyof FormStore)[] = [
    'setCallback',
    'dispatch',
    'registerValidateFields',
    'resetFields',
    'setFields',
    'setFieldsValue',
    'getFieldsValue',
    'getFieldValue',
    'validateFields',
    'submit',
    'unRegisterValidate'
]

export type FormInstance = Pick<FormStore, typeof formInstanceApi[number]>;

/* 判断是否是正则表达式 */
const isReg = (value: RegExp) => value instanceof RegExp

export default class FormStore {
    private FormUpdate: () => void
    private model: { [key: string]: IValidate }
    private control: { [key: string]: { changeValue?: () => void } }
    private isSchedule: boolean
    private callback: IFormCallback
    private penddingValidateQueue: (() => void)[]
    private defaultFormValue: { [key: string]: any }

    constructor(forceUpdate: () => void, defaultFormValue = {}) {
        this.FormUpdate = forceUpdate     /* 为 Form 的更新函数，目前没有用到 */
        this.model = {}                   /* 表单状态层 */
        this.control = {}                 /* 控制每个 formItem 的控制器  */
        this.isSchedule = false           /* 开启调度 */
        this.callback = {                 /* 存放监听函数 callback */
            onFinish: () => { },
            onFinishFailed: () => { }
        }
        this.penddingValidateQueue = []   /* 批量更新队列 */
        this.defaultFormValue = defaultFormValue /* 表单初始化的值 */
    }

    /* 触发事件 */
    dispatch(action: { type: keyof FormStore }, ...arg: any[]) {
        if (!action && typeof action !== 'object') return null
        const { type } = action
        /* 利用按位取反操作符 ~ 来检查 type 是否在 formInstanceApi 中 */
        if (~formInstanceApi.indexOf(type)) {
            return (this[type] as any)(...arg)
        } else if (typeof this[type] === 'function') {
            return (this[type] as any)(...arg)
        }
    }

    /* 提供操作form的方法 */
    getForm(): FormInstance {
        return formInstanceApi.reduce((map: any, item: string) => {
            map[item] = (this as any)[item].bind(this)
            return map
        }, {})
    }

    /* 处理回调函数 */
    setCallback(callback: IFormCallback) {
        if (callback) this.callback = callback
    }

    /* 创建一个验证模块 */
    static createValidate(validate: IValidate): IValidate {
        const { value, rule, required, message } = validate
        return {
            value,
            rule: rule || (() => true),
            required: required || false,
            message: message || '',
            status: 'pending'
        }
    }

    /* 注册表单单元项 */
    registerValidateFields = (name: string, control: { changeValue?: () => void }, model: IValidate) => {
        if (this.defaultFormValue[name]) model.value = this.defaultFormValue[name] /* 如果存在默认值的情况 */
        const validate = FormStore.createValidate(model)
        this.model[name] = validate
        this.control[name] = control
    }

    /* 卸载注册表单单元项 */
    unRegisterValidate(name: string) {
        delete this.model[name]
        delete this.control[name]
    }

    /* 通知对应FormItem更新 */
    notifyChange(name: string) {
        const controller = this.control[name]
        if (controller?.changeValue) controller.changeValue()
    }

    /* 复制并清空状态 */
    setValueClearStatus(name: string, modelValue: IValidate | null) {
        const model = this.model[name]
        if (!model) return false
        this.model[name].value = modelValue?.value ?? ''
        this.model[name].status = 'pending'
        this.notifyChange(name)
    }

    /* 设置表单的值 */
    setFieldsValue(name: string, modelValue: IValidate) {
        const model = this.model[name]
        if (!model) return false
        if (typeof modelValue === 'object') {    /* 设置表单项 */
            const { message, rule, value } = modelValue
            if (message) model.message = message
            if (rule) model.rule = rule
            model.value = value
            model.status = 'pending'            /* 设置待验证状态 */
            this.validateFieldValue(name, true)  /* 如果重新设置了验证规则，那么重新验证一次 */
        } else {
            this.setValueClearStatus(name, modelValue)
        }
    }

    /* 设置一组字段状态 */
    setFields(fields: { [key: string]: IValidate }) {
        if (typeof fields !== 'object') return
        Object.keys(fields).forEach(name => {
            this.setFieldsValue(name, fields[name])
        })
    }

    /* 获取对应字段名的值 */
    getFieldValue(name: string): string | number | null {
        const model = this.model[name]
        if (!model && this.defaultFormValue[name]) return this.defaultFormValue[name] /* 没有注册，但是存在默认值的情况 */
        return model ? model.value ?? '' : null
    }

    /* 获取表单数据层的值 */
    getFieldsValue() {
        return Object.keys(this.model).reduce((map: { [key: string]: string | number | null }, name) => {
            map[name] = this.getFieldValue(name)
            return map
        }, {})
    }

    /* 获取表单模型 */
    getFieldModel(name: string) {
        return this.model[name] ?? {}
    }

    /* 重置表单 */
    resetFields() {
        Object.keys(this.model).forEach(name => {
            this.setValueClearStatus(name, null)
        })
    }

    /* 单一表单单元项验证 */
    validateFieldValue(name: string, forceUpdate: boolean = false) {
        const model = this.model[name]
        /* 记录上次状态 */
        const lastStatus = model.status
        if (!model) return null
        const { required, rule, value } = model
        let status = 'resolve'
        if (required && !value) {
            status = 'reject'
        } else if (rule instanceof RegExp && isReg(rule)) {  /* 正则校验规则 */
            status = typeof value === 'string' && rule.test(value) ? 'resolve' : 'reject'
        } else if (typeof rule === 'function') {  /* 自定义校验规则 */
            status = rule(value) ? 'resolve' : 'reject'
        }
        model.status = status
        /*  */
        if (lastStatus !== status || forceUpdate) {
            const notify = this.notifyChange.bind(this, name)
            this.penddingValidateQueue.push(notify)
        }
        this.scheduleValidate()
        return status
    }

    /* 批量调度验证更新任务 */
    scheduleValidate() {
        this.isSchedule = true
        Promise.resolve().then(() => {
            /* 批量更新验证任务, 合并setState操作 */
            unstable_batchedUpdates(() => {
                do {
                    const notify = this.penddingValidateQueue.shift()
                    if (notify) {
                        notify();  /* 触发更新 */
                    }
                } while (this.penddingValidateQueue.length > 0)
                this.isSchedule = false
            })
        })
    }

    /* 表单整体验证 */
    validateFields(callback: (status: boolean) => void) {
        let status = true
        Object.keys(this.model).forEach(modelName => {
            const modelStates = this.validateFieldValue(modelName, true)
            if (modelStates === 'reject') status = false
        })
        callback(status)
    }

    /* 提交表单 */
    submit(cb?: (status: boolean) => void) {
        this.validateFields((status: boolean) => {
            const { onFinish, onFinishFailed } = this.callback
            if (cb) cb(status) /* 提交失败 */
            if (!status) onFinishFailed && typeof onFinishFailed === 'function' && onFinishFailed() /* 验证失败 */
            onFinish && typeof onFinish === 'function' && onFinish(this.getFieldsValue())     /* 验证成功 */
        })
    }
}
