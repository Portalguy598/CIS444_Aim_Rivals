import LeaderboardWindow from '../LeaderboardWindow';
import { useNavigate } from 'react-router-dom';

function ReactionLeaderboard(){
    const navigate = useNavigate();

    function returnToModeHandler(){
        navigate('/mode');
    }
    return(
        <>
            <h2 className="leaderboard-title">
  Reaction Leaderboard
</h2>
            <button onClick={returnToModeHandler}>Back to mode select</button>
            <LeaderboardWindow mode="reaction"></LeaderboardWindow>
        </>
    );
}

export default ReactionLeaderboard;