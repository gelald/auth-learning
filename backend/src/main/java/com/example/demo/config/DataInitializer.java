package com.example.demo.config;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Initializing sample products...");

            Product product1 = new Product();
            product1.setName("Laptop Pro");
            product1.setDescription("High-performance laptop for professionals");
            product1.setPrice(new BigDecimal("1299.99"));
            product1.setQuantity(50);
            product1.setCategory("Electronics");
            product1.setCreatedBy("admin");

            Product product2 = new Product();
            product2.setName("Wireless Mouse");
            product2.setDescription("Ergonomic wireless mouse");
            product2.setPrice(new BigDecimal("49.99"));
            product2.setQuantity(200);
            product2.setCategory("Electronics");
            product2.setCreatedBy("admin");

            Product product3 = new Product();
            product3.setName("Mechanical Keyboard");
            product3.setDescription("RGB mechanical keyboard with blue switches");
            product3.setPrice(new BigDecimal("149.99"));
            product3.setQuantity(100);
            product3.setCategory("Electronics");
            product3.setCreatedBy("admin");

            Product product4 = new Product();
            product4.setName("USB-C Hub");
            product4.setDescription("7-in-1 USB-C hub with HDMI");
            product4.setPrice(new BigDecimal("79.99"));
            product4.setQuantity(150);
            product4.setCategory("Electronics");
            product4.setCreatedBy("admin");

            Product product5 = new Product();
            product5.setName("Monitor Stand");
            product5.setDescription("Adjustable aluminum monitor stand");
            product5.setPrice(new BigDecimal("89.99"));
            product5.setQuantity(80);
            product5.setCategory("Accessories");
            product5.setCreatedBy("admin");

            productRepository.save(product1);
            productRepository.save(product2);
            productRepository.save(product3);
            productRepository.save(product4);
            productRepository.save(product5);

            log.info("Sample products initialized successfully");
        } else {
            log.info("Products already exist, skipping initialization");
        }
    }
}
