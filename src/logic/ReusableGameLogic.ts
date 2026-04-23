import React, { useRef, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.tsx';

export const GameState = {
    NEW: 0,
    PLAYING: 1,
    COMPLETE: 2
}

export interface Target {
	id: number;
	xPos: number;
	yPos: number;
	spawnTime: number;
}

export class ReusableGameLogic
{
    private readonly CULL_TARGET_AGE: number = 4;
    private readonly BASE_POINTS_ON_HIT: number = 10;
    private readonly TARGET_PLACE_PERIOD: number = 2;
    private readonly TARGET_PLACE_ATTEMPTS: number = 5;
    private readonly TARGET_PLACE_BOUNDARY: number = 0.3;
    private readonly GAME_TIME: number = 30;
    private readonly TICK_PERIOD: number = 1000;

	private timeLeft: React.RefObject<number>;
	private clicks: React.RefObject<number>;
	private hits: React.RefObject<number>;
	private score: React.RefObject<number>;
	private gameState: React.RefObject<number>;
	private targets: React.RefObject<Target []>;
	private timerTicker: ReturnType<typeof setInterval>;
	private enableTargetCulling: boolean;

	public readonly uiTimeLeft
	private readonly setTimeLeft;
	public readonly uiClicks
	private readonly setClicks;
	public readonly uiHits
	private readonly setHits;
	public readonly uiScore
	private readonly setScore;
	public readonly uiGameState
	private readonly setGameState;
	public readonly uiTargets
	private readonly setTargets;

	private readonly user;
	private readonly leaderboardField: string;

    constructor(cullTargetAge: number, 
                basePointsOnHit: number,
                targetPlacePeriod: number,
                targetPlaceAttempts: number,
                targetPlaceBoundary: number,
                gameTime: number,
                tickPeriodMs: number,
                enableTargetCulling: boolean,
				user: any,
				leaderboardField: string)
    {
        this.CULL_TARGET_AGE = cullTargetAge;
        this.BASE_POINTS_ON_HIT = basePointsOnHit;
        this.TARGET_PLACE_PERIOD = targetPlacePeriod;
        this.TARGET_PLACE_ATTEMPTS = targetPlaceAttempts;
        this.TARGET_PLACE_BOUNDARY = targetPlaceBoundary;
        this.GAME_TIME = gameTime;
        this.TICK_PERIOD = tickPeriodMs;


        this.timeLeft = useRef(gameTime);
        this.clicks = useRef(-1); //-1 because first click to start game counts
        this.hits = useRef(0);
        this.score = useRef(0);
        this.gameState = useRef(GameState.NEW);
        this.targets = useRef<Target []>([]);
        this.timerTicker = -1;

        this.enableTargetCulling = enableTargetCulling;

		[this.uiTimeLeft, this.setTimeLeft] = useState<number>(this.timeLeft.current);
		[this.uiClicks, this.setClicks] = useState<number>(this.clicks.current);
		[this.uiHits, this.setHits] = useState<number>(this.hits.current);
		[this.uiScore, this.setScore] = useState<number>(this.score.current);
		[this.uiGameState, this.setGameState] = useState<number>(this.gameState.current);
		[this.uiTargets, this.setTargets] = useState<Target[]>(this.targets.current);

		this.user = user;
		this.leaderboardField = leaderboardField;
    }

    addTarget(xPos: number, yPos: number) 
    {
		console.log("New target at: " + xPos + ", " + yPos);
		const id = Math.random();
		const curTimeLeft = this.timeLeft.current;
		const newTarget = { id: id, xPos: xPos, yPos: yPos, spawnTime: curTimeLeft };
		
		const curTargets = this.targets.current;
		this.targets.current = [...curTargets, newTarget];
		this.setTargets(this.targets.current);
	}

    randomlyPlaceNewTarget()
    {
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
			for (const existingTarget of this.targets.current)
			{
				const sqrDistance = (xPos - existingTarget.xPos) ** 2 + (yPos - existingTarget.yPos) ** 2
				if (sqrDistance < this.TARGET_PLACE_BOUNDARY) { foundCandidate = false; continue; };
			}
			
		} while (attempts < this.TARGET_PLACE_ATTEMPTS && !foundCandidate);
		
		this.addTarget(xPos, yPos);
	}

    removeTarget(id: number)
    {
		this.targets.current = this.targets.current.filter(target => target.id !== id);
		this.setTargets(this.targets.current);
	}

    purgeTargets()
    {
		this.targets.current = [];
		this.setTargets(this.targets.current);
	}

    cullOldTargets()
    {
		const newTargetList = []
		let changesMade = false
		
		for (const target of this.targets.current)
		{
			const targetAge = target.spawnTime - this.timeLeft.current;
			if (targetAge < this.CULL_TARGET_AGE)
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
			this.targets.current = newTargetList;
			this.setTargets(this.targets.current);
		}
	}

    onTargetHit(targetID: number)
    {
		if (this.gameState.current !== GameState.PLAYING) { return; }
		
		console.log("Hit target");
		this.hits.current += 1;
		this.setHits(this.hits.current);
		this.removeTarget(targetID);
		
		//For now just add 10 points per hit, maybe score based upon how close to center later?
		this.score.current += this.BASE_POINTS_ON_HIT;
		this.setScore(this.score.current);
	}

    onGameClick()
    {
		if (this.gameState.current !== GameState.PLAYING) { return; }
		
		console.log('hit onGameClick');
		this.clicks.current += 1;
		this.setClicks(this.clicks.current);
	}

    doGameStart()
    {
		console.log("Game starting");
		// if timerTicker !== -1, then it has been assigned an ID through setInterval
		if (this.timerTicker !== -1)
		{
			clearInterval(this.timerTicker)
		}
		
		this.timerTicker = setInterval(() => {
			this.decrementTimer();
		}, this.TICK_PERIOD);
		
		this.gameState.current = GameState.PLAYING;
		this.setGameState(this.gameState.current);
	}

    doGameReset()
    {
		console.log("Game reset");
		this.timeLeft.current = this.GAME_TIME;
		this.setTimeLeft(this.timeLeft.current);
		this.clicks.current = -1;
		this.setClicks(this.clicks.current);
		this.score.current = 0;
		this.setScore(this.score.current);
		this.hits.current = 0;
		this.setHits(this.hits.current);
		this.purgeTargets();
		this.gameState.current = GameState.NEW;
		this.setGameState(this.gameState.current);
	}

    doGameEnd()
    {
		console.log("Game ended");
		this.purgeTargets();
		this.gameState.current = GameState.COMPLETE
		this.setGameState(this.gameState.current);
		this.submitScore();
	}

    async submitScore()
    {
		if (this.user)
		{
			console.log('made it into submitScore');
			// get current stored score to compare to the new one
			const docRef = doc(db, 'users', this.user.uid);
			const docSnap = await getDoc(docRef);
			const propName = this.leaderboardField;
			if(!docSnap.exists()){
				console.error('Could not get snapshot of document to upload data for flick game');
			}
			const data = docSnap.data();
			let savedScore = null;
			if(data){
				savedScore = data[propName as keyof typeof data];
			}

			// if there is a new high score, update the document
			if(this.score.current > savedScore){
				try {
					await updateDoc(docRef, {[propName]: this.score.current});
					alert('New high score of ' + this.score.current + ' has been saved!');
				} catch (error){
					console.error('Error updating score: ', error);
				}
			}
		}
	}

    decrementTimer()
    {
		this.timeLeft.current -= 1;
		this.setTimeLeft(this.timeLeft.current);
		
        if (this.enableTargetCulling)
        {
		    this.cullOldTargets();
        }
		
		if (this.timeLeft.current % this.TARGET_PLACE_PERIOD === 0)
		{
			this.randomlyPlaceNewTarget();
		}
		
		if (this.timeLeft.current <= 0)
		{
			clearInterval(this.timerTicker);
			this.doGameEnd();
		}
	}
}