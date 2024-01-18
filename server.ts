// deno-lint-ignore-file no-unused-vars ban-unused-ignore require-await

import Client from "./fromDemo/subhosting.ts";
import { serveDir } from "https://deno.land/std@0.212.0/http/file_server.ts";
import { BasicWebServer } from "./modules/BasicWebServer.ts";
const shc = new Client();
const app = new BasicWebServer();

app.staticFolder("./public");

app.get("/projects", async (req) => {
  const projects = await (await shc.listProjects()).json();
  console.log("projects :>> ", projects);
  return projects;
  // https://api.deno.com/v1/organizations/168b4a5f-9a10-40b5-b9af-791d55f1b4d8/projects?
});

// Poll deployment data from Subhosting API
app.get("/deployments", async (req) => {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") || "";
  console.log("projectId :>> ", projectId);
  const dr = await shc.listDeployments(projectId, {
    order: "desc",
  });
  console.log("dr :>> ", dr);
  const deployments = await dr.json();
  console.log("deployments :>> ", deployments);

  return deployments;
});

// Create deployment for the given project with the Subhosting API
app.post("/deployment", async (req) => {
  const body = await req.json();

  const dr = await shc.createDeployment(body.projectId, {
    entryPointUrl: "main.ts",
    assets: {
      "main.ts": {
        kind: "file",
        content: body.code,
        encoding: "utf-8",
      },
    },
    envVars: {},
  });
  console.log("dr :>> ", dr);
  const deploymentResponse = await dr.json();
  console.log("deploymentResponse :>> ", deploymentResponse);
  return deploymentResponse;
});

// Create project for the given org with the Subhosting API
app.post("/project", async (req) => {
  // const body = await req.json();
  let body;
  try {
    // body = await req.json();
    body = await req.text();
    // console.log("bodyyy :>> ", body);
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response("Invalid JSON body", { status: 400 });
  }

  const pr = await shc.createProject(body as string);
  // const pr = await shc.createProject(body.name as string);
  console.log("pr :>> ", pr);
  const projectResponse = await pr.json();
  console.log("projectResponse :>> ", projectResponse);

  return new Response(null, { status: 302, headers: { Location: "/" } });
});
