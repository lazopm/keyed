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
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
	<link href="https://fonts.googleapis.com/css2?family=Roboto&family=Roboto+Slab:wght@500&display=swap" rel="stylesheet"/>
      </Head>

      <main>{layout ? <Game layout={layout} /> : null}</main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: Roboto, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
