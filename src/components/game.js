import { useState, useRef, useEffect } from 'react';

const LEARNED_THRESHOLD = 5;

const generatePrompt = (layout, learnings) => {
  const learned = [];
  const findNew = nodes => {
    const seen = new Set();
    const queue = [...nodes];
    while (queue.length > 0) {
      const node = queue.shift();
      if (learnings.get(node) < LEARNED_THRESHOLD) {
        return node;
      }
      learned.push(node);
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

const Prompt = ({ position, error, prompt, layout }) => {
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
          font-size: 10vh;
          font-weight: bold;
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
  const learnings = useRef(buildLearningsMap(layout));
  const [promptState, setWordState] = useState({
    position: 0,
    error: false,
    prompt: generatePrompt(layout, learnings.current),
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
            const score = Math.min(learnings.current.get(currentKey) + 1, 7);
            learnings.current.set(currentKey, score);
            if (isLastPosition) {
              sound.success.pause();
              sound.success.currentTime = 0;
              sound.success.play();
            }
          }
          return {
            position: isLastPosition ? 0 : position + 1,
            prompt: isLastPosition
              ? generatePrompt(layout, learnings.current)
              : prompt,

            error: false,
          };
        }
        sound.error.play();
        if (error) return state;
        learnings.current.set(
          currentKey,
          Math.max(learnings.current.get(currentKey) - 1, 0),
        );
        return { ...state, error: true };
      });
    };
    document.addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [setWordState]);

  return <Prompt {...promptState} layout={layout} />;
};

export default Game;
