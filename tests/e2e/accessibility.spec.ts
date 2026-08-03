import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public landing page has no serious accessibility violations",async({page})=>{
 await page.goto("/");
 const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
 const serious=results.violations.filter(item=>item.impact==="serious"||item.impact==="critical");
 const details=serious.flatMap(item=>item.nodes.map(node=>`${item.id}: ${node.target.join(" ")} — ${node.any[0]?.message??item.help}`));
 expect(serious.length,details.join("\n")).toBe(0);
});

test("primary landing actions work from the keyboard",async({page})=>{
 await page.goto("/");
 const primary=page.getByRole("button",{name:"Create a gift"});
 await expect(primary).toBeVisible();
 await primary.focus();
 await primary.press("Enter");
 await expect(page.getByText("Who is this little world for?",{exact:true})).toBeVisible();
});

test("search landing pages have no serious accessibility violations",async({page})=>{
 const routes=["/gifts-for-boyfriend","/gifts-for-girlfriend","/birthday-gifts-online","/anniversary-gifts-online","/digital-love-letter","/personalized-online-gifts"];
 for(const route of routes){
  await page.goto(route);
  const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  const serious=results.violations.filter(item=>item.impact==="serious"||item.impact==="critical");
  const details=serious.flatMap(item=>item.nodes.map(node=>`${route} ${item.id}: ${node.target.join(" ")}`));
  expect(serious.length,details.join("\n")).toBe(0);
 }
});
