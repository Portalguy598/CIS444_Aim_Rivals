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
            <h1>Flicks Leaderboard</h1>
            <button onClick={returnToModeHandler}>Back to mode select</button>
            <LeaderboardWindow mode="flick"></LeaderboardWindow>
        </>
    );
}

export default FlicksLeaderboard;