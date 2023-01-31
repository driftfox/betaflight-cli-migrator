<script>
    // cd public && npm run build && vercel deploy && vercel --prod
    import {Snackbar, MaterialApp, Button, Card, CardText, Select} from 'svelte-materialify';
    import {safeCommands, unsafeCommands, unsafeSections, setVersionCommands} from './stores'
    import 'codemirror/mode/python/python'
    import CodeMirror from "./index"
    import OptionSection from "./OptionSection.svelte";

    let editor;
    let migrationResults;
    let backup = "";
    let _otherSectionsAndSectionsEnder = ['profile', 'batch', 'save']
    let snackbar = false;
    let snackMessage = "";
    let showAllSettings = false;

    const filterBackup = () => {

        let _safeCommands, _unsafeCommands, _unsafeSections
        safeCommands.subscribe(value => {
            _safeCommands = value;
        });
        unsafeCommands.subscribe(value => {
            _unsafeCommands = value;
        });
        unsafeSections.subscribe(value => {
            _unsafeSections = value;
        });

        let out = "# STARTING PROCESS ";
        let unsafeCount = 0;
        backup = editor.getValue();
        if (backup.length === 0) {
            snackMessage = "Nothing to analyze";
            migrationResults = undefined;
        } else {
            let backupRows = backup.split('\n')
            let weAreInUnSafeSection = false;
            for (let row of backupRows) {
                let _originalRow = row;
                row = row.toLowerCase().trim().replace("set ", "");
                if (!weAreInUnSafeSection) {
                    if (_unsafeSections.some(command => row.startsWith(command)))
                        weAreInUnSafeSection = true;
                } else {
                    if (_otherSectionsAndSectionsEnder.some(command => row.startsWith(command)))
                        if (!_unsafeSections.some(command => row.startsWith(command)))
                            weAreInUnSafeSection = false;
                }
                if (row.length) {
                    let safe = null;
                    if (row.startsWith('#')) // safe
                        safe = true;
                    else {
                        let findForSafeCommands = _safeCommands.some(command => row.startsWith(command))
                        let findForUnSafeCommands = _unsafeCommands.some(command => row.startsWith(command))
                        if (findForUnSafeCommands)
                            safe = false;
                        else if (findForSafeCommands)
                            safe = true;
                    }
                    if (safe && !weAreInUnSafeSection)
                        safe = true;
                    if ((safe || safe === null) && !weAreInUnSafeSection)
                        out = out + "\n" + _originalRow + (safe ? (!row.startsWith('#') ? " #SAFE" : "") : " #TO_CHECK (maybe safe)")
                    else if (!safe || weAreInUnSafeSection) {
                        out += "\n" + (!row.startsWith('#') ? ("# " + _originalRow + " #UNSAFE" + (weAreInUnSafeSection ? "_SECTION" : "") + " !!") : _originalRow)
                        unsafeCount++;
                    }
                } else out += "\n"
            }
            // editor.setValue(out)
            navigator.clipboard.writeText(out);
            migrationResults = out;
            setTimeout(function () {
                scrollIntoView('#results');
            }, 200);
            snackMessage = "Completed! " + unsafeCount + " unsafe rows detected. Results have been copied to your clipboard."
        }
        snackbar = true;
    }
    const options = {
        mode: "python",
        lineNumbers: true,
        value: backup,
        viewportMargin: Infinity,
    }

    let selectedMigrationOption = 'fourThreeToFourFour';
    const migrationVersions = [
        {
            name: '4.3 to 4.4',
            value: 'fourThreeToFourFour',
        },
        {
            name: '4.2 to 4.3',
            value: 'fourTwoToFourThree',
        },
    ]
    const selectVersion = () => {
        setVersionCommands(selectedMigrationOption);
    }

    function toggleShowSettings() {
        showAllSettings = !showAllSettings;
    }

    function scrollIntoView(selector) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.scrollIntoView({
            behavior: 'smooth'
        });
    }

</script>

<svelte:head>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-3303696-10"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'UA-3303696-10');
    </script>
    <title>Betaflight Safe Migrator - from @deduzzo -</title>
</svelte:head>
<MaterialApp>
    <Snackbar class="flex-column" bind:active={snackbar} bottom center timeout={4000}>
        {snackMessage}
    </Snackbar>
    <div style="max-width: 1000px;margin: 0 auto;" class="pa-4 pb-6">
        <div class="d-flex justify-center ma-5"><h3>Betaflight CLI Migrator</h3></div>
        <div class="d-flex justify-center ma-5" style="font-size: 12px">DISCLAIMER: with the use of this tool everyone
            is required to MANUALLY verify the result produced. Given the variety of quads and flight controllers, it is
            possible that the results produced are not 100% perfect. This tool gives an indication, and is to be
            considered as a work in progress. The creators DO NOT assume any responsibility for any malfunction, product
            damage, or problem that may occur after its use.
        </div>
        <div class="d-flex justify-center ma-5">Source on: <a
                href="https://github.com/deduzzo/betaflight43-safe-migration"> Github @deduzzo</a></div>
        <div class="step mb-3">
            <h4 class="mb-3">Step 1</h4>
            <p>Select a Betaflight version.</p>
            <div style="max-width: 330px">
                <Select class="mb-3" placeholder="Migrating to which version of Betaflight?" items={migrationVersions}
                        bind:value={selectedMigrationOption} on:change={selectVersion}></Select>
            </div>
            <Button on:click={toggleShowSettings}>
                {#if !showAllSettings}Show{/if}
                {#if showAllSettings}Hide{/if} All Settings
            </Button>
            {#if showAllSettings}
                <Card class="mt-5 pa-6">
                    <span class="text-overline">Settings</span>
                    <CardText>
                        <OptionSection type="safeCommands"/>
                        <OptionSection type="unsafeCommands"/>
                        <OptionSection type="unsafeSections"/>
                    </CardText>
                </Card>
            {/if}
        </div>
        <div class="step mb-3">
            <h4 class="mb-3">Step 2</h4>
            <p>Run <code>diff all</code> in the Betaflight CLI and paste the output here.</p>
            <CodeMirror bind:editor {options} class="editor"/>
        </div>
        <div class="step mb-3">
            <h4 class="mb-3">Step 3</h4>
            <div class="d-flex justify-center ma-5">
                <Button class="d-flex flex-row" on:click={filterBackup}>Get BetaFlight safe diff</Button>
            </div>
        </div>
        <div class="step mb-3" id="results">
            {#if migrationResults}
                <h4 class="mb-3">Results</h4>
                <pre style="padding: 15px; background: #404040; color: #fff; box-shadow: inset 0 0 10px 3px #1e1e1e;">{migrationResults}</pre>
            {/if}
        </div>
    </div>
</MaterialApp>

<style>
    :global(.editor) {
        font-size: 1rem;
        height: auto;
    }

    :global(.CodeMirror) {
        height: auto;
        border: 1px solid #eee;
    }
</style>
