import core from "@actions/core";
import github from "@actions/github";

async function run() {
  try {
    const rate = core.getInput("rate");
    const repoToken = core.getInput("repo-token");

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

    if (interval < 600)
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
