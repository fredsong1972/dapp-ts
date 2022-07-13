import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Demo from './demo'
import logo from './metamask.svg';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
            With cryptocurrencies and blockchain technology, NFTs have become part of this crazy world.            
        </p>
        <Box
          sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', typography: 'h3',
            '& > :not(style) + :not(style)': {
              ml: 2,
            },
          }}>
          <Link href="/demo" underline="none" sx={{ color: '#FFF' }}>
            Web3 NFT Demo
          </Link>
        </Box>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </Router>
  );
}

export default App;
