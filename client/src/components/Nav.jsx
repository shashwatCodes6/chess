import react from 'react'
import Cookies from 'js-cookie'

function Nav(){
    const cookies = Cookies.get();
    const username = cookies.username;
    // const navigate = useNavigate()

    return (
        <div className='flex p-1 justify-between bg-gradient-to-r'>
            <div className='flex'>
                <img className = "m-1 h-8" src = "/src/assets/b_n.png"></img>
                <p className='p-2'>MyChess </p>
            </div>
            <div className='flex'>
                {
                    username !== "undefined" ? 
                    <div className='p-2 border border-black rounded-lg m-1 hover:bg-slate-400 hover:text-white'> {username} </div> : 
                    (<div className='p-2 border border-black rounded-lg m-1 hover:bg-slate-400 hover:text-white' onClick={() =>  {}}>Login</div>)
                }
                {
                    username === "undefined" ? 
                        (<div className='p-2  border border-black rounded-lg m-1 hover:bg-slate-400 hover:text-white' onClick={() => {}}>Signup</div>) : 
                        (<div className='p-2  border border-black rounded-lg m-1 hover:bg-slate-400 hover:text-white' onClick={() => {}}>Logout</div>)
                }
            </div>
        </div>
    );
}


export default Nav