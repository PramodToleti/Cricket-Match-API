const express = require("express");

const app = express();

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
