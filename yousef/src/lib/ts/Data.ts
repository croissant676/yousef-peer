import type Peer from "peerjs";
import {DataConnection} from "peerjs";

// simple timeout promise, returns whatever value is passed in after {@link millis} milliseconds.
export async function timeout<T>(millis: number, value: T = undefined): Promise<T> {
    return new Promise<T>((resolve) => {
        setTimeout(() => resolve(value), millis)
    });
}

// returns the promise specified if it resolves in millis time, if not, cancels the promise
// and returns undefined.
export async function withTimeout<T>(otherPromise: Promise<T>, millis: number): Promise<T | undefined> {
    return Promise.race<T | undefined>([otherPromise, timeout(millis, undefined)]);
}

export enum DataCode {
    Verify,
}

// a type mapping that between each data code and the data type that it represents
export type DataCodeTypes = {
    [DataCode.Verify]: number
}

// a piece of data that can be communicated between 2 peers
export interface Data {
    code: DataCode
}

export function isData(suspiciousObject: unknown): suspiciousObject is Data {
    return <boolean>(suspiciousObject && typeof suspiciousObject.code === "number"
        && Object.values(DataCode).includes(suspiciousObject.code));
}

// a function that accepts data in a data stream router
// if the function returns false, it will be removed from the
// router in the future.
export type Route<T extends Data> = (T) => boolean | void

// takes data from a given stream and 'routes' it:
//  - specific codes can be listened to, and functions run only on
//    those codes
//  - users can await the next function, saving
export class DataStreamRouter {
    routes: Route<any>[][] = [];
    name: string;

    constructor(name: string) {
        console.log(`creating data stream router ${name}.`)
        this.name = name;
        for (let dataCodeKey in DataCode) {
            if (isNaN(Number(dataCodeKey))) {
                return;
            }

            this.routes[dataCodeKey] = [];
        }
    }

    // run the router for the given data.
    accept(data: Data) {
        const routes = this.routes[data.code];
        console.log(`data stream router '${this.name}' routing data ${JSON.stringify(data)}.`)
        const newRoutes = [];
        for (const route of routes) {
            const result = route(data);
            if (result !== false) {
                newRoutes.push(route);
            }
        }
        this.routes[data.code] = newRoutes;
    }

    // executes the given route for each of the given data code
    on<C extends DataCode>(code: C, route: Route<DataCodeTypes[C]>) {
        this.routes[code].push(route);
    }

    // returns the next data object of type [code] that comes through the stream
    async next<C extends DataCode>(code: DataCode): Promise<DataCodeTypes[C]> {
        return new Promise<DataCodeTypes[C]>((resolve) => {
            this.on(code, (data) => {
                resolve(data);
                return false;
            })
        });
    }

    // same as next, but returns undefined if the timeout finishes first.
    async nextWithTimeout<C extends DataCode>(code: DataCode, millis: number): Promise<DataCodeTypes[C] | undefined> {
        return withTimeout(this.next(code), millis);
    }
}

export async function openPeerAndGetId(peer: Peer) {
    return new Promise<string>(resolve => {
        peer.on('open', resolve);
    });
}

export async function openConnection(connection: DataConnection) {
    return new Promise<void>(resolve => {
        connection.on('open', resolve)
    })
}

// communication types
