import type { ScriptModule } from '../flow';

export default {
    /**
     * @param message 上一个消息源发送的消息
     */
    trigger: (message) => {
        // 默认打印到 RWD DEBUG 面板，点击flow右上角的 terminal 图标可直接打开
        Logger.printDebug(JSON.stringify(message));
    },
} as ScriptModule.Target;
