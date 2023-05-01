const receiveMessage = function (event) {
    if (event.data?.command === 'copyText') {
        navigator.clipboard.writeText(event.data.data);
    }
};
window.addEventListener('message', receiveMessage);