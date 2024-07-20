export let hostName: string | undefined;
export function initHostname(name: string) {
    if (!hostName)
        hostName = name;
    else console.log(`attempting to initialize hostname though it alr has value; new: ${name}, existing ${hostName}`)
}

export let host = { name: hostName! }