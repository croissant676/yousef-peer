<script lang="ts">
    import {allCards, type CallingDisplay, timeoutPromise} from "./common";
    import {cubicIn} from "svelte/easing";
    import {fade} from "svelte/transition";
    import RawCard from "./RawCard.svelte";

    export let callingData: CallingDisplay = {};

    let cards = callingData.cards.map((a) => allCards[a]);
    let sum = 0;
    let rawCards = [];

    export async function flip() {
        for (let i = 0; i < cards.length; i++) {
            rawCards[i].display();
            await timeoutPromise(200);
            sum += cards[i].value;
        }
    }

    let exploding = [0];
    setTimeout(() => {
        exploding = false
    }, 100);

    let count = 0;

    export function explode() {
        exploding = true;
        for (let rawCard of rawCards) {
            rawCard.explode();
        }
    }

</script>

{#if !exploding}
    <div class="stage_2" style="--height: {callingData.isCaller ? 30 : 70}%">
    <span in:fade={{delay: 500, duration: 500, easing: cubicIn}}>
        {callingData.isCaller ? 'CALLER: ' : ''}{callingData.name}
    </span>
        <div class="stage_2_box1" in:fade={{delay: 500, duration: 500, easing: cubicIn}}>
            {#each cards as card, i}
                <RawCard data={card} bind:this={rawCards[i]}/>
            {/each}
        </div>
        <span in:fade={{delay: 400, duration: 500, easing: cubicIn}}>
        sum: {sum}
    </span>
    </div>
{/if}

<style>

    .stage_2_btm {
        top: 80%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .stage_2 {
        top: var(--height);
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .stage_2_box1 {
        display: flex;
        flex-direction: row;
    }
</style>