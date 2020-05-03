import shuffle from 'lodash.shuffle';

class Key {
  constructor(keyCode, char) {
    this.keyCode = keyCode;
    this.char = char;
    this.children = new Set();
  }
  toString() {
    return this.char;
  }
}

const buildTree = async () => {
  const layoutMap = await navigator.keyboard.getLayoutMap();
  const keys = new Set();
  const k = {};
  for (let [keyCode, char] of layoutMap.entries()) {
    const key = new Key(keyCode, char);
    k[keyCode] = key;
    keys.add(key);
  };

  const buildBranch = levels => {
    const nodes = levels.shift();
    if (levels.length) {
      const childNodes = shuffle(buildBranch(levels))
      childNodes.forEach(childNode => {
        nodes.forEach(node => {
          node.children.add(childNode);
        });
      });
    }
    return nodes;
  };

  const tree = shuffle([
    buildBranch([
      [k.KeyA],
      [k.KeyQ, k.KeyZ],
      [k.Digit1],
    ]),
    buildBranch([
      [k.KeyS],
      [k.KeyW, k.KeyX],
      [k.Digit2],
    ]),
    buildBranch([
      [k.KeyD],
      [k.KeyE, k.KeyC],
      [k.Digit3],
    ]),
    buildBranch([
      [k.KeyF],
      [k.KeyR, k.KeyT, k.KeyG, k.KeyB, k.KeyV],
      [k.Digit4, k.Digit5],
    ]),
    buildBranch([
      [k.KeyJ],
      [k.KeyH, k.KeyY, k.KeyU, k.KeyN, k.KeyM],
      [k.Digit6, k.Digit7],
    ]),
    buildBranch([
      [k.KeyK],
      [k.KeyI, k.Comma],
      [k.Digit8],
    ]),
    buildBranch([
      [k.KeyL],
      [k.KeyO, k.Period],
      [k.Digit9],
    ]),
    buildBranch([
      [k.Semicolon],
      [k.KeyP, k.BracketLeft, k.BracketRight, k.Quote, k.Slash],
      [k.Digit0, k.Minus, k.Equal, k.Backslash, k.Backquote],
    ]),
  ].flat());
  return {tree, keys, keyMap: k};
};

export default buildTree;
