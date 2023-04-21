import {Card, Col, Row} from "react-bootstrap";
import styles from "@/styles/ScoreWidget.module.css";
import Image from "next/image";


/***
 * This component renders the current state of the game and the overall scores. NOTE
 * the Team records are hardcoded, didn't see that information in the JSON
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const GameStatus = (props) => {
    return (
        <Card className={styles.cardContainer}>
            <Row>
                <Col>
                    <div className={styles.currentScoreAway}>
                        <div className={styles.currentScoreAwayStats}>
                            <span>{props.gameData.awayTeam.last}</span>
                            <span>9-9,6-6 AWAY</span>
                        </div>
                        <Image
                            src="/barstoolIcon.png"
                            width="48"
                            height="48"
                            alt={"image"}
                            className={`rounded-circle ${styles.avatar}`}
                        ></Image>
                        <div className={styles.score}>{props.gameData.currentAwayScore}</div>
                    </div>
                </Col>
                <Col>
                    <div className={styles.currentGameState}>
                        {props.gameData.gameStatus}
                    </div>
                </Col>
                <Col>
                    <div className={styles.currentScoreAway}>
                        <div className={styles.score}>{props.gameData.currentHomeScore}</div>
                        <div className={styles.currentScoreAwayStats}>
                            <span>{props.gameData.homeTeam.last}</span>
                            <span>9-9,6-6 AWAY</span>
                        </div>
                        <Image
                            src="/barstoolIcon.png"
                            width="48"
                            height="48"
                            alt={"image"}
                            className={`rounded-circle ${styles.avatar}`}
                        ></Image>
                    </div>
                </Col>
            </Row>
        </Card>
    )
}


export default GameStatus;