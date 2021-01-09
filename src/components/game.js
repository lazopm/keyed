import { useState, useRef, useEffect } from 'react';

const LEARNED_THRESHOLD = 5;

const getLearnedNodes = scoreMap => Array.from(scoreMap.entries())
    .filter(([k,v]) => v >= LEARNED_THRESHOLD)
    .map(([k,v]) => k);

const generatePrompt = (layout, scoreMap) => {
  const learned = getLearnedNodes(scoreMap);
  const findNew = nodes => {
    const seen = new Set();
    const queue = [...nodes];
    while (queue.length > 0) {
      const node = queue.shift();
      if (!learned.includes(node)) {
        return node;
      }
      [...node.children]
        .filter(child => !seen.has(child))
        .forEach(child => {
          seen.add(child);
          queue.push(child);
        });
    }
    return null;
  };

  const newKey = findNew(layout.tree);
  const prompt = [newKey];
  while (prompt.length < Math.min(Math.max(learned.length, 5), 8)) {
    const randomKey =
      learned[Math.round(Math.random() * (learned.length - 1))] || newKey;
    if (Math.round(Math.random()) === 0) {
      prompt.push(randomKey);
    } else {
      prompt.unshift(randomKey);
    }
  }
  return prompt;
};

const buildLearningsMap = layout =>
  [...layout.keys].reduce((map, key) => {
    map.set(key, 0);
    return map;
  }, new Map());

const ScoreBoard = ({ scoreMap }) => {
  const learned = getLearnedNodes(scoreMap);
  return (
    <>
      <style jsx>{`
	.root {
	  display: flex;
	}
	.score {
	  color: grey;
	  font-size: 40px;
	  margin-right: 5px;
	  margin-left: 5px;
	}
        .key {
	  border: 3px solid grey;
	  border-radius: 3px;
	  font-size: 20px;
	  color: grey;
	  width: 40px;
	  height: 40px;
	  padding: 2px;
	  margin: 5px;
	}
      `}</style>
      <div className="root">
	<div className="score">{learned.length} / {scoreMap.size}</div>
	{learned.map(node => (
	 <div key={node.char} className="key">{node.char.toUpperCase()}</div>
	))}
      </div>
    </>
  );
}

const Prompt = ({ position, error, prompt, layout, scoreMap }) => {
  const prev = prompt
    .slice(0, position)
    .map(key => key.toString())
    .join('');
  const current = prompt[position].toString();
  const next = prompt
    .slice(position + 1)
    .map(key => key.toString())
    .join('');
  return (
    <>
      <ScoreBoard scoreMap={scoreMap}/>
      <div className="prompt">
        <span>
          <span className="prev">{prev}</span>
          <span className={error ? 'error' : 'current'}>{current}</span>
          <span className="next">{next}</span>
        </span>
      </div>
      <style jsx>{`
        .prompt {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
	  font-family: 'Roboto Slab', serif;
          font-size: 10vh;
          font-weight: bold;
	  font-variant-ligatures: none;
        }
        .prompt .inner {
          flex-grow: 1;
        }
        .prompt .prev {
          color: grey;
        }
        .prompt .current {
          color: blue;
        }
        .prompt .error {
          color: red;
        }
        .prompt .next {
          color: black;
        }
      `}</style>
    </>
  );
};

const Game = ({ layout }) => {
  const scoreMap = useRef(buildLearningsMap(layout));
  const [promptState, setWordState] = useState({
    position: 0,
    error: false,
    prompt: generatePrompt(layout, scoreMap.current),
  });
  useEffect(() => {
    const sound = {
      success: new Audio('/success.mp3'),
      error: new Audio('/error.flac'),
    };
    const handler = e => {
      const keyCode = e.code;
      setWordState(state => {
        const { position, prompt, error } = state;
        const isLastPosition = position === prompt.length - 1;
        const currentKey = prompt[position];
        if (keyCode === currentKey.keyCode) {
          if (!error) {
            const score = Math.min(scoreMap.current.get(currentKey) + 1, 7);
            scoreMap.current.set(currentKey, score);
            if (isLastPosition) {
              sound.success.pause();
              sound.success.currentTime = 0;
              sound.success.play();
            }
          }
          return {
            position: isLastPosition ? 0 : position + 1,
            prompt: isLastPosition
              ? generatePrompt(layout, scoreMap.current)
              : prompt,

            error: false,
          };
        }
        sound.error.play();
        if (error) return state;
        scoreMap.current.set(
          currentKey,
          Math.max(scoreMap.current.get(currentKey) - 1, 0),
        );
        return { ...state, error: true };
      });
    };
    document.addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [setWordState]);

  return (
    <>
      <Prompt {...promptState} layout={layout} scoreMap={scoreMap.current}/>
    </>
  );
};

export default Game;
