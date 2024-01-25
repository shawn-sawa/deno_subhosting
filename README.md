# Deploy Stream

This isn't just any app – it's a dynamic deployment wizard. Think of it as the Swiss Army knife for web projects, still a bit rough around the edges.

## Purpose

Why settle for boring when you can have a project that sets up live servers on the fly, offers a basic editor, and has a GPT buddy in the pipeline?

## Main Features

- **Organization & Project Management**: Keep your projects and their structure neatly organized.
- **Deployment on Demand**: Hit an API, and boom – your server is live.
- **Basic Editor Included**: Make changes directly, no fancy tools needed.
- **Admin Powers**: Control your deployments like a boss.
- **GPT Integration Coming Soon**: Imagine a GPT that doesn't just chat but also sets up projects for you. That's the dream, and it's on the way.

## Current State

This masterpiece is a work-in-progress. Expect some quirks and a bit of DIY.

## Future Plans

- **Smarter GPT Interaction**: A GPT that not only talks the talk but also walks the walk, setting up projects based on your conversation.
- **User Feedback Loop**: You talk, GPT listens, and the project evolves. Real-time changes based on your input.

## Getting Started: Unleash the Magic ✨

1. **API Key & Organization ID**: First things first, pop your API key and organization ID into the `.env` file. Think of it as the secret sauce for your project.

2. **Power Up the Server**: Let's get this party started! Just a heads-up:

   - Your server is the life of the party with 4 main attractions (endpoints):
     - `/createDeployment`: It's like hitting the big red button. Boom, deployment created.
     - `/listDeployments`: For when you need a roll-call of all your deployments.
     - `/deleteDeployments`: Sometimes you gotta let go. This is for that.
     - `/getDeployment`: Get the lowdown on any deployment.
   - It's got a front end, too, echoing these endpoints. Still under construction, but it's getting there.

3. **Create Your First Deployment**:
   - Hit up `/createDeployment` with a GET request.
   - In return, you'll get a shiny object with a URL and an API key. It's like finding a treasure map.

From this point on, it's all about interacting with your newly spawned server:

- **GET /**: Just like knocking on the front door. This returns your `index.html`.
- **POST /update**: Time to renovate! Update `index.html` by sending HTML in the request body. Don't forget to whisper the "x-api-key" in the header for secret access.
- **GET /editor**: Craving some DIY? This returns the `editor.html` for you to play with.

Dive in, and let the web magic begin!
