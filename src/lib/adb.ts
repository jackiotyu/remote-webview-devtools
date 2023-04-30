import ADBKit from '@devicefarmer/adbkit';

class ADB {
    readonly client = ADBKit.createClient();
    listDevices() {
        return this.client.listDevices();
    }
    trackDevices() {
        return this.client.trackDevices();
    }
    getDevices(serial: string) {
        return this.client.getDevice(serial);
    }
}

export default new ADB();