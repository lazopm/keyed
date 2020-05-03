import Head from 'next/head';
import Game from '../components/game';
import { useState, useEffect } from 'react';
import buildTree from '../tree';

const Home = () => {
  const [layout, setLayout] = useState(null);
  useEffect(() => {
    buildTree().then(setLayout);
  }, [setLayout]);
  return (
    <div className="container">
      <Head>
        <title>Keyed</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>{layout ? <Game layout={layout} /> : null}</main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
