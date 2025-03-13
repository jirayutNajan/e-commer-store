import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({_id: {$in: req.user.cartItems}});    

    // add quantity for each product
    // mongoose product.id == product._id
    const cartItems = products.map(product => {
      const item = req.user.cartItems.find(cartItems => cartItems.id === product.id);
      return {...product.toJSON(), quantity:item.quantity}
    })

    // console.dir(await req.user.populate({
    //   path: "cartItems._id",
    //   model: "Product" // ✅ ระบุ collection ที่ต้องการ populate
    // }))

    // console.log(JSON.stringify(await req.user.populate({
    //   path: "cartItems._id", // อ้างอิงไปที่ collection Product
    //   model: "Product" // กำหนด collection ที่ต้องการ populate
    // }), null, 2));

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const addToCart = async (req, res) => {
  try {
    const {productId} = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(item => item.id === productId);
    if(existingItem) {
      existingItem.quantity += 1;
    }
    else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const removeAllFromCart = async (req, res) => {
  try {
    const {productId} = req.body;
    const user = req.user;
    if(!productId) {
      user.cartItems = [];
    }
    else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const updateQuantity = async (req, res) => {
  try {
    const {id: productId} = req.params;
    const {quantity} = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if(existingItem) {
      if(quantity === 0) {
        user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    }
    else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}