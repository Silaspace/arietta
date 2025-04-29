import { atom, map } from 'nanostores';
import { persistentAtom, persistentMap } from '@nanostores/persistent'
import { Logger } from './log'
import { AVRDFU } from './avrdfu'
import { Assembler } from './assembler'



/* ------------------------ */
/*       Global State       */
/* ------------------------ */

export type Settings = {
    theme: 'dark' | 'light'
}

export type DeviceStatus = {
    connected: boolean
    bStatus: AVRDFU.bStatus
    bState: AVRDFU.bState

}

export const settings = persistentMap<Settings>('settings', {
    theme: 'light'
})

export const deviceStatus = map<DeviceStatus>({
    connected: false,
    bStatus: AVRDFU.bStatus.OK,
    bState: AVRDFU.bState.appDETACH,
});

let initial: string = ''
export const rawCode = persistentAtom('rawCode', initial, { listen: false })
export const hexCode = atom(new Uint8Array);



/* ----------------------- */
/*         WebUSB          */
/* ----------------------- */
export const webUSB = navigator.usb ? true : false

export const pair = async () => {
    let connected = await dfu.pair()
    deviceStatus.setKey("connected", connected)
}

export const connect = async () => {
    let connected = await dfu.connect()
    await dfu.read(AVRDFU.command.read_product_name)
    deviceStatus.setKey("connected", connected)
}

export const disconnect = async () => {
    await dfu.restart()
    deviceStatus.setKey("connected", false)
}

export const statusCallback = (status: AVRDFU.Status) => {
    deviceStatus.setKey("bStatus", status.bStatus)
    deviceStatus.setKey("bState", status.bState)
}

if (webUSB) {
    navigator.usb.onconnect = connect
    navigator.usb.ondisconnect = () => { deviceStatus.setKey("connected", false) }
}



/* ------------------------ */
/*      Global Classes      */
/* ------------------------ */
const dfuLog = new Logger("WebDFU")
export const dfu = new AVRDFU(dfuLog, statusCallback)

const asmLog = new Logger("Assembler")
export const asm = new Assembler(asmLog)