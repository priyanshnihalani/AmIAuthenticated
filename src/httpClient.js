import axios from 'axios'
import { defaultConfig } from './config.js'
import { AuthService } from './auth.service'

let clientInstance = null

export function createHttpClient(userConfig = {}) {
    const config = { ...defaultConfig, ...userConfig }

    const client = axios.create({
        baseURL: config.baseURL,
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json'
        }
    })

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error?.response?.status === 401) {
                if(typeof config.onUnauthorized === 'function'){
                    config.onUnauthorized(error)
                }
                else{
                    const flow = AuthService.getFlow()

                    if(flow.step == 'otp' || flow.step == 'forgot-password'){
                        config.redirectHandler(`/${flow.step}`)
                    }
                    else{
                        config.redirectHandler('/login')
                    }
                }

                AuthService.clearAuth()
            }
            return Promise.reject(error)
        }
    )

    clientInstance = client
    return client;
}

export function getHttpClient(){
    return clientInstance
}