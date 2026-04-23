import React, { useRef } from 'react';

import { ReusableGameLogic, GameState } from './ReusableGameLogic.ts';
import type { Target } from './ReusableGameLogic.ts'
import type { User } from 'firebase/auth';
import { last } from 'firebase/firestore/pipelines';

export class TraceLogic extends ReusableGameLogic
{
    protected readonly TARGET_STRIDE: number = 5;
    protected readonly MAX_ANGLE_DELTA: number = Math.PI / 8; //22.5 degrees

    protected hoveredTarget: React.RefObject<Target | null>;
    protected isMouseDown: React.RefObject<boolean>;

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
                targetStride: number,
                maxAngleDelta: number)
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

        this.hoveredTarget = useRef(null);
        this.isMouseDown = useRef(false);
        this.TARGET_STRIDE = targetStride;
        this.MAX_ANGLE_DELTA = maxAngleDelta;
    }

    onMouseDown()
    {
        this.isMouseDown.current = true;
    }

    onMouseUp()
    {
        this.isMouseDown.current = false;
    }

    onTargetHover(target: Target)
    {
        this.hoveredTarget.current = target
    }

    onTargetUnhover(target: Target)
    {
        if (this.hoveredTarget.current === null) { return; }
        if (this.hoveredTarget.current !== target) { return; }

        this.hoveredTarget.current = null;
    }

    calculateHoverPoints()
    {
        if (this.gameState.current !== GameState.PLAYING) { return; }

        if (!this.isMouseDown.current) { return; }

        this.clicks.current += 1;
        this.setClicks(this.clicks.current);

        if (this.hoveredTarget.current != null)
        {
            this.hits.current += 1;
		    this.setHits(this.hits.current);
        }
        else
        {
            return;
        }

        
        let accuracyScale = 1;
        //TODO scale points according to how close the cursor is to the center of the target
        const calculatedPoints = this.BASE_POINTS_ON_HIT * accuracyScale;

        this.score.current += calculatedPoints;
		this.setScore(this.score.current);

        console.log("dbg: added points for hovered target w/ id " + this.hoveredTarget.current.id)
    }

    moveTargets()
	{
        const newTargetList = []
		for (const target of this.targets.current)
		{
            let xDelta = 0;
            let yDelta = 0;
            let attempts = 0;
            let lastAttemptGood = false;
            do
            {
                //Random new angle within bounds of MAX_ANGLE_DELTA, bound between 0 and 2PI radians
                xDelta = 0;
                yDelta = 0;

                let newAngle = target.offsetAngle + ((Math.random() * this.MAX_ANGLE_DELTA) - (this.MAX_ANGLE_DELTA / 2))
                newAngle = this.clampRadians(newAngle);
                target.offsetAngle = newAngle;

                yDelta = Math.sin(newAngle) * this.TARGET_STRIDE;
                xDelta = Math.cos(newAngle) * this.TARGET_STRIDE;

                lastAttemptGood = this.positionWithinBounds(target.xPos + target.xOffset + xDelta, target.yPos + target.yOffset + yDelta, 0);

                //If last attempt went out of bounds, turn 90 degrees to try and steer away from the wall 
                if (!lastAttemptGood)
                {
                    newAngle += Math.PI / 2;
                    newAngle = this.clampRadians(newAngle);
                    target.offsetAngle = newAngle;
                }

                ++attempts;
            } while (attempts <= this.TARGET_PLACE_ATTEMPTS && !lastAttemptGood)

            if (this.positionWithinBounds(target.xPos + target.xOffset + xDelta, target.yPos + target.yOffset + yDelta, 0))
            {
                target.xOffset += xDelta;
                target.yOffset += yDelta;
                console.log("dbg: accepted pos");
            }
            else
            {
                console.log(`Rejected position after ${attempts} attempts`);
            }

            newTargetList.push(target);
		}

        this.targets.current = newTargetList;
        this.setTargets(this.targets.current);
	}

    doGameReset()
    {
		super.doGameReset();
        this.hoveredTarget.current = null;
		this.isMouseDown.current = false;
	}

    preTargetCullHook()
    {
        this.calculateHoverPoints();
    }

    preTargetPlaceHook()
    {
        //This hook runs right after targets are culled and right before a new target is potentially placed
        //Stop awarding points if user keeps holding mouse 1 on a target which has been culled
        if (this.hoveredTarget.current != null)
        {
            if (!this.targets.current.includes(this.hoveredTarget.current))
            {
                console.log("Unhovering target with id " + this.hoveredTarget.current.id);
                this.hoveredTarget.current = null;
            }
            else
            {
                console.log("Did not find expired target to unhover");
            }
        }

        this.moveTargets();
    }

    clampRadians(angle: number)
    {
        if (angle > (Math.PI * 2)) { angle -= (Math.PI * 2)}
        else if (angle < 0) { angle += (Math.PI * 2)}
        return angle
    }
}