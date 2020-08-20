export function uuid(): string {
    return 'XXXXXXX-XXXX-4XXX-YXXX-XXXXXXXXXXXX'.replace(/[XY]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'X' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    }).toUpperCase()
  }
  