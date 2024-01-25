import BaseClass from "./BaseClass.ts";

export default class Deployment extends BaseClass {
  id: string;
  projectId: string;
  description: string;
  status: string;
  domains: string[];
  databases: object;
  createdAt: string;
  updatedAt: string;

  constructor({ details, orgParams }: InitDeploymentParams) {
    super(orgParams);

    this.id = details.id;
    this.projectId = details.projectId;
    this.description = details.description || "";
    this.status = details.status;
    this.domains = details.domains;
    this.databases = details.databases;
    this.createdAt = details.createdAt;
    this.updatedAt = details.updatedAt;
  }

  async updateConfig({ env_vars, databases, description }: DeploymentConfigParams): Promise<APIResponse<DeploymentDetails>> {
    const method = "POST";
    const url = this.url(`/deployments/${this.id}/redeploy`);
    const body = {
      env_vars,
      databases,
      description,
    };

    return await this.sendRequest({ url, method, headers: this.headers, body });
  }

  async buildLogs(): Promise<BuildLog | Error> {
    const method = "GET";
    const url = this.url(`/deployments/${this.id}/build_logs`);
    const res = await this.sendRequest<BuildLog>({
      url,
      method,
      headers: this.headers,
    });
    if (res.status === "error") return new Error(res.error?.message || "Error getting build logs");

    return res.data!;
  }

  // TODO: Add query params
  async appLogs(): Promise<APIResponse<AppLog>> {
    const method = "GET";
    const url = this.url(`/deployments/${this.id}/app_logs`);
    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async getDetails(): Promise<APIResponse<DeploymentDetails>> {
    const method = "GET";
    const url = this.url(`/deployments/${this.id}`);

    return await this.sendRequest({ url, method, headers: this.headers });
  }
}
