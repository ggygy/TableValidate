import {  createContext  } from 'react'
import { FormInstance } from '../utils/FormStore'
/* 创建一个 FormContext */
const  FormContext = createContext<FormInstance>({} as FormInstance)

export default FormContext