// start.js
const { exec } = require("child_process");

// This runs your npm preview script
const child = exec("npm run preview -- --host 0.0.0.0 --port 5100");

child.stdout.on("data", (data) => console.log(data));
child.stderr.on("data", (data) => console.error(data));

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
