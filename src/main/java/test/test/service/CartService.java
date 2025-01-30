package test.test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import test.test.entity.Cart;
import test.test.repository.CartRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    public List<Cart> getCartItems(Long userId) {

        return cartRepository.findByUserId(userId);
    }

    public Cart addToCart(Cart newCartItem) {
        try {
            Cart existingItem = cartRepository
                    .findByUserAndProductId(newCartItem.getUser().getId(), newCartItem.getProduct().getId())
                    .orElse(null);

            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + newCartItem.getQuantity());
                return cartRepository.save(existingItem);
            }

            return cartRepository.save(newCartItem);
        } catch (Exception e) {
            throw new RuntimeException("Error adding to cart: " + e.getMessage());
        }
    }

    public void removeFromCart(Long cartItemId) {
        cartRepository.deleteById(cartItemId);
    }

    public Cart updateCartItemQuantity(Long cartItemId, int quantity) {
        Cart cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartRepository.deleteById(cartItemId);
            return null;
        }

        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }
}

