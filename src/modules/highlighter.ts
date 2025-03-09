export class Highlighter {

    static language = [
        {
            regex: /([a-zA-Z]*:)/g,
            output: '<span class="font-mono text-base text-rose-700 dark:text-rose-500">$1</span>',
        },
        {
            regex: /\b(r[0-9]*)\b/g,
            output: '<span class="font-mono text-base text-violet-700 dark:text-violet-400">$1</span>',
        },
        {
            regex: /\b(0x[0-9a-fA-F]*)\b/g,
            output: '<span class="font-mono text-base text-lime-600 dark:text-lime-300">$1</span>',
        },
        {
            regex: /\b(0x[0-9a-fA-F]*[g-zG-Z]+[0-9a-fA-F]*)\b/g,
            output: '<span class="font-mono text-base underline decoration-wavy decoration-red-600">$1</span>',
        },
        {
            regex: /\b(0b[0-1]*)\b/g,
            output: '<span class="font-mono text-base text-lime-600 dark:text-lime-300">$1</span>',
        },
        {
            regex: /\b(0b[0-1]*[2-9a-zA-Z]+[0-1]*)\b/g,
            output: '<span class="font-mono text-base underline decoration-wavy decoration-red-600">$1</span>',
        },
        {
            regex: /(;.*)/g,
            output: '<span class="font-mono text-base italic text-gray-400 dark:text-gray-500">$1</span>',
        },
    ]

    public hex(hex: Uint8Array): string {
        let html: string = ''

        for (let i = 0; i < hex.length; i += 1) {
            const nextHex: string = '<span class="font-mono text-base text-lime-600 dark:text-lime-300">0x' + hex[i].toString(16).padStart(2, '0') + '</span>';
            html += nextHex + (i % 2 ? '\n' : ' ')
        }

        return html
    }
    
    public highlight(src: string): string {
        Highlighter.language.forEach(key => src = src.replace(key.regex, key.output));
        return src
    }

    public countLines(src: string): number {
        return src.split(/\r\n|\r|\n/).length
    }
}