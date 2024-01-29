import BasicWebServer from "./modules/BasicWebServer.ts";
import SubhostingManager from "./modules/SubhostingManager.ts";
const apiKey = Deno.env.get("DEPLOY_ACCESS_TOKEN");
const orgId = Deno.env.get("DEPLOY_ORG_ID");

const manager = new SubhostingManager({ apiKey, orgId });
await manager.init();

const app = new BasicWebServer();

app.staticFolder("./public");

app.get("/createDeployment", async (req) => {
  console.log("createDeployment");

  const info = await manager.createDeployment();
  if (info instanceof Error) return new Response(info.message, { status: 400 });
  return new Response(JSON.stringify(info), { status: 200 });
});

app.get("/listDeployments", async (req) => {
  console.log("listDeployments");

  const info = await manager.listDeployments();
  if (!info) return new Response("there was an error listing deployments", { status: 400 });
  if (info.status === "error") return new Response(JSON.stringify(info.error), { status: 400 });
  if (info.status === "success") return new Response(JSON.stringify(info.data), { status: 200 });

  // TODO: handle all possible responses
  return new Response(JSON.stringify(info), { status: 500 });
});

app.get("/deleteDeployments", async (req) => {
  console.log("deleteDeployments");
  const info = await manager.deleteDeployments();
  if (info instanceof Error) return new Response(info.message, { status: 400 });

  return new Response(null, { status: 200 });
});

app.get("/getDeployment", async (req) => {
  console.log("getDeployment");

  const url = new URL(req.url);
  const deploymentId = url.searchParams.get("deploymentId");
  if (!deploymentId)
    return new Response("No deploymentId provided", {
      status: 400,
    });
  const deployment = await manager.getDeployment(deploymentId);
  if (deployment instanceof Error)
    return new Response(deployment.message, {
      status: 400,
    });
  return new Response(JSON.stringify(deployment), {
    status: 200,
  });
});
