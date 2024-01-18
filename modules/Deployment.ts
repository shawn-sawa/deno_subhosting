// import { sendRequest } from "./utils.ts";
import BaseClass from "./BaseClass.ts";

export default class Deployment extends BaseClass {
  id: string;
  projectId: string;
  description: string;
  status: string;
  domains: string[];
  databases: object;
  createdAt: string; // "2021-08-01T00:00:00Z"
  updatedAt: string; // "2024-01-18T04:51:25.759515Z"

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

  async buildLogs(): Promise<APIResponse<BuildLog>> {
    const method = "GET";
    const url = this.url(`/deployments/${this.id}/build_logs`);
    return await this.sendRequest<BuildLog>({
      url,
      method,
      headers: this.headers,
    });
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
