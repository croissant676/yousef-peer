<script lang="ts">
    import {allCards} from "./common";
    import {gameData, isTimeForDraw} from "./clientSide";
    import {selectDrawLoc} from "./clientMappings";

    $: pile = $gameData.pile.map((p) => allCards[p]);
    $: deckSize = $gameData.deck_size;
</script>

<div id="a">
    <button class="v" disabled={!$isTimeForDraw} on:click={async () => await selectDrawLoc(false)}>
        <input alt="pile" src={pile[pile.length - 1].url} type="image"/>
        <p> # pile: {pile.length} </p>
    </button>
    <button class="v" disabled={!$isTimeForDraw} on:click={async () => await selectDrawLoc(true)}>
        <input alt="deck" id="deck_comp" src="https://www.deckofcardsapi.com/static/img/back.png " type="image"/>

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