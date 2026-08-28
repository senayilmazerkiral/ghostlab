package com.sena.ecommerce.config;

import com.sena.ecommerce.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // Kullanıcı kayıt ve login
                        .requestMatchers("/users/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()

                        // Ürünleri ve kategorileri herkes görebilir
                        .requestMatchers(
                                HttpMethod.GET,
                                "/products/**",
                                "/categories/**"
                        ).permitAll()

                        // Ürün ve kategori ekleme sadece ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        // Ürün ve kategori güncelleme sadece ADMIN
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        // Ürün ve kategori silme sadece ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        // Siparişleri USER ve ADMIN görebilir
                        .requestMatchers(
                                HttpMethod.GET,
                                "/orders/**"
                        ).hasAnyRole("USER", "ADMIN")

                        // Sipariş oluşturma
                        .requestMatchers(
                                HttpMethod.POST,
                                "/orders"
                        ).hasAnyRole("USER", "ADMIN")

                        // Sipariş durumunu sadece ADMIN değiştirebilir
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/orders/*/status"
                        ).hasRole("ADMIN")

                        // Diğer her şey login gerektirir
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}