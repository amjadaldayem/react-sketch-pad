import './App.css';
import styles from './paint.module.css'
import Canvas from "./components/canvas/canvas";
import React from "react";

export default class App extends React.Component{
    render (){
        return (
            <>
                <div className={styles.container}>
                    <Canvas/>
                </div>
            </>
        )}
}