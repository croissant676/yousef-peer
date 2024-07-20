<script lang="ts">
    import {addYouTag, lobbyData} from "./clientSide";
</script>

<div id="container">
    <strong>players: </strong>
    {#each $lobbyData as data}
        <br>
        {addYouTag(data.name)}
    {/each}
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
</style>