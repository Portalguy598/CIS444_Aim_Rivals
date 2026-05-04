import React, { useRef } from 'react';

import { ReusableGameLogic, GameState } from './ReusableGameLogic.ts';
import type { Target } from './ReusableGameLogic.ts';
import type { User } from 'firebase/auth';

export class TraceLogic extends ReusableGameLogic
{
    protected readonly TARGET_STRIDE: number = 5;
    protected readonly MAX_ANGLE_DELTA: number = Math.PI / 8;

    protected hoveredTarget: React.RefObject<Target | null>;
    protected isMouseDown: React.RefObject<boolean>;

    constructor(
        cullTargetAge: number,
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
        maxAngleDelta: number
    )
    {
        super(
            cullTargetAge,
            basePointsOnHit,
            targetPlacePeriod,
            targetPlaceAttempts,
            targetPlaceBoundary,
            gameTime,
            tickPeriodMs,
            enableTargetCulling,
            user,
            leaderboardField
        );

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
        if (this.gameState.current !== GameState.PLAYING)
        {
            this.isMouseDown.current = false;
            return;
        }

        this.isMouseDown.current = false;
    }

    onTargetHover(target: Target)
    {
        this.hoveredTarget.current = target;
    }

    onTargetUnhover(target: Target)
    {
        if (this.hoveredTarget.current?.id === target.id)
        {
            this.hoveredTarget.current = null;
        }
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

        
        const accuracyScale = 1 - this.calculateBullseyeOffset(this.hoveredTarget.current);
        const calculatedPoints = Math.ceil(this.BASE_POINTS_ON_HIT * accuracyScale);

        this.score.current += calculatedPoints;
		this.setScore(this.score.current);

        //console.log(`dbg: added points for hovered target w/ id ${this.hoveredTarget.current.id}. Accuracy scale was ${accuracyScale}`)
    }

    moveTargets()
    {
        const newTargetList = [];

        for (const target of this.targets.current)
        {
            let xDelta = 0;
            let yDelta = 0;
            let attempts = 0;
            let valid = false;

            do
            {
                let newAngle =
                    target.offsetAngle +
                    (Math.random() * this.MAX_ANGLE_DELTA - this.MAX_ANGLE_DELTA / 2);

                newAngle = this.clampRadians(newAngle);
                target.offsetAngle = newAngle;

                xDelta = Math.cos(newAngle) * this.TARGET_STRIDE;
                yDelta = Math.sin(newAngle) * this.TARGET_STRIDE;

                valid = this.positionWithinBounds(
                    target.xPos + target.xOffset + xDelta,
                    target.yPos + target.yOffset + yDelta,
                    3
                );

                if (!valid)
                {
                    newAngle += Math.PI / 2;
                    target.offsetAngle = this.clampRadians(newAngle);
                }

                attempts++;
            }
            while (attempts <= this.TARGET_PLACE_ATTEMPTS && !valid);

            if (valid)
            {
                target.xOffset += xDelta;
                target.yOffset += yDelta;
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
        if (
            this.hoveredTarget.current &&
            !this.targets.current.includes(this.hoveredTarget.current)
        )
        {
            this.hoveredTarget.current = null;
        }

        this.moveTargets();
    }

    clampRadians(angle: number)
    {
        if (angle > Math.PI * 2) angle -= Math.PI * 2;
        if (angle < 0) angle += Math.PI * 2;
        return angle;
    }
}