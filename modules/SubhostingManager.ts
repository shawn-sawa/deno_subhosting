import Organization from "./Organization.ts";
import Project from "./Project.ts";
import Deployment from "./Deployment.ts";

const editorPath = "./userServer/editor.html";
const dpPath = "./userServer/DynamicPageClass.ts";

const editor = Deno.readTextFileSync(editorPath);
const dp = Deno.readTextFileSync(dpPath);

// ! Must call "init"
export default class SubhostingManager {
  // TODO: get errors from deployments

  org: Organization;
  Main_Project_ID = "1651a50d-3bf9-45a0-bc16-94b73a5e2180";
  project: Project | undefined = undefined;

  constructor(params: InitOrgParams) {
    this.org = new Organization(params);
  }

  private replaceVariables(htmlString: string, variables: { [key: string]: string }): string | Error {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const matches = htmlString.matchAll(variablePattern);

    for (const match of matches) {
      const variableName = match[1];
      if (variables.hasOwnProperty(variableName)) {
        htmlString = htmlString.replace(match[0], variables[variableName]);
      } else {
        return new Error(`Variable ${variableName} not found in variables object`);
      }
    }
    return htmlString;
  }

  private generateFiles(api: string): string[] | Error {
    const editorVars = { api };

    // Appending to end of dp to initiate the class with the api key
    const dpNew = dp.concat(`\nnew DynamicPage("${api}")`);

    // ! Casting as strings because of the catch "gotErrs"
    const editorNew = this.replaceVariables(editor, editorVars) as string;

    const gotErrs = [editorNew].some((file) => typeof file !== "string");

    // ! If changed, make sure to remove 'as string' casting above.
    if (gotErrs) return Error("Error replacing variables");

    return [dpNew, editorNew];
  }

  private deploymentOptions() {
    const api = crypto.randomUUID();

    const newFiles = this.generateFiles(api);
    if (newFiles instanceof Error) return newFiles;

    const [dpNew, editorNew] = newFiles;

    const assets: Record<string, Asset> = {
      "main.ts": {
        kind: "file",
        content: dpNew,
      },
      "editor.html": {
        kind: "file",
        content: editorNew,
      },
    };

    const params: CreateDeploymentRequest = {
      entryPointUrl: "main.ts",
      envVars: {
        // TODO: Test if this is working
        api,
      },
      assets,
    };

    return { params, api };
  }

  public async createDeployment(): Promise<{ url: string; api: string; id: string } | Error> {
    if (!this.project) return Error("Project not found");

    const options = this.deploymentOptions();
    if (options instanceof Error) return options;
    const { params, api } = options;

    const res = await this.project.createDeployment(params);
    if (res.status === "error") return Error(res.error?.message);
    if (!res.data || !res.data.id) return Error("Deployment not created");
    const id = res.data.id;

    let status: string | Error = "pending";
    while (status === "pending") {
      status = await this.getDeploymentStatus(id);
      if (status instanceof Error) return status;

      if (status !== "pending") break;
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`Waiting for deployment to finish...- ${id}`);
          resolve();
        }, 1000);
      });
    }
    if (status !== "success") return Error(`Deployment failed (status: ${status})`);

    // cannot create deployment from 'res' because it doesn't contain the domain details.
    const deploy = await this.getDeployment(id);
    if (deploy instanceof Error) return deploy;

    const url = deploy.domains[0];
    if (!url) return Error("Error getting url");

    // TODO: no need to send deployment ID to user. Save it in the DB?
    return { url, api, id };
  }

  private async getDeploymentStatus(deploymentId: string): Promise<string | Error> {
    const res = await fetch(`https://api.deno.com/v1/deployments/${deploymentId}`, {
      headers: { Authorization: "Bearer ddo_fNB0mmC3gj8XZyqWAFj74W0JERuBhF2ddd75" },
    });
    try {
      const details = await res.json();
      return details.status;
    } catch (error) {
      return new Error(error);
    }
  }

  // private async getDeploymentDetails(deploymentId: string): Promise<string | Error> {
  //   const res = await fetch(`https://api.deno.com/v1/deployments/${deploymentId}`, {
  //     headers: { Authorization: "Bearer " },
  //   });
  //   try {
  //     const details = await res.json();
  //     return details;
  //   } catch (error) {
  //     return new Error(error);
  //   }
  // }

  public async init() {
    await this.org.initProjects();
    console.log("init");

    const project = await this.org.getProject(this.Main_Project_ID);
    if (project) this.project = project;
    else return Error("Project not found");
  }

  public async listDeployments() {
    return await this.project?.listDeployments();
  }

  public async deleteDeployments() {
    return new Promise<void | Error>(async (resolve, reject) => {
      if (!this.project) return reject(Error("Project not found"));
      this.project.deployments.forEach(async (deployment, n, arr) => {
        await this.project!.deleteDeployment(deployment.id);
        console.log("deleted deployment", deployment.id);
        if (n === arr.length - 1) {
          console.log("finished deleting deployments");
          resolve();
        }
      });
    });
  }

  public async getDeployment(deploymentId: string): Promise<Error | Deployment> {
    if (!this.project) return Error("Project not found");

    return await this.project.getDeployment(deploymentId);
  }
}
