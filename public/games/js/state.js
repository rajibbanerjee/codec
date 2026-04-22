// Single source of truth for game state
const state = {
  domain: null,       // selected scenario object
  stepIndex: 0,       // 0-3
  answers: [],        // { stepId, correct } per step
  score: 0,
  submitted: false,   // whether current step answer has been submitted
};

export function getState()              { return state; }
export function setDomain(scenario)    { state.domain = scenario; state.stepIndex = 0; state.answers = []; state.score = 0; }
export function nextStep()             { state.stepIndex++; state.submitted = false; }
export function recordAnswer(stepId, correct) {
  state.answers.push({ stepId, correct });
  if (correct) state.score += 25;
  state.submitted = true;
}
export function resetGame()            { state.domain = null; state.stepIndex = 0; state.answers = []; state.score = 0; state.submitted = false; }
