import {writable} from "svelte/store";
import type {Player} from "./Player";
import type Peer, {DataConnection} from "peerjs";
import type {Data} from "../Data";
import {DataCode, openPeerAndGetId} from "../Data";

export class Settings {
    useJokers: boolean = true;
    jokersCanSubstituteInStraight: boolean = true;
    straightMustHaveSameSuit: boolean = false;
    deckMultiplier: number = 1;
    cardsPerPlayer: number = 4;
    pointsUntilLoss: number = 100;
    punishmentForIncorrectCall: number = 30;
    minRoundsBeforeCall: number = 3;
}

export const roomSettings = writable(new Settings());
roomSettings.subscribe(async (newSettings) => {

});

export let isServer: boolean = false;

const players: Player[] = [];
let peer: Peer;

export async function initializeServer() {
    isServer = true;
    peer = new Peer();
    console.log('creating internal server, waiting to connect to peer server.');
    const id = await openPeerAndGetId(peer);
    console.log(`connected to peer server! peer id = ${id}`);

    peer.on('connection', async (dataConnection) => {
        console.log(`detected data connection! peer id = ${dataConnection.peer}, connection id = ${dataConnection.connectionId}`);
        await dataConnectionVerification(dataConnection);

        
    });

    return id;
}

// verification object is simply a data with verify code
const VerificationData: Data = { code: DataCode.Verify };
async function dataConnectionVerification(dataConnection: DataConnection) {
    dataConnection.send(VerificationData);
    console.log(`sent data verification to peer ${dataConnection.peer}`);
}

export function A() {

}