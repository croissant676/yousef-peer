<script lang="ts">
    import {backOfCardUrl, type Card, cardText} from "./common";
    import {cubicInOut} from "svelte/easing";

    export let data: Card;
    let flipped_ = true;

    export function display() {
        flipped_ = !flipped_;
    }


    let exploding: boolean = false;
    $: animation = exploding ? 3 : .4;
    let randA = genRandom();
    let randB = genRandom();
    let randC = genRandom();

    function genRandom() {
        let a = Math.random();
        if (Math.random() > .5)
            return -a;
        return a;
    }

    let randD = 500 + Math.random() * 2000;

    export async function explode() {
        exploding = true;
    }

    function explodeAndDie(node: HTMLElement) {
        let forceAngle = Math.random() * Math.PI;
        let dx = Math.cos(forceAngle) * 100;
        let dy = Math.sin(forceAngle) * 100;

        let boundingRect = node.getBoundingClientRect();
        let newX = boundingRect.x;
        let newY = boundingRect.y;
        return {
            duration: 3000,
            css: (t) => {
                dy -= 5;
                let eased = cubicInOut(1 - t);
                return `transform: rotate3d(${eased * randA}, ${eased * randB}, ${eased * randC}, ${eased * randD}deg)
                scale(${eased * 2 + 1});
                left: ${newX += dx}; top: ${newY += dy};

                opacity: ${t};
                `;
            }
        }
    }

</script>

<div style="background: transparent;">
    {#if !exploding}
        <div class:flipped={flipped_} class="card" out:explodeAndDie
             style="transition: {animation}s ease-in-out;">
            <div class="front">
                <input type="image" src={data.url} alt={data.toString()}}
                       title={cardText(data)}/>
            </div>
            <div class="back">
                <input type="image" src={backOfCardUrl} alt="back of card"/>
            </div>
        </div>
    {/if}
</div>
<style>

    .card {
        padding: .1em;
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