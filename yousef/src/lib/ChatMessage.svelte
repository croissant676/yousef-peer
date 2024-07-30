<script lang="ts">
    import type {ChatMessageData} from "./common";

    export let message: ChatMessageData;
</script>

<div id="holder">
    <span id="left">
        <strong>{message.sender ?? 'game'}:&nbsp</strong>
    </span>
    <span id="right">
        {#if !message.sender}
            <strong>{message.data}</strong>
        {:else}
            {message.data}
        {/if}
    </span>
</div>

<style>
    #holder {
        text-align: left;
        padding-left: 1em;
        display: flex;
    }

    #left {
        width: fit-content;
    }

    #right {
        width: fit-content;
        overflow-wrap: anywhere;
        word-break: break-all;
    }
</style>