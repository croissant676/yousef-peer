<script lang="ts">
    import {allCards, type Card, isValidSelection, timeoutPromise} from "./common";
    import SelectableCard from "./SelectableCard.svelte";
    import {
        clientName,
        gameData,
        isTimeForDraw,
        justDrewToFalse,
        setMatchClientSelectCard,
        settings
    } from "./clientSide";
    import {call, sendCards} from "./clientMappings";
    import {onMount} from "svelte";

    let selection = new Array(10).fill(false);
    let selected: Card[] = [];

    function onChange(index: number) {
        return (bool) => {
            selection[index] = bool;
            selected = [];
            for (let i = 0; i < selection.length; i++) {
                if (selection[i])
                    selected.push(cards[i]);
            }
            selected = selected;
        }
    }

    let selectableCards: SelectableCard[] = [];

    $: isTurn = $gameData.current_player === clientName;
    $: sum = selected.map(card => card.value).reduce((a, b) => a + b, 0);
    $: valid = isValidSelection($settings, selected);
    $: buttonText = isTurn ? valid ? "\xa0\xa0\xa0submit!\xa0\xa0\xa0" : "invalid combo" : "not your turn"

    async function submit() {
        let removedIndices: number[] = [];
        for (let i = 0; i < selectableCards.length; i++) {
            if (selection[i]) {
                selectableCards[i].backToDeck();
                removedIndices.push(i);
            }
            selection[i] = false;
            await timeoutPromise(200);
        }
        selected = [];
        await sendCards(removedIndices);

        $isTimeForDraw = true;
    }

    let first = true;

    export async function initialDisplay() {
        await timeoutPromise(1000);
        for (let i = 0; i < selectableCards.length; i++) {
            selectableCards[i].flip();
            await timeoutPromise(200);
        }
        // for future refs, first = false;
        first = false;
    }

    gameData.subscribe((x) => console.log(x))
    $: cards = $gameData.hand.map(cardId => allCards[cardId]);

    onMount(initialDisplay)
    $: ableToCall = $gameData.round_num > $settings.roundsBeforeCall;
    setMatchClientSelectCard(() => {
        console.log(`client: new hands = ${JSON.stringify(cards)}`)
    });

    function reset() {
        first = true;
    }
</script>


<div id="nox">
    your hand
    <div>
        {#key $gameData.hand}
            <div id="card-holder">
                {#each cards as card, index (index)}
                    <SelectableCard data={card} onchange={onChange(index)} bind:this={selectableCards[index]}
                                    flipped={first}
                                    drawn={first || index !== cards.length - 1 || !justDrewToFalse()}/>
                {/each}
                {#if cards.length === 0}
                    <p id="empty">waurw! <br> such empty</p>
                {/if}
            </div>
        {/key}
        <div>
            selected sum: {sum}
        </div>
        <div>
            <button disabled={!valid || !isTurn || $isTimeForDraw} id="submit" on:click={submit}>
                {buttonText}
            </button>
            <button disabled={!isTurn || !ableToCall || $isTimeForDraw} id="call" on:click={call}>
                call!
            </button>
        </div>
    </div>
</div>

<style>
    #nox {
        position: absolute;
        bottom: 5em;
        background: #00000033;
        padding: 5px;
        border-radius: 10px;
        border: 0;
        display: block;
        left: 50%;
        transform: translate(-50%);
    }

    #card-holder {
        justify-content: center;
        display: flex;
        height: 10em;
        transition: 3s;
    }

    #submit {
        background-color: #f36161;
    }

    #call {
        background-color: #ceb864;
    }

    #empty {
        position: absolute;
        top: 40%;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }
</style>