export interface CDPMessage {
    id?: string | number;
    method?: string;
    params: string;
    result: string;
}

/** 提供给脚本调用回调，执行后触发下一个流程 */
export type FireMethod = (message: CDPMessage) => void;

/** 脚本模块需要提供的函数 */
export type PipeMethod = (message: CDPMessage, fire: FireMethod) => any;

export type FromMethod = (fire: FireMethod) => any;

export type TargetMethod = (message: CDPMessage) => any;

export enum ModuleType {
    source = 'source',
    middleware = 'middleware',
    target = 'target',
}

/** 脚本模块规范 */
export namespace ScriptModule {
    /** 中间件模块 */
    export interface Middleware {
        /** 外部调用方法，固定此名称 */
        pipe: PipeMethod;
    }
    /** 数据源模块 */
    export interface Source {
        /** 外部调用方法，固定此名称 */
        from: FromMethod;
    }
    /** 数据接收模块 */
    export interface Target {
        /** 外部调用方法，固定此名称 */
        end: TargetMethod;
    }
}
