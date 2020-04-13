"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rate = core_1.default.getInput("rate");
            const repoToken = core_1.default.getInput("repo-token");
            const checkInterval = parseTimeString(rate);
            console.log(`rate set to ${rate}`);
            const githubClient = new github_1.default.GitHub(repoToken);
            const { data: workflowLists, } = yield githubClient.actions.listRepoWorkflows(github_1.default.context.repo);
            const workingWorkflow = workflowLists.workflows.find((w) => w.name === github_1.default.context.workflow);
            const { data: workflowHistory, } = yield githubClient.actions.listWorkflowRuns(Object.assign(Object.assign({}, github_1.default.context.repo), { workflow_id: (_a = workingWorkflow) === null || _a === void 0 ? void 0 : _a.id }));
            const lastSuccessWorkflow = workflowHistory.workflow_runs.find((ww) => ww.status === "success");
            const lastSuccessWorkflowDate = new Date((_b = lastSuccessWorkflow) === null || _b === void 0 ? void 0 : _b.created_at).getTime();
            const interval = Math.floor(new Date().getTime() - lastSuccessWorkflowDate / 1000);
            if (interval < checkInterval)
                yield githubClient.actions.cancelWorkflowRun(Object.assign(Object.assign({}, github_1.default.context.repo), { run_id: github_1.default.context.run_id }));
            core_1.default.setOutput("result", "rate limit passed");
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
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
