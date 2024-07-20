import type {ChatMessageData, ClientNameSetData, CommData, LobbyData, PlayerReadyData} from "./common";
import {Peer} from "peerjs";
import {openConn, openPeer} from "./internalServer";
import {isCommData, raceTimeout} from "./common";
import type {DataConnection} from "peerjs";
import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";
import type {SvelteComponent} from "svelte";

export const messages: Writable<ChatMessageData[]> = writable([]);
export const lobbyData = writable<PlayerReadyData[]>([]);

// ui
export let component = writable<SvelteComponent>();
export let props = writable<object>();

export function addYouTag(text: string): string {
    if (text === clientName)
        return clientName + ' (you)';
    return text;
}

let peer: Peer | undefined = undefined;
export let conn: DataConnection | undefined;

export let clientName: string;
export function setClientName(name: string) {
    clientName = name;
}

async function joinRoomNoTimeout(code: string): Promise<0> {
    if (!peer) {
        peer = new Peer();
        await openPeer(peer);
        console.log(`created new peer, id ${peer.id}, opened`);
    }

    conn = peer.connect(code);
    await openConn(conn);
    console.log(`contacted peer ${code}, created new conn ${conn.connectionId}`);

    registerActions()
    await waitForCommData('yousef_ver');
    return 0;
}


export async function joinRoom(code: string): Promise<boolean> {
    // raceTimeout returns undefined if timeout reached, while joinRoomNoTimeout is null
    return await raceTimeout(joinRoomNoTimeout(code), 1500) === 0;
}

export async function attemptSetName(name: string): Promise<boolean> {
    let checkName = clientSend({'_type': 'name', name} as ClientNameSetData)
    let response = await Promise
        .race<CommData>([waitForCommData('bad_name'), waitForCommData('good_name')]);
    return response._type === 'good_name';
}

// resolve code
let resolveFunctions: { [_type: string]: (data: CommData) => void } = {};

async function waitForCommData(_type: string): Promise<CommData> {
    return new Promise<CommData>(resolve => {
        resolveFunctions[_type] = resolve;
    });
}

function registerActions() {
    if (!conn) throw 'conn is undefined when register actions called!'
    conn.on('data', async (data) => {
        if (!isCommData(data)) {
            console.log(`received unusable data: ${JSON.stringify(data)}`);
            return
        }

        console.log(`received data ${JSON.stringify(data)}`);
        if (data._type in resolveFunctions) {
            resolveFunctions[data._type](data);
        } else {
            switch (data._type) {
                case "in_msg":
                    let res = data as ChatMessageData;
                    messages.set([...get(messages), res]);
                    break;
                case 'lobby_upd':
                    let lobbyUpd = data as LobbyData;
                    lobbyData.set(lobbyUpd.data);
                    break;
            }
        }
    })
}

export async function clientSend(data: CommData) {
    if (!conn) {
        console.error(`attempting to send data ${JSON.stringify(data)} even though no active conn...`);
        return;
    }
    conn.send(data)
    console.log(`sent data ${JSON.stringify(data)} to server successfully!`)
}