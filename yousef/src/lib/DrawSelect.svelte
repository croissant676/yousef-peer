<script lang="ts">
    import {allCards, type Card} from "./common";
    import {onMount} from "svelte";
    import {component, setDeckComp} from "./clientSide";

    export let pile: Card[] = [allCards[2]];
    export let deckSize = 5;

    onMount(() => {
        setDeckComp(document.getElementById('deck_comp') as HTMLInputElement);
    });
</script>

<div id="a">
    <button class="v">
        <input type="image" src={pile[pile.length - 1].url} alt="pile"/>
        <p> # pile: {pile.length} </p>
    </button>
    <button class="v">
        <input type="image" src="https://www.deckofcardsapi.com/static/img/back.png " alt="deck" id="deck_comp"/>

        <p> # deck: {deckSize} </p>
    </button>
</div>
<style>
    #a {
        position: absolute;
        top: 30%;
        transform: translate(-50%, 0);
        padding: 1em;
        border-radius: 10px;
        display: inline-flex;
    }

    .v {
        margin: 0 10px 0 10px;
        display: flex;
        align-content: center;
        justify-content: center;
        flex-direction: column;
        background-color: #1a1a1a;
        padding: 1em;
        border-radius: 15px;
    }

    input {
        height: 10em;
    }
</style>