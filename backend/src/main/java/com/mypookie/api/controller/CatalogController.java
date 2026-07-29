package com.mypookie.api.controller;
import com.mypookie.api.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/catalog") @RequiredArgsConstructor
public class CatalogController {
 private final ActivityTypeRepository activities; private final BundleRepository bundles;
 @GetMapping public Map<String,Object> catalog(){return Map.of("activities",activities.findByActiveTrue(),"bundles",bundles.findByActiveTrue());}
}
