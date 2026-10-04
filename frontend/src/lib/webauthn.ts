function b64urlToBytes(value: string): Uint8Array {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
}

function bytesToB64url(bytes: Uint8Array): string {
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function isPasskeyCancelled(err: any): boolean {
    return err?.name === "NotAllowedError" || err?.name === "AbortError";
}

export async function createPasskey(options: any) {
    const credential = (await navigator.credentials.create({
        publicKey: {
            ...options,
            challenge: b64urlToBytes(options.challenge),
            user: { ...options.user, id: hexToBytes(options.user.id) },
            excludeCredentials: options.excludeCredentials?.map((item: any) => ({
                ...item,
                id: b64urlToBytes(item.id),
            })),
        },
    } as CredentialCreationOptions)) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAttestationResponse;

    return {
        id: credential.id,
        rawId: bytesToB64url(new Uint8Array(credential.rawId)),
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
        response: {
            clientDataJSON: bytesToB64url(new Uint8Array(response.clientDataJSON)),
            attestationObject: bytesToB64url(new Uint8Array(response.attestationObject)),
            transports: response.getTransports?.() ?? [],
        },
    };
}

export async function getPasskey(options: any) {
    const credential = (await navigator.credentials.get({
        publicKey: {
            ...options,
            challenge: b64urlToBytes(options.challenge),
            allowCredentials: options.allowCredentials?.map((item: any) => ({
                ...item,
                id: b64urlToBytes(item.id),
            })),
        },
    } as CredentialRequestOptions)) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAssertionResponse;

    return {
        id: credential.id,
        rawId: bytesToB64url(new Uint8Array(credential.rawId)),
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
        response: {
            clientDataJSON: bytesToB64url(new Uint8Array(response.clientDataJSON)),
            authenticatorData: bytesToB64url(new Uint8Array(response.authenticatorData)),
            signature: bytesToB64url(new Uint8Array(response.signature)),
            userHandle: response.userHandle
                ? bytesToHex(new Uint8Array(response.userHandle))
                : null,
        },
    };
}
