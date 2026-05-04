import LeaderboardWindow from '../LeaderboardWindow';
import './Leaderboard.css';
import { useNavigate } from 'react-router-dom';

function FlicksLeaderboard(){
    const navigate = useNavigate();

    function returnToModeHandler(){
        navigate('/mode');
    }
    return(
        <>
             <h2 className="leaderboard-title">
            Flicks Leaderboard
            </h2>
            <button onClick={returnToModeHandler}>Back to mode select</button>
            <LeaderboardWindow mode="flick"></LeaderboardWindow>
        </>
    );
}

export default FlicksLeaderboard;