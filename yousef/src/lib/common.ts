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
    return Promise.race<Res | undefined>([promise,
        new Promise<undefined>((resolve, _) => setTimeout(() => resolve(undefined), timeout))
    ]);
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

export let allCards: Card[] = (function () {
    let list = [];
    let suits = ['hearts', 'diamonds', 'clubs', 'spades']
    for (let i = 0; i < 4; i++) {
        let suit = suits[i];
        let suitChar = 'HDCS'[i];
        for (let j = 0; j < 13; j++) {
            let rank = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
            let rankChar = 'A1234567890JQK'[j];
            list.push({
                id: list.length,
                rank: rank,
                rankValue: j,
                value: j > 10 ? 10 : j,
                suit: suit,
                url: `https://deckofcardsapi.com/static/img/${rankChar}${suitChar}.svg`
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
            url: 'https://deckofcardsapi.com/static/img/X1.svg'
        },
        {
            id: 53,
            rank: 'joker',
            suit: 'big',
            rankValue: 0,
            value: 0,
            url: 'https://deckofcardsapi.com/static/img/X2.svg'
        }
    );
    return list;
})();

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