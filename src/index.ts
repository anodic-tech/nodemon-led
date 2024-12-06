import { getRgb } from "./midi";
import { sendSerial } from "./serial";

setInterval(()=>{
    // console.log(getRgb())
    sendSerial(getRgb())
}, 20)