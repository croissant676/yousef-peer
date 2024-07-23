<script lang="ts">
    import type {OpponentRoundData} from "./common";

    export let data: OpponentRoundData;

</script>


<div id="div">
    <h3>{data.name}</h3>
    score: {data.score}<br>
    cards: {data.cardCount}
</div>

<style>
    div {
        padding: .5em;
        border-radius: 10px;
        border: #646cff;
        background: #00000033;
    }

    button {
        background-color: #f36161;
    }
</style>