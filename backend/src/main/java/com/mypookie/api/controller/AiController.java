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
            Every question must have exactly four concise options. Limit each question to 14 words and each option to 5 words. correctIndex must be 0-3.
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
        String activityRules = activityRulesFor(gameType);
        String prompt = """
            Create exactly %d editable ideas for the digital-gift activity "%s".
            Relationship context: %s. Tone: %s.
            Keep them personal-feeling but never assume private facts. "Sexy" means consenting adults only and must remain playful, flirty and non-explicit. Avoid graphic sexual content, invasive, cruel, unsafe, coercive, or embarrassing content.
            Return JSON only in this exact shape:
            {"items":[{"prompt":"...","options":["...","...","...","..."]}]}
            %s
            Follow this activity-specific contract exactly; it overrides generic game patterns:
            %s
            Do not borrow wording, formats, or mechanics from Truth or Dare unless this activity is explicitly Truth or Dare.
            """.formatted(count, gameType, relationship, tone, playfulLengthRules(), activityRules);
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
            Title and genre: at most 5 words. Roles: at most 8 words each. Subtitle and tagline: at most 12 words each.
            """.formatted(mode,sender,recipient,preference,questions,senderAnswers,recipientAnswers);
        return generate(prompt, "You are a perceptive, wholesome creative director who turns relationship answers into original entertainment concepts.", null);
    }

    private boolean configured(){return apiKey!=null&&!apiKey.isBlank();}
    static String playfulLengthRules(){
        return """
            Keep card copy punchy: every prompt must be at most 12 words and every option at most 7 words.
            Use one short sentence or phrase only. Never add explanations, introductions, labels, numbering, or repeated context.
            """;
    }
    static String activityRulesFor(String gameType){
        String key=(gameType==null?"":gameType.toLowerCase()).replaceAll("[^a-z]","");
        return switch(key){
            case "neverhave", "neverhaveiever" -> """
                Every prompt must be a grammatically complete Never Have I Ever statement that naturally follows the words "Never have I ever…".
                Write a light confession of at most 9 words, such as "re-read our old chats at midnight". Do not write a question, dare, command, scenario, or question mark.
                Never use the words "truth" or "dare". The options array must be empty because the interface supplies "I haven't" and "I have".
                """;
            case "wouldrather" -> """
                Create a playful either/or dilemma. Put a card theme of at most 6 words in prompt and exactly two distinct, equally appealing choices in options.
                Do not write truth questions, dares, confessions, yes/no questions, or more than two options.
                """;
            case "thisorthat" -> """
                Create a fast preference question in prompt and exactly two concise choices in options.
                The choices must be comparable alternatives, not truth answers or dares.
                """;
            case "truthdare", "truthordare" -> """
                The first half of items must be answerable Truth questions. The second half must be safe, achievable Dare instructions.
                Keep every options array empty. Do not mix a truth and a dare inside one item.
                """;
            case "quiz", "playfulquiz" -> """
                Each prompt must be a playful multiple-choice question with two to four concise options.
                Put the intended answer first. Do not write dares or Never Have I Ever statements.
                """;
            case "emoji", "emojidecoder" -> """
                Put an emoji-only or emoji-led memory clue in prompt. Put its short answer in options[0] and a helpful hint in options[1].
                Return exactly two options and never write a truth or dare.
                """;
            case "wheel", "spinthewheel", "slots", "slotmachine" -> """
                Every prompt must be a short prize, treat, promise, or activity that can be won. Keep every options array empty.
                Do not write questions, dares, or instructions.
                """;
            case "scratch", "scratchreveal" -> """
                Create one reveal: prompt is the short surprise title and options[0] is its warm supporting detail.
                Do not return a question or dare.
                """;
            case "treasure", "treasurehunt" -> """
                Each prompt is one solvable clue. Put a helpful hint in options[0] and one short accepted answer in options[1].
                Return exactly two options. Do not write truth-or-dare prompts.
                """;
            case "alwaysyou", "theanswerwasalwaysyou" -> """
                Each prompt is a funny affectionate question where every answer secretly points to the recipient.
                Return two to four playful answer variants in options. Never include dares.
                """;
            case "excuse", "excusegenerator" -> """
                Each prompt is a funny situation for which both people need an excuse. Put one playful sender excuse in options[0].
                Return exactly one option. Do not write a question, truth prompt, or dare.
                """;
            case "roast", "roastmegently" -> """
                Every prompt is a short, affectionate, harmless complaint or loving roast. Keep every options array empty.
                Never make it cruel, humiliating, sensitive, or a truth-or-dare prompt.
                """;
            case "fortune", "fortunecookie" -> """
                Every prompt is a short, positive fortune or gentle prediction. Never write a question, task, quiz, instruction, or question mark.
                Keep every options array empty.
                """;
            case "mysterybox" -> """
                Every prompt is a concise surprise, reward, promise, or reveal that can come out of a mystery box. Keep every options array empty.
                Do not write questions or dares.
                """;
            case "movie", "song" -> """
                Every prompt is a surprising, funny bonding question about shared chaos, snacks, plot twists, bloopers, superpowers, or inside-joke energy.
                Keep every options array empty. Avoid generic compatibility questions and never write dares.
                """;
            default -> """
                Every prompt must belong only to the named activity. Use zero to four concise options only when that activity genuinely needs choices.
                Never silently turn the activity into Truth or Dare.
                """;
        };
    }
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
