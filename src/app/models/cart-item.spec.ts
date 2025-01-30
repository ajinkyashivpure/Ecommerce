import { CartItem } from './cart-item';

describe('CartItem', () => {
  it('should create a cart item object', () => {
    const cartItem: CartItem = {
      productId: 1,
      userId: 1,
      quantity: 2,
      productName:''
    };
    expect(cartItem).toBeTruthy();
  });
});
