package com.f941efile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class F941eFileApplication {

    public static void main(String[] args) {
        SpringApplication.run(F941eFileApplication.class, args);
    }
}
