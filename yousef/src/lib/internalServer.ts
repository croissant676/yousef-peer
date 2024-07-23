// noinspection SillyAssignmentJS

import {Peer} from "peerjs";
import type {DataConnection} from "peerjs";
import {gameData, lobbyData, messages, updateUIForRoom} from "./clientSide";
import type {
    Card,
    ChatMessageData,
    ClientMessageData,
    ClientNameSetData,
    CommData,
    LobbyData, OpponentRoundData,
    PlayerReadyData, RoomGameInfo
} from "./common";
import {isCommData, makeDeck} from "./common";
import {host, hostName} from "./host";
import {get, writable} from "svelte/store";
import Lobby from "./Lobby.svelte";

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

let roomState: RoomState = RoomState.Lobby;

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

type User = { name: string, isHost: boolean };

class UserMgr {
    conn: DataConnection;
    curState: UserState = UserState.NA;
    name: string | undefined;

    get isHost() {
        return false;
    }

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
                case 'card_select':

                    break;
                case 'draw_select':
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

export async function sendGameMsg(info: string) {
    return sendChatMsg({ '_type': 'in_msg', sender: undefined, data: info })
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

export type ScoreTracker = { [username: string]: number };

class GameData {
    scores: ScoreTracker;
    players: User[];
    roundData: ScoreTracker[];
    round: Round | undefined;
    settings: Settings;
    prevWinner: number = 0;

    constructor() {
        this.settings = roomSettings;
        this.roundData = [];
        this.players = [host, ...otherUsers as User];
        this.scores = {};
        for (let player of this.players) {
            this.scores[player.name] = 0;
        }
        console.log(`created game! data: ${this.settings}`);
    }

    async startNewRound() {
        this.round = new Round();
        await this.round.start();
    }
}

class Round {
    deck: Card[];
    pile: Card[];
    turnCount: number;
    playerHands: { [username: string]: Card[] }

    get roundNumber(): number {
        return Math.floor(this.turnCount / game.players.length) + 1;
    }

    constructor() {
        this.deck = makeDeck(game.settings.deckCount, game.settings.useJokers);
        this.pile = [];
        this.playerHands = {};
        this.turnCount = 0;
        for (let player of game.players) {
            this.playerHands[player.name] = [];
        }
    }

    async start() {
        for (let i = 0; i < game.settings.cardsPerPlayer; i++) {
            for (let playerHandsKey in this.playerHands) {
                this.playerHands[playerHandsKey].push(this.drawFromDeck());
            }
        }
        await this.sendUpdates();
        await sendGameMsg(`round ${game.roundData.length + 1} is starting!`)
    }

    drawFromDeck(): Card {
        if (this.deck.length === 0) {
            this.deck.push(...this.pile);
            this.pile = [];
        }
        return this.deck.pop();
    }

    get curPlayer(): User {
        // ensure that we fit inside the list
        return game.players[(this.turnCount + game.prevWinner) % game.players.length];
    }

    mapToIds(cards: Array<Card>): number[] {
        return cards.map(card => card.id);
    }

    async sendUpdates() {
        let globalOppRD: OpponentRoundData[] = [];
        for (let player of game.players) {
            globalOppRD.push({
                name: player.name,
                cardCount: this.playerHands[player.name].length,
                score: game.scores[player.name]
            })
        }
        for (let player of game.players) {
            let excludingPlayer =
                globalOppRD.filter(x => x.name !== player.name);
            let roomGameInfo: RoomGameInfo = {
                '_type': 'round_upd',
                turn_num: this.turnCount,
                round_num: this.roundNumber,
                current_player: this.curPlayer.name,
                opponents: excludingPlayer,
                hand: this.mapToIds(this.playerHands[player.name]),
                score: game.scores[player.name],
                scoreboard: game.roundData,
                deck_size: this.deck.length,
                pile: this.mapToIds(this.pile)
            };
            if (player.isHost) {
                gameData.set(roomGameInfo)
            } else {
                await (player as UserMgr).send(roomGameInfo)
            }
        }
    }

    async play() {

    }
}

let game: GameData;

export async function startGame() {
    roomState = RoomState.Game;
    game = new GameData();

    await game.startNewRound();
    updateUIForRoom();
}
