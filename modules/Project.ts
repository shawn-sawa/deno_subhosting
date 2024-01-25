import BaseClass from "./BaseClass.ts";

import Deployment from "./Deployment.ts";
export default class Project extends BaseClass {
  id: string;
  name: string;
  description: string;
  createdAt: string; //(date-time)
  updatedAt: string; //(date-time)
  deployments: Deployment[] = [];
  constructor({ orgParams, details }: InitProjectParams) {
    super(orgParams);
    this.id = details.id;
    this.name = details.name;
    this.description = details.description;
    this.createdAt = details.createdAt;
    this.updatedAt = details.updatedAt;
  }

  async initDeployments() {
    return new Promise(async (resolve, reject) => {
      const deploymentList = await this.listDeployments();
      if (deploymentList.status !== "success") return;
      const deployments = deploymentList.data;
      // TODO: fix this to handle errors
      if (!Array.isArray(deployments)) return;

      deployments.forEach((deploy, n, arr) => {
        const params: InitDeploymentParams = {
          orgParams: this,
          details: deploy,
        };

        this.deployments.push(new Deployment(params));
        if (n === arr.length - 1) {
          resolve(this);
        }
      });
    });
  }

  async listDeployments(params?: ListParams): Promise<APIResponse<DeploymentDetails[]>> {
    const queryParams = this.buildQueryString(params);

    const method = "GET";
    const url = this.url(`/projects/${this.id}/deployments`).concat(queryParams ? `?${queryParams}` : "");

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async deleteDeployment(deploymentId: string): Promise<APIResponse<null>> {
    const method = "DELETE";
    const url = this.url(`/deployments/${deploymentId}`);

    console.log("Delete deployment url :>> ", url);

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async createDeployment(params: CreateDeploymentRequest): Promise<APIResponse<DeploymentDetails>> {
    const { entryPointUrl, importMapUrl, lockFileUrl, compilerOptions, assets, envVars, databases, description } = params;

    const deploymentData = [
      { key: "entryPointUrl", value: entryPointUrl },
      { key: "importMapUrl", value: importMapUrl },
      { key: "lockFileUrl", value: lockFileUrl },
      { key: "compilerOptions", value: compilerOptions },
      { key: "assets", value: assets },
      { key: "envVars", value: envVars },
      { key: "databases", value: databases },
      { key: "description", value: description },
    ].filter((item) => item.value !== null && item.value !== undefined);

    const body: { [key: string]: any } = {};

    deploymentData.forEach((item) => {
      body[item.key] = item.value;
    });

    const method = "POST";
    const url = this.url(`/projects/${this.id}/deployments`);

    return await this.sendRequest({ url, method, headers: this.headers, body });
  }

  async updateDetails(name?: string, description?: string): Promise<APIResponse<ProjectDetails>> {
    const method = "PATCH";
    const url = this.url(`/projects/${this.id}`);
    const body = {
      name: name || null,
      description: description || null,
    };
    return await this.sendRequest({ url, method, headers: this.headers, body });
  }
  async getAnalytics(since: string, until: string): Promise<APIResponse<AnalyticsData>> {
    const queryParams = this.buildQueryString({ since, until });

    const method = "GET";
    const headers = this.headers;
    const url = this.url(`projects/${this.id}/analytics?${queryParams}`);
    return await this.sendRequest({ url, method, headers });
  }

  /** Get the details for this project */
  async getDetails(): Promise<APIResponse<ProjectDetails>> {
    const method = "GET";
    const url = this.url(`/projects/${this.id}`);
    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async getDeployment(deploymentId: string): Promise<Deployment | Error> {
    if (this.deployments.length) {
      const deploy = this.deployments.find((deploy) => deploy.id === deploymentId);
      if (deploy) {
        return deploy;
      }
    }

    const apiResponse = await this.listDeployments()!;
    if (apiResponse.status === "error") return new Error(apiResponse.error!.message);
    if (!apiResponse.data) return new Error("No deployments found");

    const deploy = apiResponse.data.find((deploy) => deploy.id === deploymentId);

    if (!deploy) return new Error("Deployment not found");

    return new Deployment({ orgParams: this, details: deploy });
  }
}
