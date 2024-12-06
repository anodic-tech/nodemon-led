import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

const port = new SerialPort({
    path:'/dev/cu.SLAB_USBtoUART',
    baudRate: 115200
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
port.pipe(parser);

// Read the port data
port.on("open", () => {
    console.log('serial port open');
});

// Switches the port into "flowing mode"
parser.on('data', function (data:string) {
    console.log('Message from Arduino:', data)
})

export const sendSerial = (rgbArray: number[][]) => {
    const byteArray = new Uint8Array(rgbArray.length*3+2)
    byteArray[0] = 254
    let i = 1
    rgbArray.forEach( rgb => {
        rgb.forEach( value => {
            byteArray[i] = Math.floor(value/255*253)
            i++
        })
    })
    byteArray[byteArray.length-1] = 255
    console.log(byteArray)
    port.write(byteArray, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        // console.log('message written');
    });
}
