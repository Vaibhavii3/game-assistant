import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import BatchGeneration from './Batchgeneration';

function App() {

    return (
      <>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/batch" element={<BatchGeneration />} />
        </Routes>
      </Router>

      </>
    );
}

export default App;
