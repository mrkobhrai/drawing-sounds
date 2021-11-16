import React, {useRef, useState} from "react";

interface Props {
    onMouseUpCallback: any,
}

interface Point {
    x: number,
    y: number,
    dragged: boolean,
}

const DrawingCanvas = (props: Props): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [points, setPoints] = useState<Point[]>([])
    const [drawing, setDrawing] = useState<boolean>(false)
    const [ignored, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const onMouseDown: React.MouseEventHandler = (e) => {
        let x, y
        if (e instanceof TouchEvent && e.changedTouches) {
            x = e.changedTouches[0].pageX
            y = e.changedTouches[0].pageY
        } else {
            x = e.pageX - canvasRef.current!.offsetLeft
            y = e.pageY - canvasRef.current!.offsetTop
        }
        points.push({x, y, dragged: false})
        setDrawing(true)
    }

    const onMouseUp = (e: any) => {
        console.log(points)
        props.onMouseUpCallback()
        setDrawing(false)
    }

    const onMouseMove = (e: any) => {
        if (drawing) {
            let x, y
            if (e instanceof TouchEvent && e.changedTouches) {
                x = e.changedTouches[0].pageX
                y = e.changedTouches[0].pageY
            } else {
                x = e.pageX - canvasRef.current!.offsetLeft
                y = e.pageY - canvasRef.current!.offsetTop
            }
            points.push({x, y, dragged: true})
            forceUpdate()
        }
    }
    const canvas = <canvas ref={canvasRef} id="drawingCanvas" onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
    </canvas>

    if (canvasRef.current && canvasRef.current.getContext('2d')) {
        const context = canvasRef.current!.getContext('2d')!
        context.beginPath()
        for (let i = 1; i < points.length; i+=1) {
            if (points[i].dragged) {
                context.moveTo(points[i-1].x, points[i-1].y)
                context.lineTo(points[i].x, points[i].y)
                context.stroke()
            }
        }
    }

    return canvas
}

export default DrawingCanvas
