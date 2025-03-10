import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  image: {
    type: String,
    required: [true, "Image is required"]
  },
  category: {
    type: String,
    required: true 
  },
  isFeatured: { // default product is not featured admin can update this 
    type: Boolean,
    default: false
  }
}, {timestamps: true});

const Product = mongoose.model("Product", productSchema);

export default Product;