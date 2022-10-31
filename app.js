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
