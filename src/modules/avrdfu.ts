import { Log } from './log'

export class AVRDFU {
    private device: USBDevice | null = null
    private interfaceNumber: number = 0
    private configurationNumber: number = 1

    constructor(private log: Log.Interface) {}

    private async open(): Promise<boolean> {
        try {
            if (!this.device) {
                this.log.error("No device selected")
                return false
            }
            
            this.log.info("Connecting to device...")
            await this.device.open()
            await this.device.selectConfiguration(this.configurationNumber)
            await this.device.claimInterface(this.interfaceNumber)
            
            this.log.info("Device connected")
            return true
        } catch (error) {
            this.log.error("Error connecting to device: " + error)
            return false
        }
    }

    private async send(bRequest: AVRDFU.bRequest, data: Uint8Array, wValue: number): Promise<USBOutTransferResult | undefined> {
        if (!this.device) {
            this.log.error("No device connected")
            return
        }

        try {
            return await this.device.controlTransferOut({
                requestType: 'class',
                recipient: 'interface',
                request: bRequest,
                value: wValue,
                index: this.interfaceNumber
            }, data)
        } catch (error) {
            this.log.error("Error sending DFU command: " + error)
        }
    }

    private async receive(bRequest: AVRDFU.bRequest, length: number): Promise<USBInTransferResult | undefined> {
        if (!this.device) {
            this.log.error("No device connected")
            return
        }

        try {
            return await this.device.controlTransferIn({
                requestType: 'class',
                recipient: 'interface',
                request: bRequest,
                value: 0x00,
                index: this.interfaceNumber
            }, length)
        } catch (error) {
            this.log.error("Error receiving response:" + error)
        }
    }

    public async abort(): Promise<void> {
        this.log.info("Sending DFU_ABORT command...")
        await this.send(AVRDFU.bRequest.DFU_ABORT, AVRDFU.commands.empty, 0)
    }

    public async clearStatus(): Promise<void> {
        this.log.info("Sending DFU_CLRSTATUS command...")
        await this.send(AVRDFU.bRequest.DFU_CLRSTATUS, AVRDFU.commands.empty, 0)
    }

    public async pair(): Promise<boolean> {
        try {
            this.log.info("Requesting USB devices...")
            this.device = await navigator.usb.requestDevice({
                filters: [{ vendorId: AVRDFU.VendorID }]
            })
            return this.open()
        } catch (error) {
            this.log.error("Error pairing device:" + error)
            return false
        }
    }

    public async connect(): Promise<boolean> {
        try {
            this.log.info("Requesting paired USB device...")
            const devices = await navigator.usb.getDevices()
            this.device = devices[0]
            return this.open()
        } catch (error) {
            this.log.error("Error pairing device:" + error)
            return false
        }
    }

    public async download(firmware: Uint8Array, blockSize: number = 32): Promise<void> {
        this.log.info("Start firmware upload")

        const start_address = 0x00
        const dfu_suffix = [
            0x00, 0x00, 0x00, 0x00,
            0x10, 0x44, 0x46, 0x55,
            0x01, 0x10, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF
        ]

        const image = new Uint8Array(32 + firmware.length + 16)

        // header
        image[0] = 0x01
        image[1] = 0x00
        image[2] = 0xFF & (start_address >> 8)
        image[3] = 0xFF & start_address
        image[4] = 0xFF & (firmware.length - 1 >> 8)
        image[5] = 0xFF & firmware.length - 1

        // firmware
        image.set(firmware, 32)

        // suffix
        image.set(dfu_suffix, 32 + firmware.length)

        // send
        this.log.info("Sending firmware...")
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, image, 0)
        await this.getStatus()
        
        this.log.info("Firmware upload completed")
    }

    public async erase(): Promise<void> {
        this.log.info("Sending full chip erase...")
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.commands.erase, 0)
    }

    public async getState(): Promise<AVRDFU.bState | void> {
        this.log.info("Sending DFU_GETSTATE command...")
        const response = await this.receive(AVRDFU.bRequest.DFU_GETSTATE, 1)

        if (response && response.data) {
            return response.data.getUint8(0)
        } else {
            this.log.error("No response received")
        }
    }

    public async getStatus(): Promise<AVRDFU.Status | void> {
        this.log.info("Sending DFU_GETSTATUS command...")
        const response = await this.receive(AVRDFU.bRequest.DFU_GETSTATUS, 6)

        if (response && response.data) {
            return {
                bStatus:       response.data.getUint8(0),
                bwPollTimeOut: response.data.getUint32(1, true) & 0xFFFFFF,
                bState:        response.data.getUint8(4),
                iString:       response.data.getUint8(5),
            }
        } else {
            this.log.error("No response received")
        }
    }

    public async restart(): Promise<void> {
        this.log.info("Restarting device...")
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.commands.restart, 0)
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.commands.empty, 0)
        this.device = null
    }
}

export namespace AVRDFU {
    export const VendorID = 0x03EB

    export type Status = {
        bStatus: bStatus,
        bwPollTimeOut: number,
        bState: bState,
        iString: number,
    }

    export enum bRequest {
        DFU_DETACH    = 0x00,
        DFU_DNLOAD    = 0x01,
        DFU_UPLOAD    = 0x02,
        DFU_GETSTATUS = 0x03,
        DFU_CLRSTATUS = 0x04,
        DFU_GETSTATE  = 0x05,
        DFU_ABORT     = 0x06,
    }

    export enum bStatus {
        OK              = 0x00,
        errTARGET       = 0x01,
        errFILE         = 0x02,
        errWRITE        = 0x03,
        errERASE        = 0x04,
        errCHECK_ERASED = 0x05,
        errPROG         = 0x06,
        errVERIFY       = 0x07,
        errADDRESS      = 0x08,
        errNOTDONE      = 0x09,
        errFIRMWARE     = 0x0A,
        errVENDOR       = 0x0B,
        errUSBR         = 0x0C,
        errPOR          = 0x0D,
        errUNKNOWN      = 0x0E,
        errSTALLEDPK    = 0x0F,
    }

    export enum bState {
        appIDLE                = 0x00,
        appDETACH              = 0x01,
        dfuIDLE                = 0x02,
        dfuDNLOAD_SYNC         = 0x03,
        dfuDNBUSY              = 0x04,
        dfuDNLOAD_IDLE         = 0x05,
        dfuMANIFEST_SYNC       = 0x06,
        dfuMANIFEST            = 0x07,
        dfuMANIFEST_WAITRESET  = 0x08,
        dfuUPLOAD_IDLE         = 0x09,
        dfuERROR               = 0x0A,
    }

    export enum commandIdentifier {
        Id_program_start       = 0x01,
        Id_display_data        = 0x03,
        Id_write_command       = 0x04,
        Id_read_command        = 0x05,
        Id_change_base_address = 0x06,
    }

    export const commands = {
        empty:   new Uint8Array([]),
        erase:   new Uint8Array([AVRDFU.commandIdentifier.Id_write_command, 0x00, 0xFF, 0x00, 0x00, 0x00]),
        restart: new Uint8Array([AVRDFU.commandIdentifier.Id_write_command, 0x03, 0x01, 0x00, 0x00, 0x00]),
    }
}