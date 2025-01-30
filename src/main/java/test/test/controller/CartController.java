package test.test.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import test.test.entity.*;
import test.test.service.CartService;
import test.test.service.ProductService;
import test.test.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/test/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartItems(userId);
        List<CartDTO> cartDTOs = cartItems.stream()
                .map(cart -> new CartDTO(
                        cart.getId(),
                        cart.getProduct().getId(),
                        cart.getUser().getId(),
                        cart.getProduct().getName(),
                        cart.getQuantity()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cartDTOs);
    }

    @PostMapping("/addToCart")
    public ResponseEntity<?> addToCart(@RequestBody CartRequestDTO request) {
        try {
            System.out.println("Request received: " + request.toString()); // Debug log

            if (request.getUserId() == null || request.getProductId() == null || request.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Invalid request parameters")
                );
            }

            User user = userService.getUserById(request.getUserId());
            Product product = productService.getProductById(request.getProductId());

            if (user == null || product == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "User or Product not found")
                );
            }

            Cart cartItem = new Cart();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());

            Cart savedItem = cartService.addToCart(cartItem);
            return ResponseEntity.ok(Map.of(
                    "message", "Added to cart successfully",
                    "cartItem", new CartDTO(
                            savedItem.getId(),
                            savedItem.getProduct().getId(),
                            savedItem.getUser().getId(),
                            savedItem.getProduct().getName(),
                            savedItem.getQuantity()
                    )
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Failed to add to cart: " + e.getMessage())
            );
        }
    }
    @DeleteMapping("delete/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/updateQuantity/{cartItemId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        try {
            Cart updatedCart = cartService.updateCartItemQuantity(cartItemId, quantity);
            return ResponseEntity.ok(new CartDTO(
                    updatedCart.getId(),
                    updatedCart.getProduct().getId(),
                    updatedCart.getUser().getId(),
                    updatedCart.getProduct().getName(),
                    updatedCart.getQuantity()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update quantity");
        }
    }
}