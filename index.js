const express = require("express");
const SudokuSolver = require("./solution/SudokuSolver");

const app = express();
const http = require("http").createServer(app);

const hostname = "127.0.0.1";
const port = 4000;


app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());

app.route("/").get((req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.route("/api/solve").post((req, res) => {
  const puzzle = req.body;

  try {
    const solved = (new SudokuSolver(puzzle)).solve();
    res.json(solved);
  } catch (e) {
    res.send("failed"); 
  }
});

http.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
