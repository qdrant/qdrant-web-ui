import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Collection from './pages/Collection';

function App() {
  return (
    <div className="App">
      <Header/>
      <header className="App-header">
        <Router>
          <Routes>
            <Route exact path="/"  element={<Home />} />
            <Route exact path="/collections"  element={<Collections />} />
            <Route exact path="/collections/:collectionName"  element={<Collection />} />
          </Routes>
        </Router>
      </header> 
    </div>
  );
}

export default App;