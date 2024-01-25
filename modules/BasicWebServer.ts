import { serveDir } from "https://deno.land/std@0.212.0/http/file_server.ts";

export class BasicWebServer {
  private _get: Map<string, (req: Request) => Response | Promise<Response>> = new Map();
  private _post: Map<string, (req: Request) => Response | Promise<Response>> = new Map();
  private _put: Map<string, (req: Request) => Response | Promise<Response>> = new Map();
  private _patch: Map<string, (req: Request) => Response | Promise<Response>> = new Map();
  private _delete: Map<string, (req: Request) => Response | Promise<Response>> = new Map();
  private _options: Map<string, (req: Request) => Response | Promise<Response>> = new Map();

  private _static: string | null = null;

  // deploy automatically overrides this
  private port = 8000;
  private hostname = "127.0.0.1";
  private server: Deno.HttpServer;
  constructor({ port, hostname }: { port?: number; hostname?: string } | undefined = {}) {
    if (port) this.port = port;
    if (hostname) this.hostname = hostname;
    this.server = Deno.serve(
      {
        hostname: this.hostname,
        port: this.port,
      },
      // ? .bind(this)
      this.handleRequest.bind(this)
    );
  }

  /**
   * 1. gets the method of the request
   * 1. get the corrosponding method
   * 1. get the route that has been set inside the map
   * 1. call the function associated with it.
   * 1. if all else fails, serve static files
   */
  private async handleRequest(req: Request): Promise<Response> {
    const pathname = new URL(req.url).pathname;
    const reqType = req.method.toLowerCase();
    const method =
      reqType === "get"
        ? this._get
        : reqType === "post"
        ? this._post
        : reqType === "put"
        ? this._put
        : reqType === "patch"
        ? this._patch
        : reqType === "delete"
        ? this._delete
        : null;

    // Check if there's a callback function registered for the route
    const routeCallback = method ? method.get(pathname) : null;

    // TODO: Put these in a try/catch?
    // TODO: Multiple static folders?
    if (routeCallback) return await routeCallback(req);
    if (this._static) return serveDir(req, { fsRoot: this._static, showIndex: true });

    // TODO: custom 404
    return new Response("🤷‍♂️", { status: 404 }); // 404
  }

  public get(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._get.set(route, callback);
  }
  public post(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._post.set(route, callback);
  }
  public put(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._put.set(route, callback);
  }
  public patch(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._patch.set(route, callback);
  }
  public delete(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._delete.set(route, callback);
  }

  public options(route: string, callback: (req: Request) => Response | Promise<Response>) {
    this._options.set(route, callback);
  }

  public staticFolder(route: string) {
    this._static = route;
  }
}

/* 
   TODO: Implement a feature to handle static files without file extensions.
   This could be done by checking if a file with the requested path and a .html extension exists in the static directory.
   If such a file exists, serve it. If not, treat the request as a dynamic route.
   Be aware that this could potentially cause conflicts if a static file and a dynamic route have the same path.
   One way to avoid these conflicts is to use a special prefix for static files, such as "/static".
   This way, a request for "/test" would be treated as a dynamic route, and a request for "/static/test" would be treated as a static file.
   Another option is to check if a file exists with the requested path and serve it. If not, then you could treat it as a dynamic route.
   However, this could still potentially cause conflicts if a static file and a dynamic route have the same path.
   Consider the trade-offs of each approach and choose the one that best fits your needs.

   TODO: custom 404 page
   TODO: add cors headers
   TODO: add websocket
   

   */
