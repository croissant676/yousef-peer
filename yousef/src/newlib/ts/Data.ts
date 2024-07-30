// creates a timeout with the value specified
export async function timeout<T>(millis: number, value: T = undefined): Promise<T> {
    return new Promise<T>((resolve) => {
        setTimeout(() => resolve(value), millis)
    });
}

export async function withTimeout<T>(otherPromise: Promise<T>, millis: number): Promise<T | undefined> {
    return Promise.race<T | undefined>([otherPromise, timeout(millis, undefined)]);
}

export enum DataCode {
    Verify,
}

export interface Data {
    code: DataCode
}

export type Route = (Data) => boolean | void

class DataStreamRouter {
    routes: Route[][] = [];
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

    accept(data: Data) {
        const routes = this.routes[data.code];
        console.log(`data stream router '${this.name}' routing data ${JSON.stringify(data)}.`)
        const newRoutes = [];
        for (const route of routes) {
            if (route(data)) {
                newRoutes.push(data);
            }
        }
        this.routes[data.code] = newRoutes;
    }

    on(code: DataCode, route: Route) {
        this.routes[code].push(route);
    }

    async next(code: DataCode) {
        return new Promise<Data>((resolve) => {
            this.on(code, (data) => {
                resolve(data);
                return false;
            });
        });
    }
}

// communication types