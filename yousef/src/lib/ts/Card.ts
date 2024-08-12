const ranks = ["joker", "ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"];
export type Rank = typeof ranks[number];

export interface RankData {
    name: string,
    // the value of the rank, with joker as 0
    value: number
    // for yousef purposes, the value of the card when we sum it
    yousefValue: number,
    urlChar: string
}

// mapping record to get the rank data for a given rank.
export const Ranks: Record<Rank, RankData> = (function () {
    const data = {};
    for (let i = 0; i < ranks.length; i++) {
        data[ranks[i]] = {
            name: ranks[i].toString(),
            value: i,
            yousefValue: i > 10 ? 10 : i,
            urlChar: 'XA234567890JQK'[i]
        } as RankData
    }
    return data;
})();

export const suits = ["hearts", "diamonds", "clubs", "spades"]
export type NonJokerSuit = typeof suits[number];
export type NonJokerCard = {
    id: number,
    rank: Exclude<Rank, "joker">,
    rankData: RankData,
    suit: NonJokerSuit,
    text: string,
    url: string
}

export type JokerCard = {
    id: 52 | 53,
    rank: "joker",
    rankData: RankData,
    suit: "small" | "big",
    text: string,
    url: string
}

export type Card = NonJokerCard | JokerCard;

export const cards: Card[] = (function () {
    const list: Card[] = [];
    for (let i = 0; i < suits.length; i++) {
        const suit = suits[i];
        for (let j = 1; j < ranks.length; j++) {
            const rank: Exclude<Rank, "joker"> = ranks[i];
            list.push({
                id: list.length,
                rank: rank,
                rankData: ranks[rank],
                suit: suit,
                text: `${rank} of ${suit}`,
                url: `https://deckofcardsapi.com/static/img/${ranks[rank].urlChar}${suit[0].toUpperCase()}.png`
            });
        }
    }
    list.push({
        id: 52,
        rank: "joker",
        rankData: ranks["joker"],
        suit: "small",
        text: "small joker",
        url: "https://deckofcardsapi.com/static/img/X1.png"
    }, {
        id: 53,
        rank: "joker",
        rankData: ranks["joker"],
        suit: "big",
        text: "big joker",
        url: "https://deckofcardsapi.com/static/img/X2.png"
    })
    return list;
})();

export function createDeck(multiplier: number = 1, includeJokers: boolean = true): Card[] {
    const deck: Card[] = [];
    for (let i = 0; i < includeJokers ? 54 : 52; i++) {
        deck.push(...Array<Card>(multiplier).fill(cards[i]));
    }
    // we then want to shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function yousef_validSelection(cards: Card[], straightsMustHaveSameSuit: boolean = false, jokersCanSubInStraight: boolean = true): boolean {
    // basic cases
    if (cards.length === 0) {
        return false;
    } else if (cards.length === 1) {
        return true;
    } else if (cards.length === 2) {
        return cards[0].rank === cards[1].rank;
    }

    // check if they all have the same rank
    const startingRank = cards[0].rank;
    let allCardsAreSameRank = true;

    for (let i = 1; i < cards.length; i++) {
        if (cards[i].rank != startingRank) {
            allCardsAreSameRank = false;
            break;
        }
    }
    if (allCardsAreSameRank) {
        return true;
    }

    // now we have to check straights...
    // first, we want to sort the cards
    cards.sort((cardA, cardB) => cardA.rankData.value - cardB.rankData.value);
    let jokerCount = 0;
    // since jokers have a rankData value of 0, they will be at the front of the sorted array
    // so the number of jokers is the index of the first non-joker card.
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].rank !== "joker") {
            jokerCount = i;
            break;
        }
    }

    // get rid of the jokers
    cards.splice(0, jokerCount);

    const nonJokerCards = cards as NonJokerCard[];
    // since we know it has to be a suit, if straights must have same suit
    // is enabled, then if they don't all have the same suit we return false
    if (straightsMustHaveSameSuit) {
        const startingSuit = nonJokerCards[0].suit;
        for (let i = 1; i < nonJokerCards.length; i++) {
            if (nonJokerCards[i].suit != startingSuit) {
                return false;
            }
        }
    }

    if (jokerCount === 0 || !jokersCanSubInStraight) {
        // this should be sequential
        const firstRank = nonJokerCards[0].rankData.value;
        for (let i = 1; i < nonJokerCards.length; i++) {
            if (nonJokerCards[i].rankData.value != firstRank + i) {
                return false;
            }
        }
        return true;
    }

    let neededJokers = 0;
    let previousRankValue = cards[0].rankData.value;
    for (let i = 1; i < nonJokerCards.length; i++) {
        let currentRankValue = nonJokerCards[i].rankData.value;
        // check if this value is the same as the prev
        if (currentRankValue === previousRankValue) {
            return false; // we have 2 of the same value in a straight
        }
        neededJokers += (currentRankValue - previousRankValue - 1);
        previousRankValue = currentRankValue;
    }

    return jokerCount >= neededJokers;
}