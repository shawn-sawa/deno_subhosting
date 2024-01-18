export default abstract class BaseClass {
  orgId;
  apiKey;
  baseURL = "https://api.deno.com/v1";

  constructor(params: InitOrgParams) {
    this.orgId = params.orgId;
    this.apiKey = params.apiKey;
    this.baseURL && params.baseURL;
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

  // deno-lint-ignore no-explicit-any
  buildQueryString(params: any) {
    return params
      ? Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : "";
  }

  handleError(error: Error) {
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

      try {
        const data = await res.json();
        return { status: "success", data: data as T };
      } catch (error) {
        console.error(error);
        return { status: "error", error: res as unknown as ErrorResponse };
      }
    } catch (error) {
      return { status: "error", error: this.handleError(error) };
    }
  }
}
