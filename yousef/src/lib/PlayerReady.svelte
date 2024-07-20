<script lang="ts">
    import {colorFor, type PlayerReadyData} from "./common";
    import {addYouTag, clientName} from "./clientSide";

    export let playerReady: PlayerReadyData;
    $: displayText = addYouTag(playerReady.name);
</script>

<div id="content">
    <span style="float:left;">
        {displayText}
    </span>
    <span style="float:right;color:{colorFor(playerReady.isReady)};">
        {playerReady.isReady ? '\xa0\xa0\xa0\xa0ready' : 'not ready'}
    </span>
    <br>
</div>

<style>
    #content {
        padding: .6em;
    }
</style>