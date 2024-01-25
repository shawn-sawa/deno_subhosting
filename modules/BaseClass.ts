export default abstract class BaseClass {
  orgId;
  apiKey;
  baseURL = "https://api.deno.com/v1";

  constructor(params: InitOrgParams) {
    // TODO: remove the orgid and apikey in case a deployment or project is returned to a user.
    this.orgId = params.orgId;
    this.apiKey = params.apiKey;
    this.baseURL = params.baseURL || this.baseURL;

    if (![this.orgId, this.apiKey, this.baseURL].every(Boolean)) {
      throw new Error("Missing orgId, apiKey or baseURL");
    }
  }

  url(url: string) {
    return this.baseURL + url;
  }
  get headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  buildQueryString(params: any) {
    // TODO use URLSearchParams
    return params
      ? Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : "";
  }

  handleError(error: Error) {
    // TODO: add logging
    throw error;
  }
  async sendRequest<T>({ url, method, headers, body = null }: RequestParams): Promise<APIResponse<T>> {
    try {
      const newBody = body && JSON.stringify(body);

      const res = await fetch(url, {
        method,
        headers: headers,
        body: newBody,
      });
      const clonedRes = res.clone();
      try {
        const data = await res.json();
        return { status: "success", data: data as T };
      } catch (error) {
        // ! If res could not be parsed as JSON, return it as it is (maybe return as text?)
        return { status: "other", error: res as unknown as ErrorResponse, data: clonedRes as T };
      }
    } catch (error) {
      return { status: "error", error: this.handleError(error) };
    }
  }
}
