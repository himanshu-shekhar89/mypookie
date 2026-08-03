import { test, expect } from "@playwright/test";

test("creator signup through recipient completion produces a sender report", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create a gift/i }).click();

  await page.getByLabel("Your name").fill("E2E Sender");
  await page.getByLabel("Their name").fill("E2E Receiver");
  await page.getByLabel("They are").selectOption("Neutral");
  await page.getByRole("button", { name: /Build from scratch/i }).click();

  await page.locator(".activity-choice").filter({hasText:"Personal letter"}).locator(".activity-check").click();
  await page.getByRole("button", { name: /^Checkout/i }).click();

  await page.getByRole("tab", { name: "Sign up" }).click();
  await page.getByLabel("Email address").fill("creator-e2e@mypookie.test");
  await page.getByLabel("Password").fill("testing-password-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: /Choose when E2E Receiver can open it/i })).toBeVisible();
  await page.getByLabel(/Gift opening PIN/).fill("2468");
  await page.getByLabel(/How many times/).selectOption("1");

  await page.getByRole("button", { name: /Pay ₹.* securely|Complete free checkout/i }).click();
  const demoButton=page.getByRole("button", { name: /Complete test payment/i });
  await expect(demoButton).toBeVisible();
  await demoButton.click();

  await expect(page.getByRole("heading", { name: "A little world for E2E Receiver." })).toBeVisible();
  const shareLink=await page.locator("input[readonly]").inputValue();
  expect(shareLink).toContain("?gift=");

  await page.goto(shareLink);
  await page.getByPlaceholder("4–8 digit PIN").fill("2468");
  await page.getByRole("button", { name: /Open my gift/i }).click();
  await page.getByRole("button", { name: /Open your gift/i }).click();
  await page.getByRole("button", { name: "Open the envelope" }).click();
  const finishButton=page.getByRole("button", { name: /Finish this experience/i });
  await expect(finishButton).toBeEnabled();
  await finishButton.click();

  await expect(page.getByRole("heading", { name: "This little world is now yours." })).toBeVisible();
  await page.locator(".rating-stars button").nth(4).click();
  await page.getByRole("button", { name: "Send my rating" }).click();
  await page.getByPlaceholder("Write something from the heart…").fill("Loved every moment.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/Sent to E2E Sender/)).toBeVisible();

  const ordersResponse=await request.get("http://127.0.0.1:8080/api/orders",{headers:{"X-Demo-User":"local-creator"}});
  expect(ordersResponse.ok()).toBeTruthy();
  const orders=await ordersResponse.json() as Array<{recipientName:string;progressStatus:string;recipientMessage?:string;ratingStars?:number}>;
  const order=orders.find(item=>item.recipientName==="E2E Receiver"&&item.ratingStars===5&&item.recipientMessage==="Loved every moment.");
  expect(order).toMatchObject({progressStatus:"COMPLETED",recipientMessage:"Loved every moment.",ratingStars:5});
});
