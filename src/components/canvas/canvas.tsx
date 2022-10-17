import styles from './canvas.module.css'
import React from "react";
import IPoint from "../../model/point";
import Line from "../../model/line";
import StateI from "../../model/state";

export default class Canvas extends React.Component{
    state:StateI = {
        firstNewLinePoint: null,
        secondNewLinePoint: null,
        startDraw: false,
        endDraw: false,
        lines: [],
        canvasRef:  null,
        context: null,
    }
    constructor(props:never) {
        super(props);
        this.state.canvasRef = React.createRef();
    }
    componentDidUpdate(prevState: StateI) {
        const createNewLine = this.state.firstNewLinePoint && this.state.secondNewLinePoint && this.state.startDraw;
        if(this.state.secondNewLinePoint !== prevState.secondNewLinePoint){
            if(createNewLine){
                this.state.context?.clearRect(0,0,600,600);
                this.renderStackLines()
                this.renderLine(this.state.firstNewLinePoint as IPoint,this.state.secondNewLinePoint as IPoint);
                this.renderPointsOfIntersection([...this.state.lines,[this.state.firstNewLinePoint as IPoint,this.state.secondNewLinePoint as IPoint]])
            }
            if(this.state.endDraw){
                this.state.lines = [...this.state.lines, [this.state.firstNewLinePoint as IPoint, this.state.secondNewLinePoint as IPoint]]
                this.state.firstNewLinePoint = null;
                this.state.endDraw = false;
            }
        }
    }
    componentDidMount() {
        this.setState({...this.state, context: this.state.canvasRef?.current?.getContext('2d')})
    }

    getPointOfIntersection(p1:IPoint, p2:IPoint, p3:IPoint, p4:IPoint):IPoint | null {
        const d:number = (p1.x - p2.x) * (p4.y - p3.y) - (p1.y - p2.y) * (p4.x - p3.x);
        const da:number = (p1.x - p3.x) * (p4.y - p3.y) - (p1.y - p3.y) * (p4.x - p3.x);
        const db:number = (p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x);

        const ta:number = da / d;
        const tb:number = db/ d;

        if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1)
        {
            const dx:number = p1.x + ta * (p2.x - p1.x);
            const dy:number = p1.y + ta * (p2.y - p1.y);

            return {x: dx, y:dy};
        }
        return null;
    }
    renderPointsOfIntersection(lines:Line[]):void{
        lines.forEach((line,index) => {
            lines.forEach((validateLine,validateIndex) =>{
                if(index !== validateIndex){
                    const data = this.getPointOfIntersection(line[0],line[1],validateLine[0],validateLine[1])
                    if(data){
                        this.state.context?.beginPath();
                        this.state.context?.arc(data.x,data.y,5,0,2 * Math.PI);
                        (this.state.context as  CanvasRenderingContext2D).strokeStyle = 'white';
                        (this.state.context as  CanvasRenderingContext2D).fillStyle = '#0085ff';
                        this.state.context?.fill()
                        this.state.context?.stroke();
                    }
                }
            })
        })
    }
    renderLine(point1:IPoint,point2:IPoint){
        this.state.context?.beginPath()
        this.state.context?.moveTo(point1.x,point1.y);
        this.state.context?.lineTo(point2.x,point2.y);
        (this.state.context as  CanvasRenderingContext2D).strokeStyle = 'white';
        this.state.context?.stroke();
    }
    renderStackLines(){
        this.state.lines.length && this.state.lines.forEach(line => this.renderLine(line[0],line[1]))
    }
    onStartDraw(x:number,y:number){
        this.setState({...this.state,startDraw: true,firstNewLinePoint: {x,y}})
    }
    onEndDraw(){
        this.setState({...this.state,endDraw: true,startDraw: false })
    }
    onCancelDraw(){
        this.state.context?.clearRect(0,0,600,600);
        this.renderStackLines();
        this.renderPointsOfIntersection(this.state.lines);
        this.setState({...this.state,startDraw: false,firstNewLinePoint: null})
    }
    onCollapseLines(){
        function getMiddlePoint(line:Line):IPoint{
            return {
                x: (line[0].x + line[1].x)/2,
                y: (line[0].y + line[1].y)/2
            }
        }
        function getCoordinates(line:Line){
            return {x: line[1].x - line[0].x,y: line[1].y - line[0].y}
        }
        function getSecondPoint(coordinates:IPoint,middlePoint:IPoint):IPoint{
            return {x:coordinates.x + middlePoint.x,y: coordinates.y + middlePoint.y}
        }
        const reset = setInterval(() => {
            this.state.context?.clearRect(0,0,600,600);
            this.setState({...this.state,
                lines: this.state.lines
                    .map((line,lineIndex) => {
                        const data = line.map((point,pointIndex) => {
                            const middlePoint = getMiddlePoint(line);
                            const halfLine = [middlePoint,point];
                            const halfCoordinates = getCoordinates(halfLine);
                            const setCoordinates = {x: halfCoordinates.x * 0.9,y: halfCoordinates.y * 0.9};
                            const setHalfSecondPoint = getSecondPoint(setCoordinates,middlePoint);
                            return setHalfSecondPoint;
                        })
                        return Math.abs(data[0].x - data[1].x) < 1 ? null : data;
                        // return data;
                    })
                    .filter(line => line !== null)
            })
            this.renderStackLines();
            this.renderPointsOfIntersection(this.state.lines);
            !this.state.lines.length && clearInterval(reset);
        } ,50)
    }
    render() {
        return (
            <>
                <canvas
                    onClick={({nativeEvent}) => !this.state.firstNewLinePoint ? this.onStartDraw(nativeEvent.offsetX, nativeEvent.offsetY) : this.onEndDraw()}
                    onMouseMove={({nativeEvent}) => this.setState({...this.state,
                        secondNewLinePoint : {
                        x: nativeEvent.offsetX,
                        y: nativeEvent.offsetY,
                    }})}
                    className={styles.canvas}
                    onContextMenu={event => {
                        event.preventDefault();
                        this.onCancelDraw()
                    }}
                    ref={this.state.canvasRef}
                    width={600}
                    height={400}
                />
                <button
                    onClick={() => this.onCollapseLines()}
                    className={styles.button}
                    children={'Collapse lines'}
                />
            </>
        )
    }
}