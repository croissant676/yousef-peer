<script lang="ts">

    import CodeDisplay from "./Code.svelte";
    import Chat from "./Chat.svelte";
    import PlayerReadyScreen from "./PlayerReadyScreen.svelte";
    import ListPlayers from "./ListPlayers.svelte";
    import {everybodyReady, isServer} from "./internalServer";
    import Settings from "./Settings.svelte";
    import {lobbyData} from "./clientSide";

    let showSettings = false;
    function changeToggle() {
        showSettings = !showSettings;
    }

</script>
<CodeDisplay/>
<Chat/>
<PlayerReadyScreen/>
<ListPlayers/>

<button id="show-settings" on:click={changeToggle}>
    settings
</button>
{#if isServer && showSettings}
    <Settings/>
{/if}

<style>
    #show-settings {
        position: fixed;
        margin-bottom: 1em;
        margin-right: 2em;
        bottom: 0;
        right: 0;
    }
</style>