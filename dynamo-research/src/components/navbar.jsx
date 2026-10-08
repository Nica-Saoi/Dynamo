import '../styles/navigation.css'

function Navbar(){
    return (
        <div className="navigation">
            <ul>
                <li><a>Update History</a></li>
                <li><a>Repo/Docs</a></li>
                <li><a>Final Report</a></li>
            </ul>
            <p className='title'>Dynamo Research</p>
        </div>
    )
}

export default Navbar