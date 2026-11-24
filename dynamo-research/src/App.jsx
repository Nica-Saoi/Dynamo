import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './styles/App.css'
import Home from './components/home'
import Navbar from './components/navbar'
import FileRepository from './components/filerepository'
import Login from './components/login'
import Signup from './components/signup'

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />

        <Route path="/home" element={
          <>
            <Navbar />
            <Home />
          </>
        } />

        <Route path="/repository" element={
          <>
            <Navbar />
            <FileRepository />
          </>
        } />

      </Routes>

      {/* <Home /> */}
    </BrowserRouter>
  )
}

export default App
