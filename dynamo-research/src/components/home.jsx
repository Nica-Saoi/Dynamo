import Link from '@mui/material/Link'
import { useState } from 'react'
// import './App.css'

function Home() {
    return (
        <div className='homePage'>
        
            <div className='homeAbout'>
                <h2>Who Are We?</h2>

                <p>
                    Dynamo is research platform designed to make scientific research easier
                    to explore, understand, and reproduce. By bringing research papers, 
                    datasets, code, and supporting materials together in one place, Dynamo helps
                    researchers, students, and curious minds better understand how research
                    is connected and build upon existing work.
                </p>
            </div>

            <div className="homeSearch">
                <input
                    type="text"
                    placeholder="Search"
                    className="searchInput"
                />

                <p>Or</p>
                
                <a href="/repository" className="uploadLink">
                    Upload Files
                </a>
            </div>

        </div>
       
    )
}

export default Home