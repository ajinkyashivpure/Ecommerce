package test.test.entity;

public class LoginResponse {
    private String token;
    private UserDTO user;  // Add this

    public LoginResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    public LoginResponse(String token) {
        this.token = token;
    }

    // Add getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }
}
