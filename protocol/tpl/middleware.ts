import type { ScriptModule } from '../flow';

export default {
    /**
     * @param message 上一个消息源发送的消息
     * @param send 发送消息给下一个节点，可多次调用，调用一次即发送一次
     */
    trigger: (message, send) => {

    },
} as ScriptModule.Middleware;
