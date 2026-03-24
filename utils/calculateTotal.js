module.exports.calculateCartTotal = (cart) => {
  let total = 0;

  cart.forEach((item) => {
    let price = item.product.price;
    let discount = item.product.discount;

    let finalPrice = price * (1 - discount / 100);
    total += finalPrice * item.quantity;
  });

  return total;
};
