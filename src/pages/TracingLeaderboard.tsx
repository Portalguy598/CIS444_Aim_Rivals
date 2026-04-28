import LeaderboardWindow from '../LeaderboardWindow';
import { useNavigate } from 'react-router-dom';

function TracingLeaderboard(){
    const navigate = useNavigate();

    function returnToModeHandler(){
        navigate('/mode');
    }

    return(
        <>
            <h1>Tracing Leaderboard</h1>
            <button onClick={returnToModeHandler}>Back to mode select</button>
            <LeaderboardWindow mode="trace"></LeaderboardWindow>
        </>
    );
}

export default TracingLeaderboard;