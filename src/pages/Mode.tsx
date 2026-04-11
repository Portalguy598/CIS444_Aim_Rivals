import './Mode.css';
// import { Modes } from '@/enums/Modes';

const Modes = {'reaction' : 0, 'flicks' : 1, 'tracing' : 2};

function SelectMode()
{
	const runGameMode = (mode: string) =>
	{
		console.log(`TODO run game for mode ${Modes[mode as keyof typeof Modes]}`);
	}
	
	const openLeaderboard = (mode: string) =>
	{
		console.log(`TODO open leaderboard for mode ${Modes[mode as keyof typeof Modes]}`);
	}
	
	const logout = () =>
	{
		console.log('TODO do logout (probably should be an imported function?');
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