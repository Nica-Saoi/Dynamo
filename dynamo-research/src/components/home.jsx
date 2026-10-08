import { useState } from 'react'
// import './App.css'

function Home() {
    return (
    <>
        <div>
        <div className='updates wheel'>
            {/* insert the latest 3 cards of updates */}
            <a href='/'></a>
        </div>
        <div className='about'></div>
        <div className='supporting docs'>
            <h2>Repo</h2>
        <button
            type="button"
            className="repo"
            //   onClick={} navigate to repo page
            >
            Repo
            </button>
        </div>
        <div className='gen findings'>
            <h2>General Findings</h2>
            <p>Here is where a brief abstract goes of our findings</p>
        </div>
    </div>
    </>
    )
}

export default Home