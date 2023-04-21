import {Card, Col, Row} from "react-bootstrap";
import styles from "@/styles/ScoreWidget.module.css";
import Table from "react-bootstrap/Table";
import Image from "next/image";

const Scoreboard=(props)=>{
    return(
        <Card className={styles.cardContainer}>
            <Row className={styles.tableStyles}>
                <Col xs={2} className={styles.teamNameTableColumn}>
                    <Table bordered size="sm">
                        <thead></thead>
                        <tbody>
                        <tr>
                            <td style={{ color: "white" }}>Filler</td>
                        </tr>
                        <tr>
                            <td className={styles.teamNames}>
                                <div className={styles.scoreLabel}>
                                    <Image
                                        src={"/barstoolIcon.png"}
                                        alt={"image"}
                                        width="20"
                                        height="20"
                                        className="rounded-circle"
                                    ></Image>
                                    {props.gameData.awayTeam.abbrev}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className={styles.teamNames}>
                                <div className={styles.scoreLabel}>
                                    <Image
                                        src={"/barstoolIcon.png"}
                                        alt={"image"}
                                        width="20"
                                        height="20"
                                        className="rounded-circle"
                                    ></Image>
                                    {props.gameData.homeTeam.abbrev}
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </Col>
                <Col className={styles.scoreTableColumn}>
                    <Table bordered hover size="sm" className={styles.scoreTable}>
                        <thead>
                        <tr>
                            {props.gameData.scoreHeaders.map((val, idx) => {
                                return <td key={idx}> {val}</td>;
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {props.gameData.awayScore.map((score, idx) => {
                                return <td key={idx}>{score}</td>;
                            })}
                        </tr>
                        <tr>
                            {props.gameData.homeScore.map((score, idx) => {
                                return <td key={idx}>{score}</td>;
                            })}
                        </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                {props.gameData.highlightPlayers.map((player, idx) => {
                    return (
                        <Col key={idx}>
                            <div className={styles.playerSummary}>
                                <Image
                                    src="/sportsAvatar.png"
                                    width="48"
                                    height="48"
                                    alt={"image"}
                                    className={`rounded-circle ${styles.avatar}`}
                                ></Image>
                                <div className={styles.playerSummaryStats}>
                                    <span>{player.status}</span>
                                    <span>{player.displayName}</span>
                                    <span>{player.statLine}</span>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
        </Card>
    )
}

export default  Scoreboard;