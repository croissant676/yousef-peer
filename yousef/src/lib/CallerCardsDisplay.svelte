<script lang="ts">

    import {fade, fly} from "svelte/transition";
    import {cubicIn, cubicInOut} from "svelte/easing";
    import {type CallingDisplay, timeoutPromise} from "./common";
    import CardDisplayCalling from "./CardDisplayCalling.svelte";

    let stage = -1;
    setTimeout(() => {
        stage = 0;
    }, 100)

    let callerDisplay: CallingDisplay = {
        name: 'player2',
        isCaller: true,
        cards: [1, 2, 3]
    };

    let bottomDisplay: CallingDisplay = {
        name: 'player',
        isCaller: false,
        cards: [24, 26, 15, 49]
    };

    let topCardDisplay;
    let bottomCardDisplay;

    let displayVersus = true;

    setTimeout(async () => {
        stage = 1;

        await timeoutPromise(1500);
        await topCardDisplay.flip();

        await timeoutPromise(2000);
        await bottomCardDisplay.flip();
        await timeoutPromise(2000);
        await bottomCardDisplay.explode();
    }, 1500);

</script>
<!--<CodeDisplay/>-->
<!--<Chat/>-->
{#if stage > -1}
    <div id="holder" in:fade={{duration: 400}}>
        {#if stage === 0}
            <div class="stage_1" transition:fly={{y: '-500%', duration: 1000, easing: cubicInOut}}>
            <span in:fade={{delay: 400, duration: 500, easing: cubicIn}}>
            :player: has called<br><br>
            </span>

                <span in:fade={{delay: 1400, duration: 500, easing: cubicIn}}>
            let's check how their cards stack up
            </span>
            </div>
        {/if}
        {#if stage === 1}
            <CardDisplayCalling callingData={callerDisplay} bind:this={topCardDisplay}/>


            <div class="stage_1" in:fly={{x: 500, delay: 2600, duration: 800, easing: cubicInOut}}>
                {#if displayVersus}
                    <h1 class="stage_2_mid_span">
                        versus
                    </h1>
                {:else}
                    <h1 class="stage_2_mid_span" style="color: #00ff22">
                        caller wins!
                    </h1>
                {/if}
            </div>

            {#key bottomDisplay}
                <CardDisplayCalling callingData={bottomDisplay} bind:this={bottomCardDisplay}/>
            {/key}
        {/if}
    </div>
{/if}


<style>
    #holder {
        background: #00000077;
        transition: 0.5s;
        top: 0;
        left: 0;
        position: absolute;
        height: 100%;
        width: 100%;
    }

    .stage_1 {
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .stage_2_mid_span {
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }
</style>