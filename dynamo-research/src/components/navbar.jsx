import '../styles/navigation.css'
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox';


function Navbar(){
    return (
        <div className="navigation">
            <div className='navleft'>
                <p className='title'><a href="/">Dynamo Research</a></p>
            </div>
            <div className='navRight'>
            <SearchIcon/>
                <ul>
                    <li><a>Research History</a></li>
                    <li><a href = "/repository">Repo/Docs</a></li>
                    <li><a>Final Report</a></li>
                </ul>
                <a href="/login"><AccountBoxIcon/></a>
            </div>
        </div>
    )
}

export default Navbar