<script lang="ts">

    import CodeDisplay from "./Code.svelte";
    import Chat from "./Chat.svelte";
    import PlayerReadyScreen from "./PlayerReadyScreen.svelte";
    import ListPlayers from "./ListPlayers.svelte";
    import {isServer} from "./internalServer";
    import Settings from "./Settings.svelte";
    import SettingsClient from "./SettingsClient.svelte";

    let showSettings = false;

    function changeToggle() {
        showSettings = !showSettings;
    }

</script>
<CodeDisplay/>
<Chat/>
<PlayerReadyScreen/>
<ListPlayers/>

{#if isServer}
    <button id="show-settings" on:click={changeToggle}>
        settings
    </button>
    {#if showSettings}
        <Settings/>
    {/if}
{:else }
    <button id="show-settings" on:click={changeToggle}>
        settings
    </button>
    {#if showSettings}
        <SettingsClient/>
    {/if}
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