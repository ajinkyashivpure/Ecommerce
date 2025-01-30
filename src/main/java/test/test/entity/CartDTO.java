package test.test.entity;

public class CartDTO {
    private Long id;
    private Long productId;
    private Long userId;
    private String productName;
    private int quantity;

    public CartDTO() {
    }

    public CartDTO(Long id, Long productId, Long userId, String productName, int quantity) {
        this.id = id;
        this.productId = productId;
        this.userId = userId;
        this.productName = productName;
        this.quantity = quantity;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}