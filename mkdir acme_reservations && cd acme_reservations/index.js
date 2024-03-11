const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_restaurants_db');
const uuid = require('uuid');

const createTables = async()=> {
  const SQL = `
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE customers(
  id UUID PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE restaurants(
  id UUID PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE reservations(
  id UUID PRIMARY KEY,
  date DATE NOT NULL
  customer_id UUID REFERENCES customers(id) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  party_count INTERGER NOT NULL 
);
  `;
  await client.query(SQL);
};

const createCustomer = async(name)=> {
  const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async(name)=> {
  const SQL = `
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createReservation = async({ place_id, user_id, departure_date})=> {
  const SQL = `
    INSERT INTO reservation(id, restaurant_id, party_count, customer_id, reservation_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), place_id, user_id, departure_date]);
  return response.rows[0];
};

const fetchCustomer = async()=> {
  const SQL = `
SELECT *
FROM customers
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurant = async()=> {
  const SQL = `
SELECT *
FROM restaurants
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReservation = async()=> {
  const SQL = `
SELECT *
FROM reservations
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyReservation = async(id)=> {
  const SQL = `
DELETE FROM reservations
where id = $1
  `;
  await client.query(SQL, [id]);
};

app.get('/', (req, res) => {
  throw new Error('BROKEN') // Express will catch this on its own.
})

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomer,
  fetchRestaurant,
  createReservation,
  fetchReservation,
  destroyReservation
};
