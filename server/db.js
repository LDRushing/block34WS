const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_restaurants_db');
const uuid = require('uuid');
const express = require('express');
const app = express();

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
  date DATE DEFAULT NOW(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  party_count INTEGER NOT NULL 
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

const createReservation = async({ customer_id, restaurant_id, party_count})=> {
  const SQL = `
    INSERT INTO reservations(id, customer_id, restaurant_id, party_count) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), customer_id, restaurant_id, party_count]);
  return response.rows[0];
};

const fetchCustomers = async()=> {
  const SQL = `
SELECT *
FROM customers
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async()=> {
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

app.use((err, req, res, next) => { //error-handling 
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

module.exports = { 
  client, 
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservation,
  destroyReservation
};