out.connect = function connect(frontend, backend) {};

const REQ_PREFIX = '[EDU_REQ]';
const RES_PREFIX = '[EDU_RES]';

const URLSearchParams = URL.URLSearchParams;

let id = 10000;

let reqMap = new Map();
let resBodyMap = new Map();
let reqDataMap = new Map();
let send = false;

out.backendReceive = function backendReceive (frontend, backend, message) {
    try {
        const { method, params } = JSON.parse(message);
        if(method === 'Runtime.consoleAPICalled' && params.args && [REQ_PREFIX,RES_PREFIX].includes(params.args[0]?.value)) {
            const { args, timestamp } = params;
            let [ prefixObj, idObj, dataObj ] = args;
            // 关联请求和响应
            let reqId = idObj.value;
            // 数据json字符串
            let reqData = JSON.parse(dataObj.value);
            reqMap.set(reqId, id++);
            if(prefixObj.value === REQ_PREFIX) {
                const isPostMethod = reqData.method.toLowerCase() === 'post';
                const postData = JSON.stringify({
                    method: 'Network.requestWillBeSent',
                    params: {
                        requestId: reqId,
                        documentURL: '',
                        timestamp,
                        wallTime: timestamp - 10000,
                        initiator: { type: 'other' },
                        frameId: reqId,
                        loaderId: reqId,
                        request: {
                            url: `${reqData.url }${isPostMethod ? '' : `?${new URLSearchParams(reqData.data).toString()}`}`,
                            headers: reqData.header,
                            method: reqData.method,
                            postData: isPostMethod ? reqData.data : void 0,
                            hasPostData: true,
                            initialPriority: 'High',
                        }
                    }
                });
                reqDataMap.set(reqId, reqData.data);
                frontend.send(postData);
            } else {
                resBodyMap.set(reqId, reqData.data);
                frontend.send(JSON.stringify({
                    method: 'Network.dataReceived',
                    params: {
                        timestamp,
                        requestId: reqId,
                        dataLength: reqData.profile.receivedBytedCount,
                        encodedDataLength: reqData.profile.receivedBytedCount
                    }
                }));
                frontend.send(JSON.stringify({
                    method: 'Network.responseReceived',
                    params: {
                        requestId: reqId,
                        type: 'XHR',
                        loaderId: reqId,
                        timestamp,
                        response: {
                            url: reqData.url,
                            headers: reqData.header,
                            mimeType: 'application/json',
                            status: reqData.statusCode,
                            hasPostData: true,
                            connectionReused: true,
                            connectionId: 0,
                            remoteIPAddress: reqData.profile.peerIP,
                            remotePort: reqData.profile.port,
                            encodedDataLength: reqData.profile.receivedBytedCount,
                            securityState: 'unknown'
                        }
                    }
                }));
                frontend.send(JSON.stringify({
                    method: 'Network.loadingFinished',
                    params: {
                        timestamp,
                        requestId: reqId,
                        shouldReportCorbBlocking: false,
                        encodedDataLength: reqData.profile.receivedBytedCount
                    }
                }));
            }
        }
    } catch (err) {
        console.log(err, 'err');
    }
    return false;
};

out.frontendReceive = function frontendReceive (frontend, backend, message) {
    try {
        const { method, params, id } = JSON.parse(message.toString());
        if(method === 'Network.getResponseBody' && params.requestId && resBodyMap.has(params.requestId)) {
            frontend.send(JSON.stringify({
                id,
                result: {
                    base64Encoded: false,
                    body: JSON.stringify(resBodyMap.get(params.requestId)),
                }
            }));
            return true;
        }
        if(method === 'Network.getRequestPostData' && params.requestId && resBodyMap.has(params.requestId)) {
            frontend.send(JSON.stringify({
                id,
                result: {
                    postData: reqDataMap.get(params.requestId),
                }
            }));
            return true;
        }
    } catch(err) {
        console.log(err, 'err frontendReceive');
    }
    return false;
};

out.dispose = function dispose() {
    id = null;
    send = null;
    reqMap = null;
    resBodyMap = null;
    reqDataMap = null;
};
