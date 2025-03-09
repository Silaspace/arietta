import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent'
import { Logger } from '../modules/log'
import { AVRDFU } from '../modules/avrdfu'
import { Assembler } from '../modules/assembler'


/* ------------------------ */
/*      Global Classes      */
/* ------------------------ */
const dfuLog = new Logger("WebDFU")
export const dfu = new AVRDFU(dfuLog)

const asmLog = new Logger("Assembler")
export const asm = new Assembler(asmLog)



/* ------------------------ */
/*       Global State       */
/* ------------------------ */

type Settings = {
    theme: 'dark' | 'light'
}

export const settings = persistentMap<Settings>('settings:', {
    theme: 'light'
})

export const deviceConnected = atom(false);
export const rawCode = atom("");



/* ----------------------- */
/*         WebUSB          */
/* ----------------------- */
export const webUSB = navigator.usb ? true : false

export const pair = async () => {
    let connected = await dfu.pair()
    deviceConnected.set(connected)
}

export const connect = async () => {
    let connected = await dfu.connect()
    deviceConnected.set(connected)
}

export const disconnect = async () => {
    await dfu.restart()
    deviceConnected.set(false)
}

if (webUSB) {
    navigator.usb.onconnect = connect
    navigator.usb.ondisconnect = () => { deviceConnected.set(false) }
}
