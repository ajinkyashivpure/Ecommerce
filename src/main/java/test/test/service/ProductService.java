package test.test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import test.test.entity.Product;
import test.test.exception.ErrorResponse;
import test.test.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product createProduct(Product product) {
        try {
            // Validate product data
            if (product.getName() == null || product.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name cannot be empty");
            }
            if (product.getPrice() <= 0) {
                throw new IllegalArgumentException("Price must be greater than 0");
            }
            if (product.getStock() < 0) {
                throw new IllegalArgumentException("Stock cannot be negative");
            }

            // Check if image size is within limits (optional)
            if (product.getImage() != null && product.getImage().length > 10485760) { // 10MB limit
                throw new IllegalArgumentException("Image size too large");
            }

            // Save the product
            return productRepository.save(product);
        } catch (Exception e) {
            throw new RuntimeException("Error creating product: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getProduct(Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            return ResponseEntity.ok(product.get());
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Product does not exist"));
    }
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
}