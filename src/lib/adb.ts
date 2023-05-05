import ADBKit, { Device } from '@devicefarmer/adbkit';

const client = ADBKit.createClient();

client.trackDevices().then(tracker => {
    tracker.on('add', async (device: Device) => {
        console.log('Device %s was plugged in', device.id);
        console.log('all', await client.listDevices());
    });
    tracker.on('remove', (device: Device) => {
        console.log('Device %s was unplugged', device.id);
    });
    tracker.on('end', () => console.log('Tracking stopped'));
});


export default client;