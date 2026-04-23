import { useState, useEffect, useMemo } from "react";
import {
  Heart, Plus, Sun, Cloud, Moon, Sparkles, Check, RefreshCw,
  ChevronRight, ChevronLeft, User, Apple, Palette, Music,
  Trees, BookOpen, Blocks, ArrowRight, X, Utensils, Clock,
  Star, Leaf
} from "lucide-react";

/* ============================================================
   LittleDay — Smart Parenting Assistant
   Single-file React prototype. All state in-memory (session).
   Architecture: data layer (recommendation engine) is pure and
   could be lifted into a Node/Firebase backend unchanged.
   ============================================================ */

/* -------- 1. DESIGN TOKENS (inline so single-file works) ---- */
const tokens = {
  cream: "#FBF6EE",
  paper: "#F5EDE0",
  ink: "#2B2420",
  inkSoft: "#6B5D54",
  peach: "#F2A07B",
  peachDeep: "#E07A4F",
  sage: "#A8B89A",
  sageDeep: "#7A8F6C",
  butter: "#F4D58D",
  rose: "#E8A5A0",
  sky: "#B8CFD8",
};

/* -------- 2. RECOMMENDATION ENGINE (pure functions) --------- */
/* These would live in /services/recommendations on a backend.   */
/* Rule-based v1; extendable to ML by swapping these functions.  */

const AGE_BANDS = {
  infant: { min: 0, max: 1, label: "Infant" },
  toddler: { min: 1, max: 3, label: "Toddler" },
  preschool: { min: 3, max: 6, label: "Preschool" },
  child: { min: 6, max: 10, label: "Child" },
};

function bandFor(ageYears) {
  if (ageYears < 1) return "infant";
  if (ageYears < 3) return "toddler";
  if (ageYears < 6) return "preschool";
  return "child";
}

/* Activity library keyed by (band, interest, slot) */
const ACTIVITY_LIBRARY = {
  morning: {
    toddler: {
      drawing: { title: "Crayon Rainbow", duration: 20, materials: ["Thick crayons", "Large paper"], steps: ["Tape paper to the table so it won't slide", "Show one color at a time and name it aloud", "Let them scribble freely — no corrections", "Celebrate each mark with a warm reaction"], benefits: ["Fine motor skills", "Color recognition"] },
      music: { title: "Morning Shaker Song", duration: 15, materials: ["Rice in a jar", "Your voice"], steps: ["Seal rice in a small lidded jar", "Sing a familiar nursery rhyme together", "Shake to the beat on strong syllables", "Pause and let them shake a solo"], benefits: ["Rhythm", "Listening"] },
      reading: { title: "Point-and-Name Book", duration: 15, materials: ["One picture book"], steps: ["Sit so they can see the pages", "Point to one object per page and name it", "Ask 'where is the...?' and wait", "Praise every attempt to point back"], benefits: ["Vocabulary", "Attention"] },
      building: { title: "Stack & Topple", duration: 20, materials: ["Soft blocks or cups"], steps: ["Stack three blocks slowly while they watch", "Invite them to knock it down — cheer!", "Hand them one block at a time to stack", "Count aloud as the tower grows"], benefits: ["Hand-eye coordination", "Cause and effect"] },
      outdoor: { title: "Garden Walk & Touch", duration: 20, materials: ["A safe outdoor spot"], steps: ["Walk slowly holding their hand", "Stop at each texture — leaf, bark, grass", "Name the texture: 'rough', 'soft', 'cool'", "Let them lead for the last few minutes"], benefits: ["Sensory development", "Gross motor"] },
    },
    preschool: {
      drawing: { title: "Shape Hunt Sketch", duration: 25, materials: ["Paper", "Markers or crayons"], steps: ["Walk around one room looking for circles", "Draw each circle you spot together", "Switch to squares, then triangles", "Tape the finished hunt sheet on the fridge"], benefits: ["Observation", "Shape recognition"] },
      music: { title: "Kitchen Band", duration: 20, materials: ["Wooden spoon", "Pots", "Bowl"], steps: ["Set out 3 pots of different sizes", "Play each one and notice the different sound", "Make a 4-beat pattern and ask them to copy", "Take turns being the 'band leader'"], benefits: ["Pattern recognition", "Confidence"] },
      reading: { title: "Story Predict", duration: 20, materials: ["A new-to-them picture book"], steps: ["Read the title and look at the cover", "Ask: 'what do you think happens?'", "Read a few pages, then pause and ask again", "Compare their guess to the real ending"], benefits: ["Comprehension", "Imagination"] },
      building: { title: "Block Tower Challenge", duration: 25, materials: ["Building blocks or LEGO DUPLO"], steps: ["Build a tower as tall as their knee", "Try to go as tall as their waist", "If it falls, talk about why — too narrow?", "Finish by building a house for a toy"], benefits: ["Problem solving", "Spatial skills"] },
      outdoor: { title: "Nature Treasure Hunt", duration: 30, materials: ["A small bag or basket"], steps: ["Make a list: one leaf, one stone, one flower", "Walk outside and collect together", "Sort the treasures by color at home", "Glue favorites onto a paper as a memory"], benefits: ["Classification", "Gross motor"] },
    },
    child: {
      drawing: { title: "Draw Your Morning", duration: 30, materials: ["Paper", "Colored pencils"], steps: ["Ask them to recall what they did after waking", "Draw each moment in a comic-strip row", "Label each box with one word", "Read the 'comic' back together"], benefits: ["Sequencing", "Self expression"] },
      music: { title: "Song Writing Mini", duration: 30, materials: ["Paper and pencil"], steps: ["Pick a familiar tune like Twinkle Twinkle", "Write 4 new lines about something they love", "Sing it together twice", "Record on your phone to play back"], benefits: ["Language", "Creativity"] },
      reading: { title: "Chapter + Summary", duration: 30, materials: ["Age-appropriate chapter book"], steps: ["Read one short chapter aloud, or take turns", "Afterward, ask for a 3-sentence summary", "Ask: what was the problem? How was it solved?", "Predict what happens next chapter"], benefits: ["Comprehension", "Critical thinking"] },
      building: { title: "Bridge Engineering", duration: 30, materials: ["Blocks", "A small toy car"], steps: ["Challenge: build a bridge the car can cross", "Test it — does it hold? Does it collapse?", "Rebuild stronger together", "Discuss what made version 2 better"], benefits: ["Engineering thinking", "Resilience"] },
      outdoor: { title: "Park Mission Run", duration: 40, materials: ["Park or open space"], steps: ["Set 3 missions: touch a red thing, find something round, spot a bird", "Time each mission playfully", "Finish with 5 minutes of free running", "Cool down with slow walking and water"], benefits: ["Cardiovascular", "Observation"] },
    },
  },
  afternoon: {
    toddler: {
      drawing: { title: "Finger Paint Clouds", duration: 15, materials: ["Washable finger paint", "Paper"], steps: ["Lay a towel under the workspace", "Dot 3 colors on the paper for them", "Let them smush and swirl with fingers", "Hang to dry while you clean hands together"], benefits: ["Sensory play", "Creativity"] },
      music: { title: "Copy the Clap", duration: 10, materials: ["Just your hands"], steps: ["Clap a simple pattern: clap-clap-pause", "Wait for them to copy it", "Make the patterns slightly longer each round", "Let them invent one for you to copy"], benefits: ["Memory", "Rhythm"] },
      reading: { title: "Cozy Lap Read", duration: 15, materials: ["A favorite repeat book"], steps: ["Settle into a comfy spot", "Read slowly with lots of expression", "Pause on the last word of rhymes — let them fill in", "Hug and say 'one more time?' once"], benefits: ["Bonding", "Language"] },
      building: { title: "Cup Tower Time", duration: 15, materials: ["Plastic cups"], steps: ["Demo stacking 3 cups upside down", "Hand cups one at a time", "Celebrate every stack and knock-down", "End with putting cups away together"], benefits: ["Motor control", "Tidying habit"] },
      outdoor: { title: "Bubble Chase", duration: 15, materials: ["Bubble solution", "Wand"], steps: ["Blow bubbles low to the ground", "Let them toddle after and pop them", "Count loudly: 'one... two... pop!'", "Take a water break halfway"], benefits: ["Gross motor", "Counting"] },
    },
    preschool: {
      drawing: { title: "Self Portrait", duration: 25, materials: ["Mirror", "Paper", "Markers"], steps: ["Look in the mirror together", "Notice eye color, hair, smile", "Draw a portrait while describing features", "Write their name underneath"], benefits: ["Self awareness", "Fine motor"] },
      music: { title: "Freeze Dance", duration: 15, materials: ["Any music player"], steps: ["Play an upbeat song and dance together", "Pause the music randomly — everyone freezes", "Whoever moves has to make a silly pose", "Play 3 rounds, laugh a lot"], benefits: ["Impulse control", "Gross motor"] },
      reading: { title: "Act Out the Story", duration: 25, materials: ["A familiar story"], steps: ["Reread a favorite short story", "Assign roles — you be the villain", "Act out each scene with voices", "Take a bow at the end"], benefits: ["Expression", "Memory"] },
      building: { title: "Fort Architect", duration: 30, materials: ["Pillows", "Blankets", "Chairs"], steps: ["Plan the fort together — draw it first", "Build the walls, then the roof", "Bring in a book and read inside", "Take it down carefully together"], benefits: ["Planning", "Spatial thinking"] },
      outdoor: { title: "Chalk Obstacle Course", duration: 30, materials: ["Sidewalk chalk"], steps: ["Draw hopscotch, a curvy line, a circle", "Instruction: hop to 5, walk the line, jump the circle", "Time their runs playfully", "Let them design the next course"], benefits: ["Balance", "Following directions"] },
    },
    child: {
      drawing: { title: "Invention Blueprint", duration: 30, materials: ["Paper", "Ruler", "Pencils"], steps: ["Brainstorm: what tool would make life easier?", "Draw the invention with labeled parts", "Explain how each part works", "Pitch it to a family member"], benefits: ["Innovation", "Communication"] },
      music: { title: "Rhythm Clap Game", duration: 20, materials: ["Just your hands"], steps: ["Teach a 4-beat hand-clap pattern", "Add one new move per round", "Speed up gradually", "Invent a new pattern together"], benefits: ["Coordination", "Memory"] },
      reading: { title: "Book Review Cards", duration: 25, materials: ["Index cards", "Pencil"], steps: ["Pick a recently finished book", "Write: title, favorite character, 2 sentences why", "Rate it out of 5 stars", "Keep the cards in a 'books I read' box"], benefits: ["Opinion forming", "Writing"] },
      building: { title: "Paper Bridge", duration: 30, materials: ["Printer paper", "Small cups", "Coins for weight"], steps: ["Challenge: a paper bridge between 2 cups", "Test how many coins it holds", "Fold the paper differently and retest", "Discuss why folding made it stronger"], benefits: ["Engineering", "Hypothesis testing"] },
      outdoor: { title: "Backyard Olympics", duration: 40, materials: ["Open outdoor space"], steps: ["Set 4 events: hop race, long jump, toss, sprint", "Record each result on paper", "Try to beat their own score on round 2", "Award a handmade medal"], benefits: ["Athleticism", "Goal setting"] },
    },
  },
  evening: {
    toddler: {
      drawing: { title: "Sticker Picture", duration: 10, materials: ["Stickers", "Paper"], steps: ["Peel one sticker at a time for them", "Let them place it anywhere on the page", "Name what each sticker is", "Display on the fridge"], benefits: ["Fine motor", "Choice making"] },
      music: { title: "Bath Time Songs", duration: 10, materials: ["Bath tub"], steps: ["Sing water songs during bath routine", "Splash gently on strong beats", "Name body parts as you wash each one", "End with a quiet lullaby"], benefits: ["Routine building", "Language"] },
      reading: { title: "Board Book Walk", duration: 10, materials: ["2-3 board books"], steps: ["Lay books on the floor", "Toddle over and pick one together", "Read just a few pages — stop before they lose interest", "Put away before the next activity"], benefits: ["Choice", "Attention"] },
      building: { title: "Sort by Color", duration: 10, materials: ["Colored blocks or toys"], steps: ["Set out 2 bowls of different colors", "Sort one toy at a time together", "Name each color as you sort", "Celebrate the finished bowls"], benefits: ["Classification", "Color names"] },
      outdoor: { title: "Evening Stroll", duration: 15, materials: ["Stroller or walking"], steps: ["Walk the same short loop each evening", "Point out one 'new' thing each time", "Listen for birds or dogs", "End at the same spot — hello, routine"], benefits: ["Fresh air", "Routine"] },
    },
    preschool: {
      drawing: { title: "Feelings Drawing", duration: 20, materials: ["Paper", "Crayons"], steps: ["Ask: what color is 'happy'?", "Draw a shape for each feeling they name", "Talk about which feeling fits today", "Hug and put the drawing in a 'feelings folder'"], benefits: ["Emotional literacy", "Self reflection"] },
      music: { title: "Dance Party", duration: 20, materials: ["Music player"], steps: ["Pick 2 favorite songs", "Dance freely — no rules", "Try one slow song, one fast", "End with stretches"], benefits: ["Mood regulation", "Gross motor"] },
      reading: { title: "Read-to-Me Night", duration: 20, materials: ["2 short books"], steps: ["They choose both books", "Read in a cozy nest of pillows", "Use different voices for characters", "Whisper the last page"], benefits: ["Bonding", "Listening"] },
      building: { title: "Kitchen Castle", duration: 25, materials: ["Tupperware", "Wooden spoons"], steps: ["Use kitchen items as castle blocks", "Build with them on the floor", "Move a small toy through the castle", "Put everything away as a game"], benefits: ["Resourcefulness", "Imagination"] },
      outdoor: { title: "Scooter or Bike", duration: 30, materials: ["Scooter/bike", "Helmet"], steps: ["Gear up and head to a safe path", "Practice starts and stops first", "Pick a 'destination' — a tree, a corner", "Slow cool-down back home"], benefits: ["Balance", "Confidence"] },
    },
    child: {
      drawing: { title: "Manga Panel", duration: 30, materials: ["Paper", "Pencil", "Black pen"], steps: ["Fold paper into 4 panels", "Sketch a tiny story — pencil first", "Ink the lines with pen", "Show it to someone and narrate"], benefits: ["Storytelling", "Fine motor"] },
      music: { title: "Song Learning", duration: 30, materials: ["A song they love"], steps: ["Play a song and write down the chorus", "Sing it together a few times", "Talk about what the lyrics mean", "Record a fun version on your phone"], benefits: ["Language", "Confidence"] },
      reading: { title: "Read-Aloud Duet", duration: 25, materials: ["A chapter book"], steps: ["Take turns reading paragraphs", "Pause at cliffhangers and predict", "Discuss one interesting word per page", "Bookmark and save for tomorrow"], benefits: ["Fluency", "Vocabulary"] },
      building: { title: "Marble Run", duration: 35, materials: ["Cardboard tubes", "Tape", "A marble"], steps: ["Tape tubes to a wall or cardboard", "Test marble flow — adjust angles", "Add a finish-line cup", "Challenge: make the ride last 10 seconds"], benefits: ["Physics", "Iteration"] },
      outdoor: { title: "Bike Ride Adventure", duration: 45, materials: ["Bike", "Helmet"], steps: ["Pick a route with 2 landmarks", "Ride there together at a steady pace", "Rest and water break at landmark 2", "Ride home the same way"], benefits: ["Cardiovascular", "Navigation"] },
    },
  },
  night: {
    infant: {
      default: { title: "Lullaby & Rock", duration: 15, materials: ["Soft lighting"], steps: ["Dim the lights", "Hum the same lullaby each night", "Rock slowly and steadily", "Lay down when drowsy but not asleep"], benefits: ["Sleep routine", "Bonding"] },
    },
    toddler: {
      default: { title: "Three Goodnights", duration: 10, materials: ["Their bedroom"], steps: ["Say goodnight to 3 things in the room", "Tuck in their favorite toy first", "Read one very short book", "Whisper 'I love you' and dim the light"], benefits: ["Predictable routine", "Security"] },
    },
    preschool: {
      default: { title: "Today's Best Moment", duration: 15, materials: ["Cozy bed"], steps: ["Tuck in and get comfy", "Ask: 'what was your best moment today?'", "Share yours too", "Read one story and turn off the light"], benefits: ["Reflection", "Gratitude"] },
    },
    child: {
      default: { title: "Wind-Down Journal", duration: 20, materials: ["A notebook", "Pencil"], steps: ["Write 2 things that went well today", "Write 1 thing to try tomorrow", "Read quietly for 10 minutes", "Lights out at the same time as yesterday"], benefits: ["Reflection", "Sleep habits"] },
    },
  },
};

function pickActivity(slot, band, interests, history) {
  // history = { skipped: Set of titles, completed: Set of titles }
  if (slot === "night") {
    const entry = ACTIVITY_LIBRARY.night[band]?.default ||
                  ACTIVITY_LIBRARY.night.preschool.default;
    return { ...entry, slot, interest: "calm" };
  }
  const byBand = ACTIVITY_LIBRARY[slot]?.[band] || ACTIVITY_LIBRARY[slot].preschool;
  // Prefer interests the child actually has. Fall back to any.
  const relevantInterests = interests.filter(i => byBand[i]);
  const pool = relevantInterests.length ? relevantInterests : Object.keys(byBand);

  // Personalization: downrank skipped, uprank completed
  const scored = pool.map(key => {
    const a = byBand[key];
    let score = Math.random();
    if (history.skipped?.has(a.title)) score -= 0.6;
    if (history.completed?.has(a.title)) score += 0.3;
    return { key, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = byBand[scored[0].key];
  return { ...picked, slot, interest: scored[0].key };
}

/* Meal library: simplified for prototype, easy to extend. */
const MEAL_LIBRARY = {
  breakfast: {
    veg: [
      { name: "Banana Oats Bowl", ingredients: ["½ cup oats", "1 banana", "1 cup milk", "Honey (omit for <1yr)"], recipe: ["Warm milk in a pan", "Add oats, stir 3–5 min", "Top with sliced banana", "Drizzle honey for kids over 1"], benefits: ["Fiber", "Potassium", "Slow energy"] },
      { name: "Veggie Scrambled Paneer", ingredients: ["50g paneer", "1 tomato", "1 tsp oil", "Pinch of turmeric"], recipe: ["Heat oil in a pan", "Toss diced tomato until soft", "Crumble paneer in with turmeric", "Cook 3 minutes and serve warm"], benefits: ["Protein", "Calcium"] },
      { name: "Apple Cinnamon Toast", ingredients: ["1 slice whole wheat bread", "½ apple", "Cinnamon", "1 tsp butter"], recipe: ["Toast the bread lightly", "Spread a thin layer of butter", "Top with thin apple slices", "Sprinkle cinnamon and serve"], benefits: ["Fiber", "Antioxidants"] },
    ],
    nonveg: [
      { name: "Egg & Cheese Roll", ingredients: ["1 egg", "1 small tortilla", "Slice of cheese", "Butter"], recipe: ["Whisk the egg with a pinch of salt", "Cook flat in a buttered pan", "Lay cheese and tortilla on top, flip", "Roll up and slice into coins"], benefits: ["Protein", "B vitamins"] },
      { name: "Chicken Oat Porridge", ingredients: ["½ cup oats", "30g shredded cooked chicken", "1 cup broth", "Pinch of pepper"], recipe: ["Simmer oats in broth until soft", "Stir in shredded chicken", "Season very mildly", "Serve warm"], benefits: ["Protein", "Fiber"] },
    ],
    vegan: [
      { name: "Peanut Butter Banana Toast", ingredients: ["1 slice whole wheat bread", "1 tbsp peanut butter", "½ banana"], recipe: ["Toast the bread", "Spread peanut butter while warm", "Layer banana slices on top", "Cut into fun shapes"], benefits: ["Healthy fats", "Potassium"] },
      { name: "Soy Milk Oats", ingredients: ["½ cup oats", "1 cup soy milk", "Berries", "Maple syrup"], recipe: ["Warm soy milk", "Cook oats until creamy", "Top with berries", "Drizzle maple syrup"], benefits: ["Plant protein", "Antioxidants"] },
    ],
  },
  midMorning: {
    veg: [
      { name: "Fruit Cubes", ingredients: ["Apple", "Pear", "A few grapes (halved for small kids)"], recipe: ["Wash all fruit", "Cut apple and pear into small cubes", "Halve grapes lengthwise for safety", "Serve in a colorful bowl"], benefits: ["Vitamins", "Hydration"] },
      { name: "Yogurt with Honey", ingredients: ["½ cup plain yogurt", "1 tsp honey (over 1yr)", "A few nuts (if no allergy)"], recipe: ["Scoop yogurt into a bowl", "Swirl in honey", "Top with crushed nuts if safe", "Eat with a small spoon"], benefits: ["Probiotics", "Calcium"] },
    ],
    nonveg: [
      { name: "Boiled Egg", ingredients: ["1 egg", "Salt", "Pepper"], recipe: ["Boil the egg for 8 minutes", "Cool under running water", "Peel and slice in half", "Sprinkle a tiny pinch of salt"], benefits: ["Protein", "Choline"] },
    ],
    vegan: [
      { name: "Trail Mix Cup", ingredients: ["Raisins", "Pumpkin seeds", "Dry cereal"], recipe: ["Mix equal parts in a small cup", "Skip nuts if there's any allergy", "Pack for on-the-go", "Eat with clean hands"], benefits: ["Healthy fats", "Iron"] },
    ],
  },
  lunch: {
    veg: [
      { name: "Dal, Rice & Veggies", ingredients: ["½ cup rice", "½ cup cooked dal", "Steamed carrots", "Ghee"], recipe: ["Cook rice till soft", "Warm the dal with a little ghee", "Steam carrots until fork-tender", "Serve together in one bowl"], benefits: ["Protein", "Carbs", "Vitamin A"] },
      { name: "Veg Pasta", ingredients: ["½ cup pasta", "Cherry tomatoes", "Spinach", "Olive oil", "Cheese"], recipe: ["Boil the pasta until al dente", "Sauté tomatoes and spinach in oil", "Toss the pasta in the pan", "Top with a little grated cheese"], benefits: ["Carbs", "Iron"] },
    ],
    nonveg: [
      { name: "Chicken Rice Bowl", ingredients: ["½ cup rice", "60g cooked chicken", "Cucumber", "Soy sauce (tiny bit)"], recipe: ["Cook the rice", "Dice or shred the cooked chicken", "Slice cucumber thin", "Assemble and add a drop of soy sauce"], benefits: ["Protein", "Carbs"] },
    ],
    vegan: [
      { name: "Chickpea Bowl", ingredients: ["½ cup cooked chickpeas", "½ cup quinoa", "Roasted sweet potato", "Lemon"], recipe: ["Cook the quinoa", "Roast diced sweet potato at 200°C for 20 min", "Warm the chickpeas in a pan", "Layer into a bowl and squeeze lemon on top"], benefits: ["Plant protein", "Fiber"] },
    ],
  },
  snack: {
    veg: [
      { name: "Cheese & Cracker Plate", ingredients: ["Cheese cubes", "Whole grain crackers", "Cucumber sticks"], recipe: ["Cube the cheese into bite size", "Arrange crackers in a row", "Add cucumber sticks alongside", "Serve at child's table"], benefits: ["Calcium", "Fiber"] },
      { name: "Banana Pancakes (mini)", ingredients: ["1 banana", "1 egg (or flax egg)", "A little oil"], recipe: ["Mash banana with the egg", "Pour silver-dollar sized rounds in a pan", "Flip when bubbles form", "Cool slightly before serving"], benefits: ["Potassium", "Protein"] },
    ],
    nonveg: [
      { name: "Chicken Sliders", ingredients: ["Small bun", "Shredded cooked chicken", "Yogurt", "Lettuce"], recipe: ["Mix chicken with a spoon of yogurt", "Warm the bun lightly", "Layer lettuce and chicken inside", "Slice in half for little hands"], benefits: ["Protein"] },
    ],
    vegan: [
      { name: "Hummus & Veggies", ingredients: ["¼ cup hummus", "Carrot sticks", "Bell pepper strips"], recipe: ["Scoop hummus into a small bowl", "Cut veggies into easy-grip sticks", "Arrange around the hummus", "Dip and munch"], benefits: ["Fiber", "Vitamin C"] },
    ],
  },
  dinner: {
    veg: [
      { name: "Veggie Khichdi", ingredients: ["¼ cup rice", "¼ cup moong dal", "Mixed vegetables", "Ghee", "Turmeric"], recipe: ["Wash rice and dal together", "Pressure cook with veg and turmeric", "Finish with a spoon of ghee", "Serve warm and soft"], benefits: ["Easy digestion", "Complete protein"] },
      { name: "Paneer Wrap", ingredients: ["1 roti", "Paneer cubes", "Yogurt sauce", "Cucumber"], recipe: ["Lightly sauté paneer in a dry pan", "Warm the roti", "Spread yogurt and add paneer + cucumber", "Roll and slice in half"], benefits: ["Calcium", "Protein"] },
    ],
    nonveg: [
      { name: "Fish & Veg Rice", ingredients: ["Small fish fillet", "½ cup rice", "Steamed broccoli", "Lemon"], recipe: ["Pan-sear fish 3 min per side", "Cook the rice", "Steam the broccoli", "Plate together and squeeze lemon"], benefits: ["Omega-3", "Protein"] },
    ],
    vegan: [
      { name: "Lentil Stew", ingredients: ["½ cup red lentils", "Carrot", "Onion", "Garlic", "Cumin"], recipe: ["Sauté onion and garlic gently", "Add carrot, lentils, cumin and water", "Simmer 20 min until soft", "Blend slightly for younger kids"], benefits: ["Iron", "Protein"] },
    ],
  },
};

function pickMeal(slot, diet, allergies = []) {
  const dietKey = diet === "vegan" ? "vegan" : diet === "nonveg" ? "nonveg" : "veg";
  let pool = MEAL_LIBRARY[slot][dietKey] || MEAL_LIBRARY[slot].veg;
  // Allergy filter — drop meals whose ingredients include any allergen keyword.
  if (allergies.length) {
    pool = pool.filter(m => !m.ingredients.some(ing =>
      allergies.some(a => ing.toLowerCase().includes(a.toLowerCase()))
    ));
  }
  if (!pool.length) pool = MEAL_LIBRARY[slot].veg;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildDailyPlan(child) {
  const ageYears = child.ageMonths / 12;
  const band = bandFor(ageYears);
  const history = {
    skipped: new Set(child.skipped || []),
    completed: new Set(child.completed || []),
  };
  const interests = child.interests || [];
  const activities = [
    pickActivity("morning", band, interests, history),
    pickActivity("afternoon", band, interests, history),
    pickActivity("evening", band, interests, history),
    pickActivity("night", band, interests, history),
  ];
  const meals = [
    { slot: "breakfast", label: "Breakfast", ...pickMeal("breakfast", child.diet, child.allergies) },
    { slot: "midMorning", label: "Mid-morning snack", ...pickMeal("midMorning", child.diet, child.allergies) },
    { slot: "lunch", label: "Lunch", ...pickMeal("lunch", child.diet, child.allergies) },
    { slot: "snack", label: "Evening snack", ...pickMeal("snack", child.diet, child.allergies) },
    { slot: "dinner", label: "Dinner", ...pickMeal("dinner", child.diet, child.allergies) },
  ];
  return { activities, meals, band };
}

/* -------- 3. UI PRIMITIVES ---------------------------------- */

function SoftCard({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: tokens.cream,
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 1px 0 rgba(43,36,32,0.04), 0 8px 24px -16px rgba(43,36,32,0.18)",
        border: `1px solid rgba(43,36,32,0.06)`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease",
        ...style,
      }}
      onMouseDown={e => onClick && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </div>
  );
}

function Pill({ active, onClick, children, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? tokens.ink : tokens.cream,
        color: active ? tokens.cream : tokens.ink,
        border: `1.5px solid ${active ? tokens.ink : "rgba(43,36,32,0.15)"}`,
        padding: "10px 16px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s ease",
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(43,36,32,0.2)" : tokens.ink,
        color: tokens.cream,
        border: "none",
        padding: "16px 24px",
        borderRadius: 999,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: 0.2,
        boxShadow: disabled ? "none" : "0 6px 16px -8px rgba(43,36,32,0.4)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* -------- 4. SCREENS ---------------------------------------- */

function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  return (
    <div style={{ padding: "48px 24px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: tokens.peach,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32, boxShadow: "0 8px 24px -10px rgba(224,122,79,0.5)"
        }}>
          <Heart size={28} color={tokens.cream} fill={tokens.cream} />
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 40, lineHeight: 1.1, color: tokens.ink, margin: 0, fontWeight: 400 }}>
          Hello,<br />little one's <em style={{ fontStyle: "italic", color: tokens.peachDeep }}>day</em> awaits.
        </h1>
        <p style={{ fontSize: 16, color: tokens.inkSoft, lineHeight: 1.5, marginTop: 16, marginBottom: 40 }}>
          A warm companion for everyday plans, gentle activities, and meals your child will love.
        </p>

        <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Your name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="What should we call you?"
          style={{
            background: tokens.cream,
            border: `1.5px solid rgba(43,36,32,0.12)`,
            borderRadius: 16,
            padding: "16px 18px",
            fontSize: 16,
            color: tokens.ink,
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 24,
          }}
        />
      </div>

      <PrimaryButton onClick={() => onDone(name || "Mama")}>
        Begin <ArrowRight size={18} />
      </PrimaryButton>
      <button
        onClick={() => onDone("Mama")}
        style={{ background: "none", border: "none", color: tokens.inkSoft, marginTop: 16, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
      >
        Skip for now
      </button>
    </div>
  );
}

const INTEREST_OPTIONS = [
  { id: "drawing", label: "Drawing", icon: Palette },
  { id: "music", label: "Music", icon: Music },
  { id: "outdoor", label: "Outdoor play", icon: Trees },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "building", label: "Building", icon: Blocks },
];

function ChildForm({ onSave, onCancel, existing }) {
  const [name, setName] = useState(existing?.name || "");
  const [ageYears, setAgeYears] = useState(existing ? Math.floor(existing.ageMonths / 12) : 3);
  const [ageMonths, setAgeMonths] = useState(existing ? existing.ageMonths % 12 : 0);
  const [gender, setGender] = useState(existing?.gender || "");
  const [interests, setInterests] = useState(existing?.interests || []);
  const [diet, setDiet] = useState(existing?.diet || "veg");
  const [allergies, setAllergies] = useState(existing?.allergies?.join(", ") || "");
  const [routine, setRoutine] = useState(existing?.routine || "balanced");
  const [step, setStep] = useState(0);

  const steps = ["Basics", "Interests", "Food", "Rhythm"];

  function toggle(id) {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function save() {
    const child = {
      id: existing?.id || `child_${Date.now()}`,
      name: name || "Little one",
      ageMonths: ageYears * 12 + ageMonths,
      gender,
      interests,
      diet,
      allergies: allergies.split(",").map(a => a.trim()).filter(Boolean),
      routine,
      skipped: existing?.skipped || [],
      completed: existing?.completed || [],
      createdAt: existing?.createdAt || Date.now(),
    };
    onSave(child);
  }

  return (
    <div style={{ padding: "24px 24px 32px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <button
          onClick={() => step === 0 ? onCancel() : setStep(step - 1)}
          style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: tokens.inkSoft, fontSize: 15, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i <= step ? tokens.peachDeep : "rgba(43,36,32,0.15)",
              transition: "all 0.2s ease"
            }} />
          ))}
        </div>
      </div>

      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, lineHeight: 1.15, color: tokens.ink, margin: "0 0 4px", fontWeight: 400 }}>
        {existing ? "Edit profile" : "Tell us about your"}<br />
        {!existing && <em style={{ fontStyle: "italic", color: tokens.peachDeep }}>little one</em>}
      </h2>
      <p style={{ color: tokens.inkSoft, fontSize: 14, marginTop: 0, marginBottom: 28 }}>{steps[step]}</p>

      <div style={{ flex: 1 }}>
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Their name"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: tokens.cream, border: `1.5px solid rgba(43,36,32,0.12)`,
                  borderRadius: 16, padding: "14px 16px", fontSize: 16, color: tokens.ink,
                  fontFamily: "inherit", outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Age</label>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <input type="number" min={0} max={12} value={ageYears} onChange={e => setAgeYears(Math.max(0, Math.min(12, +e.target.value || 0)))}
                    style={{ width: "100%", boxSizing: "border-box", background: tokens.cream, border: `1.5px solid rgba(43,36,32,0.12)`, borderRadius: 16, padding: "14px 16px", fontSize: 16, color: tokens.ink, fontFamily: "inherit", outline: "none" }} />
                  <div style={{ fontSize: 12, color: tokens.inkSoft, marginTop: 6, textAlign: "center" }}>years</div>
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" min={0} max={11} value={ageMonths} onChange={e => setAgeMonths(Math.max(0, Math.min(11, +e.target.value || 0)))}
                    style={{ width: "100%", boxSizing: "border-box", background: tokens.cream, border: `1.5px solid rgba(43,36,32,0.12)`, borderRadius: 16, padding: "14px 16px", fontSize: 16, color: tokens.ink, fontFamily: "inherit", outline: "none" }} />
                  <div style={{ fontSize: 12, color: tokens.inkSoft, marginTop: 6, textAlign: "center" }}>months</div>
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Gender <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["girl", "boy", "other"].map(g => (
                  <Pill key={g} active={gender === g} onClick={() => setGender(gender === g ? "" : g)}>
                    {g[0].toUpperCase() + g.slice(1)}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p style={{ color: tokens.inkSoft, fontSize: 14, marginTop: -12, marginBottom: 20 }}>Pick anything they light up for. Choose a few.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {INTEREST_OPTIONS.map(opt => (
                <Pill key={opt.id} active={interests.includes(opt.id)} onClick={() => toggle(opt.id)} icon={opt.icon}>
                  {opt.label}
                </Pill>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Diet</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{id:"veg",l:"Vegetarian"},{id:"nonveg",l:"Non-veg"},{id:"vegan",l:"Vegan"}].map(d => (
                  <Pill key={d.id} active={diet === d.id} onClick={() => setDiet(d.id)}>{d.l}</Pill>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: tokens.inkSoft, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Allergies</label>
              <input
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. nuts, dairy, gluten"
                style={{ width: "100%", boxSizing: "border-box", background: tokens.cream, border: `1.5px solid rgba(43,36,32,0.12)`, borderRadius: 16, padding: "14px 16px", fontSize: 16, color: tokens.ink, fontFamily: "inherit", outline: "none" }}
              />
              <div style={{ fontSize: 12, color: tokens.inkSoft, marginTop: 6 }}>Separate with commas. We'll avoid these in recipes.</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ color: tokens.inkSoft, fontSize: 14, marginTop: -12, marginBottom: 20 }}>What kind of day suits them best?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { id: "active", label: "Active", desc: "Lots of movement and play", icon: Sun },
                { id: "balanced", label: "Balanced", desc: "A mix of calm and play", icon: Cloud },
                { id: "calm", label: "Calm", desc: "Gentle, quieter activities", icon: Moon },
              ].map(r => {
                const Icon = r.icon;
                const active = routine === r.id;
                return (
                  <div key={r.id} onClick={() => setRoutine(r.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: 16,
                      background: active ? tokens.paper : tokens.cream,
                      border: `1.5px solid ${active ? tokens.ink : "rgba(43,36,32,0.08)"}`,
                      borderRadius: 20, cursor: "pointer", transition: "all 0.15s ease",
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: active ? tokens.ink : tokens.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={active ? tokens.cream : tokens.inkSoft} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: tokens.ink, fontSize: 15 }}>{r.label}</div>
                      <div style={{ color: tokens.inkSoft, fontSize: 13, marginTop: 2 }}>{r.desc}</div>
                    </div>
                    {active && <Check size={20} color={tokens.ink} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        {step < steps.length - 1 ? (
          <PrimaryButton onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={18} />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={save}>
            {existing ? "Save changes" : "Create profile"} <Check size={18} />
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

function AddChildIntro({ onStart, onCancel }) {
  return (
    <div style={{ padding: "24px 24px 32px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <button onClick={onCancel} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: tokens.inkSoft, fontSize: 15, cursor: "pointer", fontFamily: "inherit", padding: 0, alignSelf: "flex-start", marginBottom: 24 }}>
        <ChevronLeft size={18} /> Back
      </button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: tokens.butter, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <Sparkles size={30} color={tokens.ink} />
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 30, color: tokens.ink, margin: "0 0 12px", fontWeight: 400, lineHeight: 1.2 }}>
          Let's meet your<br /><em style={{ color: tokens.peachDeep }}>little one</em>
        </h2>
        <p style={{ color: tokens.inkSoft, fontSize: 15, lineHeight: 1.5, maxWidth: 300, margin: 0 }}>
          Four quick steps and we'll build gentle daily plans tuned just for them.
        </p>
      </div>
      <PrimaryButton onClick={onStart}>
        Start <ArrowRight size={18} />
      </PrimaryButton>
    </div>
  );
}

/* The main dashboard — today's plan for the active child */
const SLOT_META = {
  morning: { label: "Morning", icon: Sun, time: "8–10 am", tint: tokens.butter },
  afternoon: { label: "Afternoon", icon: Cloud, time: "1–3 pm", tint: tokens.sky },
  evening: { label: "Evening", icon: Sparkles, time: "5–6 pm", tint: tokens.peach },
  night: { label: "Night", icon: Moon, time: "8 pm", tint: tokens.sage },
};

function Dashboard({ user, children, activeId, onSwitch, onAddChild, onEditChild, setChildren }) {
  const child = children.find(c => c.id === activeId) || children[0];
  const [plan, setPlan] = useState(() => buildDailyPlan(child));
  const [tab, setTab] = useState("activities");
  const [openActivity, setOpenActivity] = useState(null);
  const [openMeal, setOpenMeal] = useState(null);

  useEffect(() => { setPlan(buildDailyPlan(child)); }, [child.id]);

  const completedCount = plan.activities.filter(a => child.completed?.includes(a.title)).length;

  function refreshPlan() {
    setPlan(buildDailyPlan(child));
  }

  function toggleDone(activity) {
    setChildren(prev => prev.map(c => {
      if (c.id !== child.id) return c;
      const isDone = c.completed?.includes(activity.title);
      return {
        ...c,
        completed: isDone ? c.completed.filter(t => t !== activity.title) : [...(c.completed || []), activity.title],
      };
    }));
  }

  function skip(activity) {
    setChildren(prev => prev.map(c => {
      if (c.id !== child.id) return c;
      return { ...c, skipped: [...(c.skipped || []), activity.title] };
    }));
    // regenerate just that slot
    const newActivity = pickActivity(activity.slot, plan.band, child.interests, {
      skipped: new Set([...(child.skipped || []), activity.title]),
      completed: new Set(child.completed || []),
    });
    setPlan(p => ({ ...p, activities: p.activities.map(a => a.slot === activity.slot ? newActivity : a) }));
    setOpenActivity(null);
  }

  const ageLabel = useMemo(() => {
    const yr = Math.floor(child.ageMonths / 12);
    const mo = child.ageMonths % 12;
    if (yr === 0) return `${mo} mo`;
    if (mo === 0) return `${yr} yr`;
    return `${yr} yr ${mo} mo`;
  }, [child.ageMonths]);

  return (
    <div style={{ minHeight: "100%", background: tokens.paper, paddingBottom: 40 }}>
      {/* Top bar */}
      <div style={{ padding: "20px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: tokens.inkSoft, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>Hello, {user}</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: tokens.ink, marginTop: 2 }}>
            Today, <em style={{ color: tokens.peachDeep }}>{new Date().toLocaleDateString(undefined, { weekday: "long" })}</em>
          </div>
        </div>
        <button
          onClick={refreshPlan}
          style={{ background: tokens.cream, border: `1px solid rgba(43,36,32,0.1)`, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          title="Regenerate today's plan"
        >
          <RefreshCw size={18} color={tokens.ink} />
        </button>
      </div>

      {/* Child switcher */}
      <div style={{ display: "flex", gap: 10, padding: "12px 20px", overflowX: "auto" }}>
        {children.map(c => (
          <button key={c.id} onClick={() => onSwitch(c.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: c.id === child.id ? tokens.ink : tokens.cream,
              color: c.id === child.id ? tokens.cream : tokens.ink,
              padding: "8px 14px 8px 8px", borderRadius: 999, border: "none",
              fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
              boxShadow: c.id === child.id ? "0 6px 16px -8px rgba(43,36,32,0.4)" : "none",
              flexShrink: 0,
            }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%",
              background: c.id === child.id ? tokens.peach : tokens.paper,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: tokens.ink }}>
              {c.name[0]?.toUpperCase()}
            </div>
            {c.name}
          </button>
        ))}
        <button onClick={onAddChild}
          style={{ background: "transparent", border: `1.5px dashed rgba(43,36,32,0.25)`, padding: "8px 14px", borderRadius: 999, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 14, color: tokens.inkSoft, cursor: "pointer", flexShrink: 0 }}>
          <Plus size={16} /> Add child
        </button>
      </div>

      {/* Hero card for the active child */}
      <div style={{ padding: "12px 20px 0" }}>
        <SoftCard style={{ background: `linear-gradient(135deg, ${tokens.peach} 0%, ${tokens.rose} 100%)`, color: tokens.ink, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, opacity: 0.7 }}>{AGE_BANDS[plan.band].label} · {ageLabel}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, lineHeight: 1.1, marginTop: 6 }}>{child.name}</div>
              <div style={{ fontSize: 14, marginTop: 8, opacity: 0.75 }}>
                {completedCount}/{plan.activities.length} activities done today
              </div>
            </div>
            <button onClick={() => onEditChild(child.id)}
              style={{ background: "rgba(43,36,32,0.12)", border: "none", borderRadius: 12, padding: 10, cursor: "pointer" }}>
              <User size={16} color={tokens.ink} />
            </button>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16, height: 6, background: "rgba(43,36,32,0.12)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${(completedCount / plan.activities.length) * 100}%`,
              height: "100%", background: tokens.ink, borderRadius: 999,
              transition: "width 0.3s ease"
            }} />
          </div>
        </SoftCard>
      </div>

      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 8, padding: "20px 20px 0" }}>
        <button onClick={() => setTab("activities")}
          style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none",
            background: tab === "activities" ? tokens.ink : "transparent",
            color: tab === "activities" ? tokens.cream : tokens.inkSoft,
            fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Sparkles size={16} /> Activities
        </button>
        <button onClick={() => setTab("meals")}
          style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none",
            background: tab === "meals" ? tokens.ink : "transparent",
            color: tab === "meals" ? tokens.cream : tokens.inkSoft,
            fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Utensils size={16} /> Meals
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px" }}>
        {tab === "activities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {plan.activities.map(a => {
              const meta = SLOT_META[a.slot];
              const Icon = meta.icon;
              const isDone = child.completed?.includes(a.title);
              return (
                <SoftCard key={a.slot} onClick={() => setOpenActivity(a)} style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 64, background: meta.tint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
                      <Icon size={22} color={tokens.ink} />
                      <div style={{ fontSize: 10, fontWeight: 700, color: tokens.ink, marginTop: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>{meta.label}</div>
                    </div>
                    <div style={{ flex: 1, padding: 16 }}>
                      <div style={{ fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600 }}>{meta.time} · {a.duration} min</div>
                      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: tokens.ink, marginTop: 4, lineHeight: 1.25, textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.5 : 1 }}>
                        {a.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <button onClick={e => { e.stopPropagation(); toggleDone(a); }}
                          style={{
                            background: isDone ? tokens.sage : tokens.paper,
                            color: isDone ? tokens.cream : tokens.inkSoft,
                            border: "none", padding: "6px 12px", borderRadius: 999,
                            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                          <Check size={12} /> {isDone ? "Done" : "Mark done"}
                        </button>
                        <ChevronRight size={18} color={tokens.inkSoft} style={{ marginLeft: "auto" }} />
                      </div>
                    </div>
                  </div>
                </SoftCard>
              );
            })}
          </div>
        )}

        {tab === "meals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {plan.meals.map(m => (
              <SoftCard key={m.slot} onClick={() => setOpenMeal(m)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: tokens.butter, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Apple size={22} color={tokens.ink} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17, color: tokens.ink, marginTop: 2, lineHeight: 1.2 }}>{m.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {m.benefits.slice(0, 2).map(b => (
                        <span key={b} style={{ fontSize: 11, color: tokens.sageDeep, background: `${tokens.sage}33`, padding: "3px 8px", borderRadius: 999, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Leaf size={10} /> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={18} color={tokens.inkSoft} />
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </div>

      {/* Activity detail sheet */}
      {openActivity && (
        <DetailSheet onClose={() => setOpenActivity(null)} tint={SLOT_META[openActivity.slot].tint}>
          <div style={{ fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>
            {SLOT_META[openActivity.slot].label} · <Clock size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {openActivity.duration} min
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: tokens.ink, margin: "8px 0 16px", fontWeight: 400, lineHeight: 1.15 }}>{openActivity.title}</h2>

          <SectionLabel>You'll need</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {openActivity.materials.map(m => (
              <span key={m} style={{ fontSize: 13, background: tokens.paper, color: tokens.ink, padding: "6px 12px", borderRadius: 999, border: `1px solid rgba(43,36,32,0.08)` }}>{m}</span>
            ))}
          </div>

          <SectionLabel>How to play</SectionLabel>
          <ol style={{ paddingLeft: 0, listStyle: "none", margin: "0 0 20px", counterReset: "step" }}>
            {openActivity.steps.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: tokens.ink, color: tokens.cream, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ color: tokens.ink, fontSize: 15, lineHeight: 1.5 }}>{s}</div>
              </li>
            ))}
          </ol>

          <SectionLabel>Good for</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
            {openActivity.benefits.map(b => (
              <span key={b} style={{ fontSize: 13, background: `${tokens.sage}33`, color: tokens.sageDeep, padding: "6px 12px", borderRadius: 999, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Star size={12} /> {b}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => skip(openActivity)}
              style={{ flex: 1, background: tokens.cream, border: `1.5px solid rgba(43,36,32,0.12)`, padding: "14px", borderRadius: 999, fontFamily: "inherit", fontWeight: 600, color: tokens.ink, cursor: "pointer", fontSize: 14 }}>
              Not today
            </button>
            <PrimaryButton onClick={() => { toggleDone(openActivity); setOpenActivity(null); }} style={{ flex: 1.4 }}>
              <Check size={16} /> Mark done
            </PrimaryButton>
          </div>
        </DetailSheet>
      )}

      {/* Meal detail sheet */}
      {openMeal && (
        <DetailSheet onClose={() => setOpenMeal(null)} tint={tokens.butter}>
          <div style={{ fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>{openMeal.label}</div>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: tokens.ink, margin: "8px 0 16px", fontWeight: 400, lineHeight: 1.15 }}>{openMeal.name}</h2>

          <SectionLabel>Ingredients</SectionLabel>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: "0 0 20px" }}>
            {openMeal.ingredients.map(i => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(43,36,32,0.06)`, fontSize: 15, color: tokens.ink }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.peachDeep }} />
                {i}
              </li>
            ))}
          </ul>

          <SectionLabel>Quick recipe</SectionLabel>
          <ol style={{ paddingLeft: 0, listStyle: "none", margin: "0 0 20px" }}>
            {openMeal.recipe.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: tokens.ink, color: tokens.cream, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ color: tokens.ink, fontSize: 15, lineHeight: 1.5 }}>{s}</div>
              </li>
            ))}
          </ol>

          <SectionLabel>Nutrition highlights</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {openMeal.benefits.map(b => (
              <span key={b} style={{ fontSize: 13, background: `${tokens.sage}33`, color: tokens.sageDeep, padding: "6px 12px", borderRadius: 999, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Leaf size={12} /> {b}
              </span>
            ))}
          </div>
        </DetailSheet>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>{children}</div>;
}

function DetailSheet({ children, onClose, tint }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(43,36,32,0.4)", zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadein 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: tokens.cream, width: "100%", maxWidth: 480,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: "90vh", overflow: "auto", padding: "32px 24px 32px",
        position: "relative",
        animation: "slideup 0.25s ease",
      }}>
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 40, height: 4, borderRadius: 2, background: "rgba(43,36,32,0.15)" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: tokens.paper, border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
          <X size={18} color={tokens.ink} />
        </button>
        {tint && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: tint }} />}
        {children}
      </div>
    </div>
  );
}

/* -------- 5. APP ROOT --------------------------------------- */

/* Persistent storage helpers — saves to browser localStorage so data
   survives reloads. Safe-wrapped in case storage is disabled. */
const STORAGE_KEY = "littleday_v1";
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function App() {
  // Seed demo child so the plan engine is immediately visible on first use.
  const seedChild = {
    id: "child_demo",
    name: "Aria",
    ageMonths: 48,            // 4 years
    gender: "girl",
    interests: ["drawing", "outdoor"],
    diet: "veg",
    allergies: [],
    routine: "balanced",
    skipped: [],
    completed: [],
    createdAt: Date.now(),
  };

  const saved = loadState();
  const [screen, setScreen] = useState(saved?.user ? "dashboard" : "onboarding");
  const [user, setUser] = useState(saved?.user || "");
  const [children, setChildren] = useState(saved?.children || [seedChild]);
  const [activeId, setActiveId] = useState(saved?.activeId || seedChild.id);
  const [editingId, setEditingId] = useState(null);

  // Auto-save on any change to user/children/activeId
  useEffect(() => {
    if (user) saveState({ user, children, activeId });
  }, [user, children, activeId]);

  function handleOnboardingDone(name) {
    setUser(name);
    setScreen("dashboard");
  }

  function startAddChild() {
    setEditingId(null);
    setScreen("intro");
  }

  function saveChild(child) {
    setChildren(prev => {
      const idx = prev.findIndex(c => c.id === child.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = child;
        return next;
      }
      return [...prev, child];
    });
    setActiveId(child.id);
    setScreen("dashboard");
  }

  const editing = children.find(c => c.id === editingId);

  return (
    <div style={{
      minHeight: "100vh", background: tokens.paper, color: tokens.ink,
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: "flex", justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: ${tokens.ink} !important; }
        ::selection { background: ${tokens.peach}; color: ${tokens.ink}; }
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        body { margin: 0; background: ${tokens.paper}; }
        /* Warm paper noise */
        .paper-bg::before {
          content: "";
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(rgba(43,36,32,0.025) 1px, transparent 1px);
          background-size: 3px 3px;
        }
      `}</style>

      <div className="paper-bg" style={{
        width: "100%", maxWidth: 480, minHeight: "100vh",
        background: tokens.paper, position: "relative", zIndex: 1,
        boxShadow: "0 0 60px rgba(43,36,32,0.08)",
      }}>
        {screen === "onboarding" && <Onboarding onDone={handleOnboardingDone} />}
        {screen === "intro" && <AddChildIntro onStart={() => setScreen("form")} onCancel={() => setScreen("dashboard")} />}
        {screen === "form" && (
          <ChildForm
            existing={editing}
            onSave={saveChild}
            onCancel={() => setScreen("dashboard")}
          />
        )}
        {screen === "dashboard" && (
          <Dashboard
            user={user || "Mama"}
            children={children}
            activeId={activeId}
            onSwitch={setActiveId}
            onAddChild={startAddChild}
            onEditChild={(id) => { setEditingId(id); setScreen("form"); }}
            setChildren={setChildren}
          />
        )}
      </div>
    </div>
  );
}
