<script lang="ts">
    import {gameData, lobbyData} from "./clientSide";

    function addCurPlayer(name: string): string {
        if (name === $gameData.current_player) {
            return name + " (current player)";
        }
        return name;
    }
</script>

<div id="container">
    <strong>players: </strong>
    {#each $lobbyData as data}
        <br>
        {addCurPlayer(data.name)}
    {/each}
    <br>
    <span class="yellow_span">round {$gameData.round_num}</span>
</div>

<style>
    #container {
        position: fixed;
        margin-right: 2em;
        margin-top: 2em;
        right: 0;
        top: 0;
        border-radius: 20px;
        padding: 1em;
        text-align: right;
    }

    .yellow_span {
        color: #ceb864;
    }
</style>