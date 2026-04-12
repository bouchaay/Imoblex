package fr.imoblex.modules.newsletter.controller;

import fr.imoblex.modules.newsletter.dto.NewsletterSubscribeRequest;
import fr.imoblex.modules.newsletter.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/public/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody NewsletterSubscribeRequest request) {
        try {
            return ResponseEntity.ok(newsletterService.subscribe(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unsubscribe/{token}")
    public ResponseEntity<Map<String, String>> unsubscribe(@PathVariable String token) {
        newsletterService.unsubscribe(token);
        return ResponseEntity.ok(Map.of("status", "unsubscribed"));
    }
}
