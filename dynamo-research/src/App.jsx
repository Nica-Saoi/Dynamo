import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'
import Home from './components/home'
import Navbar from './components/navbar'
import FileRepository from './components/filerepository'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        < Route path="/" element={<Home />} />
        <Route path="/repository" element={<FileRepository />} />
      </Routes>

      {/* <Home /> */}
    </BrowserRouter>
  )
}

export default App
