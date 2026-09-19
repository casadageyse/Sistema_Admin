export default { async fetch(request) { return Response.redirect("https://main.casa-da-geyse-admin.pages.dev" + new URL(request.url).pathname, 301); } };
