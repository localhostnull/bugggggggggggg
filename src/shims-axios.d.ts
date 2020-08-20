import { AxiosInstance, AxiosRequestConfig, AxiosPromise } from "axios";
/**
 * 自定义扩展axios模块
 * @author Maybe
 */
export interface ResponseResult<T = any> {
    code: number;
    msg: string;
    data: T;
  }
declare module "axios" {
    export interface AxiosInstance {
        request<T = any, R = ResponseResult<T>>(
            config: AxiosRequestConfig
        ): Promise<R>;
        get<T = any, R = ResponseResult<T>>(
            url: string,
            config?: AxiosRequestConfig
        ): Promise<R>;
        delete<T = any, R = ResponseResult<T>>(
            url: string,
            config?: AxiosRequestConfig
        ): Promise<R>;
        head<T = any, R = ResponseResult<T>>(
            url: string,
            config?: AxiosRequestConfig
        ): Promise<R>;
        options<T = any, R = ResponseResult<T>>(
            url: string,
            config?: AxiosRequestConfig
        ): Promise<R>;
        post<T = any, R = ResponseResult<T>>(
            url: string,
            data?: any,
            config?: AxiosRequestConfig
        ): Promise<R>;
        put<T = any, R = ResponseResult<T>>(
            url: string,
            data?: any,
            config?: AxiosRequestConfig
        ): Promise<R>;
        patch<T = any, R = ResponseResult<T>>(
            url: string,
            data?: any,
            config?: AxiosRequestConfig
        ): Promise<R>;
    }
}