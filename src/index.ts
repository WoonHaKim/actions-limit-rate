import core from "@actions/core";
import github from "@actions/github";

async function run() {
  try {
    const rate = core.getInput("rate");
    const repoToken = core.getInput("repo-token");
    const checkInterval = parseTimeString(rate);

    console.log(`rate set to ${rate}`);

    const githubClient = new github.GitHub(repoToken);

    const {
      data: workflowLists,
    } = await githubClient.actions.listRepoWorkflows(github.context.repo);
    const workingWorkflow = workflowLists.workflows.find(
      (w) => w.name === github.context.workflow
    );

    const {
      data: workflowHistory,
    } = await githubClient.actions.listWorkflowRuns({
      ...github.context.repo,
      workflow_id: workingWorkflow?.id!,
    });

    const lastSuccessWorkflow = workflowHistory.workflow_runs.find(
      (ww) => ww.status === "success"
    );

    const lastSuccessWorkflowDate = new Date(
      lastSuccessWorkflow?.created_at!
    ).getTime();
    const interval = Math.floor(
      new Date().getTime() - lastSuccessWorkflowDate / 1000
    );

    if (interval < checkInterval)
      await githubClient.actions.cancelWorkflowRun({
        ...github.context.repo,
        run_id: (github.context as any).run_id,
      });

    core.setOutput("result", "rate limit passed");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

function parseTimeString(str: string) {
  const dividers: { [key: string]: number } = { sec: 1, min: 60, hour: 3600 };
  for (var divider in Object.keys(dividers)) {
    if (str.includes(divider))
      return Number(str.split(divider)[0]) * dividers[divider];
  }
  return 600;
}
