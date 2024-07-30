import type {ScoreTracker, Settings} from "./internalServer";

export type ChatMessageData = { _type: 'in_msg', sender: string | undefined, data: string }
export type PlayerReadyData = { name: string, isReady: boolean }
export type PlayerNameData = { name: string }


export type ClientMessageData = { _type: 'msg', data: string }
export type ClientNameSetData = { _type: 'name', name: string }
export type LobbyData = { _type: 'lobby_upd', data: PlayerReadyData[] }

export function colorFor(isReady: boolean) {
    return isReady ? '#77dd77' : '#ff6961'
}

export type CommData = { '_type': string }

export async function raceTimeout<Res>(promise: Promise<Res>, timeout: number): Promise<Res | undefined> {
    return Promise.race<Res | undefined>([promise, timeoutPromise(timeout)]);
}

export async function timeoutPromise(timeout: number): Promise<undefined> {
    return new Promise<undefined>((resolve, _) => setTimeout(() => resolve(undefined), timeout));
}

export function isCommData(potentialCommData: unknown): potentialCommData is CommData {
    return '_type' in potentialCommData && typeof potentialCommData._type === 'string';
}

export type Card = {
    id: number,
    rank: 'ace' | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king',
    rankValue: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades',
    url: string
} | { id: number, rank: 'joker', suit: 'small' | 'big', rankValue: 0, value: 0, url: string }

export let backOfCardUrl = 'https://www.deckofcardsapi.com/static/img/back.png';
export let allCards: Card[] = (function () {
    let list = [];
    let suits = ['hearts', 'diamonds', 'clubs', 'spades']
    for (let i = 0; i < 4; i++) {
        let suit = suits[i];
        let suitChar = 'HDCS'[i];
        for (let j = 0; j < 13; j++) {
            let rank = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'][j];
            let rankChar = 'A234567890JQK'[j];
            list.push({
                id: list.length,
                rank: rank,
                rankValue: j + 1,
                value: j + 1 > 10 ? 10 : j + 1,
                suit: suit,
                url: `https://deckofcardsapi.com/static/img/${rankChar}${suitChar}.png`
            } as Card);
        }
    }
    list.push(
        {
            id: 52,
            rank: 'joker',
            suit: 'small',
            rankValue: 0,
            value: 0,
            url: 'https://deckofcardsapi.com/static/img/X1.png'
        },
        {
            id: 53,
            rank: 'joker',
            suit: 'big',
            rankValue: 0,
            value: 0,
            url: 'https://deckofcardsapi.com/static/img/X2.png'
        }
    );
    return list;
})();

export function cardText(card: Card): string {
    return card.rank === 'joker' ? `${card.suit} joker` : `${card.rank} of ${card.suit}`
}

export function makeDeck(multiply: number = 1, useJokers: boolean = true): Card[] {
    let res: Card[] = [];
    for (let i = 0; i < (useJokers ? 54 : 52); i++) {
        res.push(...Array<Card>(multiply).fill(allCards[i]));
    }
    // shuffle
    for (let i = res.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
}

export function isValidSelection(
    options: {
        jokersCanSubInStraight: boolean,
        straightSuit: boolean,
    }, cards: Card[]
): boolean {
    console.log(`checking card validity for ${JSON.stringify(cards)}`)
    // simple and most common cases
    if (cards.length == 0)
        return false;
    if (cards.length == 1)
        return true;
    if (cards.length == 2) {
        return cards[0].rank === cards[1].rank;
    }
    // check if its a trips / quads / penta / hexa / septa / octa / ...
    let rank = cards[0].rankValue;
    let allSameRank = true;
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].rankValue !== rank) {
            allSameRank = false;
            break;
        }
    }
    if (allSameRank)
        return true;

    // straight, a bit annoying..
    cards.sort((a, b) => a.rankValue - b.rankValue);
    let jokerCount = 0;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].rank !== 'joker') {
            jokerCount = i;
            break;
        }
    }

    cards.splice(0, jokerCount);
    if (cards[cards.length - 1].rankValue - cards[0].rankValue <= 1 && jokerCount == 0)
        return false; // only 2 cards, etc

    if (options.straightSuit) {
        let startingSuit = cards[0].suit;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].suit != startingSuit)
                return false;
        }
    }
    if (jokerCount == 0) {
        let start = cards[0].rankValue;
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].rankValue != start + i) {
                return false;
            }
        }
        return true;
    }

    let neededJokers = 0;
    let prev = cards[0].rankValue;
    for (let i = 1; i < cards.length; i++) {
        let nextRank = cards[i].rankValue;
        if (nextRank == prev)
            return false; // 2 of the same type
        neededJokers += (nextRank - prev - 1);
        prev = nextRank;
    }
    return neededJokers <= jokerCount;
}

export type RoomGameInfo = {
    '_type': 'round_upd',
    turn_num: number,
    round_num: number,
    current_player: string,
    'opponents': OpponentRoundData[],
    'hand': number[],
    score: number,
    scoreboard: ScoreTracker[],
    deck_size: number,
    pile: number[]
}

export type OpponentRoundData = { name: string, cardCount: number, score: number }
export type CardSelect = {
    '_type': 'card_select',
    'hands': number[] // the indices
}

export type DrawSelect = {
    '_type': 'draw_select',
    'value': 'deck' | 'pile'
}

export type SettingsUpd = {
    _type: 'sett_upd',
    settings: Settings
}

export type TurnUpd = {
    _type: 'turn_upd',
    player_turn: string
}

export const DrawFinishedRes = {_type: 'draw_finished'}

export type CalledUpd = {
    _type: 'call_alert'
    caller: string,
    caller_cards: number[],
    beat?: string,
    otherPlayers: NonCallingPlayer[]
}

export type NonCallingPlayer = {
    name: string,
    cards: number[]
}

export type CallingDisplay = {
    name: string,
    isCaller: boolean,
    cards: number[]
}