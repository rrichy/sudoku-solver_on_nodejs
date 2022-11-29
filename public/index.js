const rawform = document.getElementById("main-form");

rawform.addEventListener("submit", async (e) => {
  e.preventDefault();

  const puzzle = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));

  const form = new FormData(rawform);

  for (let [name, value] of form.entries()) {
    const [row, col] = name.match(/\d/g).map((n) => n - 1);
    puzzle[row][col] = +value;
  }

  const res = await fetch("/api/solve", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json",
    },
    body: JSON.stringify(puzzle),
  });

  const data = await res.json();

  puzzle.forEach((rows, row) => {
    rows.forEach(
      (_, col) =>
        (document.getElementsByName(`row-${row + 1}-col-${col + 1}`)[0].value =
          data[row][col])
    );
  });
});
