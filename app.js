const express = require("express");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get All Players Details API
app.get("/players/", async (req, res) => {
  const getPlayersDetailsQuery = `
        SELECT 
          * 
        FROM 
          player_details;
    `;

  const dbResponse = await db.all(getPlayersDetailsQuery);
  const playersDetails = dbResponse.map((obj) => {
    return {
      playerId: obj.player_id,
      playerName: obj.player_name,
    };
  });
  res.send(playersDetails);
});

//Get Specific Player API
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerDetailsQuery = `
        SELECT 
          * 
        FROM 
          player_details
        WHERE 
          player_id = ${playerId};
    `;
  const dbResponse = await db.get(getPlayerDetailsQuery);
  const playerDetails = [dbResponse].map((obj) => {
    return {
      playerId: obj.player_id,
      playerName: obj.player_name,
    };
  });
  res.send(...playerDetails);
});

//Update Player Details API
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName } = playerDetails;
  const updatePlayerDetailsQuery = `
        UPDATE 
          player_details
        SET 
          player_name = '${playerName}'
        WHERE 
          player_id = ${playerId};
    `;
  const dbResponse = await db.run(updatePlayerDetailsQuery);
  res.send("Player Details Updated");
});

//Get Match Details APi
app.get("/matches/:matchId/", async (req, res) => {
  const { matchId } = req.params;
  const getMatchDetailsQuery = `
        SELECT 
          * 
        FROM 
          match_details
        WHERE 
          match_id = ${matchId};
    `;
  const dbResponse = await db.get(getMatchDetailsQuery);
  const matchDetails = [dbResponse].map((obj) => {
    return {
      matchId: obj.match_id,
      match: obj.match,
      year: obj.year,
    };
  });
  res.send(...matchDetails);
});

//Get Match Details of a Specific Player API
app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerMatchDetailsQuery = `
        SELECT 
          match_details.match_id AS matchId,
          match_details.match AS match,
          match_details.year AS year
        FROM match_details
            INNER JOIN player_match_score
        ON match_details.match_id = player_match_score.match_id
        WHERE 
          player_match_score.player_id = ${playerId};
    `;
  const playerMatchDetails = await db.all(getPlayerMatchDetailsQuery);
  res.send(playerMatchDetails);
});

//Get Players List of a Specific match API
app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const getPlayersOfMatchQuery = `
        SELECT 
          player_details.player_id AS playerId,
          player_details.player_name AS playerName
        FROM player_details
            INNER JOIN player_match_score
        ON player_details.player_id = player_match_score.player_id
        WHERE 
          player_match_score.match_id = ${matchId};
    `;
  const playersList = await db.all(getPlayersOfMatchQuery);
  res.send(playersList);
});

//Get Stats of a Specific Player
app.get("/players/:playerId/playerScores", async (req, res) => {
  const { playerId } = req.params;
  const getStatsQuery = `
        SELECT
          player_details.player_id AS playerId,
          player_details.player_name AS playerName,
          SUM(player_match_score.score) AS totalScore,
          SUM(player_match_score.fours) AS totalFours,
          SUM(player_match_score.sixes) AS totalSixes
        FROM player_details 
            INNER JOIN player_match_score 
        ON player_details.player_id = player_match_score.player_id
        WHERE 
          player_details.player_id = ${playerId};
    `;
  const playerStats = await db.get(getStatsQuery);
  res.send(playerStats);
});

module.exports = app;
