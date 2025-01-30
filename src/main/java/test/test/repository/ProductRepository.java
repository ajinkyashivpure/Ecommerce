package test.test.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import test.test.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}