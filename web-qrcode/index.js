let qrcode;
function changeQrCode() {
    let text = document.getElementById('QRInput').value;
    if (text !== '') {
        if(qrcode) {
            qrcode.clear();
            qrcode.makeCode(text);
        } else {
            // Using https://davidshimjs.github.io/qrcodejs/
            qrcode = new QRCode('output', {
                text,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H,
            });
        }
    }
}

document.getElementById('QRInput').value = 'http://debugxweb.qq.com/?inspector=true'
document.getElementById('submitButton').onclick = changeQrCode;
changeQrCode();