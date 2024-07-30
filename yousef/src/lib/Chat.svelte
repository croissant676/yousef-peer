<script lang="ts">
    import ChatMessage from "./ChatMessage.svelte";
    import {messages} from "./clientSide";
    import {sendMessage} from "./clientMappings";

    let currentMessage: string = '';

    function send() {
        sendMessage(currentMessage);
        currentMessage = '';
    }
</script>

<div id="container">
    Chat
    <div id="content">
        {#each $messages as message}
            <ChatMessage message={message}/>
        {/each}
    </div>
    <div id="bottom-bar">
        <input bind:value={currentMessage} id="chat-entry"
               on:change={send} placeholder="type your message" type="text">
    </div>
</div>

<style>
    #container {
        position: fixed;
        margin-left: 2em;
        margin-bottom: 1em;
        left: 0;
        bottom: 0;
        height: 50%;
        width: 20%;
        min-width: 15em;
        padding: 1em 0 1em 0;
        background-color: #1a1a1a;
        border-radius: 20px;
    }


    #content {
        overflow-y: scroll;
        height: 88%;
        border-bottom: #222323 solid 2px;
    }

    #bottom-bar {
        position: absolute;
        background: transparent;
        border-top-width: 2px;
        border-color: white;
        bottom: 0;
        width: 100%;
    }

    #chat-entry {
        padding: 0;
        font-size: .9em;
        background: transparent;
        border-color: transparent;
        border-style: solid;
        border-width: 0 0 2px 0;
        border-radius: 0;
        transition: 0.3s ease-in-out;
    }

    #chat-entry:focus {
        outline: none;
        border-color: #535bf2;
        transition: 0.3s ease-in-out;
        width: 90%;
    }

    #chat-entry:focus::after {
        width: 100%
    }

</style>