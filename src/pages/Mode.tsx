import './Mode.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.tsx';
import tracingImage from '../assets/Tracing.jpg';
import flickImage from '../assets/Flicks.jpg';
import reactionImage from '../assets/Reaction.jpg';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Modes = {'reaction' : 0, 'flicks' : 1, 'tracing' : 2};

function SelectMode()
{
	// used to navigate between pages
	const navigate = useNavigate();

	// loads and unloads mode-page style upon entering and leaving page
	useEffect(() => {
  		document.body.classList.add("mode-page");

  		return () => {
    	document.body.classList.remove("mode-page");
  		};
}, []);

	// handles navigation to each game mode
	const runGameMode = (mode: string) =>
	{
		
		switch (mode)
		{
			case 'reaction':
				console.log('Switching to reaction mode');
				navigate('/reaction');
				break;
				
			case 'flicks':
				console.log('Switching to flicks mode');
				navigate('/flicks');
				break;
				
			case 'tracing':
				console.log('Switching to tracing mode');
				navigate('/trace');
				break;
				
			default:
				console.log('Invalid mode: ' + mode);
				break;
		}
	}
	
	// handles navigation to the leaderboard
	const openLeaderboard = (mode: string) =>
	{
		console.log(`TODO open leaderboard for mode ${Modes[mode as keyof typeof Modes]}`);
		switch (mode)
		{
			case 'reaction':
				console.log('Switching to reaction leaderboard');
				navigate('/reaction-leaderboard');
				break;
			case 'flicks':
				console.log('Switching to flicks leaderboard');
				navigate('/flicks-leaderboard');
				break;
			case 'tracing':
				console.log('Switching to tracing leaderboard');
				navigate('/tracing-leaderboard');
				break;
			default:
				console.log('Invalid leaderboard mode: ' + mode);
				break;
		}
	}
	
	const logout = () =>
	{
		// when it is recognized that the user is signed out, they are automatically sent to the login page
		signOut(auth);
	}
	
		
	return (
		<div className='container font-roboto'>
			<div className='header'>
				<h3 className='gameTitle'>Aim Rivals</h3>
				<div className='headerButtonContainer'>
					<button className='arcadeTitle' id="logout-button" onClick={logout}>Logout</button>
				</div>
			</div>
			
			<div className='bodyContainer'>
				<div className='modeStack' id='mode-reaction-time-stack'>
					<h2 className='arcadeTitle'>Reaction</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('reaction')}>
						<img className="modeImg" src={reactionImage} alt="Reaction Mode"></img>
					</div>
					<button className='lbButton' id='mode-reaction-time-lb-button' onClick={() => openLeaderboard('reaction')}>View Leaderboard</button>
				</div>
				
				<div className='modeStack' id='mode-flicks-stack'>
					<h2 className='arcadeTitle'>Flicks</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('flicks')}>
						<img className="modeImg" src={flickImage} alt="Flicks Mode"></img>
					</div>
					<button className='lbButton' id='mode-flicks-lb-button' onClick={() => openLeaderboard('flicks')}>View Leaderboard</button>
				</div>
				
				<div className='modeStack' id='mode-tracing-stack'>
					<h2 className='arcadeTitle'>Tracing</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('tracing')}>
						<img className="modeImg" src={tracingImage} alt="Tracing Mode"></img>
					</div>
					<button className='lbButton' id='mode-tracing-lb-button' onClick={() => openLeaderboard('tracing')}>View Leaderboard</button>
				</div>
			</div>
		</div>
	);
}

export default SelectMode;