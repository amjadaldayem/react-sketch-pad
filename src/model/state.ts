import IPoint from "./point";
import Line from "./line";
import React from "react";

interface StateI {
    firstNewLinePoint: IPoint | null;
    secondNewLinePoint: IPoint | null ;
    startDraw: boolean;
    endDraw: boolean ;
    lines: Line[] ;
    canvasRef: React.RefObject<HTMLCanvasElement> | null;
    context: CanvasRenderingContext2D | null | undefined ;
}

export default StateI;