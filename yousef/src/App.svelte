<script lang="ts">
    import Title from "./lib/Title.svelte";
    import NameScreen from "./lib/NameScreen.svelte";
    import Lobby from "./lib/Lobby.svelte";
    import {component, props} from "./lib/clientSide";
    import CallingRes from "./lib/CallingRes.svelte";
    import CallerCardsDisplay from "./lib/CallerCardsDisplay.svelte";

    function title() {
        $props = {whenDone: name}
        $component = Title;
    }

    function name() {
        $props = {whenDone: lobby}
        $component = NameScreen;
    }

    function lobby() {
        $component = Lobby;
    }

    title();
</script>


<svelte:head>
    <title>yousef</title>
    <meta name="robots" content="noindex nofollow"/>
    <html lang="en"/>
</svelte:head>

<main>
    <!--    <svelte:component this={$component} {...$props}/>-->
    <CallerCardsDisplay/>
</main>

<style>

</style>
