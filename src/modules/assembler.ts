import { Log } from './log'
import init from './main.wasm?init'

declare global {
    interface Window {
        write: (data: Uint8Array) => void
        assemble: () => Uint8Array | Error;
    }
}

export class Assembler {
    private loaded: Promise<void> = new Promise(() => {})
    private wasmInstance: WebAssembly.Instance | null = null
    private log: Log.Interface
    
    constructor(log: Log.Interface) {
        this.log = log
        this.load()
    }

    public async load(): Promise<void> {
        await import("./wasm_exec.js")

        this.log.info("Starting Go runtime...")
        const go = new (window as any).Go()
        this.wasmInstance = await init(go.importObject) as WebAssembly.Instance
        go.run(this.wasmInstance)

        this.log.info("Loaded assembler")
        this.loaded = Promise.resolve()
    }

    public async assemble(source: string, verbose: boolean): Promise<Uint8Array | Error> {
        await this.loaded
        const uint8Array = new TextEncoder().encode(source)
        window.write(uint8Array)

        let data = window.assemble()

        if (verbose && data instanceof Error) {
            this.log.error(data.message)
        }

        return data
    }

    public async isLoaded(): Promise<void> {
        return this.loaded
    }
}

export namespace Assembler {
}