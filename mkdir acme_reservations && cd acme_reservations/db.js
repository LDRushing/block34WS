//server/db.js
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomer,
  fetchRestaurant,
  createReservation,
  fetchReservation,
  destroyReservation,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomer());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurant());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservation());
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/reservantions/:id", async (req, res, next) => {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/reservations", async (req, res, next) => {
  try {
    res.status(201).send(await createReservation(req.body));
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [frenchie, kitty, chula, leMadeleine, redRobin, oliveGarden, ihop] =
    await Promise.all([
      createCustomer("Frenchie"),
      createCustomer("Kitty"),
      createCustomer("Chula"),
      createCustomer("Tiger"),
      createRestaurant("Le Madeleine"),
      createRestaurant("Red Robin"),
      createRestaurant("Olive Garden"),
      createRestaurant("IHOP"),
    ]);
  console.log(`Frenchie has an id of ${frenchie.id}`);
  console.log(`Le Madeleine has an id of ${leMadeleine.id}`);
  console.log(await fetchUsers());
  console.log(await fetchPlaces());
  await Promise.all([
    createReservation({
      customer_id: kitty.id,
      place_id: redRobin.id,
      reservation_id: "04/01/2024",
    }),
    createReservation({
      customer_id: chula.id,
      place_id: oliveGarden.id,
      reservation_id: "04/15/2024",
    }),
    createReservation({
      customer_id: tiger.id,
      place_id: ihop.id,
      reservation_id: "07/04/2024",
    }),
    createReservation({
      customer_id: frenchie.id,
      place_id: leMadeleine.id,
      reservation_id: "10/31/2024",
    }),
  ]);
  const reservations = await fetchReservation();
  console.log(reservation);
  await destroyReservation(reservations[0].id);
  console.log(await fetchReservation());
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
