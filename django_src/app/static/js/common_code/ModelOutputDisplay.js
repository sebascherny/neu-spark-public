'use strict';

class ModelOutputDisplay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const processedOutput = this.props.processedOutput;

        const getCompleteSummaryDivForAttack = (attack_name) => {
            var summaryDataPerFile = [];
            for (const filename of processedOutput.runningFiles.sort()) {
                summaryDataPerFile.push({
                    'status': 'running',
                    'filename': filename
                })
            }
            for (const filename of processedOutput.pendingFiles.sort()) {
                summaryDataPerFile.push({
                    'status': 'pending',
                    'filename': filename
                })
            }
            var summaryByFile = {};
            if (processedOutput.data[attack_name] != null) {
                Object.keys(processedOutput.data[attack_name]).sort().map((promptName, promptIdx) => {
                    for (const fileVulns of processedOutput.data[attack_name][promptName]) {
                        if (summaryByFile[fileVulns['filename']] == null) {
                            summaryByFile[fileVulns['filename']] = {};
                        }
                        if (summaryByFile[fileVulns['filename']][promptName] == null) {
                            summaryByFile[fileVulns['filename']][promptName] = 0;
                        }
                        summaryByFile[fileVulns['filename']][promptName] += fileVulns['model_output'].length;
                    }
                });
                Object.keys(summaryByFile).sort().map((filename, fidx) => {
                    summaryDataPerFile.push({
                        'status': 'ok',
                        'filename': filename,
                        'summaryInfoForFile': summaryByFile[filename]
                    });
                })
            } else if (attack_name === 'summary_tab_no_attack') {
                for (const filename of processedOutput.finishedFiles.sort()) {
                    summaryDataPerFile.push({
                        'status': 'finished',
                        'filename': filename
                    })
                }
            }
            for (const filename of processedOutput.failedFiles.sort()) {
                summaryDataPerFile.push({
                    'status': 'failed',
                    'filename': filename
                })
            }
            for (const filename of processedOutput.skippedFiles.sort()) {
                summaryDataPerFile.push({
                    'status': 'skipped',
                    'filename': filename
                })
            }
            return {
                elemId: 'complete_summary_tab_for_' + attack_name,
                content: <div>
                    {
                        summaryDataPerFile.map((fileData, fileIdx) => <div key={attack_name + '_' + (fileIdx)}>
                            {getFileTabContent(fileData, fileIdx, 'summary_no_prompt', attack_name, false)}
                        </div>)
                    }
                </div>
            }
        }


        const getSummaryTab = (promptData, attack_name, promptIdx) => {
            return {
                elemId: 'summary_tab_' + attack_name + '_' + promptIdx,
                content: <div>
                    {
                        promptData.map((fileData, fileIdx) =>
                            getFileTabContent(fileData, fileIdx, promptIdx, attack_name, false)
                        )
                    }
                </div>
            }
        }

        const getFileTab = (jsonFile, fileIdx, promptIdx, attack_name, showCode) => {
            return {
                elemId: 'tab_file_' + attack_name + '_' + (fileIdx) + '_' + (promptIdx),
                content: getFileTabContent(jsonFile, fileIdx, promptIdx, attack_name, showCode)
            }
        }


        const getFileTabContent = (jsonFile, fileIdx, promptIdx, attack_name, showCode) => {
            const will_show_code = showCode && jsonFile.content != null;
            const textareaId = 'textarea_' + attack_name + '_' + (promptIdx) + '_' + (fileIdx);
            return <div key={fileIdx}>
                <label>File {fileIdx + 1}: {jsonFile['filename']}</label>
                {
                    (jsonFile['model_output'] || []).map((vulnerabilityInfo, vulnIdx) =>
                        <div key={vulnIdx}>
                            {
                                vulnerabilityInfo['lineNumber'] ?
                                    <label key={vulnIdx}>At line {vulnerabilityInfo['lineNumber']}</label> :
                                    <label key={vulnIdx}>No line number</label>
                            }
                            {
                                vulnerabilityInfo['lineCode'] ?
                                    <label>{': '}{vulnerabilityInfo['lineCode']}</label> :
                                    null
                            }
                            {
                                vulnerabilityInfo['lineNumber'] && will_show_code ?
                                    <button onClick={() => {
                                        const textarea = document.getElementById(textareaId);
                                        selectTextareaLine(
                                            textarea,
                                            vulnerabilityInfo['lineNumber']
                                        );
                                        scrollToLine(textarea, Math.max(0, vulnerabilityInfo['lineNumber'] - 4))
                                    }}>Go</button> : null
                            }
                            <br />
                            {vulnerabilityInfo['reasoning'] ?
                                <div>
                                    <label>{vulnerabilityInfo['reasoning']}</label>
                                    <br />
                                </div> : null
                            }
                        </div>
                    )
                }
                {
                    (jsonFile['model_output'] == null || jsonFile['model_output'].length === 0) && jsonFile['status'] === 'ok' && jsonFile['summaryInfoForFile'] == null ?
                        <div>
                            <label>No vulnerabilities were found.</label>
                        </div> : null
                }
                {
                    jsonFile['status'] === 'running' ?
                        <div>
                            {processedOutput.finished ?
                                <label>File was running when the program stopped.</label> : <label>File is running...</label>
                            }
                        </div> : null
                }
                {
                    jsonFile['status'] === 'failed' ?
                        <div>
                            <label>File could not be parsed</label>
                        </div> : null
                }
                {
                    jsonFile['status'] === 'skipped' ?
                        <div>
                            <label>File skipped.</label>
                        </div> : null
                }
                {
                    jsonFile['status'] === 'pending' ?
                        <div>
                            <label>Pending...</label>
                        </div> : null
                }
                {
                    jsonFile['status'] === 'finished' ?
                        <div>
                            <label>Finished</label>
                        </div> : null
                }
                {
                    jsonFile['summaryInfoForFile'] ?
                        <div>
                            {Object.keys(jsonFile['summaryInfoForFile']).map((promptKey, idx) => <div key={idx}>
                                <label>For prompt {promptKey}, {jsonFile['summaryInfoForFile'][promptKey]} vulnerabilities were found</label>
                            </div>)}
                        </div> : null
                }
                {
                    will_show_code ?
                        <textarea
                            id={textareaId}
                            style={
                                {
                                    'width': '90%',
                                    'height': '300px'
                                }
                            }
                            defaultValue={jsonFile['content']}></textarea> : null
                }
                <br />
            </div>
        }

        const getCompleteSummaryDiv = () => {
            return getCompleteSummaryDivForAttack('summary_tab_no_attack');
        }

        const get_prompts_tab_for_attack = (attack_name) => {
            return <TabsElement
                propMsg={"ABC_attack_" + attack_name}
                tabElements={
                    [getCompleteSummaryDivForAttack(attack_name)].concat(
                        Object.keys(processedOutput.data[attack_name]).sort().map((prompt, promptIdx) => {
                            const promptData = processedOutput.data[attack_name][prompt];
                            return {
                                elemId: 'tab_id_' + attack_name + '_' + (promptIdx), content: <TabsElement
                                    key={'APPPP_' + promptIdx}
                                    propMsg={'APPPP_' + promptIdx}
                                    tabElements={[getSummaryTab(promptData, attack_name, promptIdx)].concat(promptData.map((fileData, fileIdx) =>
                                        getFileTab(fileData, fileIdx, promptIdx, attack_name, true)
                                    ))}
                                    tabButtons={
                                        [{ elemId: 'summary_btn_' + attack_name + '_' + prompt, text: 'Summary' }].concat(
                                            promptData.map((fileData, fileIdx) => {
                                                return { elemId: 'btn_' + attack_name + '_' + prompt + '_' + (fileIdx), text: fileData.filename }
                                            })
                                        )
                                    }
                                />
                            }
                        })
                    )
                }
                tabButtons={
                    [{ elemId: 'summary_tab_btn_attack_' + attack_name, text: 'Summary' }].concat(
                        Object.keys(processedOutput.data[attack_name]).sort().map((prompt, promptIdx) => {
                            const promptData = processedOutput.data[attack_name][prompt];
                            return { elemId: 'btn_' + attack_name + '_' + prompt, text: prompt }
                        })
                    )
                }
            />
        }

        return <TabsElement
            propMsg="ABC"
            tabElements={
                [getCompleteSummaryDiv()].concat(
                    Object.keys(processedOutput.data).sort().map((attack_name, attackIdx) => {
                        return { elemId: 'attack_tab_' + attack_name, content: get_prompts_tab_for_attack(attack_name) };
                    })
                )
            }
            tabButtons={
                [{ elemId: 'complete_summary_tab_btn', text: 'Summary' }].concat(
                    Object.keys(processedOutput.data).sort().map((attack_name, attackIdx) => {
                        return { elemId: 'btn_' + attack_name + '_' + attackIdx, text: attack_name }
                    })
                )
            }
        />;
    }
}