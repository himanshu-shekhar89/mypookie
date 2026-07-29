package com.mypookie.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final RestClient client;
    private final ObjectMapper mapper;

    @Value("${app.groq.api-key:}")
    private String apiKey;

    public AiController(RestClient.Builder builder, ObjectMapper mapper) {
        this.client = builder.baseUrl("https://api.groq.com/openai/v1").build();
        this.mapper = mapper;
    }

    @PostMapping("/quiz-suggestions")
    public ResponseEntity<?> quizSuggestions(@RequestBody(required = false) Map<String, Object> request) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "AI suggestions are not configured."));
        }

        String relationship = request == null ? "couple" : String.valueOf(request.getOrDefault("relationship", "couple"));
        String tone = request == null ? "playful and romantic" : String.valueOf(request.getOrDefault("tone", "playful and romantic"));
        String prompt = """
            Create exactly 3 playful, warm quiz questions for a digital gift between a %s.
            Tone: %s. Avoid sexual, invasive, cruel, or embarrassing content.
            Return JSON only with this exact shape:
            {"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"interaction":"floating"}]}
            Every question must have exactly four concise options. correctIndex must be 0-3.
            Mix romantic and funny prompts. interaction must be either "floating" or "normal".
            """.formatted(relationship, tone);

        Map<String, Object> body = Map.of(
            "model", "llama-3.3-70b-versatile",
            "temperature", 0.85,
            "response_format", Map.of("type", "json_object"),
            "messages", List.of(
                Map.of("role", "system", "content", "You create concise, charming relationship quiz content and always return valid JSON."),
                Map.of("role", "user", "content", prompt)
            )
        );

        try {
            JsonNode response = client.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
            String content = response.path("choices").path(0).path("message").path("content").asText();
            JsonNode parsed = mapper.readTree(content);
            return ResponseEntity.ok(Map.of("questions", parsed.path("questions")));
        } catch (Exception error) {
            return ResponseEntity.status(502).body(Map.of("error", "Groq could not generate questions right now."));
        }
    }
}
