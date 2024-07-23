<script lang="ts">
    import {gameData} from "./clientSide";
    import Opponent from "./Opponent.svelte";

    let data = $gameData;
</script>


<div class="holder">
    <h2 id="opponent-title">opponents</h2>
    {#each data.opponents as opp (opp.name)}
        <Opponent data={opp}/>
    {/each}
</div>

<style>
    .holder {
        position: absolute;
        top: 2em;
        transform: translate(-50%);
    }

    #opponent-title {
        padding-bottom: -10px;
    }
</style>