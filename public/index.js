/// <reference lib="dom" />
// @ts-check
const createDeploymentBtn = document.getElementById("createDeploymentBtn");
const listDeploymentsBtn = document.getElementById("listDeploymentsBtn");
const deleteDeploymentsBtn = document.getElementById("deleteDeploymentsBtn");
const getDeploymentBtn = document.getElementById("getDeploymentBtn");

const tabs = Array.from(document.querySelectorAll(".tab"));
const containers = Array.from(document.querySelectorAll(".container"));

const ldtbody = document.getElementById("ldtbody");
console.log("ldtbody :>> ", ldtbody);

createDeploymentBtn.addEventListener("click", async () => {
  console.log("createDeployment");
  // const res = await fetch("/createDeployment");
});

listDeploymentsBtn.addEventListener("click", async () => {
  console.log("listDeployments");
  const res = await fetch("/listDeployments");
  if (res.status !== 200) {
    console.log("res.status :>> ", res.status);
    console.log("res.text() :>> ", await res.text());
  }
  const deployments = await res.json();
  ldtbody.innerHTML = "";
  const deploymentsHTML = deployments.map((d) => {
    return `
       <tr>
       <td>${d.id}</td>
       <td>${d.createdAt}</td>
       <td>${d.databases}</td>
       <td>${d.description}</td>
       <td>${d.status}</td>
       <td>${d.updatedAt}</td>
       <td>${d.projectId}</td>
       </tr>`;
  });
  ldtbody.innerHTML = deploymentsHTML.join(" ");
});

deleteDeploymentsBtn.addEventListener("click", async () => {
  console.log("deleteDeployments");
  //   const res = await fetch("/deleteDeployments");
});

getDeploymentBtn.addEventListener("click", async () => {
  console.log("getDeployment");
  //   const res = await fetch("/getDeployment");
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.textContent;
    const showContainer = containers.filter((c) => c.id.startsWith(tabName))[0];

    tabs.forEach((tab, i) => {
      tab.classList.remove("active");
      containers[i].classList.add("hidden");
    });

    tab.classList.add("active");
    showContainer.classList.remove("hidden");
  });
});
