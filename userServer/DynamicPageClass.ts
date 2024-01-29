// TODO: links to old version
import BasicWebServer from "https://gist.githubusercontent.com/shawn-sawa/84d1f1ac570cb5672c3232eef6c8e3f1/raw/40ed39312f806de779db11d206d6deca40b0a7f1/BasicWebServer.ts";

export default class DynamicPage {
  API_KEY: string;
  server = new BasicWebServer();
  sockets = new Set<WebSocket>();
  htmlContent = "<h1>Hello, from Deno Subhosting!</h1>";
  headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });

  constructor(apiKey: string) {
    this.API_KEY = apiKey;
    this.setupRoutes();

    //TODO: pull api key from env?
    const envKey = Deno.env.get("API_KEY");
    console.log("envKey :>> ", envKey);
  }

  setupRoutes() {
    // TODO: allow custom <head>
    // TODO: pass server to user to add routes
    this.server.get("/", () => this.sendHTML());
    this.server.options("/", () => this.res(204, null));
    this.server.post("/update", (req) => this.updateHTML(req));
    // TODO: protect editor route with API key
    this.server.get("/editor", (res) => this.sendEditor(res));
    this.server.get("/ws", (req) => this.upgradeWebSocket(req));
  }

  /** Update the HTML content */
  async updateHTML(req: Request): Promise<Response> {
    const apiKey = req.headers.get("x-api-key");

    if (this.API_KEY !== apiKey) return this.res(401, "Invalid or missing API key");

    try {
      const requestData = await req.text();
      if (!requestData) return this.res(400, "No request body provided");
      this.htmlContent = requestData;
      this.notifyClients();

      return this.res(200, "HTML content updated");
    } catch (error) {
      console.log("Error updating HTML content:", error);

      return this.res(500, "Error updating HTML content");
    }
  }

  upgradeWebSocket(req: Request): Response | Promise<Response> {
    // Handle WebSocket connections
    if (req.headers.get("upgrade") !== "websocket") return this.res(400, "Not a websocket request");

    const { socket, response } = Deno.upgradeWebSocket(req);

    this.sockets.add(socket);
    socket.onopen = () => console.log("WebSocket connection opened.");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);

      this.sockets.delete(socket);
    };

    return response;
  }

  res(status: number, message: string | null = null, mime?: string) {
    // TODO: Log errors
    const mimeTypeList = new Map([
      ["html", "text/html"],
      ["css", "text/css"],
      ["js", "application/javascript"],
      ["json", "application/json"],
      ["txt", "text/plain"],
    ]);

    const headers = new Headers(this.headers);

    if (mime) {
      const mimeType = mimeTypeList.get(mime);
      headers.append("Content-Type", mimeType || "text/plain");
    }
    return new Response(message, {
      status: status,
      headers,
    });
  }

  /** Returns the current HTML content */
  sendHTML() {
    // TODO: allow custom <head>
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing</title>
    <link rel="shortcut icon" href="#" type="image/x-icon">
    </head>
    <body>
    ${this.htmlContent}
    <script>
    if ("WebSocket" in window) {
      (function () {
        const protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
        const address = protocol + window.location.host + "/ws";
        const socket = new WebSocket(address);
        socket.onmessage = function (msg) {
          if (msg.data == "reload") window.location.reload();
        };
        if (sessionStorage && !sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer")) {
          console.log("Live reload enabled.");
          sessionStorage.setItem("IsThisFirstTime_Log_From_LiveServer", true);
        }
      })();
    } else {
      console.error("Upgrade your browser. This Browser does NOT support WebSocket for Live-Reloading.");
    };
    </script>
    </body>
    </html>`;

    return this.res(200, html, "html");
  }

  /** Sends a message to all websocket clients to reload
   *
   * Called after html has been updated
   */
  notifyClients() {
    console.log("Notifying clients...");
    this.sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send("reload");
        } catch (error) {
          console.error(`Error sending message: ${error}`);
          // Attempt to close the socket
          try {
            socket.close();
          } catch (error) {
            console.error(`Error closing socket: ${error}`);
          }
          this.sockets.delete(socket);
        }
      }
    });
  }

  sendEditor(req: Request) {
    const html = Deno.readTextFileSync("./editor.html");
    return this.res(200, html, "html");
  }
}
