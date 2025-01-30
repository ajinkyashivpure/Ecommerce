package test.test.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import test.test.entity.Cart;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("SELECT DISTINCT c FROM Cart c WHERE c.user.id = :userId")
    List<Cart> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM Cart c " +
            "WHERE c.user.id = :userId " +
            "AND c.product.id = :productId")
    Optional<Cart> findByUserAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}