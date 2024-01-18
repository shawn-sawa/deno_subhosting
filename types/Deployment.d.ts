interface DeploymentConfigParams {
  env_vars?: object | null;
  databases?: object | null;
  description?: string | null;
}

interface InitDeploymentParams {
  details: DeploymentDetails;
  orgParams: InitOrgParams;
}

interface DeploymentDetails {
  /** Must be 12 characters */
  id: string;
  /** project this deployment belongs to */
  projectId: string;
  description?: string;
  status: string;
  /** list of domains pointing to the deployment. ex: ["brave-butterfly-86-f2ryt7a16dhq.deno.dev"] */
  domains: string[];
  databases: Record<string, string>;
  /** ex: "2021-08-01T00:00:00Z" */
  createdAt: string;
  /** ex: "2021-08-01T00:00:00Z" */

  updatedAt: string;
}

interface AppLog {
  time: string; //(date-time)	Log: timestamp
  level: string;
  message: string;
  region: string;
}

interface BuildLog {
  level: string;
  message: string;
}
