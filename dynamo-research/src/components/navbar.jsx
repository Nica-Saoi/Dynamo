import '../styles/navigation.css'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function Navbar(){
    return (
        <div className="navigation">
            <div className='navleft'>
                <p className='title'><a href="/">Dynamo Research</a></p>
            </div>
            <div className='navRight'>
                <AccountCircleIcon />
                <span>Researcher</span>
            </div>
        </div>
    )
}

export default Navbar