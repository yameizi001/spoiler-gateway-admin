import { message } from 'ant-design-vue'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const BASE_URL = 'http://127.0.0.1:8080/gateway-backend'
const TIMEOUT = 2 * 1000

class HttpRequest {
  instance: AxiosInstance
  config: AxiosRequestConfig

  constructor(option: AxiosRequestConfig) {
    this.config = option
    this.instance = axios.create(this.config)
    this.interceptors()
  }

  interceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        const res = response.data
        if (res.code !== 200) {
          // business error
          if (res.data) {
            message.error(res.data)
          } else {
            message.error('未知错误, 请联系管理人员')
          }
        }
        return res
      },
      (error) => {
        if (error.message.includes('timeout')) {
          message.error('请求超时, 请尝试刷新或稍后重试')
        } else {
          message.error('未知错误, 请联系管理人员')
        }
        return Promise.reject(error)
      }
    )
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<GenericResp<T>> {
    return this.instance.request<GenericResp<T>, GenericResp<T>>(config)
  }

  async get<T = any>(url: string, params?: any): Promise<GenericResp<T>> {
    const config: AxiosRequestConfig = {
      params: params
    }
    return this.instance.get<GenericResp<T>, GenericResp<T>>(url, config)
  }

  async post<T = any>(url: string, params?: any, data?: any): Promise<GenericResp<T>> {
    const config: AxiosRequestConfig = {
      params: params
    }
    return this.instance.post<GenericResp<T>, GenericResp<T>>(url, data, config)
  }

  async put<T = any>(url: string, params?: any, data?: any): Promise<GenericResp<T>> {
    const config: AxiosRequestConfig = {
      params: params
    }
    return this.instance.put<GenericResp<T>, GenericResp<T>>(url, data, config)
  }

  async delete<T = any>(url: string, params?: any): Promise<GenericResp<T>> {
    const config: AxiosRequestConfig = {
      params: params
    }
    return this.instance.delete<GenericResp<T>, GenericResp<T>>(url, config)
  }
}

const http = new HttpRequest({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true
})

export default http

export type GenericResp<T> = {
  code: number
  msg: string
  data?: T
}
