import './Mode.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.tsx';

import { useNavigate } from 'react-router-dom';

// import { Modes } from '@/enums/Modes';

//import FlicksGame from './Flicks';

const Modes = {'reaction' : 0, 'flicks' : 1, 'tracing' : 2};

function SelectMode()
{
	const navigate = useNavigate();
	
	const runGameMode = (mode: string) =>
	{
		
		switch (mode)
		{
			case 'reaction':
				console.log('Reaction mode not implemented yet');
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
	
	const openSettings = () =>
	{
		console.log('TODO open settings');
	}
		
	return (
		<div className='container font-roboto'>
			<div className='header'>
				<h3 className='headerTitle'>Aim Rivals</h3>
				<div className='headerButtonContainer'>
					<button className='headerButton' id="logout-button" onClick={logout}>Logout</button>
					<button className='headerButton' id="settings-button" onClick={openSettings}>Settings</button>
				</div>
			</div>
			
			<div className='bodyContainer'>
				<div className='modeStack' id='mode-reaction-time-stack'>
					<h2 className='modeTitle'>Reaction</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('reaction')}>
						<img className="modeImg" src='FIXME' alt="Reaction Time Mode"></img>
					</div>
					<button className='lbButton' id='mode-reaction-time-lb-button' onClick={() => openLeaderboard('reaction')}>View Leaderboard</button>
				</div>
				
				<div className='modeStack' id='mode-flicks-stack'>
					<h2 className='modeTitle'>Flicks</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('flicks')}>
						<img className="modeImg" src='FIXME' alt="Flicks Mode"></img>
					</div>
					<button className='lbButton' id='mode-flicks-lb-button' onClick={() => openLeaderboard('flicks')}>View Leaderboard</button>
				</div>
				
				<div className='modeStack' id='mode-tracing-stack'>
					<h2 className='modeTitle'>Tracing</h2>
					<div className='modeImgContainer' onClick={() => runGameMode('tracing')}>
						<img className="modeImg" src='FIXME' alt="Tracing Mode"></img>
					</div>
					<button className='lbButton' id='mode-tracing-lb-button' onClick={() => openLeaderboard('tracing')}>View Leaderboard</button>
				</div>
			</div>
		</div>
	);
}

export default SelectMode;