// this contains the component for the leaderboard, reusable accross different leaderboard pages


function LeaderboardWindow({mode}: {mode: string}){
    return (
        <div className="leaderboard-window">
            <div className="leaderboard-display">
                
            </div>
            <div className="leaderboard-controls">
                <button className="page-change-button" type="button">Previous Page</button>
                <button className="page-change-button" type="button">Next Page</button>
            </div>
        </div>
    );
}

export default LeaderboardWindow;