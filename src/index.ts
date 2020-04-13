import * as github from "@actions/github";
import * as core from "@actions/core";

const rate = core.getInput("rate");
const repoToken = core.getInput("token");

function parseTimeString(str: string) {
  const dividers: { [key: string]: number } = { sec: 1, min: 60, hour: 3600 };
  for (var divider of Object.keys(dividers)) {
    if (str.includes(divider))
      return Number(str.split(divider)[0]) * dividers[divider];
  }
  return 600;
}

const runAction = async () => {
  const checkInterval = parseTimeString(rate);

  console.log("context:", github.context);
  console.log(`rate set to ${rate}: ${checkInterval}`);

  const githubClient = new github.GitHub(repoToken);

  const { data: workflowLists } = await githubClient.actions.listRepoWorkflows(
    github.context.repo
  );
  const workingWorkflow = workflowLists.workflows.find(
    (w) => w.name === github.context.workflow
  );

  const { data: workflowHistory } = await githubClient.actions.listWorkflowRuns(
    {
      ...github.context.repo,
      workflow_id: workingWorkflow?.id!,
    }
  );

  console.log("workflowHistory:", workflowHistory);

  const lastSuccessWorkflow = workflowHistory.workflow_runs.find(
    (ww) => ww.conclusion === "success"
  );

  console.log("lastSuccessWorkflow:", lastSuccessWorkflow);

  const lastSuccessWorkflowDate = new Date(
    lastSuccessWorkflow?.created_at!
  ).getTime();
  const interval = Math.floor(
    new Date().getTime() - lastSuccessWorkflowDate / 1000
  );

  console.log("lastSuccessWorkflowDate:", lastSuccessWorkflowDate);

  if (interval < checkInterval) {
    await githubClient.actions.cancelWorkflowRun({
      ...github.context.repo,
      run_id: (github.context as any).run_id,
    });
  }

  core.setOutput("result", "rate limit passed");
};

try {
  runAction();
} catch (error) {
  console.error(error);
  core.setFailed(error.message);
}
