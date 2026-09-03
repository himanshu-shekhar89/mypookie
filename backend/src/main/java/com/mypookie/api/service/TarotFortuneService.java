package com.mypookie.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypookie.api.model.TarotFortunePool;
import com.mypookie.api.repository.TarotFortunePoolRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import java.time.Instant;
import java.util.*;

@Service
public class TarotFortuneService {
 private final TarotFortunePoolRepository pools;
 private final ObjectMapper json;
 private final RestClient client;
 @Value("${app.groq.api-key:}") private String apiKey;
 @Value("${app.groq.model:openai/gpt-oss-20b}") private String model;

 public TarotFortuneService(TarotFortunePoolRepository pools,ObjectMapper json,RestClient.Builder builder){
  this.pools=pools; this.json=json; this.client=builder.baseUrl("https://api.groq.com/openai/v1").build();
 }

 @Transactional
 public synchronized List<String> drawNine(String theme){
  TarotFortunePool pool=pools.findById(1).orElseGet(TarotFortunePool::new);
  List<String> fortunes=read(pool.getFortunesJson());
  if(fortunes.size()<100||pool.getUsedCount()>=50){
   fortunes=generateHundred(theme);
   pool.setFortunesJson(write(fortunes));
   pool.setUsedCount(0);
   pool.setGeneratedAt(Instant.now());
  }
  int start=pool.getUsedCount();
  List<String> result=new ArrayList<>(9);
  for(int i=0;i<9;i++)result.add(fortunes.get((start+i)%fortunes.size()));
  pool.setUsedCount(start+9);
  pools.save(pool);
  return result;
 }

 private List<String> generateHundred(String theme){
  if(apiKey!=null&&!apiKey.isBlank())try{
   String safeTheme=theme==null||theme.isBlank()?"hope, affection and delightful surprises":theme;
   safeTheme=safeTheme.substring(0,Math.min(safeTheme.length(),160));
   String prompt="Create exactly 100 distinct, positive tarot-style fortunes for a warm digital gift. Theme: "+safeTheme+". Each fortune must be one sentence, 6 to 12 words, wholesome, hopeful, personal-feeling without assuming facts, and contain no question or instruction. Return JSON only as {\"fortunes\":[\"...\"]}.";
   Map<String,Object> body=Map.of("model",model,"temperature",1.0,"response_format",Map.of("type","json_object"),"messages",List.of(Map.of("role","system","content","You write concise, safe, varied fortunes and valid JSON."),Map.of("role","user","content",prompt)));
   JsonNode response=client.post().uri("/chat/completions").header(HttpHeaders.AUTHORIZATION,"Bearer "+apiKey).body(body).retrieve().body(JsonNode.class);
   JsonNode parsed=json.readTree(response.path("choices").path(0).path("message").path("content").asText());
   List<String> generated=new ArrayList<>();
   parsed.path("fortunes").forEach(node->{String value=node.asText().trim();if(!value.isBlank()&&value.length()<=180&&!generated.contains(value))generated.add(value);});
   if(generated.size()>=100)return new ArrayList<>(generated.subList(0,100));
  }catch(Exception ignored){}
  return fallbackHundred();
 }

 private List<String> fallbackHundred(){
  String[] openings={"A gentle surprise","A bright invitation","A quiet wish","A joyful message","A brave choice","A kind coincidence","A treasured memory","A new beginning","A familiar smile","A golden opportunity"};
  String[] endings={"will find you soon.","is already moving toward you.","will make an ordinary day magical.","opens a beautiful new chapter.","brings clarity when you need it.","returns as unexpected joy.","will grow through shared laughter.","lights the path ahead.","arrives with perfect timing.","will become a story worth keeping."};
  List<String> values=new ArrayList<>(100);
  for(String opening:openings)for(String ending:endings)values.add(opening+" "+ending);
  return values;
 }
 private List<String> read(String value){try{return json.readValue(value,new TypeReference<List<String>>(){});}catch(Exception ignored){return List.of();}}
 private String write(List<String> value){try{return json.writeValueAsString(value);}catch(Exception ignored){return "[]";}}
}
