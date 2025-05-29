export function removeUndefinedFields(obj: any) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
}

export function trimHexAddress(address: string): string {
    return address.replace(/^0x0+/, "0x");
}
