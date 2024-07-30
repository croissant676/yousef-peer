<script lang="ts">
    import {roomSettings} from './internalServer'
</script>
<div id="container">
    <label>
        <strong>~</strong>
        play with jokers &nbsp&nbsp&nbsp&nbsp&nbsp=
        <input bind:checked={$roomSettings.useJokers} type="checkbox"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        jokers can substitute <br>
        &nbsp numbers in a straight =
        <input bind:checked={$roomSettings.jokersCanSubInStraight} type="checkbox"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        all cards in straight <br>
        &nbsp must be same suit &nbsp&nbsp&nbsp&nbsp=
        <input bind:checked={$roomSettings.straightSuit} type="checkbox"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        # of decks &nbsp&nbsp&nbsp&nbsp&nbsp= {$roomSettings.deckCount}
        <input bind:value={$roomSettings.deckCount} max="9" min="1" type="range"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        # cards per player <br>
        &nbsp&nbsp(rec. 4-8) &nbsp&nbsp&nbsp&nbsp&nbsp= {$roomSettings.cardsPerPlayer}
        <input bind:value={$roomSettings.cardsPerPlayer} max="9" min="3" type="range"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        # pts to lose = {$roomSettings.ptsToLose}
        <input bind:value={$roomSettings.ptsToLose} max="200" min="30" type="range"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        # punishment for<br>
        &nbsp incorrect call = {$roomSettings.punishForIncorrectCall}
        <input bind:value={$roomSettings.punishForIncorrectCall} max="50" min="10" type="range"/>
    </label>
    <br>
    <label>
        <strong>~</strong>
        # rounds before<br>
        &nbsp people can call = {$roomSettings.roundsBeforeCall}
        <input bind:value={$roomSettings.roundsBeforeCall} max="9" min="1" type="range"/>
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

    input[type=range] {
        height: 10px;
    }
</style>