import { useEffect, useState } from 'react';
import { auth, db } from './firebase.tsx';
import { doc, getDoc, getDocs, collection, getCountFromServer, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext.tsx';



// this contains the component for the leaderboard, reusable accross different leaderboard pages
function LeaderboardWindow({mode}: {mode: string}){

    // pageNum determines the page the leaderboard is currently on, each page shows 10 users
    const [pageNum, setPageNum] = useState(1);

    // store array of users to be displayed in the table
    const [users, setUsers] = useState<any []>([]);

    // keeps track of the total number of users for page counts
    const [userCount, setUserCount] = useState(-1);

    // places database contents in array
    useEffect(() => {
        const getCollectionData = async () => {
            try{
                const q = query(collection(db, 'users'), orderBy(mode + '_score', 'desc'), orderBy('username'));
                const snapshot = await getDocs(q);
            
                const userArray: any [] = [];
                snapshot.forEach((doc) => {
                    // push object with score and username into array to be accessed later
                    userArray.push({score: doc.get(mode + '_score'), username: doc.get('username')});
                });
                setUsers(userArray);
            } catch (error){
                console.error('Failed to get user data for leaderboard: ', error);
            }
        }

        getCollectionData();
        
    }, []);

    // set the value of the userCount
    useEffect(() => {  
        const fetchCount = async () => {
            try{
                const coll = collection(db, 'users');
                const snapshot = await getCountFromServer(coll);
                setUserCount(snapshot.data().count);
            } catch (error){
                console.error('Error getting number of documents: ', error);
            }
        }

        fetchCount();
    }, []);

    // function to go to lower page
    const handlePageChangeLower = () => {
        if(pageNum <= 1){
            console.log('Already at first page');
            return;
        }

        setPageNum(pageNum - 1);
    }

    // function to go to higher page
    const handlePageChangeHigher = () => {
        if(userCount === -1){
            console.error('Count of users not loaded in yet');
            return;
        }

        // pageNum * 10 gives total users displayed to this point
        // if pageNum * 10 < userCount, then there is still another page needed to display the remaining users
        if(pageNum * 10 < userCount){
            setPageNum(pageNum + 1);
        }
        else{
            console.log('Reached last page already')
        }
    }

    return (
        <div className="leaderboard-window">
            <div className="leaderboard-display">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {// display up to 10 users on the currently selected page
                        users.slice((pageNum - 1) * 10, pageNum * 10).map((data, index) => (
                        <tr key={index + 1}>
                            <td>{index + 1}</td>
                            <td>{data.username}</td>
                            <td>{data.score}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="leaderboard-controls">
                <button className="page-change-button" type="button" onClick={handlePageChangeLower}>Previous Page</button>
                <button className="page-change-button" type="button" onClick={handlePageChangeHigher}>Next Page</button>
            </div>
        </div>
    );
}

export default LeaderboardWindow;