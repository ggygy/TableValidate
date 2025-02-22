import { useRef, useEffect } from 'react'
import { type FormInstance } from "./utils/FormStore";
import Form, { Input, FormItem, Select, Option } from './Form'
import './App.css'

function App() {
    const form = useRef<FormInstance>(null)
    useEffect(() => {
        console.log(form.current, 'form.current')
    }, [])
    const handleClick = () => {
        form.current?.submit((res) => {
            console.log(res)
        })
    }
    const handleGetValue = () => {
        console.log(form.current?.getFieldsValue(), 'form.current ')
    }

    return <div style={{ marginTop: '50px' }} >
        <Form 
            initialValues={{ author: '初始化姓名' }}
            ref={form}
        >
            <FormItem
                label="请输入小册名称"
                labelWidth={150}
                name="name"
                required
                rules={{
                    rule: /^[a-zA-Z0-9_\u4e00-\u9fa5]{4,32}$/,
                    message: '名称仅支持中文、英文字母、数字和下划线，长度限制4~32个字'
                }}
                validateTrigger="onBlur"
            >
                <Input
                    placeholder="小册名称"
                />
            </FormItem>
            <FormItem
                label="作者"
                labelWidth={150}
                name="author"
                required
                validateTrigger="onBlur"
            >
                <Input
                    placeholder="请输入作者"
                />
            </FormItem>
            <FormItem label="邮箱"
                labelWidth={150}
                name="email"
                rules={{ rule: /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/, message: '邮箱格式错误！' }}
                validateTrigger="onBlur"
            >
                <Input
                    placeholder="请输入邮箱"
                />
            </FormItem>
            <FormItem label="手机"
                labelWidth={150}
                name="phone"
                rules={{ rule: /^1[3-9]\d{9}$/, message: '手机格式错误！' }}
                validateTrigger="onBlur"
            >
                <Input
                    placeholder="请输入邮箱"
                />
            </FormItem>
            <FormItem label="简介"
                labelWidth={150}
                name="des"
                rules={{ rule: (value = '') => value.length < 5, message: '简介不超过五个字符' }}
                validateTrigger="onBlur"
            >
                <Input placeholder="输入简介" />
            </FormItem>
            <FormItem label="你最喜欢的前端框架"
                labelWidth={170}
                name="likes"
                required
            >
                <Select
                    placeholder="请选择"
                    width={120}
                >
                    <Option
                        value={1}
                    > React.js </Option>
                    <Option value={2} > Vue.js </Option>
                    <Option value={3} > Angular.js </Option>
                </Select>
            </FormItem>
            <button className="searchbtn" onClick={handleClick} type="button">
                提交
            </button>
            <button className="concellbtn" type="reset">
                重置
            </button>
        </Form>
        <div className='form-button' style={{ marginTop: '20px' }} >
            <span>验证表单功能</span>
            <button className="searchbtn" onClick={handleGetValue} style={{ background: 'green' }}>
                获取表单数层
            </button>
            <button className="searchbtn"
                onClick={() => form.current?.validateFields((res) => { console.log('是否通过验证：', res) })}
                style={{ background: 'orange' }}>
                动态验证表单
            </button>
            <button
                className="searchbtn"
                onClick={() => {
                    form.current?.setFieldsValue('des', {
                        value: form.current.getFieldValue('des'),
                        rule: (value = '') => value.length < 10,
                        message: '简介不超过十个字符'
                    })
                }}
                style={{ background: 'purple' }}
            >
                动态设置校验规则
            </button>
        </div>
    </div>
}

export default App
