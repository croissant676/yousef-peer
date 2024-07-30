<script lang="ts">
    import CodeDisplay from "./Code.svelte";
    import {setName} from "./clientMappings";
    import {setClientName} from "./clientSide";

    let name: string = '';
    let disable: boolean = false;

    export let whenDone: () => void;

    $: notAllowed = disable || !name
    let error: string | undefined = undefined;

    async function click() {
        if (notAllowed)
            return;
        if (name.includes(" ")) {
            error = "you can't have spaces in your name!";
            return;
        }
        disable = true;
        let res = await setName(name);
        if (!res) {
            error = `name ${name} is already taken!`;
            disable = false;
        } else {
            console.log(`name finished, set to ${name}.`)
            setClientName(name);
            whenDone();
        }
    }
</script>

<h3>my name is...</h3>

<CodeDisplay/>
<input bind:value={name} maxlength="36" on:change={click} placeholder="enter your name"
       type="text">
<button disabled={notAllowed} on:click={click}>
    {disable ? 'loading' : 'submit!'}
</button>


{#if error}
    <div style="margin-top: .5em">
        <strong>{error}</strong>
    </div>
{/if}