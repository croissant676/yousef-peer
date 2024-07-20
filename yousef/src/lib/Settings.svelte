<script lang="ts">
    import {roomSettings, type Settings} from './internalServer'

</script>
<div id="container">
    <label>
        <strong>~</strong>
        play with jokers &nbsp&nbsp&nbsp&nbsp&nbsp=
        <input type="checkbox" bind:checked={roomSettings.useJokers} />
    </label>
    <br>
    <label>
        <strong>~</strong>
        jokers can substitute <br>
        &nbsp numbers in a straight =
        <input type="checkbox" bind:checked={roomSettings.jokersCanSubInStraight} />
    </label>
    <br>
    <label>
        <strong>~</strong>
        all cards in straight <br>
        &nbsp must be same suit &nbsp&nbsp&nbsp&nbsp=
        <input type="checkbox" bind:checked={roomSettings.straightSuit} />
    </label>
    <br>
    <label>
        <strong>~</strong>
        # of decks &nbsp&nbsp&nbsp&nbsp&nbsp= {roomSettings.deckCount}
        <input type="range" bind:value={roomSettings.deckCount} min="1" max="9" />
    </label>
    <br>
    <label>
        <strong>~</strong>
        # cards per player <br>
        &nbsp&nbsp(rec. 4-8) &nbsp&nbsp&nbsp&nbsp&nbsp= {roomSettings.cardsPerPlayer}
        <input type="range" bind:value={roomSettings.cardsPerPlayer} min="3" max="9" />
    </label>
    <br>
    <label>
        <strong>~</strong>
        # pts to lose = {roomSettings.ptsToLose}
        <input type="range" bind:value={roomSettings.ptsToLose} min="30" max="200" />
    </label>
    <br>
    <label>
        <strong>~</strong>
        # punishment for<br>
        &nbsp incorrect call = {roomSettings.punishForIncorrectCall}
        <input type="range" bind:value={roomSettings.punishForIncorrectCall} min="10" max="50" />
    </label>
</div>

<style>
    #container {
        position: fixed;
        margin-bottom: 4em;
        margin-right: 2em;
        bottom: 0;
        right: 0;
        background: #00000033;
        padding: 10px;
        border-radius: 10px;
        border: 0;
        display: block;
        text-align: left;
    }

    #container * {
        accent-color: #7936e1;
    }

    strong {
        color: #6e80f1;
    }
</style>