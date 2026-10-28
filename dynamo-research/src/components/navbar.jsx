import '../styles/navigation.css'
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox';


function Navbar(){
    return (
        <div className="navigation">
            <div className='navleft'>
                {/* put avatar icon here for logged in */}
                <AccountBoxIcon/>
                <p className='title'>Dynamo Research</p>
            </div>
            <div className='navRight'>
                <ul>
                    <li><a>Research History</a></li>
                    <li><a>Repo/Docs</a></li>
                    <li><a>Final Report</a></li>
                </ul>
                <SearchIcon/>
            </div>
        </div>
    )
}

export default Navbar