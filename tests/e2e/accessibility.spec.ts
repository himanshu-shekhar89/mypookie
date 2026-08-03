import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public landing page has no serious structural accessibility violations",async({page})=>{
 await page.goto("/");
 const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).disableRules(["color-contrast"]).analyze();
 const serious=results.violations.filter(item=>item.impact==="serious"||item.impact==="critical");
 expect(serious,serious.map(item=>`${item.id}: ${item.help} (${item.nodes.length})`).join("\n")).toEqual([]);
});
