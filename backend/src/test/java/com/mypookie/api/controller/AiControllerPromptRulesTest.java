package com.mypookie.api.controller;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiControllerPromptRulesTest {
    @Test
    void playfulResultsHaveStrictCardLengthGuidance() {
        assertThat(AiController.playfulLengthRules())
            .contains("prompt must be at most 12 words")
            .contains("option at most 7 words")
            .contains("Never add explanations");
    }

    @Test
    void neverHaveIeverHasItsOwnStatementContract() {
        String rules = AiController.activityRulesFor("neverhave");

        assertThat(rules)
            .contains("Never Have I Ever statement")
            .contains("at most 9 words")
            .contains("options array must be empty")
            .contains("Never use the words \"truth\" or \"dare\"");
    }

    @Test
    void wouldRatherAlwaysProducesExactlyTwoChoices() {
        String rules = AiController.activityRulesFor("wouldrather");

        assertThat(rules)
            .contains("exactly two distinct")
            .contains("Do not write truth questions, dares");
    }

    @Test
    void truthDareKeepsItsOwnSplitFormat() {
        String rules = AiController.activityRulesFor("truthdare");

        assertThat(rules)
            .contains("first half")
            .contains("second half")
            .contains("Truth questions")
            .contains("Dare instructions");
    }

    @Test
    void memoryLaneGetsShortOrderedCaptions() {
        assertThat(AiController.activityRulesFor("memorycaptions"))
            .contains("scrapbook photo caption")
            .contains("at most 7 words")
            .contains("same order")
            .contains("options array empty");
    }
}
