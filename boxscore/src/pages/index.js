import ScoreWidget from "@/components/score-widget";
import {useState} from "react";
import styles from "../styles/ScoreWidget.module.css";

export default function Home() {

    const [sport, setSport] = useState('mlb')

    const onNBAClick = () => {
        setSport('nba');
    }
    const onMLBClick = () => {
        setSport('mlb');
    }


    return (
        <div>
            <div className={styles.sportsButtons}>
                <button type="button" className="btn btn-primary" onClick={onNBAClick}>NBA</button>
                <button type="button" className="btn btn-primary" onClick={onMLBClick}>MLB</button>
            </div>
            <ScoreWidget sport={sport}></ScoreWidget>
        </div>
    )


}
