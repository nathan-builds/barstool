import {Card, Col, Row} from "react-bootstrap";
import styles from "@/styles/ScoreWidget.module.css";
import Image from "next/image";
import Table from "react-bootstrap/Table";

/***
 * This component displays each of the teams player stats, is generic again as long
 * as data is formatted correctly for the sport
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const TeamStats=(props)=>{
    return(
        <Card className={styles.cardContainer}>
            <Row>
                <Col className={styles.tableCol}>
                    <div className={styles.tableTeamNames}>
                        <Image
                            src={"/barstoolIcon.png"}
                            alt={"image"}
                            width="32"
                            height="32"
                            class="rounded-circle"
                        ></Image>
                        {props.gameData.homeTeam.abbrev}
                    </div>
                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            {props.gameData.statColumnHeaders.map((columnHeader, idx) => {
                                return <th key={idx}>{columnHeader}</th>;
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {props.gameData.awayStats.map((stats, idx) => {
                            return (
                                <tr key={idx}>
                                    {stats.map((val, idx) => {
                                        return <td key={idx}>{val}</td>;
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Col>
                <Col className={styles.tableCol}>
                    <div>
                        <div className={styles.tableTeamNames}>
                            <Image
                                src={"/barstoolIcon.png"}
                                alt={"image"}
                                width="32"
                                height="32"
                                class="rounded-circle"
                            ></Image>
                            {props.gameData.awayTeam.abbrev}
                        </div>
                    </div>
                    <Table striped hover bordered size="sm">
                        <thead>
                        <tr>
                            {props.gameData.statColumnHeaders.map((columnHeader, idx) => {
                                return <th key={idx}>{columnHeader}</th>;
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {props.gameData.homeStats.map((stats, idx) => {
                            return (
                                <tr key={idx}>
                                    {stats.map((val, idx) => {
                                        return <td key={idx}>{val}</td>;
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Card>
    )
}

export default TeamStats