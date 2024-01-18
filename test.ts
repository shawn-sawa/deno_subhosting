// deno-lint-ignore-file no-unused-vars ban-ts-comment
import Organization from "./modules/Organization.ts";

const org = new Organization({
  apiKey: Deno.env.get("DEPLOY_ACCESS_TOKEN"),
  orgId: Deno.env.get("DEPLOY_ORG_ID"),
});

function getProject(projectId: string) {
  return org.projects.find((project) => project.id === "1651a50d-3bf9-45a0-bc16-94b73a5e2180");
}
setTimeout(async () => {
  // console.log(org);
  const mainProject = await getProject("1651a50d-3bf9-45a0-bc16-94b73a5e2180");

  //@ts-ignore
  mainProject?.createDeployment();
  console.log(mainProject);
  // console.log(getProject());
}, 2000);

function deleteDeployments() {
  org.projects.forEach((project) => {
    project.deployments.forEach((deployment) => {
      setTimeout(async () => {
        await project.deleteDeployment(deployment.id);
        console.log("deleted deployment", deployment.id);
      }, 500);
    });
  });
}

function deleteProjects() {
  org.projects.forEach((project) => {
    setTimeout(async () => {
      await org.deleteProject(project.id);
      console.log("deleted project", project.id);
    }, 500);
  });
}

async function createMain() {
  const mainProject = await org.createProject("main2", "Main project.");
}

// ! Main Project
// {
//   id: "1651a50d-3bf9-45a0-bc16-94b73a5e2180",
//   name: "main2",
//   description: "Main project.",
//   createdAt: "2024-01-18T19:22:20.180123Z",
//   updatedAt: "2024-01-18T19:22:20.180123Z"
// }
