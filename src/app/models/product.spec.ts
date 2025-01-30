import { Product } from './product';

describe('Product', () => {
  it('should create a product object', () => {
    const product: Product = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10
    };
    expect(product).toBeTruthy();
  });
});
