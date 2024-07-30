<script lang="ts">
    import {backOfCardUrl, type Card, cardText} from "./common";
    import {fly} from 'svelte/transition';

    export let data: Card;
    export let onchange: (s: boolean) => void;
    let selected = false;
    export let flipped: boolean = false;
    export let drawn: boolean = true;

    let flipped_ = flipped;
    let drawn_ = drawn;

    if (!drawn) {
        setTimeout(comeFromDeck, 100)
    }

    $: border = selected ? '#6e80f1' : 'transparent'

    console.log(`selectable card created with data ${JSON.stringify(data)}, drawn ${drawn_}, flipped = ${flipped_}`)

    function handle() {
        selected = !selected;
        onchange(selected);
    }

    export function backToDeck() {
        drawn_ = false;
    }

    export function comeFromDeck() {
        drawn_ = true;
    }

    export function flip() {
        flipped_ = !flipped_;
    }

</script>

{#if drawn_}
    <div style="background: transparent;">
        <div class:flipped={flipped_} class="card" transition:fly={{y: -250, duration: 500}}>
            <div class="front">
                <input type="image" src={data.url} alt={data.toString()}} style='border: {border} solid 3px'
                       on:click={handle} title={cardText(data)}/>
            </div>
            <div class="back">
                <input type="image" src={backOfCardUrl} alt="back of card" on:click={handle}/>
            </div>
        </div>
    </div>
{/if}
<style>
    .card {
        padding: .1em;
        transition: transform 0.8s;
        transform-style: preserve-3d;
        display: grid;
        grid-template: 1fr / 1fr;
        place-items: center;
    }

    input {
        border-radius: 10px;
        height: 10em;
        padding: .1em;
    }

    .flipped {
        transform: rotateY(180deg);
    }

    .front, .back {
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        grid-column: 1 / 1;
        grid-row: 1 / 1;
    }

    .back {
        transform: rotateY(180deg);
        flex-direction: column;
    }

</style>