interface Asset {
  kind: "file" | "symlink";
  content?: string; // Only for 'file' kind
  encoding?: "utf-8" | "base64"; // Only for 'file' kind
  gitSha1?: string; // SHA-1 hash for content that was previously uploaded
  target?: string; // Only for 'symlink' kind, specifies the target file path
}

interface InitProjectParams {
  details: ProjectDetails;
  orgParams: InitOrgParams;
}

interface CreateDeploymentRequest {
  entryPointUrl: string;
  importMapUrl?: string | null;
  lockFileUrl?: string | null;
  compilerOptions?: object | null;
  assets: Record<string, Asset>;
  envVars?: Record<string, string>;
  databases?: Record<string, string> | null;
  description?: string | null;
}

interface ProjectDetails {
  id: string; // (uuid)
  name: string;
  description: string;
  createdAt: string; // (date-time)
  updatedAt: string; // (date-time)
}
