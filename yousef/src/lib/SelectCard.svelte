<script lang="ts">
    import {allCards, type Card, isValidSelection, timeoutPromise} from "./common";
    import {roomSettings} from "./internalServer";
    import SelectableCard from "./SelectableCard.svelte";
    import {gameData} from "./clientSide";

    let isTurn = true;
    $: cards = $gameData.hand.map(cardId => allCards[cardId]);
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

    $: sum = selected.map(card => card.value).reduce((a, b) => a + b, 0);
    $: valid = isValidSelection(roomSettings, selected);
    $: buttonText = isTurn ? valid ? "\xa0\xa0\xa0submit!\xa0\xa0\xa0" : "invalid combo" : "not your turn"

    async function submit() {
        let newHand = []; // this new deck is only until the actual server response comes so its legit only milliseconds
        for (let i = 0; i < selectableCards.length; i++) {
            if (selection[i]) {
                selectableCards[i].backToDeck();
            } else {
                newHand.push(cards[i]);
            }
            selection[i] = false;
            await timeoutPromise(200);
        }
        cards = newHand;
        selected = [];
    }

    async function initialDisplay() {
        for (let i = 0; i < selectableCards.length; i++) {
            selectableCards[i].flip();
            await timeoutPromise(200);
        }
    }
</script>


<div id="nox">
    your hand
    <div>
        <div id="card-holder">
            {#each cards as card, index}
                <SelectableCard data={card} onchange={onChange(index)} bind:this={selectableCards[index]}/>
            {/each}
            {#if cards.length === 0}
                <p id="empty">waurw! <br> such empty</p>
            {/if}
        </div>
        <div>
            selected sum: {sum}
        </div>
        <div>
                        <button id="submit" disabled={!valid || !isTurn} on:click={submit}>
                            {buttonText}
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

    button {
        background-color: #f36161;
    }

    #empty {
        position: absolute;
        top: 40%;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }
</style>