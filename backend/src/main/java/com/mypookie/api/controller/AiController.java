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

    @PostMapping("/playful-prompts")
    public ResponseEntity<?> playfulPrompts(@RequestBody(required = false) Map<String,Object> request) {
        if (!configured()) return ResponseEntity.status(503).body(Map.of("error","AI suggestions are not configured."));
        String gameType = safe(request, "gameType", "playful quiz");
        String relationship = safe(request, "relationship", "two people who care about each other");
        String tone = safe(request, "tone", "warm, playful and clever");
        int count = boundedInt(request == null ? null : request.get("count"), 6, 2, 12);
        boolean fortune = "fortune".equalsIgnoreCase(gameType);
        String activityRules = fortune
            ? "Every prompt must be a short, positive fortune or gentle prediction. Never write a question, task, quiz, instruction, or question mark. Keep options empty."
            : """
              Use 2-4 concise options when the activity benefits from choices.
              For truth-or-dare, make the first half truths and the second half dares.
              For treasure hunts, option 1 is a hint and option 2 is a short accepted answer.
              For emoji decoder, the prompt is an emoji clue, option 1 its answer, and option 2 its hint.
              For excuse generator, each prompt is a funny situation both people need an excuse for, and option 1 is the sender's playful excuse.
              For movie or song bond analysis, ask surprising, funny and playful questions rather than generic compatibility questions—for example silly plot twists, snacks, bloopers, superpowers and shared chaos.
              """;
        String prompt = """
            Create exactly %d editable ideas for the digital-gift activity "%s".
            Relationship context: %s. Tone: %s.
            Keep them personal-feeling but never assume private facts. "Sexy" means consenting adults only and must remain playful, flirty and non-explicit. Avoid graphic sexual content, invasive, cruel, unsafe, coercive, or embarrassing content.
            Return JSON only in this exact shape:
            {"items":[{"prompt":"...","options":["...","...","...","..."]}]}
            Every item needs a concise prompt. Use 2-4 concise options when the activity benefits from choices.
            %s
            """.formatted(count, gameType, relationship, tone, activityRules);
        return generate(prompt, "You design warm, safe and playful interactive gift activities.", "items");
    }

    @PostMapping("/bond-analysis")
    public ResponseEntity<?> bondAnalysis(@RequestBody(required = false) Map<String,Object> request) {
        if (!configured()) return ResponseEntity.status(503).body(Map.of("error","AI analysis is not configured."));
        String mode=safe(request,"mode","movie");
        String sender=safe(request,"senderName","The sender");
        String recipient=safe(request,"recipientName","The recipient");
        String preference=safe(request,"preference","Let AI decide");
        Object questions=request==null?List.of():request.getOrDefault("questions",List.of());
        Object senderAnswers=request==null?List.of():request.getOrDefault("senderAnswers",List.of());
        Object recipientAnswers=request==null?List.of():request.getOrDefault("recipientAnswers",List.of());
        String prompt = """
            Analyze two people's answers about their bond and create a charming "%s" reveal.
            Sender: %s. Recipient: %s. Preferred direction: %s.
            Questions: %s
            Sender answers: %s
            Recipient answers: %s
            Find affectionate similarities and complementary differences. Do not diagnose, rank compatibility, or invent sensitive facts.
            If mode is movie, title is an original movie title, genre is its cinematic genre, and roles are character archetypes.
            If mode is song, title is an original song title, genre is its musical style, and roles describe what each person contributes to the sound.
            Return JSON only with exactly:
            {"title":"...","subtitle":"...","senderRole":"...","recipientRole":"...","tagline":"...","genre":"..."}
            Keep every value concise, specific to the supplied answers, warm, and suitable for all ages.
            """.formatted(mode,sender,recipient,preference,questions,senderAnswers,recipientAnswers);
        return generate(prompt, "You are a perceptive, wholesome creative director who turns relationship answers into original entertainment concepts.", null);
    }

    private boolean configured(){return apiKey!=null&&!apiKey.isBlank();}
    private String safe(Map<String,Object> request,String key,String fallback){
        if(request==null)return fallback;
        String value=String.valueOf(request.getOrDefault(key,fallback));
        return value.length()>500?value.substring(0,500):value;
    }
    private int boundedInt(Object value,int fallback,int min,int max){
        try{return Math.max(min,Math.min(max,Integer.parseInt(String.valueOf(value))));}
        catch(Exception ignored){return fallback;}
    }
    private ResponseEntity<?> generate(String prompt,String system,String rootKey){
        Map<String,Object> body=Map.of(
            "model","llama-3.3-70b-versatile",
            "temperature",0.82,
            "response_format",Map.of("type","json_object"),
            "messages",List.of(Map.of("role","system","content",system+" Always return valid JSON."),Map.of("role","user","content",prompt))
        );
        try{
            JsonNode response=client.post().uri("/chat/completions").header(HttpHeaders.AUTHORIZATION,"Bearer "+apiKey).body(body).retrieve().body(JsonNode.class);
            String content=response.path("choices").path(0).path("message").path("content").asText();
            JsonNode parsed=mapper.readTree(content);
            if(rootKey!=null)return ResponseEntity.ok(Map.of(rootKey,parsed.path(rootKey)));
            return ResponseEntity.ok(parsed);
        }catch(Exception error){
            return ResponseEntity.status(502).body(Map.of("error","Groq could not create this result right now."));
        }
    }
}
