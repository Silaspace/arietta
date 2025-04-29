import { Log } from './log'

export class AVRDFU {
    private device: USBDevice | null = null
    private interfaceNumber: number = 0
    private configurationNumber: number = 1

    constructor(private log: Log.Interface, private statusCallback: (status:AVRDFU.Status) => void) {}

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
        this.log.info("Aborting...")
        await this.send(AVRDFU.bRequest.DFU_ABORT, AVRDFU.command.empty, 0)
    }

    public async clearStatus(): Promise<void> {
        this.log.info("Clear device status")
        await this.send(AVRDFU.bRequest.DFU_CLRSTATUS, AVRDFU.command.empty, 0)
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

    public async download(firmware: Uint8Array): Promise<void> {
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
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.command.erase, 0)
    }

    public async getState(): Promise<AVRDFU.bState | void> {
        this.log.info("Getting device state...")
        const response = await this.receive(AVRDFU.bRequest.DFU_GETSTATE, 1)

        if (response && response.data) {
            let bState = response.data.getUint8(0)
            this.log.info("Device state: " + AVRDFU.bStateDescription(bState))
            return bState
        } else {
            this.log.error("No response received")
        }
    }

    public async getStatus(): Promise<void> {
        this.log.info("Getting device status...")
        const response = await this.receive(AVRDFU.bRequest.DFU_GETSTATUS, 6)

        if (response && response.data) {
            let bStatus = response.data.getUint8(0)

            this.statusCallback({
                bStatus:       bStatus,
                bwPollTimeOut: response.data.getUint32(1, true) & 0xFFFFFF,
                bState:        response.data.getUint8(4),
                iString:       response.data.getUint8(5),
            })

            this.log.info("Device status: " + AVRDFU.bStatusDescription(bStatus))
        } else {
            this.log.error("No response received")
        }
    }

    public async read(command: AVRDFU.readCommands): Promise<void> {
        this.log.info("Reading " + AVRDFU.readCommandDescription(command) + " from device...")

        // set up request
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, command, 0)
        await this.getStatus()

        // read data from request
        const response = await this.receive(AVRDFU.bRequest.DFU_UPLOAD, 1)

        if (response && response.data) {
            let name = response.data.getUint8(0)
            this.log.info("Response:" + name)
        } else {
            this.log.error("No response received")
        }
    }

    public async restart(): Promise<void> {
        this.log.info("Restarting device...")
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.command.restart, 0)
        await this.send(AVRDFU.bRequest.DFU_DNLOAD, AVRDFU.command.empty, 0)
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

    export function bStatusDescription(bstatus: AVRDFU.bStatus): string {
        switch (bstatus) {
            case AVRDFU.bStatus.OK              : return "OK"
            case AVRDFU.bStatus.errTARGET       : return "File is not targeted for use by this device"
            case AVRDFU.bStatus.errFILE         : return "File is for this device but fails some vendor-specific verification test"
            case AVRDFU.bStatus.errWRITE        : return "Device id unable to write memory"
            case AVRDFU.bStatus.errERASE        : return "Memory erase function failed"
            case AVRDFU.bStatus.errCHECK_ERASED : return "Memory erase check failed"
            case AVRDFU.bStatus.errPROG         : return "Program memory function failed"
            case AVRDFU.bStatus.errVERIFY       : return "Programmed memory failed verification"
            case AVRDFU.bStatus.errADDRESS      : return "Cannot program memory due to received address that is out of range"
            case AVRDFU.bStatus.errNOTDONE      : return "Received download with length 0, but device does not think it has all the data yet."
            case AVRDFU.bStatus.errFIRMWARE     : return "Device’s firmware is corrupted. It cannot return to run-time operations"
            case AVRDFU.bStatus.errVENDOR       : return "iString indicates a vendor-specific error"
            case AVRDFU.bStatus.errUSBR         : return "Device detected unexpected USB reset signaling"
            case AVRDFU.bStatus.errPOR          : return "Device detected unexpected power on reset"
            case AVRDFU.bStatus.errUNKNOWN      : return "Unknown error"
            case AVRDFU.bStatus.errSTALLEDPK    : return "Device stalled an unexpected request"
        }
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

    export function bStateDescription(bstate: AVRDFU.bState): string {
        switch (bstate) {
            case AVRDFU.bState.appIDLE                : return "Device is running its normal application"
            case AVRDFU.bState.appDETACH              : return "Device is running its normal application, has received the a detach request, and is waiting for a USB reset"
            case AVRDFU.bState.dfuIDLE                : return "Device is operating in the DFU mode and is waiting for requests"
            case AVRDFU.bState.dfuDNLOAD_SYNC         : return "Device has received a block and is waiting for the Host to solicit the status"
            case AVRDFU.bState.dfuDNBUSY              : return "Device is programming a control-write block into its non volatile memories"
            case AVRDFU.bState.dfuDNLOAD_IDLE         : return "Device is processing a download operation. Expecting download requests"
            case AVRDFU.bState.dfuMANIFEST_SYNC       : return "Device is waiting for the Host to solicit the status"
            case AVRDFU.bState.dfuMANIFEST            : return "Device is in the Manifestation phase."
            case AVRDFU.bState.dfuMANIFEST_WAITRESET  : return "Device has programmed its memories and is waiting for a USB reset or a power on reset."
            case AVRDFU.bState.dfuUPLOAD_IDLE         : return "The device is processing an upload operation. Expecting upload requests."
            case AVRDFU.bState.dfuERROR               : return "An error has occurred. Awaiting a clear status request."
        }
    }

    export enum commandIdentifier {
        Id_program_start       = 0x01,
        Id_display_data        = 0x03,
        Id_write_command       = 0x04,
        Id_read_command        = 0x05,
        Id_change_base_address = 0x06,
    }

    export const command = {
        empty:                      new Uint8Array([]),
        erase:                      new Uint8Array([AVRDFU.commandIdentifier.Id_write_command, 0x00, 0xFF, 0x00, 0x00, 0x00]),
        restart:                    new Uint8Array([AVRDFU.commandIdentifier.Id_write_command, 0x03, 0x01, 0x00, 0x00, 0x00]),
        read_bootloader_version:    new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x00, 0x00]),
        read_boot_id_1:             new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x00, 0x01]),
        read_boot_id_2:             new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x00, 0x02]),
        read_manufacturer_code:     new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x01, 0x30]),
        read_family_code:           new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x01, 0x31]),
        read_product_name:          new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x01, 0x60]),
        read_product_revision:      new Uint8Array([AVRDFU.commandIdentifier.Id_read_command, 0x01, 0x61]),
    }

    export type readCommands =
        typeof AVRDFU.command.read_bootloader_version
      | typeof AVRDFU.command.read_boot_id_1
      | typeof AVRDFU.command.read_boot_id_2
      | typeof AVRDFU.command.read_manufacturer_code
      | typeof AVRDFU.command.read_family_code
      | typeof AVRDFU.command.read_product_name
      | typeof AVRDFU.command.read_product_revision;

    export function readCommandDescription(command: AVRDFU.readCommands): string {
        switch (command) {
            case AVRDFU.command.read_bootloader_version:    return "bootloader version"
            case AVRDFU.command.read_boot_id_1:             return "boot ID 1"
            case AVRDFU.command.read_boot_id_2:             return "boot ID 2"
            case AVRDFU.command.read_manufacturer_code:     return "manufacturer code"
            case AVRDFU.command.read_family_code:           return "family code"
            case AVRDFU.command.read_product_name:          return "product name"
            case AVRDFU.command.read_product_revision:      return "product revision"
            default:                                        return "unknown field"
        }
    }

}