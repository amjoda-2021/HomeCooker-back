const express = require("express");
const router = express.Router();

const Product = require("../models/product");
//ROUTE GET

router.get("/api/products", (req, res, next) => {
  Product.find()
    .then((products) => res.status(200).json({ products: products }))
    .catch((error) => res.status(400).json({ error }));
});
// ROUTE SHOW
router.get("/api/products/:id", (req, res, next) => {
  Product.findOne({ _id: req.params.id })
    .then((product) => res.status(200).json({ product: product }))
    .catch((error) => res.status(404).json({ error }));
});
// ROUTE POST
router.post("/api/products", (req, res, next) => {
  delete req.body._id;
  const product = new Product({
    ...req.body,
  });
  product
    .save()
    .then(() => res.status(201).json({ product: product }))
    .catch((error) => res.status(400).json({ error }));
});

// ROUTE UPDATE
router.put("/api/products/:id", (req, res, next) => {
  Product.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Modified!" }))
    .catch((error) => res.status(400).json({ error }));
});

// DELETE
router.delete("/api/products/:id", (req, res, next) => {
  Product.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Deleted!" }))
    .catch((error) => res.status(400).json({ error }));
});
module.exports = router;