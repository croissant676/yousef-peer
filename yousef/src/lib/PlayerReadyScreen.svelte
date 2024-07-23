<script lang="ts">
    import PlayerReady from "./PlayerReady.svelte";
    import {component, lobbyData, setUpdateUIForRoom} from "./clientSide";
    import {colorFor} from "./common";
    import {changeLobbyReadyState} from "./clientMappings";
    import {everybodyReady, isServer, startGame} from "./internalServer";
    import Lobby from "./Lobby.svelte";
    import Room from "./Room.svelte";

    let isReady = false;
    $: color = colorFor(!isReady);

    let disableButton = false;

    async function click() {
        disableButton = true;
        await changeLobbyReadyState();
        disableButton = false;
        isReady = !isReady;
    }

    setUpdateUIForRoom(() => {
        $component = Room;
    })

    $: isEverybodyReady = $lobbyData.length > 1 && [everybodyReady(), $lobbyData][0];
    async function start() {
        console.log('starting game; change host(this) ui')
        await startGame();
    }

</script>

<div id="ready">
    <div id="container">
        {#each $lobbyData as playerReady}
            <PlayerReady playerReady={playerReady}/>
        {/each}
    </div>
    <button id="change-button" on:click={click} style="color:{color}" disabled={disableButton}>
        {isReady ? 'cancel' : 'ready!'}
    </button>

    {#if isServer && isEverybodyReady}
        <button on:click={start}>
            start!
        </button>
    {/if}
</div>


<style>
    #ready {
        background-color: #1a1a1a;
        border-radius: 20px;
        padding: 1em;
        width: 200%;
        top: 50%;
        left: 50%
    }


    #container {
        overflow-y: scroll;
        height: 80%;
        border-bottom: #222323 solid 2px;
        max-height: 20em;
    }

    #change-button {
        margin-top: .7em;
    }
</style>