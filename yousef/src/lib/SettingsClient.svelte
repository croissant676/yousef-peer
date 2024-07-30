<script lang="ts">
    import {colorFor} from "./common";
    import {settings} from "./clientSide";
    import {roomSettings} from "./internalServer";

    function htmlForBoolValue(boolValue: boolean) {
        return `<span style="color: ${colorFor(boolValue)};">${boolValue ? 'enabled' : 'disabled'}</span>`
    }

    function color(num: number) {
        return `<span style="color: #964fff;">${num}</span>`
    }

    $settings = $roomSettings;
</script>
<div id="container">
    <label>
        <strong>~</strong>
        play with jokers &nbsp&nbsp&nbsp&nbsp&nbsp= {@html htmlForBoolValue($settings.useJokers)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        jokers can substitute <br>
        &nbsp numbers in a straight = {@html htmlForBoolValue($settings.jokersCanSubInStraight)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        all cards in straight <br>
        &nbsp must be same suit &nbsp&nbsp&nbsp&nbsp= {@html htmlForBoolValue($settings.straightSuit)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        # of decks &nbsp&nbsp&nbsp&nbsp&nbsp= {@html color($settings.deckCount)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        # cards per player <br>
        &nbsp&nbsp(rec. 4-8) &nbsp&nbsp&nbsp&nbsp&nbsp= {@html color($settings.cardsPerPlayer)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        # pts to lose &nbsp = {@html color($settings.ptsToLose)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        # punishment for<br>
        &nbsp incorrect call&nbsp = {@html color($settings.punishForIncorrectCall)}
    </label>
    <br>
    <label>
        <strong>~</strong>
        # rounds before<br>
        &nbsp people can call = {@html color($settings.roundsBeforeCall)}
    </label>
    <br>
    <br>

    <strong>!</strong>
    only the host can modify <br>
    &nbsp these game settings!
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

</style>