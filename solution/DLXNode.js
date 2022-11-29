class DLXNode {
  constructor(r, c, v, ch, mr, mc, child) {
    this.row = r;
    this.col = c;
    this.value = v;
    this.colHeader = ch;
    this.matRow = mr;
    this.matCol = mc;
    if (ch == null) {
      this.nChild = child;
      this.header = true;
    }

    this.left = null;
    this.right = null;
    this.top = null;
    this.bottom = null;
  }

  setRight(node) {
    this.right = node;
    return this;
  }

  setLeft(node) {
    this.left = node;
    return this;
  }

  setTop(node) {
    this.top = node;
    return this;
  }

  setBottom(node) {
    this.bottom = node;
    return this;
  }

  removeChild() {
    if (header) this.nChild--;
    else console.error("The selected node is not a header!");
  }

  clearChild() {
    if (header) this.nChild = 0;
    else console.error("The selected node is not a header!");
  }

  puzzleValues() {
    return [this.row, this.col, this.value];
  }

  printInfo() {
    System.out.println(
      "(" +
        this.row +
        ", " +
        this.col +
        ", " +
        this.value +
        ")\tmatCol: " +
        this.matCol +
        "\tmatRow: " +
        this.matRow +
        "\tisHeader: " +
        this.header
    );
  }

  test() {
    return (
      "[" +
      this.row +
      ", " +
      this.col +
      ", " +
      this.value +
      ", " +
      this.matCol +
      "]"
    );
  }
}

module.exports = DLXNode;
