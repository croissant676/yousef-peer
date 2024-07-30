// noinspection SillyAssignmentJS

import type {DataConnection} from "peerjs";
import {Peer} from "peerjs";
import {
    gameData,
    lobbyData,
    manageTurnUpd,
    matchClientSelectCard,
    messages,
    settings,
    updateUiToRoom,
} from "./clientSide";
import type {
    Card,
    CardSelect,
    ChatMessageData,
    ClientMessageData,
    ClientNameSetData,
    CommData,
    DrawSelect,
    LobbyData,
    OpponentRoundData,
    PlayerReadyData,
    RoomGameInfo,
    SettingsUpd,
    TurnUpd
} from "./common";
import {DrawFinishedRes, isCommData, makeDeck} from "./common";
import {host, hostName} from "./host";
import {get, writable} from "svelte/store";
import Settings from "./Settings.svelte";

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

    console.log(`internal server created; connected to peer server! id = ${id}`);
    settings.set(get(roomSettings));
    subscribeSettings();
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
    resolveFunctions: { [_type: string]: (data: CommData) => void } = {};

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
                        await this.send({'_type': 'sett_upd', settings: get(roomSettings)} as CommData);
                        await lobbyDataUpdate();
                    }
                    break;

                case 'lobby_rd':
                    lobbyState[this.name] = !lobbyState[this.name];
                    await lobbyDataUpdate();
                    break;
                case 'card_select':
                    this.resolveFunctions['card_select'](commData);
                    break;
                case 'draw_select':
                    this.resolveFunctions['draw_select'](commData);
                    break;
            }
        });
    }

    get isHost() {
        return false;
    }

    async waitForCommData(_type: string): Promise<CommData> {
        return new Promise<CommData>(resolve => {
            this.resolveFunctions[_type] = resolve;
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
    return sendChatMsg({'_type': 'in_msg', sender: undefined, data: info})
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
    punishForIncorrectCall: number,
    roundsBeforeCall: number,
}

export let roomSettings = writable(defaultSettings());

function defaultSettings(): Settings {
    return {
        useJokers: false,
        jokersCanSubInStraight: true,
        straightSuit: false,
        deckCount: 1,
        cardsPerPlayer: 4,
        ptsToLose: 100,
        punishForIncorrectCall: 30,
        roundsBeforeCall: 3
    };
}

function subscribeSettings() {
    roomSettings.subscribe(async (nV) => {
        settings.set(nV);
        await sendToAllOthers({
            _type: 'sett_upd',
            settings: nV
        } as SettingsUpd);
    })
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
        this.settings = get(roomSettings);
        this.roundData = [];
        this.players = [host, ...otherUsers as User];
        this.scores = {};
        for (let player of this.players) {
            this.scores[player.name] = 0;
        }
        console.log(`created game! data: ${JSON.stringify(this.settings)}`);
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

    constructor() {
        this.deck = makeDeck(game.settings.deckCount, game.settings.useJokers);
        this.pile = [];
        this.playerHands = {};
        this.turnCount = 0;
        for (let player of game.players) {
            this.playerHands[player.name] = [];
        }
    }

    get roundNumber(): number {
        return Math.floor(this.turnCount / game.players.length) + 1;
    }

    get curPlayer(): User {
        // ensure that we fit inside the list
        return game.players[(this.turnCount + game.prevWinner) % game.players.length];
    }

    async start() {
        for (let i = 0; i < game.settings.cardsPerPlayer; i++) {
            for (let playerHandsKey in this.playerHands) {
                this.playerHands[playerHandsKey].push(this.drawFromDeck());
            }
        }
        this.pile.push(this.drawFromDeck());
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
        for (let i = 0; i < game.players.length; i++) {
            let player = game.players[i];
            let excludingPlayer = [];
            for (let j = 1; j < game.players.length; j++) {
                excludingPlayer.push(globalOppRD[(i + j) % game.players.length]);
            }

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
        while (!await this.playCurUser()) {
            this.turnCount++;
        }
        const caller = this.curPlayer;
        console.log(`called, caller = ${caller.name}`)

        let handSums = {};
        for (let playerHandsKey in this.playerHands) {
            handSums[playerHandsKey] = this.calcScore(playerHandsKey);
        }

        let scoreToBeat: number = handSums[caller.name];
        let sorted = game.players.map(x => x.name)
            .sort((a, b) => handSums[a] - handSums[b]);


    }

    calcScore(name: string): number {
        let cards = this.playerHands[name];
        return cards.map(x => x.value).reduce((a, b) => a + b, 0);
    }

    async playCurUser(): Promise<boolean> {
        let curPlayer = this.curPlayer;

        console.log(`new turn; cur player = ${curPlayer.name}`)
        let newTurnUpd = {_type: 'turn_upd', player_turn: curPlayer.name} as TurnUpd;
        manageTurnUpd(newTurnUpd);
        await sendToAllOthers(newTurnUpd)
        await this.sendUpdates();

        let cardIndices: number[];
        if (curPlayer.isHost) {
            cardIndices = await new Promise((res, _) => {
                currentResolve = res;
            }) as number[];
        } else {
            cardIndices = (await (curPlayer as UserMgr).waitForCommData('card_select') as CardSelect).hands;
        }

        if (cardIndices.length === 0) {
            return true;
        }

        let discarded = this.discardCards(cardIndices);
        console.log(`discarded cards from current player ${this.mapToIds(discarded)}`)

        let tipMsg = {
            _type: 'in_msg',
            sender: undefined,
            data: `choose where you want to draw a card from (pile or deck)`
        } as ChatMessageData;

        let isDeck: boolean;
        if (curPlayer.isHost) {
            messages.set([...get(messages), tipMsg]);

            isDeck = await new Promise((res, _) => {
                currentResolve = res;
            }) as boolean;
        } else {
            let usrMgr = curPlayer as UserMgr;
            await usrMgr.send(tipMsg);
            let drawSelect = await usrMgr.waitForCommData('draw_select') as DrawSelect;

            isDeck = drawSelect.value === 'deck';
        }

        if (isDeck) {
            let card = this.drawFromDeck();
            this.playerHands[curPlayer.name].push(card);
        } else {
            let card = this.pile.pop();
            this.playerHands[curPlayer.name].push(card);
        }

        this.pile.push(...discarded);

        console.log(`player selected ${isDeck ? 'deck' : 'pile'}, pushed cards to player hand, new hand = ${this.mapToIds(this.playerHands[curPlayer.name])}`)
        await this.sendUpdates();

        if (curPlayer.isHost) {
            matchClientSelectCard();
        } else {
            await (this.curPlayer as UserMgr).send(DrawFinishedRes);
        }
        return false;
    }

    discardCards(indices: number[]): Card[] {
        let playerCards = this.playerHands[this.curPlayer.name];
        let newHand = [];
        let discarded = [];
        for (let i = 0; i < playerCards.length; i++) {
            if (indices.indexOf(i) == -1) {
                // indices doesn't contain it, we keep
                newHand.push(playerCards[i]);
            } else {
                discarded.push(playerCards[i]);
            }
        }
        console.log(`discarding cards from player ${this.curPlayer.name}; 
                old hand: ${this.mapToIds(playerCards)}, new hand: ${this.mapToIds(newHand)}, removal indices:${indices}`)
        this.playerHands[this.curPlayer.name] = newHand;
        return discarded;
    }
}

let game: GameData;
export let currentResolve: (a: any) => void;

export async function startGame() {
    roomState = RoomState.Game;
    game = new GameData();

    await game.startNewRound();
    updateUiToRoom();
    await sendToAllOthers({'_type': 'game_start'});

    await game.round?.play()
}
