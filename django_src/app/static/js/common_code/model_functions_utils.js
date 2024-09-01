

function displayProcessCount(currentProcessedData) {
    if (document.getElementById('process_count_text_to_display') == null) {
        return;
    }
    const processedFilesCount = currentProcessedData.failedFiles.length +
        currentProcessedData.skippedFiles.length;
    const totalFilesCount = currentProcessedData.runningFiles.length +
        currentProcessedData.failedFiles.length +
        currentProcessedData.skippedFiles.length +
        currentProcessedData.pendingFiles.length;
    var displayMsg = 'Processed ' + (processedFilesCount) + ' of ' + (totalFilesCount);
    const dots = ((new Date().getSeconds()) % 3) + 1;
    displayMsg += '.';
    if (dots >= 2) {
        displayMsg += '.';
    }
    if (dots >= 3) {
        displayMsg += '.';
    }
    if (currentProcessedData.runningFiles.length) {
        displayMsg += ' <br /> Processing ' + currentProcessedData.runningFiles[0];
    }
    document.getElementById('process_count_text_to_display').innerHTML = displayMsg;
}

var INTERVAL_PROCESSING_GIF = null;
var INTERVAL_IF_MODEL_RUNNING = null;

function getOutputDataFromServer(uniqueKeyFromServer, setProcessedOutput, setIsRunning) {
    get_output_data_api(uniqueKeyFromServer, (returnedData) => {
        const currentProcessedData = returnedData.data.all_json_data;
        if (INTERVAL_PROCESSING_GIF != null) {
            clearInterval(INTERVAL_PROCESSING_GIF);
        }
        setProcessedOutput(currentProcessedData);
        INTERVAL_PROCESSING_GIF = setInterval(
            () => {
                displayProcessCount(currentProcessedData);
            }, 500
        );
        if (INTERVAL_IF_MODEL_RUNNING != null && currentProcessedData != null && currentProcessedData.finished) {
            console.log('CLEAR INTERVAL');
            if (setIsRunning != null) {
                setIsRunning(false);
            }
            clearInterval(INTERVAL_IF_MODEL_RUNNING);
            if (INTERVAL_PROCESSING_GIF != null) {
                clearInterval(INTERVAL_PROCESSING_GIF);
            }
            if (document.getElementById('process_count_text_to_display') != null) {
                document.getElementById('process_count_text_to_display').innerHTML = 'Finished. ' + (currentProcessedData.reason ? currentProcessedData.reason : '');
            }
            remove_loading();
            document.getElementById('div_for_gif').className = "";
        }
    }, () => {
        alert("Error getting output from model for key: " + uniqueKeyFromServer);
    });
}

function runModel(selectedVulnerabilities, setIsRunning, filesOrProject,
    filesNameAndContent, selectedProject, setProcessedOutput) {
    if (Object.keys(selectedVulnerabilities).length === 0) {
        alert('Select at least one vulnerability');
        return;
    }
    document.getElementById('div_for_gif').className = "loading_inside_div";
    setIsRunning(true);
    get_unique_key_from_server_api(
        uniqueKeyFromServer => {
            console.log('This run uniqueKey is : ' + uniqueKeyFromServer);
            INTERVAL_IF_MODEL_RUNNING = setInterval(
                () => {
                    getOutputDataFromServer(uniqueKeyFromServer, setProcessedOutput, setIsRunning);
                }, 2000
            )
            console.log('RUN MODEL API');
            run_model_api(filesOrProject === 'files' ? filesNameAndContent : null,
                filesOrProject !== 'files' ? selectedProject : null,
                uniqueKeyFromServer, selectedVulnerabilities,
                new URLSearchParams(window.location.search).get('is_test') === 'true',
                () => {
                    setIsRunning(false);
                    console.log('SUCCESS WITH MODEL API');
                    remove_loading();
                    document.getElementById('div_for_gif').className = "";
                }, () => {
                    setIsRunning(false);
                    console.log('ERROR WITH MODEL API');
                    remove_loading();
                    alert('Error :(');
                }
            );
        }
    )
}


