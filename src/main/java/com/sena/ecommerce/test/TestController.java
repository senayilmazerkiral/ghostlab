package com.sena.ecommerce.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "GhostLab API is running!";
    }

    @GetMapping("/test")
    public String test() {
        return "JWT protected endpoint works!";
    }
}