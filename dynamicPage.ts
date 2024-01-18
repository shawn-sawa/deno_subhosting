const VALID_API_KEYS = new Set(["your-api-key-1", "your-api-key-2"]); // Replace with your actual keys
const sockets = new Set<WebSocket>();

function isValidApiKey(providedKey: string | null): boolean {
  return VALID_API_KEYS.has(providedKey || "");
}

let htmlContent = `<html><body><h1>Initial HTML</h1></body></html>`;

function generateFullHtmlPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing</title>
    <link rel="shortcut icon" href="#" type="image/x-icon">
    </head>
<body>
    ${htmlContent}
    <script>${WebSocketClientScript}</script>
</body>
</html>`;
}
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Serve HTML page
  if (url.pathname === "/" && req.method === "GET") {
    return new Response(generateFullHtmlPage(), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Handle WebSocket connections
  if (req.headers.get("upgrade") === "websocket" && url.pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  // Handle API endpoint
  if (url.pathname === "/api/update-html" && req.method === "POST") {
    const apiKey = req.headers.get("x-api-key"); // Assume API key is sent in a custom header

    if (!isValidApiKey(apiKey)) {
      return new Response("Invalid or missing API key", { status: 401 });
    }

    try {
      const requestData = await req.text();
      htmlContent = requestData;
      console.log("HTML content updated", requestData);
      notifyClients();
    } catch (error) {
      console.error("Error updating HTML content:", error);
      return new Response("Error updating HTML content", { status: 500 });
    }
    return new Response("HTML content updated", { status: 200 });
  }

  // Fallback for any other requests
  return new Response("Not found", { status: 404 });
}

function handleWebSocket(socket: WebSocket): void {
  sockets.add(socket);

  socket.onopen = () => {
    console.log("WebSocket connection opened.");
  };

  socket.onmessage = (event) => {
    console.log("Received message:", event.data);
    // Handle incoming messages here
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    sockets.delete(socket);
  };
}

// Function to notify all connected clients to reload
function notifyClients() {
  console.log("Notifying clients...");
  sockets.forEach((socket) => {
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
        sockets.delete(socket);
      }
    }
  });
}

console.log("Server running");
Deno.serve(handleRequest);

const WebSocketClientScript = `

// <![CDATA[  <-- For SVG support
if ("WebSocket" in window) {
  (function () {
    function refreshCSS() {
      var sheets = [].slice.call(document.getElementsByTagName("link"));
      var head = document.getElementsByTagName("head")[0];
      for (var i = 0; i < sheets.length; ++i) {
        var elem = sheets[i];
        var parent = elem.parentElement || head;
        parent.removeChild(elem);
        var rel = elem.rel;
        if ((elem.href && typeof rel != "string") || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
          var url = elem.href.replace(/(&|\\?)_cacheOverride=\\d+/, "");
          elem.href = url + (url.indexOf("?") >= 0 ? "&" : "?") + "_cacheOverride=" + new Date().valueOf();
        }
        parent.appendChild(elem);
      }
    }
    var protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
    var address = protocol + window.location.host  + "/ws";
    // var address = protocol + window.location.host + window.location.pathname + "/ws";
    console.log("WebSocket address: " + address);
    var socket = new WebSocket(address);
    console.log("WebSocket created", socket);
    socket.onmessage = function (msg) {
      console.log("WebSocket message received: " + msg.data);
      if (msg.data == "reload") window.location.reload();
      else if (msg.data == "refreshcss") refreshCSS();
    };
    if (sessionStorage && !sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer")) {
      console.log("Live reload enabled.");
      sessionStorage.setItem("IsThisFirstTime_Log_From_LiveServer", true);
    }
  })();
} else {
  console.error("Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.");
}
// ]]>`;
