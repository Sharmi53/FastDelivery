async function calculateOrderPricing(connection, items, discount = 0) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Your cart is empty.');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const productId = Number(item.productId || item.id);
        const quantity = Number(item.quantity);

        if (!productId || !quantity || quantity < 1) {
            throw new Error('Invalid product or quantity in cart.');
        }

        const [products] = await connection.execute(
            `
      SELECT
        id,
        name,
        price,
        stock_quantity,
        status
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
            [productId]
        );

        if (products.length === 0) {
            throw new Error(`Product ${productId} was not found.`);
        }

        const product = products[0];
        const productPrice = Number(product.price);
        const availableStock = Number(product.stock_quantity);

        if (product.status !== 'active') {
            throw new Error(`${product.name} is currently unavailable.`);
        }

        if (availableStock < quantity) {
            throw new Error(
                `Only ${availableStock} unit(s) of ${product.name} are available.`
            );
        }

        const itemSubtotal = productPrice * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
            productId: product.id,
            productName: product.name,
            price: productPrice,
            quantity,
            subtotal: itemSubtotal
        });
    }

    const deliveryCharge = subtotal >= 150 ? 0 : 30;

    const discountAmount = Math.max(
        0,
        Number(discount) || 0
    );

    const totalAmount = Math.max(
        0,
        subtotal + deliveryCharge - discountAmount
    );

    return {
        orderItems,
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount
    };
}

module.exports = {
    calculateOrderPricing
};