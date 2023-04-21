import styles from "../styles/ScoreWidget.module.css";
import Container from "react-bootstrap/Container";
import {useEffect, useState} from "react";
import {gameState, mapData} from "@/utils/utils";
import GameStatus from "@/components/game-status";
import Scoreboard from "@/components/scoreboard";
import TeamStats from "@/components/team-stats";

const ScoreWidget = (props) => {
    // The state used to generate all the details in the template
    const [gameData, setGameData] = useState({game: gameState});

    /***
     *Takes the JSON and maps it to a more generic format that is
     * easier to display
     * @param response the JSON response from the server
     */
    const processCall = (response) => {
        const data = mapData(props.sport, response);
        setGameData(prevState => {
            return {...prevState, game: data}
        });
    };

    /***
     * Make call to backend to update data
     */
    const updateData = () => {
        fetch(`http://localhost:5000/${props.sport}`)
            .then((res) => res.json())
            .then((response) => processCall(response))
            .catch(err => console.log(`ERROR FETCHING DATA${err}`))
    };

    /**
     * Call updateData once to get initial data, then every 15 seconds, clean up function when closed
     */
    useEffect(() => {
        updateData();
        let interval = setInterval(() => updateData(), 15000);
        return () => {
            clearInterval(interval);
        };
    }, [props.sport]);


    /***
     * The idea is to have a generic template that most sports would line up with, a Status, a Scoreboard
     * and highlighted team stats. This template can be followed for any sport as long as the data is mapped
     * into a gameState object
     */
    return (
        <div className={styles.rootContainer}>
            <Container className={styles.container}>
                <GameStatus gameData={gameData.game}></GameStatus>
                <Scoreboard gameData={gameData.game}></Scoreboard>
                <TeamStats gameData={gameData.game}></TeamStats>
            </Container>
        </div>
    );
};

export default ScoreWidget;
