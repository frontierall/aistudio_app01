
// Mock service to replace Gemini API
// This allows the game to run purely client-side without an API key

const LOW_SCORE_QUOTES = [
  "My grandma delivers faster on foot!",
  "Did you get lost in the parking lot?",
  "Cold pizza? You're paying for that!",
  "I've seen snails with more hustle.",
  "You drive like a tourist!",
  "Disaster! The toppings slid off!",
  "Go home, you're embarrassing the family."
];

const MED_SCORE_QUOTES = [
  "Not bad, but the cheese is getting solid.",
  "Faster! The customers are hungry!",
  "Okay effort, but no tip for you.",
  "Average. Just like your parking skills.",
  "You call that fast? I call it casual.",
  "Decent work, but don't get cocky.",
  "Keep pushing! The crust is cooling!"
];

const HIGH_SCORE_QUOTES = [
  "Mama Mia! That's speed!",
  "Employee of the month material!",
  "You're flying! The pizza is still hot!",
  "Excellent! You earned a free slice!",
  "Bravissimo! A true delivery legend!",
  "Unbelievable! Do you have a rocket engine?",
  "Perfecto! The customers are crying tears of joy!"
];

export const getGameOverCommentary = async (score: number): Promise<string> => {
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 600));

  let quotes;
  if (score < 5) {
    quotes = LOW_SCORE_QUOTES;
  } else if (score < 15) {
    quotes = MED_SCORE_QUOTES;
  } else {
    quotes = HIGH_SCORE_QUOTES;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
