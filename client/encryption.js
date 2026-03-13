export default class Encryption {

    constructor() {

        this.key = crypto.getRandomValues(new Uint8Array(32))

    }

    async encrypt(message) {

        const encoder = new TextEncoder()

        const data = encoder.encode(message)

        const key = await crypto.subtle.importKey(
            "raw",
            this.key,
            "AES-GCM",
            false,
            ["encrypt"]
        )

        const iv = crypto.getRandomValues(new Uint8Array(12))

        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            data
        )

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        }

    }

    async decrypt(payload) {

        const decoder = new TextDecoder()

        const key = await crypto.subtle.importKey(
            "raw",
            this.key,
            "AES-GCM",
            false,
            ["decrypt"]
        )

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(payload.iv) },
            key,
            new Uint8Array(payload.data)
        )

        return decoder.decode(decrypted)

    }

}
