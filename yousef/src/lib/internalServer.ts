// noinspection SillyAssignmentJS

import {Peer} from "peerjs";
import type {DataConnection} from "peerjs";
import {lobbyData, messages} from "./clientSide";
import type {
    ChatMessageData,
    ClientMessageData,
    ClientNameSetData,
    CommData,
    LobbyData,
    PlayerReadyData
} from "./common";
import {isCommData} from "./common";
import {hostName} from "./host";
import {get, writable} from "svelte/store";

export let isServer: boolean = false;
let peer: Peer | undefined;
export let id: string | undefined;

let otherUsers: UserMgr[] = [];

export async function createInternalServer() {
    peer = new Peer();
    isServer = true;
    console.log('creating internal server...')
    id = await openPeer(peer);

    peer.on('connection', async (newConn: DataConnection) => {
        console.log(`new connection! ${newConn.connectionId}, from peer ${newConn.peer}`)

        await openConn(newConn);
        let userMgr = new UserMgr(newConn);
        await userMgr.send(verification)

        otherUsers.push(userMgr);
        console.log('created userMgr for new connection, successful; verified')
    });

    console.log(`internal server created; connected to peer server! id = ${id}`)
}

export async function openPeer(peer: Peer): Promise<string> {
    return new Promise<string>((resolve, _) => {
        peer.on('open', (id) => {
            resolve(id);
        });
    });
}

export async function openConn(conn: DataConnection) {
    return new Promise<void>((resolve, _) => {
        conn.on('open', () => resolve())
    });
}


enum RoomState {
    Lobby,
    Game,
    GameRes,
    Results
}

enum UserState {
    NA,
    Idle,
    Select,
    Draw
}

let verification: CommData = {_type: 'yousef_ver'}

function isNameTaken(name: string): boolean {
    if (name == hostName)
        return true;
    for (let otherUser of otherUsers) {
        if (otherUser.name && otherUser.name === name)
            return true;
    }
    return false;
}

let lobbyState: { [key: string]: boolean } = {};

export function resetLobbyState() {
    for (let lobbyStateKey in lobbyState) {
        lobbyState[lobbyStateKey] = false;
    }
}

type User = UserMgr | { name: string };

class UserMgr {
    conn: DataConnection;
    curState: UserState = UserState.NA;
    name: string | undefined;

    constructor(conn: DataConnection) {
        this.conn = conn;
        // send yousef verification so the client knows that we're yousef

        conn.on('data', async commData => {
            if (!isCommData(commData)) {
                console.log(`received unusable data: ${JSON.stringify(commData)}, from usr ${this.name ?? conn.peer}`);
                return
            }

            console.log(`received conn data! ${JSON.stringify(commData)}, from usr ${this.name ?? conn.peer}`)
            switch (commData._type) {
                case 'msg':
                    let newMsg = commData as ClientMessageData;
                    if (!this.name)
                        throw `illegal msg! user w/o name sending msg ${newMsg}, conn ${conn.connectionId} ${conn.peer}`;
                    let newMsgData: ChatMessageData = {
                        '_type': 'in_msg',
                        sender: this.name,
                        data: newMsg.data
                    };

                    await sendChatMsg(newMsgData)
                    break

                case 'name':
                    let nameSetReq = commData as ClientNameSetData
                    let name = nameSetReq.name
                    if (isNameTaken(name)) {
                        await this.send({'_type': 'bad_name'})
                    } else {
                        await this.send({'_type': 'good_name'})
                        this.name = name;
                        lobbyState[name] = false;
                        await lobbyDataUpdate();
                    }
                    break;

                case 'lobby_rd':
                    lobbyState[this.name] = !lobbyState[this.name];
                    await lobbyDataUpdate();
                    break;

            }
        });
    }

    async send(data: CommData) {
        console.log(`sending ${this.name ?? this.conn.peer} data: ${JSON.stringify(data)}`)
        this.conn.send(data)
    }
}


export async function sendToAllOthers(data: CommData) {
    for (let otherUser of otherUsers) {
        await otherUser.send(data);
    }
}

export async function sendChatMsg(chatMsgData: ChatMessageData) {
    messages.set([...get(messages), chatMsgData]);
    await sendToAllOthers(chatMsgData);
    console.log(`transmitted msg ${chatMsgData.sender}: ${chatMsgData.data}`)
}

export async function lobbyDataUpdate() {
    let lobbyUpd = createLobbyUpd();
    lobbyData.set(lobbyUpd.data);
    await sendToAllOthers(lobbyUpd)
    console.log(`lobby data updated! res: ${JSON.stringify(lobbyUpd)}`)
}

function createLobbyUpd(): LobbyData {
    console.log(`creating lobby date upd, current state looks like ${JSON.stringify(lobbyState)}`)
    let list: PlayerReadyData[] = [];
    for (let lobbyDataKey in lobbyState) {
        let isReady = lobbyState[lobbyDataKey];
        list.push({name: lobbyDataKey, isReady: isReady})
    }
    return {'_type': 'lobby_upd', data: list};
}

export function everybodyReady() {
    for (let lobbyStateKey in lobbyState) {
        if (!lobbyState[lobbyStateKey])
            return false;
    }
    return true;
}

export async function initHostLobbyData() {
    lobbyState[hostName] = false;
    await lobbyDataUpdate();
}

export async function changeHostLobbyState() {
    lobbyState[hostName] = !lobbyState[hostName];
    await lobbyDataUpdate();
}


export type Settings = {
    useJokers: boolean,
    jokersCanSubInStraight: boolean,
    straightSuit: boolean,
    deckCount: number,
    cardsPerPlayer: number,
    ptsToLose: number,
    punishForIncorrectCall: number
}

export let roomSettings: Settings = defaultSettings();

function defaultSettings(): Settings {
    return {
        useJokers: false,
        jokersCanSubInStraight: true,
        straightSuit: false,
        deckCount: 1,
        cardsPerPlayer: 4,
        ptsToLose: 100,
        punishForIncorrectCall: 30
    };
}

