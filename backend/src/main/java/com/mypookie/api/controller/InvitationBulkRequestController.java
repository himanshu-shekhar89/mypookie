package com.mypookie.api.controller;
import com.mypookie.api.model.InvitationBulkRequest;import com.mypookie.api.repository.InvitationBulkRequestRepository;import jakarta.validation.Valid;import lombok.RequiredArgsConstructor;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;import java.util.*;
@RestController @RequestMapping("/api/public/invitation-bulk-requests") @RequiredArgsConstructor
public class InvitationBulkRequestController {
 private final InvitationBulkRequestRepository requests;
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,String> create(@Valid @RequestBody Request r){
  if(r.quantity()<10)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Bulk orders start at 10 invitations.");
  var item=new InvitationBulkRequest();item.setId(UUID.randomUUID().toString());item.setName(r.name().trim());item.setEmail(r.email().trim().toLowerCase());item.setPhone(r.phone().trim());item.setQuantity(r.quantity());item.setEventType(r.eventType().trim());item.setMessage(r.message()==null?null:r.message().trim());requests.save(item);return Map.of("id",item.getId(),"status",item.getStatus());
 }
 public record Request(@jakarta.validation.constraints.NotBlank String name,@jakarta.validation.constraints.Email String email,@jakarta.validation.constraints.NotBlank String phone,@jakarta.validation.constraints.Min(10) int quantity,@jakarta.validation.constraints.NotBlank String eventType,String message){}
}
