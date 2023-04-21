// Any sport can be represented in the component as long as the sport details are mapped into this state object
export const gameState = {
    homeTeam: {abbrev: "", last: ""},
    awayTeam: {abbrev: "", last: ""},
    currentHomeScore: 0,
    currentAwayScore: 0,
    homeTeamLastName: "",
    awayTeamLastName: "",
    gameStatus: "",
    scoreHeaders: [],
    homeScore: [],
    awayScore: [],
    totalPeriods: 0,
    statColumnHeaders: [],
    awayStats: [[]],
    homeStats: [[]],
    highlightPlayers: [{}],
};

/**
 * Map the JSON object to the generic gameState object
 * @param sportName What sport is being mapped
 * @param json the JSON object containing the data
 * @returns a gameState object that can be used to render the display
 */
export const mapData = (sportName, json) => {
    let data = {
        homeTeam: {abbrev: "", last: ""}, awayTeam: {abbrev: "", last: ""},
    };

    mapGeneric(json, data);
    sportName === "mlb" ? mapMLB(json, data) : mapNBA(json, data);
    return data;
};

/**
 * Any data that is common to all sports is added here
 * @param json
 * @param data
 */
const mapGeneric = (json, data) => {
    data.homeTeam.abbrev = json.message["home_team"]["abbreviation"];
    data.homeTeam.last = json.message["home_team"]["last_name"];
    data.awayTeam.abbrev = json.message["away_team"]["abbreviation"];
    data.awayTeam.last = json.message["away_team"]["last_name"];
};

/**
 * Get unique stats for NBA players
 * @param nbaJSON
 * @param homeOrAway
 * @returns {*[][]}
 */
const getNBAPlayerStats = (nbaJSON, homeOrAway) => {
    let playerStats = [[]];
    nbaJSON[homeOrAway].forEach((player) => {
        const stats = [];
        let fName = player["first_name"];
        let lName = player["last_name"];
        let name = `${fName.charAt(0)}.${lName}`;
        const {
            minutes,
            field_goals_attempted,
            field_goals_made,
            three_point_field_goals_attempted,
            three_point_field_goals_made,
            free_throws_attempted,
            free_throws_made,
            offensive_rebounds,
            defensive_rebounds,
            assists,
            steals,
            blocks,
            turnovers,
            personal_fouls,
            points,
        } = player;

        const FG = `${field_goals_made}-${field_goals_attempted}`;
        const threePT = `${three_point_field_goals_made}-${three_point_field_goals_attempted}`;
        const FT = `${free_throws_made}-${free_throws_attempted}`;
        stats.push(name, minutes, FG, threePT, FT, offensive_rebounds,
            defensive_rebounds, assists, steals, blocks, turnovers, personal_fouls, points);
        playerStats.push(stats);
    });

    return playerStats;
};

/***
 *  Map all data in regards to NBA,set column headers and time periods
 * @param nbaJSON
 * @param data
 */
export const mapNBA = (nbaJSON, data) => {

    data.scoreHeaders = [1, 2, 3, 4, "T"];
    data.statColumnHeaders = ["Player", "MIN", "FG", "3PT", "FT", "OREB", "DREB", "AST", "STL", "BLK", "TO", "PF", "PTS",];

    data.homeScore = getNBAScores(nbaJSON.message, 4, false, data);
    data.awayScore = getNBAScores(nbaJSON.message, 4, true, data);
    data.awayStats = getNBAPlayerStats(nbaJSON.message, "away_stats");
    data.homeStats = getNBAPlayerStats(nbaJSON.message, "home_stats");
    data.highlightPlayers = getHighlightedNBAPlayers(nbaJSON.message);

    const gameStatus = nbaJSON.message["event_information"]["status"];
    data.gameStatus = gameStatus === "completed" ? "Final" : determineNBAGameStatus(data.homeScore);

//   return data;
};

/***
 * Map all data for MLB games into gameState object
 * @param mlbJSON
 * @param data
 */
export const mapMLB = (mlbJSON, data) => {
    data.scoreHeaders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'R', 'H', 'E'],
        data.statColumnHeaders = ['Hitters', 'AB', 'R', 'H', 'RBI', 'HR', 'BB', 'AVG',],
        data.awayStats = getMLBPlayerStats(mlbJSON, "away_batters");
    data.homeStats = getMLBPlayerStats(mlbJSON, "home_batters");
    data.homeScore = getMLBScores(mlbJSON.message, 9, false, data);
    data.awayScore = getMLBScores(mlbJSON.message, 9, true, data);
    data.highlightPlayers = getHighlightedPitchers(mlbJSON.message);

    const gameStatus = mlbJSON.message["event_information"]["status"];
    data.gameStatus = gameStatus === "completed" ? "Final" : determineMLBGameStatus(data.homeScore);

};

/***
 * Find out what state the game is in, ie Final, Q1, Q2 etc..
 * @param scores
 * @returns {`OT ${number}`|`${string} Quarter`}
 */
const determineNBAGameStatus = (scores) => {
    if (scores.length > 4) {
        return `OT ${scores.length - 4}`;
    } else {
        return `${scores.length} Quarter`;
    }
};

/***
 * Find out what state baseball game is in
 * @param scores
 * @returns {`${string}th Inning`}
 */
const determineMLBGameStatus = (scores) => {
    return `${scores.length}th Inning`;
};

/***
 * The bottom of the scoreboard displays highlighted players. For the NBA we want the top 3 scorers displayed
 * @param nbaJSON
 * @returns {*[]}
 */
const getHighlightedNBAPlayers = (nbaJSON) => {
    let stats = [];
    const {away_stats, home_stats} = nbaJSON;
    let combinedSorted = [...away_stats, ...home_stats].sort((p1, p2) => {
        return p1.points > p2.points;
    });
    // only interested in top 3 players points wise
    for (let i = 0; i < 3; i++) {
        const {
            display_name, team_abbreviation, points, assists, blocks, minutes,
        } = combinedSorted[i];
        let player = {
            status: team_abbreviation,
            displayName: display_name,
            statLine: `${points} P ${assists} AST ${blocks} BLK ${minutes} MIN`,
        };
        stats.push(player);
    }
    return stats;
};

/***
 * Get highlighted pitchers for MLB, we are only interested in 2 pitchers, the winner and looser
 * @param mlbJSON
 * @returns {[{displayName, statLine: string, status: (string)},{displayName, statLine: string, status: (string)}]}
 */
const getHighlightedPitchers = (mlbJSON) => {
    const {home_pitchers} = mlbJSON;
    const {away_pitchers} = mlbJSON;
    let homePitcher = home_pitchers.filter((pitcher) => pitcher["win"] === true);
    let awayPitcher = away_pitchers.filter((pitcher) => pitcher["win"] === true);
    if (homePitcher.length > 0) {
        //they won
        homePitcher = homePitcher[0];
        awayPitcher = away_pitchers.pop();
    } else {
        awayPitcher = awayPitcher[0];
        homePitcher = home_pitchers.pop();
    }

    const {
        win: homeWin,
        display_name: homeDisplayName,
        innings_pitched: homeInnings,
        earned_runs: homeEarned,
        walks: homeWalks,
        strike_outs: homeStrikeouts,
    } = homePitcher;

    const {
        win: awayWin,
        display_name: awayDisplayName,
        innings_pitched: awayInnings,
        earned_runs: awayEarned,
        walks: awayWalks,
        strike_outs: awayStrikeouts,
    } = awayPitcher;

    let homeHighlightedPlayer = {
        status: homeWin ? "WIN" : "LOSS",
        displayName: homeDisplayName,
        statLine: `${homeInnings} IP, ${homeEarned} ER ${homeStrikeouts} K, ${homeWalks} BB`,
    };
    let awayHighlightedPlayer = {
        status: awayWin ? "WIN" : "LOSS",
        displayName: awayDisplayName,
        statLine: `${awayInnings} IP, ${awayEarned} ER ${awayStrikeouts} K, ${awayWalks} BB`,
    };

    return [homeHighlightedPlayer, awayHighlightedPlayer];
};

/***
 * Get the correct scores, add '-' for any time period not yet completed
 * @param json
 * @param totalPeriods 4 quarters regularly
 * @param isAway home or away
 * @param data
 * @returns {*}
 */
const getNBAScores = (json, totalPeriods, isAway, data) => {
    const periodScores = isAway ? json["away_period_scores"] : json["home_period_scores"];
    const totalPoints = isAway ? json["away_totals"]["points"] : json["home_totals"]["points"];
    isAway ? data.currentAwayScore = totalPoints : data.currentHomeScore = totalPoints

    if (periodScores.length !== totalPeriods) {
        // game is ongoing
        let remainingPeriods = totalPeriods - periodScores.length;
        let i = 0;
        while (i < remainingPeriods) {
            periodScores.push("-");
            i++;
        }
    }
    periodScores.push(totalPoints);
    return periodScores;
}

/***
 * Get the correct scores, add '-' for any time period not yet completed
 * @param json
 * @param totalPeriods 9 innings regularly
 * @param isAway home or away
 * @param data
 * @returns {*}
 */
const getMLBScores = (json, totalPeriods, isAway, data) => {
    const batterTotals = isAway ? json["away_batter_totals"] : json["home_batter_totals"];
    const periodScores = isAway ? json["away_period_scores"] : json["home_period_scores"];
    const {runs, hits, extra_base_hits} = batterTotals;
    isAway ? data.currentAwayScore = batterTotals['runs'] : data.currentHomeScore = batterTotals['runs']

    if (periodScores.length !== totalPeriods) {
        // game is ongoing
        let remainingPeriods = totalPeriods - periodScores.length;
        let i = 0;
        while (i < remainingPeriods) {
            periodScores.push("-");
            i++;
        }
    }
    periodScores.push(runs, hits, extra_base_hits);
    return periodScores;
}


/**
 * Get all the MLB stats we want displayed
 * @param json
 * @param homeOrAway
 * @returns {*[][]}
 */
const getMLBPlayerStats = (json, homeOrAway) => {
    let batterStats = [[]];
    json.message[homeOrAway].forEach((batter) => {
        const stats = [];
        let fName = batter["first_name"];
        let lName = batter["last_name"];
        let hitter = `${fName.charAt(0)}.${lName}`;

        const {at_bats, runs, hits, rbi, home_runs, walks, avg} = batter;
        stats.push(hitter, at_bats, runs, hits, rbi, home_runs, walks, avg);
        batterStats.push(stats);
    });
    return batterStats;
};
