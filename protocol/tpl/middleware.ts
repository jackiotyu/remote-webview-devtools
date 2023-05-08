import { ScriptModule } from '../flow';

export default {
    /**
     * @param message 上一个消息源发送的消息
     * @param fire 发送消息给下一个流程
     */
    pipe: (message, fire) => {

    },
} as ScriptModule.Middleware;
