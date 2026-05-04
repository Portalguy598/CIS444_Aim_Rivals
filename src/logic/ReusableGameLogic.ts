import React, { use, useRef, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.tsx';
import type { User } from 'firebase/auth';

export const GameState = {
    NEW: 0,
    PLAYING: 1,
    COMPLETE: 2
}

export interface Target {
	id: number;
	xPos: number;
	yPos: number;
	spawnTime:number;
	xOffset: number;
	yOffset: number;
	offsetAngle: number;

	hitCount?: number;

}

export class ReusableGameLogic
{
    protected readonly CULL_TARGET_AGE: number = 4;
    protected readonly BASE_POINTS_ON_HIT: number = 10;
    protected readonly TARGET_PLACE_PERIOD: number = 2;
    protected readonly TARGET_PLACE_ATTEMPTS: number = 5;
    protected readonly TARGET_PLACE_BOUNDARY: number = 600;
    protected readonly GAME_TIME: number = 30;
    protected readonly TICK_PERIOD: number = 1000;

	protected timeLeft: React.RefObject<number>;
	protected clicks: React.RefObject<number>;
	protected hits: React.RefObject<number>;
	protected score: React.RefObject<number>;
	protected gameState: React.RefObject<number>;
	protected targets: React.RefObject<Target []>;
	protected timerTicker: ReturnType<typeof setInterval>;
	protected lastTargetPlaceTime: React.RefObject<number>;
	protected enableTargetCulling: boolean;
	protected mouseX: React.RefObject<number>;
	protected mouseY: React.RefObject<number>;

	public readonly uiTimeLeft
	protected readonly setTimeLeft;
	public readonly uiClicks
	protected readonly setClicks;
	public readonly uiHits
	protected readonly setHits;
	public readonly uiScore
	protected readonly setScore;
	public readonly uiGameState
	protected readonly setGameState;
	public readonly uiTargets
	protected readonly setTargets;

	protected readonly user;
	protected readonly leaderboardField: string;

    constructor(cullTargetAge: number, 
                basePointsOnHit: number,
                targetPlacePeriod: number,
                targetPlaceAttempts: number,
                targetPlaceBoundary: number,
                gameTime: number,
                tickPeriodMs: number,
                enableTargetCulling: boolean,
				user: User,
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
        this.clicks = useRef(0);
        this.hits = useRef(0);
        this.score = useRef(0);
        this.gameState = useRef(GameState.NEW);
        this.targets = useRef<Target []>([]);
        this.timerTicker = -1;
		this.lastTargetPlaceTime = useRef(Number.MAX_VALUE);
		this.mouseX = useRef(0);
		this.mouseY = useRef(0);

        this.enableTargetCulling = enableTargetCulling;

		[this.uiTimeLeft, this.setTimeLeft] = useState<number>(this.timeLeft.current);
		[this.uiClicks, this.setClicks] = useState<number>(this.clicks.current);
		[this.uiHits, this.setHits] = useState<number>(this.hits.current);
		[this.uiScore, this.setScore] = useState<number>(this.score.current);
		[this.uiGameState, this.setGameState] = useState<number>(this.gameState.current);
		[this.uiTargets, this.setTargets] = useState<Target[]>(this.targets.current);

		this.user = user;
		this.leaderboardField = leaderboardField;

		window.addEventListener('mousemove', (event) => {
  			this.mouseX.current = event.clientX;
			this.mouseY.current = event.clientY;
		});
    }

    addTarget(xPos: number, yPos: number) 
    {
		//console.log("New target at: " + xPos + ", " + yPos);
		const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		const curTimeLeft = this.timeLeft.current;
		const angle = Math.random() * Math.PI * 2;
		const newTarget = { id: id, xPos: xPos, yPos: yPos, spawnTime: curTimeLeft, xOffset: 0, yOffset: 0, offsetAngle: angle };
		

		const curTargets = this.targets.current;
		this.targets.current = [...curTargets, newTarget];
		this.setTargets(this.targets.current);
	}

	positionWithinBounds(proposedX: number, proposedY: number, margin: number)
	{
		const maxX = 100 - margin;
		const minX = margin;

		const maxY = 100 - margin;
		const minY = margin;

		//console.log(`dbg: propX = ${proposedX} propY = ${proposedY}`)

		if (proposedX < minX || proposedX > maxX) { return false; }
		if (proposedY < minY || proposedY > maxY) { return false; }

		return true;
	}

    randomlyPlaceNewTarget()
    {
		//console.log("Placing target");
		let xPos: number = 0.5;
		let yPos: number  = 0.5;
		
		let foundCandidate: boolean = false;
		let attempts = 0;
		do
		{
			xPos = 100 * (Math.random() * 0.95) + 0.1; // range between 5% and 95%
			yPos = 100 * (Math.random() * 0.95) + 0.1;
			foundCandidate = true;
			
			//Check if overlapping with existing target. Retry up to five times
			for (const existingTarget of this.targets.current)
			{
				const sqrDistance = (xPos - existingTarget.xPos) ** 2 + (yPos - existingTarget.yPos) ** 2
				if (sqrDistance < this.TARGET_PLACE_BOUNDARY) { foundCandidate = false; continue; };
				//console.log(`dst: ${sqrDistance}`);
			}

			++attempts;
		} while (attempts < this.TARGET_PLACE_ATTEMPTS && !foundCandidate);
		
		if (foundCandidate)
		{
			this.addTarget(xPos, yPos);
			this.lastTargetPlaceTime.current = this.timeLeft.current;
		}
		else
		{
			console.log("WARNING: Failed to find a valid place to spawn a target within the alloted amount of attempts");
		}
	}

    removeTarget(id: number)
    {
		this.targets.current = this.targets.current.filter(target => target.id !== id);
		this.setTargets(this.targets.current);

		//console.log("dbg: removed target with id " + id);
	}

    purgeTargets()
    {
		this.targets.current = [];
		this.setTargets(this.targets.current);
	}

	targetFromId(targetId: number): Target | undefined
	{
		return this.targets.current.find(target => target.id === targetId);
	}

	calculateBullseyeOffset(target: Target): number //1.0 is a complete miss, 0.0 is a dead on bullseye 
	{
		if (target == null) { return 1.0; } // Target DNE, call it a miss

		const targetElement = document.getElementById(target.id.toString())
		if (targetElement == null) { console.log(`WARNING: Backing field for target ${target.id} exists but element itself did not?`); return 1.0; }

		const hitbox = targetElement.getBoundingClientRect();
		const hitboxRadius = hitbox.width / 2;
		const hitboxXCenter = (hitboxRadius) + hitbox.x;
		const hitboxYCenter = (hitboxRadius) + hitbox.y;

		const distance = Math.sqrt((hitboxXCenter - this.mouseX.current) ** 2 + (hitboxYCenter - this.mouseY.current) ** 2)
		//console.log(`dbg: mouseX: ${this.mouseX.current} mouseY: ${this.mouseY.current} hitboxXCenter: ${hitboxXCenter} hitboxYCenter: ${hitboxYCenter} distance: ${distance}`)

		if (distance >= hitboxRadius) { return 1.0; }

		return distance / hitboxRadius;
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
				//console.log("dbg: culled target with id " + target.id);
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
		
		//console.log("Hit target");
		this.hits.current += 1;
		this.setHits(this.hits.current);
		
		const target = this.targetFromId(targetID);
		let accuracyScale = 1;

		if (target != null)
		{
			accuracyScale = 1 - this.calculateBullseyeOffset(target);
		}
		else
		{
			console.log("WARNING: Could not find target from ID in onTargetHit");
		}
		
		this.score.current += Math.ceil(this.BASE_POINTS_ON_HIT * accuracyScale);
		this.setScore(this.score.current);
		//console.log(`Updated score to ${this.score.current} with accuracyScale of ${accuracyScale}`);

		this.removeTarget(targetID);
	}

    onGameClick()
    {
		if (this.gameState.current !== GameState.PLAYING) { return; }
		
		//console.log('hit onGameClick');
		this.clicks.current += 1;
		this.setClicks(this.clicks.current);
	}

    doGameStart()
    {
		//console.log("Game starting");
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
		//console.log("Game reset");
		this.timeLeft.current = this.GAME_TIME;
		this.setTimeLeft(this.timeLeft.current);
		this.clicks.current = 0;
		this.setClicks(this.clicks.current);
		this.score.current = 0;
		this.setScore(this.score.current);
		this.hits.current = 0;
		this.setHits(this.hits.current);
		this.purgeTargets();
		this.gameState.current = GameState.NEW;
		this.setGameState(this.gameState.current);
		this.lastTargetPlaceTime.current = Number.MAX_VALUE;
	}

    doGameEnd()
    {
		//console.log("Game ended");
		this.purgeTargets();
		this.gameState.current = GameState.COMPLETE
		this.setGameState(this.gameState.current);
		this.submitScore(this.score.current.valueOf());
	}

    async submitScore(newScore: number)
    {
		if (this.user)
		{
			//console.log('made it into submitScore');
			// get current stored score to compare to the new one
			const docRef = doc(db, 'users', this.user.uid);
			const docSnap = await getDoc(docRef);
			const propName = this.leaderboardField;
			if(!docSnap.exists()){
				console.error('Could not get snapshot of document to upload data for game');
			}
			const data = docSnap.data();
			let savedScore = null;
			if(data){
				savedScore = data[propName as keyof typeof data];
			}

			// if there is a new high score, update the document
			if(newScore > savedScore){
				try {
					await updateDoc(docRef, {[propName]: newScore});
					alert('New high score of ' + newScore + ' has been saved!');
				} catch (error){
					console.error('Error updating score: ', error);
				}
			}
		}
	}

    decrementTimer()
    {
		this.preTimerDecrementHook()

		this.timeLeft.current -= (this.TICK_PERIOD / 1000);
		this.setTimeLeft(this.timeLeft.current);

		this.preTargetCullHook()
		
        if (this.enableTargetCulling)
        {
		    this.cullOldTargets();
        }

		this.preTargetPlaceHook()
		
		if (this.lastTargetPlaceTime.current - this.timeLeft.current > this.TARGET_PLACE_PERIOD)
		{
			this.randomlyPlaceNewTarget();
		}

		this.postTargetPlaceHook()
		
		if (this.timeLeft.current <= 0)
		{
			clearInterval(this.timerTicker);
			this.doGameEnd();
		}
	}

	preTimerDecrementHook()
	{
		return //Used to call logic defined by derived types
	}

	preTargetCullHook()
	{
		return //Used to call logic defined by derived types
	}

	preTargetPlaceHook()
	{
		return //Used to call logic defined by derived types
	}

	postTargetPlaceHook()
	{
		return //Used to call logic defined by derived types
	}
}