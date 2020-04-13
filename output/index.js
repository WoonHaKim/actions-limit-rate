"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
async function run() {
    try {
        const rate = core_1.default.getInput("rate");
        const repoToken = core_1.default.getInput("repo-token");
        const checkInterval = parseTimeString(rate);
        console.log(`rate set to ${rate}`);
        const githubClient = new github_1.default.GitHub(repoToken);
        const { data: workflowLists, } = await githubClient.actions.listRepoWorkflows(github_1.default.context.repo);
        const workingWorkflow = workflowLists.workflows.find((w) => w.name === github_1.default.context.workflow);
        const { data: workflowHistory, } = await githubClient.actions.listWorkflowRuns({
            ...github_1.default.context.repo,
            workflow_id: workingWorkflow?.id,
        });
        const lastSuccessWorkflow = workflowHistory.workflow_runs.find((ww) => ww.status === "success");
        const lastSuccessWorkflowDate = new Date(lastSuccessWorkflow?.created_at).getTime();
        const interval = Math.floor(new Date().getTime() - lastSuccessWorkflowDate / 1000);
        if (interval < checkInterval)
            await githubClient.actions.cancelWorkflowRun({
                ...github_1.default.context.repo,
                run_id: github_1.default.context.run_id,
            });
        core_1.default.setOutput("result", "rate limit passed");
    }
    catch (error) {
        core_1.default.setFailed(error.message);
    }
}
run();
function parseTimeString(str) {
    const dividers = { sec: 1, min: 60, hour: 3600 };
    for (var divider in Object.keys(dividers)) {
        if (str.includes(divider))
            return Number(str.split(divider)[0]) * dividers[divider];
    }
    return 600;
}
