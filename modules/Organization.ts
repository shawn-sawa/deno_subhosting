import Project from "./Project.ts";
import BaseClass from "./BaseClass.ts";

export default class Organization extends BaseClass {
  domains: Domain[] = [];
  projects: Project[] = [];

  constructor(params: InitOrgParams) {
    super(params);
    this.initProjects();
  }

  private async initProjects() {
    const projectList = await this.listProjects();

    if (projectList.status !== "success") return;
    const projects = projectList.data;
    // TODO: make this better
    if (!Array.isArray(projects)) return;

    projects.forEach((project) => {
      const params: InitProjectParams = {
        orgParams: this,
        details: project,
      };

      this.projects.push(new Project(params));
    });
  }

  async listProjects(params?: ListParams): Promise<APIResponse<ProjectDetails[]>> {
    const queryParams = params
      ? Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : null;

    const method = "GET";
    const url = this.url(`/organizations/${this.orgId}/projects`).concat(queryParams ? `?${queryParams}` : "");

    return await this.sendRequest<ProjectDetails[]>({
      url,
      method,
      headers: this.headers,
    });
  }

  async deleteProject(projectId: string): Promise<APIResponse<null>> {
    const method = "DELETE";
    const url = this.url(`/projects/${projectId}`);

    console.log("Delete deployment url :>> ", url);

    return await this.sendRequest<null>({ url, method, headers: this.headers });
  }

  async createProject(name: string | null, description: string | null): Promise<APIResponse<ProjectDetails>> {
    const method = "POST";
    const url = this.url(`/organizations/${this.orgId}/projects`);
    const body = {
      name: name || null,
      description: description || null,
    };
    return await this.sendRequest({ url, method, headers: this.headers, body });
  }
  async orgDetails(): Promise<APIResponse<OrganizationDetails>> {
    const method = "GET";
    const url = this.url(`/organizations/${this.orgId}`);

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async orgAnalytics(params: AnalyticsParams): Promise<APIResponse<AnalyticsData>> {
    const method = "GET";
    const queryParams = params
      ? Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : null;

    const url = this.url(`/organizations/${this.orgId}/analytics`).concat(queryParams ? `?${queryParams}` : "");

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async listKVDatabases(): Promise<APIResponse<KVDatabaseData[]>> {
    const method = "GET";
    const url = this.url(`/organizations/${this.orgId}/databases`);

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  /** @param description - Description of the database. If this is null, an empty string will be set. */
  async createKVDatabases(description?: string): Promise<APIResponse<KVDatabaseData>> {
    const method = "POST";
    const url = this.url(`/organizations/${this.orgId}/databases`);
    const body = {
      description: description || null,
    };

    return await this.sendRequest({ url, method, headers: this.headers, body });
  }

  async listDomains(params?: ListParams): Promise<APIResponse<Domain[]>> {
    const method = "GET";

    const queryParams = params
      ? Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : null;

    const url = this.url(`/organizations/${this.orgId}/domains`).concat(queryParams ? `?${queryParams}` : "");

    return await this.sendRequest({ url, method, headers: this.headers });
  }

  async addDomain(domain: string): Promise<APIResponse<Domain>> {
    const method = "POST";
    const url = this.url(`/organizations/${this.orgId}/domains`);
    const body = {
      domain,
    };

    return await this.sendRequest({ url, method, headers: this.headers, body });
  }
}
