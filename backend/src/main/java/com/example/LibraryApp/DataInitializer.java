package com.example.LibraryApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@library.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setEnabled(true);
            
            userRepository.save(adminUser);
            System.out.println("Admin user created: admin/admin123");
        }
        
        // Create a regular user if it doesn't exist
        if (!userRepository.existsByUsername("user")) {
            User regularUser = new User();
            regularUser.setUsername("user");
            regularUser.setEmail("user@library.com");
            regularUser.setPassword(passwordEncoder.encode("user123"));
            regularUser.setRole(UserRole.USER);
            regularUser.setEnabled(true);
            
            userRepository.save(regularUser);
            System.out.println("Regular user created: user/user123");
        }
        
        // Create test categories if they don't exist
        if (categoryRepository.count() == 0) {
            Category roman = new Category();
            roman.setName("Roman");
            roman.setDescription("Roman türündeki kitaplar");
            categoryRepository.save(roman);
            
            Category bilimKurgu = new Category();
            bilimKurgu.setName("Bilim Kurgu");
            bilimKurgu.setDescription("Bilim kurgu türündeki kitaplar");
            categoryRepository.save(bilimKurgu);
            
            Category tarih = new Category();
            tarih.setName("Tarih");
            tarih.setDescription("Tarih türündeki kitaplar");
            categoryRepository.save(tarih);
            
            Category felsefe = new Category();
            felsefe.setName("Felsefe");
            felsefe.setDescription("Felsefe türündeki kitaplar");
            categoryRepository.save(felsefe);
            
            System.out.println("Test categories created: Roman, Bilim Kurgu, Tarih, Felsefe");
        }
    }
} 