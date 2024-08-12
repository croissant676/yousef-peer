
// this variable should only be initialized once, but essentially tells the client
// which user it is representing

// should be set during the name screen
import {DataStreamRouter} from "../Data";

export let name: string;
export function initializeName(name: string) {
    if (name) {
        console.warn(`client name is being set to new value (${name}) even though there's already a value (${name})`);
    }
    name = name;
}

export const router: DataStreamRouter = new DataStreamRouter('client');
