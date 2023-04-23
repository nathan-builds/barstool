/***
 * The idea is to have the generic interface GameState that can represent multiple sports.
 * As long as the JSON data for the sport is mapped correctly into GameState, the ScoreWidget
 * can visually display any sport. This enables the addition of future sports easily
 */


export interface GameState {
    homeTeam: { abbrev: string, last: string },
    awayTeam: { abbrev: string, last: string },
    currentHomeScore: number,
    currentAwayScore: number,
    gameStatus: string,
    scoreHeaders: [],
    homeScore: [],
    awayScore: [],
    statColumnHeaders: [],
    awayStats: [[]],
    homeStats: [[]],
    highlightPlayers: [{}],
}


// Any sport can be represented in the component as long as the sport details are mapped into this state object
export const initialState: GameState = {
    homeTeam: {abbrev: "", last: ""},
    awayTeam: {abbrev: "", last: ""},
    currentHomeScore: 0,
    currentAwayScore: 0,
    gameStatus: "",
    scoreHeaders: [],
    homeScore: [],
    awayScore: [],
    statColumnHeaders: [],
    awayStats: [[]],
    homeStats: [[]],
    highlightPlayers: [{}],

};


/***
 * map JSON data to GameState interface shape so it can be displayed in the generic
 * components
 * @param sportName what sport is going to be displayed
 * @param json data for the sport
 */
export const mapData = (sportName, json): GameState => {
    return (sportName === 'mlb' ? mapMLB(json) : mapNBA(json));
}

/**
 * Any data that is common to all sports is added here
 * @param json
 * @param data
 */
const mapGeneric = (json) => {
    return {
        homeTeam: {abbrev: json["home_team"]["abbreviation"], last: json["home_team"]["last_name"]},
        awayTeam: {abbrev: json["away_team"]["abbreviation"], last: json["away_team"]["last_name"]},
        gameStatus: json["event_information"]["status"] === 'completed' ? 'Final' : json["event_information"]["status"]
    }
};

/**
 * Get unique stats for NBA players
 * @param nbaJSON
 * @returns {}
 */
const getNBAPlayerStats = (nbaJSON): {} => {
    let homeStats = [[]];
    let awayStats = [[]];
    ['home_stats', 'away_stats'].forEach(stat => {
        nbaJSON[stat].forEach((player) => {
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
            stat === 'home_stats' ? homeStats.push(stats) : awayStats.push(stats)

        });
    })


    return {homeStats: homeStats, awayStats: awayStats}
};

/***
 *  Map all data in regards to NBA,set column headers and time periods
 * @param nbaJSON
 */
export const mapNBA = (nbaJSON): GameState => {
    return <GameState>{
        ...mapGeneric(nbaJSON),
        ...getNBAScores(nbaJSON, 4),
        ...getNBAPlayerStats(nbaJSON),
        scoreHeaders: [1, 2, 3, 4, "T"],
        statColumnHeaders: ["Player", "MIN", "FG", "3PT", "FT", "OREB", "DREB", "AST", "STL", "BLK", "TO", "PF", "PTS",],
        highlightPlayers: getHighlightedNBAPlayers(nbaJSON),
    }

};

/***
 * Map all data for MLB games into GameState interface
 * @param mlbJSON
 * @param data
 */
export const mapMLB = (mlbJSON): GameState => {
    return <GameState>{
        ...mapGeneric(mlbJSON),
        ...getMLBScores(mlbJSON, 9),
        ...getMLBPlayerStats(mlbJSON),
        scoreHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 'R', 'H', 'E'],
        statColumnHeaders: ['Hitters', 'AB', 'R', 'H', 'RBI', 'HR', 'BB', 'AVG',],
        highlightPlayers: getHighlightedPitchers(mlbJSON),
    }


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
        return p2.points - p1.points;
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
 * @param totalPeriods
 */
const getNBAScores = (json, totalPeriods): {} => {
    const {home_period_scores, away_period_scores} = json;
    const totalAwayPoints = json["away_totals"]["points"];
    const totalHomePoints = json["home_totals"]["points"];
    let isHome = true;
    [home_period_scores, away_period_scores].forEach(scores => {
        if (scores.length !== totalPeriods) {
            // game is ongoing
            let remainingPeriods = totalPeriods - scores.length;
            let i = 0;
            while (i < remainingPeriods) {
                scores.push("-");
                i++;
            }
        }
        isHome ? scores.push(totalHomePoints) : scores.push(totalAwayPoints)
        isHome = false;
    })

    return {
        currentAwayScore: totalAwayPoints,
        currentHomeScore: totalHomePoints,
        homeScore: home_period_scores,
        awayScore: away_period_scores
    }
}

/***
 * Get the correct scores, add '-' for any time period not yet completed
 * @param json
 * @param totalPeriods 9 innings regularly
 * @returns {*}
 */
const getMLBScores = (json, totalPeriods) => {
    const {home_period_scores, away_period_scores, away_batter_totals, home_batter_totals} = json;
    const {runs: awayRuns, hits: awayHits, extra_base_hits: awayExtra} = away_batter_totals
    const {runs: homeRuns, hits: homeHits, extra_base_hits: homeExtra} = home_batter_totals
    let isHome = true;
    [home_period_scores, away_period_scores].forEach(scores => {
        if (scores.length !== totalPeriods) {
            // game is ongoing
            let remainingPeriods = totalPeriods - scores.length;
            let i = 0;
            while (i < remainingPeriods) {
                scores.push("-");
                i++;
            }
        }
        isHome ? home_period_scores.push(homeRuns, homeHits, homeExtra)
            : away_period_scores.push(awayRuns, awayHits, awayExtra)
        isHome = false;
    })


    return {
        currentAwayScore: awayRuns,
        currentHomeScore: homeRuns,
        homeScore: home_period_scores,
        awayScore: away_period_scores
    }
}


/**
 * Get all the MLB stats we want displayed
 * @param json

 */
const getMLBPlayerStats = (json) => {
    let homeBatterStats = [[]];
    let awayBatterStats = [[]];
    ['home_batters', 'away_batters'].forEach(batterSet => {
        json[batterSet].forEach((batter) => {
            const stats = [];
            let fName = batter["first_name"];
            let lName = batter["last_name"];
            let hitter = `${fName.charAt(0)}.${lName}`;

            const {at_bats, runs, hits, rbi, home_runs, walks, avg} = batter;
            stats.push(hitter, at_bats, runs, hits, rbi, home_runs, walks, avg);
            batterSet === 'home_batters' ? homeBatterStats.push(stats) : awayBatterStats.push(stats);

        });
    })

    return {homeStats: homeBatterStats, awayStats: awayBatterStats}
};
