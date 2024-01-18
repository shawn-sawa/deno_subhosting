interface OrganizationDetails {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @typeDef InitOrgParams - Parameters for initializing an organization
 * @param {string} [baseURL] - The base URL of the organization's API.
 * @param {string} [apiKey] - The API key of the organization.
 * @param {string} [orgId] - The ID of the organization.
 */
interface InitOrgParams {
  /** The base URL of the organization's API. */
  baseURL?: string;
  /** The API key of the organization. */
  apiKey?: string;
  /** The ID of the organization. */
  orgId?: string;
}
interface Domain {
  /**  The ID of the domain.  */
  id: string;
  /**  The ID of the organization that the domain is associated with.  */
  organizationId: string;
  /**  The domain value.  */
  domain: string;
  /**  An optional token.  */
  token?: string;
  /**  Whether the domain's ownership is validated or not.  */
  isValidated: boolean;
  /**  Optional TLS certificates for the domain.  */
  certificates?: string[];
  /**  Provisioning status (you can define the possible values).  */
  provisioningStatus?: string;
  /**  The ID of the project that the domain is associated with (optional).  */
  projectId?: string;
  /**  Deployment ID (optional).  */
  deploymentId?: string;
  /**  Creation date and time.  */
  createdAt: string;
  /**  Last updated date and time.  */
  updatedAt: string;
  /**  DNS records used to verify ownership.  */
  dnsRecords: string[];
}
