import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Collection from './pages/Collection';

function App() {

  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionName" element={<Collection />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
