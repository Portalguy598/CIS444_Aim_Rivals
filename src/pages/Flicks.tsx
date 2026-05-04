import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.tsx';

import './Flicks.css';

import { ReusableGameLogic, GameState } from '../logic/ReusableGameLogic.ts';

const CULL_TARGET_AGE = 2;
const BASE_POINTS_ON_HIT = 10;
const TARGET_PLACE_PERIOD = 0.333;
const TARGET_PLACE_ATTEMPTS = 5;
const TARGET_PLACE_BOUNDARY = 1;
const GAME_TIME = 30;
const TICK_PERIOD = 100;

export default function FlicksGame()
{
	const { user } = useAuth();
	const navigate = useNavigate();

	if (user === null) {
		console.error('User was null in flicks game mode');
		return <div>Loading...</div>;
	}

	const gameLogic = new ReusableGameLogic(
		CULL_TARGET_AGE,
		BASE_POINTS_ON_HIT,
		TARGET_PLACE_PERIOD,
		TARGET_PLACE_ATTEMPTS,
		TARGET_PLACE_BOUNDARY,
		GAME_TIME,
		TICK_PERIOD,
		true,
		user,
		"flick_score"
	);

	const [, forceUpdate] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			forceUpdate(x => x + 1);
		}, 50);

		return () => clearInterval(interval);
	}, []);


	const quitGame = () => {
		navigate('/mode');
	};

	const onTargetHit = (targetID: number) => {
		gameLogic.onTargetHit(targetID);
	};

	const onGameClick = () => {
		gameLogic.onGameClick();
	};

	const doGameStart = () => {
		gameLogic.doGameStart();
	};

	const doGameReset = () => {
		gameLogic.doGameReset();
	};

	return (
		<div className='container font-roboto'>

			{}
			<div className='header'>
				<h3 className='arcadeTitle'>Flicks</h3>
				<div className='headerButtonContainer'>
					<button className='arcadeTitle' id="quit-button" onClick={quitGame}>
						Quit Game
					</button>
				</div>
			</div>

			{}
			<div className="hudBar">
				<span className="time">
					Time: {Math.ceil(gameLogic.uiTimeLeft)}s
				</span>
				<span className="score">
					Score: {gameLogic.uiScore}
				</span>
				<span className="hits">
					Hits: {gameLogic.uiHits}
				</span>
			</div>

			{}
			<div className='gameContainerFlicks' onClick={onGameClick}>

				<div className='targetContainerFlicks'>
					{gameLogic.uiTargets.map((target) => (
						<div
							key={target.id}
							className='targetFlicks'
							style={{
								left: `${target.xPos}%`,
								top: `${target.yPos}%`
							}}
							onClick={() => onTargetHit(target.id)}
						/>
					))}
				</div>

				{gameLogic.uiGameState === GameState.NEW && (
	<div
		className='gameOverlayFlicks'
		onClick={(e) => {
			e.stopPropagation(); 
			doGameStart();
		}}
	>
		<h1 className='newGameHeading'>Click to start playing</h1>
	</div>
)}

				{gameLogic.uiGameState === GameState.COMPLETE && (
					<div className='gameOverlayFlicks' onClick={doGameReset}>
						<h1 className='gameOverTitle'>Game over!</h1>

						<h3 className='gameOverScore'>
							You scored {gameLogic.uiScore} points
						</h3>

						<h3 className='gameOverAccuracy'>
							You had {gameLogic.uiClicks > 0
								? (100 * gameLogic.uiHits / gameLogic.uiClicks).toFixed(1)
								: 0}% accuracy
						</h3>

						<h3 className='gameOverResetText'>
							Click to reset
						</h3>
					</div>
				)}

			</div>

		</div>
	);
}