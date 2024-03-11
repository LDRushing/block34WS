const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_vacations_db');
const uuid = require('uuid');

const createTables = async()=> {
  const SQL = `
DROP TABLE IF EXISTS vacations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS places;

CREATE TABLE users(
  id UUID PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE places(
  id UUID PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE vacations(
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  place_id UUID REFERENCES places(id) NOT NULL,
  departure_date DATE
);
  `;
  await client.query(SQL);
};

const createUser = async(name)=> {
  const SQL = `
    INSERT INTO users(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createPlace = async(name)=> {
  const SQL = `
    INSERT INTO places(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createVacation = async({ place_id, user_id, departure_date})=> {
  const SQL = `
    INSERT INTO vacations(id, place_id, user_id, departure_date) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), place_id, user_id, departure_date]);
  return response.rows[0];
};

const fetchUsers = async()=> {
  const SQL = `
SELECT *
FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchPlaces = async()=> {
  const SQL = `
SELECT *
FROM places
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchVacations = async()=> {
  const SQL = `
SELECT *
FROM vacations
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyVacation = async(id)=> {
  const SQL = `
DELETE FROM vacations
where id = $1
  `;
  await client.query(SQL, [id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createPlace,
  fetchUsers,
  fetchPlaces,
  createVacation,
  fetchVacations,
  destroyVacation
};

//server/db.js
const {
  client,
  createTables,
  createUser,
  createPlace,
  fetchUsers,
  fetchPlaces,
  createVacation,
  fetchVacations,
  destroyVacation
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/places', async(req, res, next)=> {
  try {
    res.send(await fetchPlaces());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/vacations', async(req, res, next)=> {
  try {
    res.send(await fetchVacations());
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/vacations/:id', async(req, res, next)=> {
  try {
    await destroyVacation(req.params.id);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/vacations', async(req, res, next)=> {
  try {
    res.status(201).send(await createVacation(req.body));
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [moe, lucy, ethyl, rome, nyc, la, paris] = await Promise.all([
    createUser('moe'),
    createUser('lucy'),
    createUser('ethyl'),
    createPlace('rome'),
    createPlace('nyc'),
    createPlace('la'),
    createPlace('paris')
  ]);
  console.log(`moe has an id of ${moe.id}`);
  console.log(`rome has an id of ${rome.id}`);
  console.log(await fetchUsers());
  console.log(await fetchPlaces());
  await Promise.all([
    createVacation({ user_id: moe.id, place_id: nyc.id, departure_date: '04/01/2024'}),
    createVacation({ user_id: moe.id, place_id: nyc.id, departure_date: '04/15/2024'}),
    createVacation({ user_id: lucy.id, place_id: la.id, departure_date: '07/04/2024'}),
    createVacation({ user_id: lucy.id, place_id: rome.id, departure_date: '10/31/2024'}),
  ]);
  const vacations = await fetchVacations();
  console.log(vacations);
  await destroyVacation(vacations[0].id);
  console.log(await fetchVacations());
  
  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));

};

init();

                