//import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// import { signOut } from 'firebase/auth';
// import { auth } from '../firebase.tsx';
//import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext.tsx';
//import SelectMode from './Mode';

import './Flicks.css';

import { GameState } from '../logic/ReusableGameLogic.ts';
import { ReactionLogic } from '../logic/ReactionLogic.ts';

const CULL_TARGET_AGE = 0.55;
const BASE_POINTS_ON_HIT = 10;
const TARGET_PLACE_PERIOD = 1;
const TARGET_PLACE_ATTEMPTS = 5;
const TARGET_PLACE_BOUNDARY = 0.3;
const GAME_TIME = 30;
const TICK_PERIOD = 100; //Needs to be fast so point allocation feels less discrete
const GRACE_PERIOD = 0.250;
const MIN_POINT_SCALE = 0.5;

export default function ReactionGame()
{
	// get current user for data storage purposes
	const { user } = useAuth();
	
	const navigate = useNavigate();
	
	if(user === null){
		console.error('User was null in reaction game mode');
		return;
	}

	const gameLogic = new ReactionLogic(CULL_TARGET_AGE, BASE_POINTS_ON_HIT, TARGET_PLACE_PERIOD, TARGET_PLACE_ATTEMPTS, TARGET_PLACE_BOUNDARY, GAME_TIME, TICK_PERIOD, true, user, "reaction_score", GRACE_PERIOD, MIN_POINT_SCALE);
	
	// const logout = () => {
	// 	// when it is recognized that the user is signed out, they are automatically sent to the login page
	// 	signOut(auth);
	// }
	
	const quitGame = () => {
		navigate('/mode');
	}
	
	const onTargetHit = (targetID: number) => {
		gameLogic.onTargetHit(targetID);
	}
	
	const onGameClick = () => {
		gameLogic.onGameClick();
	}
	
	const doGameStart = () => {
		gameLogic.doGameStart();
	}
	
	const doGameReset = () => {
		gameLogic.doGameReset();
	}
		
	return (
		<div className='container font-roboto'>
			<div className='pageHeader'>
				<h3 className='headerTitle'>Aim Rivals</h3>
				<div className='headerButtonContainer'>
					<button className='headerButton' id="quit-button" onClick={quitGame}>Quit Game</button>
				</div>
			</div>
			
			<div className='gameContainer' onClick={() => onGameClick()}>
				<div className='gameHeader'>
					<div className='gameHeaderText timeLeftText'>Time: {Math.ceil(gameLogic.uiTimeLeft)}s</div>
					<div className='gameHeaderText scoreText'>Score: {gameLogic.uiScore}</div>
					<div className='gameHeaderText hitsText'>Hits: {gameLogic.uiHits}</div>
				</div>
				<div className='targetContainer'>
					{gameLogic.uiTargets.map((target) => (
						<div key={target.id} className='target' style={{left: `${target.xPos}%`, top: `${target.yPos}%` }} onClick={() => onTargetHit(target.id)}></div>
					))}
				</div>
				
				{(gameLogic.uiGameState === GameState.NEW) && (
					<div className='gameOverlay newGameOverlay' onClick={doGameStart}>
						<h1 className='newGameHeading'>Click to start playing</h1>
					</div>
				)}
				
				{(gameLogic.uiGameState === GameState.COMPLETE) && (
					<div className='gameOverlay gameOverOverlay' onClick={doGameReset}>
						<h1 className='gameOverHeading'>Game over!</h1>
						<h3 className='gameOverScore'>You scored {gameLogic.uiScore} points</h3>
						<h3 className='gameOverAccuracy'>You had {(gameLogic.uiClicks > 0 ? 100 * gameLogic.uiHits / gameLogic.uiClicks : 0).toFixed(2)}% accuracy</h3>
						<h3 className='gameOverResetText'>Click to reset</h3>
					</div>
				)}
			</div>
		</div>
	);
}