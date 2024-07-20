<script lang="ts">
    import {getRoomCode} from "./clientMappings";

    let code = getRoomCode();
    let justClicked: boolean = false;

    function copyCode() {
        navigator.clipboard.writeText(code);
        justClicked = true;
        setTimeout(() => {
            justClicked = false
        }, 2000);
    }

</script>

{#if code}
    <button title="click to copy" on:click={copyCode}>
        {justClicked ? '✅' : '📋'} {code}</button>
{/if}


<style>
    button {
        position: fixed;
        margin-top: 3em;
        margin-left: 2em;
        top: 0;
        left: 0;
    }
</style>