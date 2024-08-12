import type {Data} from "../Data";
import {DataStreamRouter, isData} from "../Data";
import {name, router} from "../client/Store";
import type {DataConnection} from "peerjs";

// an interface describing the player
export interface Player {
    name: string;
    isHost: boolean;
    // the router for the data so that the player can be listened to
    dataRouter: DataStreamRouter

    // returns whether the data was successfully sent
    sendData(data: Data): Promise<boolean>
}


// peer player is designed to persist between connections
// so if someone disconnects their data connection, the data
// there is still persistent and the player object is not destroyed
// so that they can sign back in; for example, if they dc because their
// tab closed, they should be able to join back with all the information maintained.
// note that if the host closes the tab, the server goes down because the host is running the server
export class PeerPlayer implements Player {
    name: string
    // a peer player can't be the host
    isHost: false
    peerIO: PeerIO;
    // call when this is closed
    _onClose: () => Promise<void>;

    constructor(name: string, peerIO: PeerIO) {
        this.name = name;
        this.isHost = false;
        this.peerIO = peerIO;
    }

}

// a helper class that makes peer communication easy
export class PeerIO {
    connection: DataConnection;
    dataRouter: DataStreamRouter;
    associatedName?: string;

    constructor(connection: DataConnection, name: string) {
        this.connection = connection;
        this.dataRouter = new DataStreamRouter(`peer-${connection.peer}`);
    }

    async sendData(data: Data): Promise<boolean> {
        if (this.connection) {
            console.log(`sending data to peer ${this.name}: ${JSON.stringify(data)}`);
            await this.connection.send(data);
            return true;
        }

        console.warn(`attempting to send data to peer ${this.name} but there's no active connection...: ${JSON.stringify(data)}`)
        return false;
    }

    get name(): string {
        const base = `peer ${this.connection.peer}`;
        if (this.associatedName) {
            return base + ` (assoc: ${this.associatedName})`;
        }
        return base;
    }

    activateConnection() {
        console.log(`associating ${this.connection.peer} (conn id: ${this.connection.connectionId}) with player (${this.name})`);
        this.connection.on('close', async () => {
            
        });
        this.connection.on('data', data => {
            if (!isData(data)) {
                console.warn(`received unusable data, type = ${typeof data}, ${JSON.stringify(data)}`);
                return;
            }
            return this.dataRouter.accept(data);
        });
    }
}

// is a function instead of a const because we don't want to initialize everything while
// we're still in our setup phase...
export function createHostPlayer(): Player {
    return {
        name: name,
        isHost: true,
        dataRouter: new DataStreamRouter('host'),

        sendData(data: Data): Promise<boolean> {
            router.accept(data);
            // to send data to the host, we just make it so that the client router
            // receives the data
            return Promise.resolve(true);
        }
    }
}