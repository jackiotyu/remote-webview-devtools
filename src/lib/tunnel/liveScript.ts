import vm from 'node:vm';

const context = vm.createContext({
    frontend: {},
    backend: {},
});

// TODO 从虚拟文档中获取
// 连接两端
const code = `
    export default function connect(frontend, backend) {
        frontend.send("");
        backend.send("");
    }

    export function backendReceive(frontend, message) {

    }

    export function frontendReceive(backend, message) {

    }
`;

// TODO 导出连接函数给tunnel使用
export default vm.runInContext(code, context);