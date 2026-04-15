import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase.tsx';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext.tsx';
import SelectMode from './Mode';

import './Flicks.css';

const CULL_TARGET_AGE = 4;
const BASE_POINTS_ON_HIT = 10;
const TARGET_PLACE_PERIOD = 2;
const TARGET_PLACE_ATTEMPTS = 5;
const TARGET_PLACE_BOUNDARY = 0.3;
const GAME_TIME = 30;
const TICK_PERIOD = 1000;

// use object in place of enum
const GameState = {
	NEW: 0,
	PLAYING: 1,
	COMPLETE: 2
}

interface Target {
	id: number;
	xPos: number;
	yPos: number;
	spawnTime: number;
}

export default function FlicksGame()
{
	// get current user for data storage purposes
	const { user } = useAuth();
	
	const navigate = useNavigate();
	
	let timeLeft = useRef(GAME_TIME);
	let clicks = useRef(-1); //-1 because first click to start game counts
	let hits = useRef(0);
	let score = useRef(0);
	let gameState = useRef(GameState.NEW);
	let targets = useRef<Target []>([]);
	
	const [uiTimeLeft, setTimeLeft] = useState<number>(timeLeft.current);
	const [uiClicks, setClicks] = useState<number>(clicks.current);
	const [uiHits, setHits] = useState<number>(hits.current);
	const [uiScore, setScore] = useState<number>(score.current);
	const [uiGameState, setGameState] = useState<number>(gameState.current);
	const [uiTargets, setTargets] = useState<Target[]>(targets.current);
	
	// setInterval never returns a -1, so -1 will take the place of null
	let timerTicker: ReturnType<typeof setInterval> = -1;
	
	const addTarget = (xPos: number, yPos: number) => {
		console.log("New target at: " + xPos + ", " + yPos);
		const id = Math.random();
		const curTimeLeft = timeLeft.current;
		const newTarget = { id: id, xPos: xPos, yPos: yPos, spawnTime: curTimeLeft };
		
		const curTargets = targets.current;
		targets.current = [...curTargets, newTarget];
		setTargets(targets.current);
	}
	
	const randomlyPlaceNewTarget = () => {
		console.log("Placing target");
		let xPos: number = 0.5;
		let yPos: number  = 0.5;
		
		let foundCandidate: boolean = false;
		let attempts = 0;
		do
		{
			xPos = 100 * (Math.random() * 0.8) + 0.1; // range between 10% and 90%
			yPos = 100 * (Math.random() * 0.8) + 0.1;
			foundCandidate = true;
			
			//Check if overlapping with existing target. Retry up to five times
			for (const existingTarget of targets.current)
			{
				const sqrDistance = (xPos - existingTarget.xPos) ** 2 + (yPos - existingTarget.yPos) ** 2
				if (sqrDistance < TARGET_PLACE_BOUNDARY) { foundCandidate = false; continue; };
			}
			
		} while (attempts < TARGET_PLACE_ATTEMPTS && !foundCandidate);
		
		addTarget(xPos, yPos);
	}
	
	const removeTarget = (id: number) => {
		targets.current = targets.current.filter(target => target.id !== id);
		setTargets(targets.current);
	}
	
	const purgeTargets = () => {
		targets.current = [];
		setTargets(targets.current);
	}
	
	const cullOldTargets = () => {
		const newTargetList = []
		let changesMade = false
		
		for (const target of targets.current)
		{
			const targetAge = target.spawnTime - timeLeft.current;
			if (targetAge < CULL_TARGET_AGE)
			{
				newTargetList.push(target); //Keep this target
			}
			else
			{
				changesMade = true;
			}
		}
		
		if (changesMade)
		{
			targets.current = newTargetList;
			setTargets(targets.current);
		}
	}
	
	const logout = () => {
		// when it is recognized that the user is signed out, they are automatically sent to the login page
		signOut(auth);
	}
	
	const openSettings = () => {
		console.log('TODO open settings');
	}
	
	const quitGame = () => {
		navigate('/mode');
	}
	
	const onTargetHit = (targetID: number) => {
		if (gameState.current !== GameState.PLAYING) { return; }
		
		console.log("Hit target");
		hits.current += 1;
		setHits(hits.current);
		removeTarget(targetID);
		
		//For now just add 10 points per hit, maybe score based upon how close to center later?
		score.current += BASE_POINTS_ON_HIT;
		setScore(score.current);
	}
	
	const onGameClick = () => {
		if (gameState.current !== GameState.PLAYING) { return; }
		
		console.log('hit onGameClick');
		clicks.current += 1;
		setClicks(clicks.current);
	}
	
	const doGameStart = () => {
		console.log("Game starting");
		// if timerTicker !== -1, then it has been assigned an ID through setInterval
		if (timerTicker !== -1)
		{
			clearInterval(timerTicker)
		}
		
		timerTicker = setInterval(() => {
			decrementTimer();
		}, TICK_PERIOD);
		
		gameState.current = GameState.PLAYING;
		setGameState(gameState.current);
	}
	
	const doGameReset = () => {
		console.log("Game reset");
		timeLeft.current = GAME_TIME;
		setTimeLeft(timeLeft.current);
		clicks.current = -1;
		setClicks(clicks.current);
		score.current = 0;
		setScore(score.current);
		hits.current = 0;
		setHits(hits.current);
		purgeTargets();
		gameState.current = GameState.NEW;
		setGameState(gameState.current);
	}
	
	const doGameEnd = () => {
		console.log("Game ended");
		purgeTargets();
		gameState.current = GameState.COMPLETE
		setGameState(gameState.current);
		submitScore();
	}
	
	const submitScore = async () => {
		if(user){
			console.log('made it into submitScore');
			// get current stored score to compare to the new one
			const docRef = doc(db, 'users', user.uid);
			const docSnap = await getDoc(docRef);
			if(!docSnap.exists()){
				console.error('Could not get snapshot of document to upload data for flick game');
			}
			const data = docSnap.data();
			let savedScore = null;
			if(data){
				savedScore = data.flick_score;
			}

			// if there is a new high score, update the document
			if(score.current > savedScore){
				try {
					await updateDoc(docRef, {flick_score: score.current});
					alert('New high score of ' + score.current + ' has been saved!');
				} catch (error){
					console.error('Error updating score: ', error);
				}
			}
		}
	}
	
	const decrementTimer = () => {
		timeLeft.current -= 1;
		setTimeLeft(timeLeft.current);
		
		cullOldTargets();
		
		if (timeLeft.current % TARGET_PLACE_PERIOD === 0)
		{
			randomlyPlaceNewTarget();
		}
		
		if (timeLeft.current <= 0)
		{
			clearInterval(timerTicker);
			doGameEnd();
		}
	}
		
	return (
		<div className='container font-roboto'>
			<div className='pageHeader'>
				<h3 className='headerTitle'>Aim Rivals</h3>
				<div className='headerButtonContainer'>
					<button className='headerButton' id="quit-button" onClick={quitGame}>Quit Game</button>
					<button className='headerButton' id="settings-button" onClick={openSettings}>Settings</button>
				</div>
			</div>
			
			<div className='gameContainer' onClick={() => onGameClick()}>
				<div className='gameHeader'>
					<div className='gameHeaderText timeLeftText'>Time: {uiTimeLeft}s</div>
					<div className='gameHeaderText scoreText'>Score: {uiScore}</div>
					<div className='gameHeaderText hitsText'>Hits: {uiHits}</div>
				</div>
				<div className='targetContainer'>
					{uiTargets.map((target) => (
						<div key={target.id} className='target' style={{left: `${target.xPos}%`, top: `${target.yPos}%` }} onClick={() => onTargetHit(target.id)}></div>
					))}
				</div>
				
				{(uiGameState === GameState.NEW) && (
					<div className='gameOverlay newGameOverlay' onClick={doGameStart}>
						<h1 className='newGameHeading'>Click to start playing</h1>
					</div>
				)}
				
				{(uiGameState === GameState.COMPLETE) && (
					<div className='gameOverlay gameOverOverlay' onClick={doGameReset}>
						<h1 className='gameOverHeading'>Game over!</h1>
						<h3 className='gameOverScore'>You scored {uiScore} points</h3>
						<h3 className='gameOverAccuracy'>You had {uiClicks > 0 ? 100 * uiHits / uiClicks : 0}% accuracy</h3>
						<h3 className='gameOverResetText'>Click to reset</h3>
					</div>
				)}
			</div>
		</div>
	);
}