import React from 'react';
import { Link } from 'react-router-dom'; 
import './Homepage.css'; 

const Homepage = () => {
  return (
    <div className="homepage-container">
      <header className="header">
        <h1>Welcome to Qdrant!</h1>
      </header>

      <section className="setup-collection">
        <h2>Begin by setting up your collection</h2>
        <p>
          Start building your app by creating a collection and inserting your vectors.
          Interactive tutorials will show you how to organize data and perform searches. 
        </p>
        <div className="buttons">
          <Link to="/tutorial/quickstart">
            <button className="btn">Quickstart</button>
          </Link>
          <Link to="/tutorial/loadcontent">
            <button className="btn">Load Sample Data</button>
          </Link>
        </div>
      </section>

      <section className="explore-data">
        <h2>Connect to your new project</h2>
        <p>
          Easily interact with your database using Qdrant SDKs and our REST API. 
          Use these libraries to connect, query, and manage your vector data from the app.
        </p>
        <div className="buttons">
          <a href="https://api.qdrant.tech/api-reference" target="_blank" rel="noopener noreferrer">
          <button className="btn">API Reference</button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Homepage;