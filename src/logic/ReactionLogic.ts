//import React, { useRef } from 'react';

import { ReusableGameLogic, GameState } from './ReusableGameLogic.ts';
//import type { Target } from './ReusableGameLogic.ts'
import type { User } from 'firebase/auth';
//import { last } from 'firebase/firestore/pipelines';

export class ReactionLogic extends ReusableGameLogic
{
    private readonly REACTION_GRACE_PERIOD: number = 0.250
    private readonly SLOW_REACTION_POINT_SCALAR: number = 0.5 //User gets this multiplied to the base points if they click at the last possible moment
    private readonly INTERP_SLOPE: number = 0.5;
    private readonly INTERP_YINT: number = 1.25;

    constructor(cullTargetAge: number, 
                basePointsOnHit: number,
                targetPlacePeriod: number,
                targetPlaceAttempts: number,
                targetPlaceBoundary: number,
                gameTime: number,
                tickPeriodMs: number,
                enableTargetCulling: boolean,
				user: User,
				leaderboardField: string,
                reactionGracePeriod: number,
                slowReactionPointScalar: number)
    {
        super(cullTargetAge, 
                basePointsOnHit,
                targetPlacePeriod,
                targetPlaceAttempts,
                targetPlaceBoundary,
                gameTime,
                tickPeriodMs,
                enableTargetCulling,
				user,
				leaderboardField);

        this.REACTION_GRACE_PERIOD = reactionGracePeriod;
        this.SLOW_REACTION_POINT_SCALAR = slowReactionPointScalar;

        this.INTERP_SLOPE = -1 * (1.0 - this.SLOW_REACTION_POINT_SCALAR) / (this.CULL_TARGET_AGE - this.REACTION_GRACE_PERIOD);
        this.INTERP_YINT = (-1 * this.INTERP_SLOPE * this.CULL_TARGET_AGE) + this.SLOW_REACTION_POINT_SCALAR;
    }

    onTargetHit(targetID: number): void 
    {
        if (this.gameState.current !== GameState.PLAYING) { return; }
		
		//console.log("Hit target");

		this.hits.current += 1;
		this.setHits(this.hits.current);

        this.clicks.current += 1;
        this.setClicks(this.clicks.current);

		
		//Adjust score depending on how fast they clicked
        const targetObj = this.targetFromId(targetID);
        

        if (targetObj != null)
        {
            const targetAge = targetObj.spawnTime - this.timeLeft.current;
            const calculatedScore = this.BASE_POINTS_ON_HIT * this.interpPointScale(targetAge);
            //console.log(`calc'd score: ${calculatedScore}`);
            this.score.current += Math.floor(calculatedScore);
            this.setScore(this.score.current);
        }

        else
        {
            console.log("ERROR: Could not get target reference to determine age for scoring!");
        }

        this.removeTarget(targetID); //Move target removal after score calc to prevent nullref
    }

    interpPointScale(targetAge: number): number
    {
        let scalar = (this.INTERP_SLOPE * targetAge) + this.INTERP_YINT;
        //console.log(`DBG: Raw scalar: ${scalar}`);
        if (scalar > 1.0) { scalar = 1.0; }
        else if (scalar < this.SLOW_REACTION_POINT_SCALAR) { scalar = this.SLOW_REACTION_POINT_SCALAR; }

        return scalar;
    }
}