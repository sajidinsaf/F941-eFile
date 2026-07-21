package com.f941efile.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaWebConfig implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        return "forward:/index.html";
    }
}
