import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.tsx';

import './Tracing.css';

import { TraceLogic } from '../logic/TraceLogic.ts';
import { GameState } from '../logic/ReusableGameLogic.ts';
import type { Target } from '../logic/ReusableGameLogic.ts';

const CULL_TARGET_AGE = 4;
const BASE_POINTS_ON_HIT = 1;
const TARGET_PLACE_PERIOD = 5;
const TARGET_PLACE_ATTEMPTS = 5;
const TARGET_PLACE_BOUNDARY = 1;
const GAME_TIME = 30;
const TICK_PERIOD = 70;//250;

export default function TraceGame() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const gameLogic = new TraceLogic(
		CULL_TARGET_AGE,
		BASE_POINTS_ON_HIT,
		TARGET_PLACE_PERIOD,
		TARGET_PLACE_ATTEMPTS,
		TARGET_PLACE_BOUNDARY,
		GAME_TIME,
		TICK_PERIOD,
		true,
		user!!,
		"trace_score",
		5,
		Math.PI / 8
	);

	const quitGame = () => {
		navigate('/mode');
	};

	const onTargetHit = (targetID: number) => {	
		console.log('OnTargetHit called with ' + targetID);
	};

	const doGameStart = () => {
		gameLogic.doGameStart();
	};

	const doGameReset = () => {
		gameLogic.doGameReset();
	};

	const onTargetHover = (target: Target) => {
		gameLogic.onTargetHover(target);
	};

	const onTargetUnhover = (target: Target) => {
		gameLogic.onTargetUnhover(target);
	};

	const onMouseDown = () => {
		
		gameLogic.onMouseDown();
	};

	const onMouseUp = () => {
		gameLogic.onMouseUp();
	};

	return (
		<div className='container font-roboto'>
			<div className='header'>
				<h3 className='arcadeTitle'>Aim Rivals</h3>
				<div className='headerButtonContainer'>
					<button className='arcadeTitle' id='quit-button' onClick={quitGame}>
						Quit Game
					</button>
				</div>
			</div>

			<div className='hudBar'>
				<span className='time'>
					Time: {Math.ceil(gameLogic.uiTimeLeft)}s
				</span>
				<span className='score'>
					Score: {gameLogic.uiScore}
				</span>
				<span className='hits'>
					Hits: {gameLogic.uiHits}
				</span>
			</div>

			<div
				className='gameContainerTrace'
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onMouseLeave={() => gameLogic.onMouseUp()}
			>
				<div className='targetContainerTrace'>
					{gameLogic.uiTargets.map((target) => (
						<div
							key={target.id}
							className= 'targetTrace'
							style={{
								left: `${target.xPos}%`,
								top: `${target.yPos}%`,
								transform: `translate(${target.xOffset}cqb, ${target.yOffset}cqb)`
						}}
						
							onPointerDown={(e) => {e.stopPropagation(); onTargetHit(target.id);

							}}
							onPointerEnter={() => onTargetHover(target)}
							onPointerLeave={() => onTargetUnhover(target)}
						/>
					))}
				</div>

				{gameLogic.uiGameState === GameState.NEW && (
					<div className='gameOverlayTrace' onClick={doGameStart}>
						<h1 className='newGameHeading'>
							Click to start playing
						</h1>
					</div>
				)}

				{gameLogic.uiGameState === GameState.COMPLETE && (
					<div className='gameOverlayTrace' onClick={doGameReset}>
						<h1 className='gameOverTitle'>Game over!</h1>

						<h3 className='gameOverScore'>
							You scored {gameLogic.uiScore} points
						</h3>

						<h3 className='gameOverAccuracy'>
							You had{' '}
							{gameLogic.uiClicks === 0
								? 0
								: Math.round(
										(100 * gameLogic.uiHits) /
											gameLogic.uiClicks
								  )}
							% accuracy
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