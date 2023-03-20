import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Collections from './pages/Collections';
import Collection from './pages/Collection';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:collectionName" element={<Collection />} />
          </Routes>
        </HashRouter>
      </header>
    </div>
  );
}

export default App;
