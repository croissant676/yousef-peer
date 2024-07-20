<script lang="ts">
    import {createInternalServer} from "./internalServer";
    import {joinRoom} from "./clientSide";

    let code: string = '';
    $: isJoining = code.length > 0;

    let disable: boolean = false;
    let error: string | undefined = undefined;

    export let whenDone: () => void;

    async function click() {
        if (isJoining) {
            disable = true;
            let res = await joinRoom(code);
            if (!res) {
                error = `can't find room \`${code}\`!`;
                disable = false;
            } else {
                await whenDone();
            }
        } else {
            disable = true;
            await createInternalServer();
            await whenDone();
        }
    }
</script>

<h1 id="title">yousef</h1>
<h4>enter a code or create a game</h4>

<input type="text" bind:value={code} placeholder="enter a code" maxlength="36"
on:change={click}>
<button disabled={disable} on:click={click}>
    {disable ? 'loading..' : isJoining ? 'join room' : 'create room'}
</button>

{#if error}
    <div style="margin-top: .5em">
        <strong>{error}</strong>
    </div>
{/if}