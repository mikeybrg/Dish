import { useState, useEffect, useRef } from 'react';
import RecipeGuide from '../components/RecipeGuide';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

function parseJSON(text) {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse response');
  }
}

async function fetchRecipe(name) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Give a beginner-friendly recipe for "${name}" for a college student. Return ONLY valid JSON, no markdown: {"name":string,"difficulty":"Easy"|"Medium"|"Hard","cookTime":string,"ingredients":string[],"steps":string[]}`,
      }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseJSON(data.content[0].text);
}

async function sendChatMessage(messages, recipeName, ingredients) {
  const system = `You are a helpful cooking assistant. The user is currently cooking "${recipeName}". Ingredients: ${ingredients.join(', ')}. Answer questions about this recipe briefly and helpfully.`;
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

function getImageUrl(name) {
  const term = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '+'));
  return `https://source.unsplash.com/400x300/?${term},food`;
}

const DIFF_COLORS = {
  Easy:   { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  Medium: { bg: '#FEF9C3', text: '#A16207', border: '#FDE047' },
  Hard:   { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
};

// ── Pre-cached top 10 recipes per section ────────────────────────────────────
const RECIPE_CACHE = {
  // ── Beginner ──
  b1: { name: 'Avocado Toast', difficulty: 'Easy', cookTime: '5 min', ingredients: ['2 slices bread', '1 ripe avocado', 'Juice of ½ lemon', 'Salt and pepper', 'Red pepper flakes (optional)'], steps: ['Toast your bread until golden and crisp.', 'Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.', 'Mash the avocado with a fork, squeeze in lemon juice, season with salt and pepper.', 'Spread the mashed avocado generously onto each slice of toast.', 'Top with red pepper flakes if using, and serve immediately.'] },
  b2: { name: 'Scrambled Eggs', difficulty: 'Easy', cookTime: '5 min', ingredients: ['3 large eggs', '2 tbsp butter', '2 tbsp milk', 'Salt and pepper', 'Fresh chives (optional)'], steps: ['Crack eggs into a bowl, add milk, salt, and pepper. Whisk until combined.', 'Melt butter in a non-stick pan over low-medium heat.', 'Pour in the egg mixture. Wait 20 seconds, then gently fold with a spatula.', 'Continue folding slowly — remove pan from heat when eggs are almost set but still glossy.', 'Plate immediately and top with chives if using.'] },
  b3: { name: 'PB&J Sandwich', difficulty: 'Easy', cookTime: '3 min', ingredients: ['2 slices bread', '2 tbsp peanut butter', '1 tbsp strawberry jam', 'Optional: banana slices'], steps: ['Lay both slices of bread flat on a clean surface.', 'Spread peanut butter evenly on one slice.', 'Spread jam on the other slice.', 'Press the two slices together, peanut butter side meeting jam side.', 'Cut diagonally and enjoy!'] },
  b4: { name: 'Overnight Oats', difficulty: 'Easy', cookTime: '5 min', ingredients: ['½ cup rolled oats', '½ cup milk', '¼ cup plain yogurt', '1 tbsp honey or maple syrup', 'Fresh berries and banana to top'], steps: ['Add oats, milk, yogurt, and honey to a jar or container with a lid.', 'Stir everything together well.', 'Seal and refrigerate overnight (or at least 4 hours).', 'In the morning, stir and check consistency — add more milk if too thick.', 'Top with berries and sliced banana, then enjoy cold.'] },
  b5: { name: 'Banana Pancakes', difficulty: 'Easy', cookTime: '15 min', ingredients: ['1 ripe banana', '2 eggs', 'Pinch of cinnamon', 'Pinch of salt', 'Butter for the pan', 'Honey or maple syrup to serve'], steps: ['Mash the banana thoroughly in a bowl until smooth with no large chunks.', 'Whisk in the eggs, cinnamon, and salt until fully combined.', 'Heat a non-stick pan over medium-low heat with a small pat of butter.', 'Pour small rounds of batter (about 2 tbsp each) into the pan.', 'Cook 2 minutes until bubbles form, flip gently, cook 1 more minute. Serve with honey.'] },
  b6: { name: 'Grilled Cheese', difficulty: 'Easy', cookTime: '8 min', ingredients: ['2 slices bread', '2-3 slices cheddar or American cheese', '2 tbsp butter', 'Optional: garlic powder or tomato slices'], steps: ['Spread butter generously on one side of each bread slice.', 'Heat a pan over medium-low heat.', 'Place one slice butter-side down in the pan and layer cheese on top.', 'Place the second slice butter-side up on top.', 'Cook 3-4 minutes per side until golden brown and cheese is fully melted. Slice and serve.'] },
  b7: { name: 'BLT Sandwich', difficulty: 'Easy', cookTime: '8 min', ingredients: ['4 strips bacon', '2 slices bread', '2-3 leaves romaine lettuce', '2 slices tomato', '1-2 tbsp mayonnaise', 'Salt and pepper'], steps: ['Cook bacon in a pan over medium heat, turning occasionally, until crisp (about 5-6 minutes).', 'Drain bacon on a paper towel. Toast bread until golden.', 'Spread mayo generously on both slices of toast.', 'Layer lettuce, tomato (season with salt and pepper), and bacon on one slice.', 'Top with the other slice. Cut diagonally and serve.'] },
  b8: { name: 'Upgraded Ramen', difficulty: 'Easy', cookTime: '10 min', ingredients: ['1 packet instant ramen', '1 egg', '2 cups water', '1 tsp soy sauce', '1 tsp sesame oil', '1 green onion, sliced'], steps: ['Bring water to a boil in a small pot.', 'Add ramen noodles and cook 2 minutes until soft.', 'Reduce heat to low. Stir in half the seasoning packet and soy sauce.', 'Crack in the egg and let it poach in the broth for 3 minutes.', 'Pour into a bowl, drizzle sesame oil, and top with green onion.'] },
  b9: { name: 'Fried Rice', difficulty: 'Easy', cookTime: '15 min', ingredients: ['2 cups cooked rice (day-old works best)', '2 eggs', '3 tbsp soy sauce', '1 tbsp sesame oil', '½ cup frozen peas and carrots', '2 cloves garlic, minced'], steps: ['Heat a large pan or wok over high heat with a splash of neutral oil.', 'Add garlic and frozen vegetables; stir-fry 2 minutes.', 'Push vegetables to the side. Crack eggs into the empty space and scramble until just set.', 'Add rice and break up any clumps with your spatula.', 'Pour soy sauce and sesame oil over everything; toss to combine and serve hot.'] },
  b10: { name: 'Cheese Quesadilla', difficulty: 'Easy', cookTime: '10 min', ingredients: ['2 large flour tortillas', '1 cup shredded cheddar cheese', '1 tbsp butter or oil', 'Salsa and sour cream to serve'], steps: ['Lay one tortilla flat on a clean surface. Spread cheese evenly over one half.', 'Fold the tortilla in half over the cheese to create a half-moon.', 'Heat butter in a pan over medium heat until melted.', 'Cook the folded quesadilla 2-3 minutes per side until golden and cheese is fully melted.', 'Slice into wedges and serve with salsa and sour cream.'] },
  // ── Intermediate ──
  m1: { name: 'Pasta Carbonara', difficulty: 'Medium', cookTime: '20 min', ingredients: ['200g spaghetti', '100g bacon or pancetta', '2 eggs + 1 egg yolk', '50g Parmesan, grated', 'Freshly ground black pepper', 'Salt'], steps: ['Cook spaghetti in well-salted boiling water until al dente. Reserve 1 cup pasta water before draining.', 'Meanwhile, cook bacon in a pan over medium heat until crispy. Remove from heat and let cool slightly.', 'Whisk eggs, extra yolk, and Parmesan in a bowl. Season with lots of black pepper.', 'Drain pasta and quickly toss with bacon in the pan (heat off). Pour in the egg mixture.', 'Add pasta water a splash at a time, tossing rapidly so eggs thicken into a creamy sauce without scrambling. Serve immediately.'] },
  m2: { name: 'Chicken Stir Fry', difficulty: 'Medium', cookTime: '20 min', ingredients: ['2 chicken breasts, sliced thin', '2 cups broccoli florets', '1 red bell pepper, sliced', '3 tbsp soy sauce', '1 tbsp oyster sauce', '1 tbsp sesame oil', '2 cloves garlic', 'Cooked rice to serve'], steps: ['Mix soy sauce, oyster sauce, and sesame oil in a small bowl. Set aside.', 'Heat a wok or large pan over high heat with oil until smoking hot.', 'Add chicken and cook 4-5 minutes, stirring occasionally, until browned through. Remove and set aside.', 'Add garlic, broccoli, and bell pepper to the same pan; stir-fry 3 minutes.', 'Return chicken, pour sauce over everything, toss well to coat. Serve immediately over rice.'] },
  m3: { name: 'Beef Tacos', difficulty: 'Medium', cookTime: '25 min', ingredients: ['300g ground beef', '1 packet taco seasoning', '8 small corn tortillas', 'Shredded lettuce', 'Diced tomato', 'Shredded cheddar cheese', 'Sour cream and salsa'], steps: ['Cook ground beef in a pan over medium-high heat, breaking it apart with a spoon, until browned (about 7 minutes).', 'Drain excess fat carefully from the pan.', 'Add taco seasoning and ¼ cup water. Stir and simmer 5 minutes until the liquid is absorbed.', 'Warm tortillas in a dry pan for 30 seconds each side, or microwave wrapped in a damp paper towel.', 'Build tacos with meat and all your favorite toppings.'] },
  m4: { name: 'Pesto Pasta', difficulty: 'Easy', cookTime: '15 min', ingredients: ['200g pasta (penne or fusilli)', '4-5 tbsp store-bought basil pesto', 'Handful of cherry tomatoes, halved', 'Parmesan to serve', 'Salt and olive oil'], steps: ['Cook pasta in well-salted boiling water per package instructions. Reserve ½ cup pasta water before draining.', 'While pasta cooks, halve the cherry tomatoes.', 'Drain pasta and return to the pot over low heat.', 'Stir in pesto and a splash of pasta water until the sauce coats every noodle.', 'Top with cherry tomatoes and grated Parmesan. Serve immediately.'] },
  m5: { name: 'Burrito Bowl', difficulty: 'Medium', cookTime: '30 min', ingredients: ['1 cup white rice', '1 can black beans, drained and rinsed', '2 chicken thighs', '1 tsp cumin', '1 tsp chili powder', '1 tsp garlic powder', 'Salsa, sour cream, shredded cheese, avocado to top'], steps: ['Season chicken thighs generously with cumin, chili powder, garlic powder, salt, and pepper.', 'Cook rice according to package instructions (about 18 minutes).', 'Pan-fry seasoned chicken over medium-high heat 5-6 minutes per side until cooked through. Let rest 3 minutes, then slice.', 'Warm black beans in a small pot with a pinch of cumin and salt.', 'Build bowls: rice base, black beans, sliced chicken, and all your favorite toppings.'] },
  m6: { name: 'Pad Thai', difficulty: 'Medium', cookTime: '25 min', ingredients: ['200g flat rice noodles', '2 eggs', '200g shrimp or firm tofu', '3 tbsp soy sauce or fish sauce', '2 tbsp fresh lime juice', '1 tbsp sugar', 'Bean sprouts, green onion, and crushed peanuts to serve'], steps: ['Soak rice noodles in warm water for 15 minutes until pliable; drain well.', 'Mix soy sauce (or fish sauce), lime juice, and sugar in a small bowl to make the sauce.', 'Cook shrimp or tofu in a hot oiled wok until done; push to the side and scramble eggs.', 'Add noodles and sauce; toss everything together over high heat for 2 minutes.', 'Plate immediately and top with bean sprouts, green onion, and crushed peanuts.'] },
  m7: { name: 'Shakshuka', difficulty: 'Medium', cookTime: '20 min', ingredients: ['1 can (400g) crushed tomatoes', '4 eggs', '1 onion, diced', '1 bell pepper, diced', '2 cloves garlic, minced', '1 tsp cumin', '1 tsp paprika', 'Feta cheese and pita to serve'], steps: ['Heat olive oil in a wide pan over medium heat. Sauté onion and bell pepper until soft, about 5 minutes.', 'Add garlic, cumin, and paprika; cook 1 minute until fragrant.', 'Pour in crushed tomatoes. Season with salt and pepper. Simmer 5 minutes.', 'Use a spoon to create 4 wells in the sauce. Crack one egg into each well.', 'Cover and cook 5-7 minutes until egg whites are set but yolks are still runny. Top with crumbled feta and serve with warm pita.'] },
  m8: { name: 'French Toast', difficulty: 'Medium', cookTime: '15 min', ingredients: ['4 slices thick bread (brioche is ideal)', '2 eggs', '¼ cup milk', '1 tsp vanilla extract', '1 tsp ground cinnamon', 'Butter for the pan', 'Maple syrup and powdered sugar to serve'], steps: ['Whisk together eggs, milk, vanilla extract, and cinnamon in a shallow wide bowl.', 'Heat a large pan over medium heat and melt a generous pat of butter until foamy.', 'Dip each bread slice into the egg mixture, letting it soak for about 10 seconds per side.', 'Place dipped bread in the pan and cook 2-3 minutes per side until deep golden brown.', 'Serve with maple syrup and a light dusting of powdered sugar.'] },
  m9: { name: 'Chicken Fried Rice', difficulty: 'Medium', cookTime: '25 min', ingredients: ['2 cups cooked rice (day-old preferred)', '2 chicken breasts, cut into small cubes', '2 eggs', '3 tbsp soy sauce', '1 cup frozen peas and carrots', '3 cloves garlic, minced', '1 tbsp sesame oil'], steps: ['Cook diced chicken in a hot oiled pan over medium-high heat until golden, about 5-6 minutes. Remove and set aside.', 'In the same pan, sauté garlic and frozen vegetables for 2 minutes.', 'Push to the side and crack eggs into the empty space; scramble until just cooked through.', 'Add rice and cooked chicken; pour soy sauce over everything and toss well to combine.', 'Drizzle with sesame oil, toss once more, and serve hot.'] },
  m10: { name: 'Beef Stir Fry', difficulty: 'Medium', cookTime: '20 min', ingredients: ['300g beef sirloin, sliced very thin', '2 cups mixed vegetables (snap peas, bell pepper, broccoli)', '3 tbsp soy sauce', '1 tbsp oyster sauce', '1 tsp cornstarch', '2 cloves garlic', 'Cooked rice to serve'], steps: ['Toss sliced beef with cornstarch, 1 tbsp soy sauce, and a pinch of pepper. Marinate 5 minutes.', 'Heat a wok or large pan over very high heat with oil until just smoking.', 'Add beef in a single layer and sear 1-2 minutes without stirring, then toss. Cook until just done. Remove from pan.', 'Add garlic and all vegetables to the pan; stir-fry 3 minutes until tender-crisp.', 'Return beef, add remaining soy sauce and oyster sauce, toss to combine. Serve immediately over rice.'] },
  // ── Advanced ──
  a1: { name: 'Chicken Tikka Masala', difficulty: 'Hard', cookTime: '45 min', ingredients: ['4 chicken thighs, cubed', '1 can crushed tomatoes', '1 cup heavy cream', '1 large onion, diced', '4 cloves garlic, minced', '1 tbsp fresh ginger', '1 tsp each: garam masala, cumin, turmeric, paprika', '½ cup plain yogurt', 'Rice and naan to serve'], steps: ['Marinate chicken in yogurt, 1 tsp garam masala, turmeric, and salt for 20 minutes.', 'Broil or pan-fry marinated chicken at high heat until charred on the edges, about 8 minutes. Set aside.', 'Sauté onion and garlic in butter over medium heat until deeply golden, about 8 minutes. Add ginger and remaining spices; stir 1 minute.', 'Add crushed tomatoes and simmer 10 minutes, stirring occasionally, until thickened.', 'Stir in cream and chicken, simmer 10 more minutes until sauce coats the chicken. Serve over rice with warm naan.'] },
  a2: { name: 'Pan Seared Steak', difficulty: 'Hard', cookTime: '20 min', ingredients: ['1 ribeye or NY strip steak, about 1 inch thick', '2 tbsp unsalted butter', '3 garlic cloves, crushed', 'Fresh rosemary and thyme sprigs', 'Coarse salt and black pepper', 'Neutral high-heat oil (grapeseed or vegetable)'], steps: ['Take steak out of the fridge 30 minutes before cooking. Pat completely dry with paper towels. Season very generously all over with salt and pepper.', 'Heat a cast iron pan over high heat until it just starts to smoke. Add a thin film of oil.', 'Lay steak in the pan and sear without moving 2-3 minutes. Flip once — sear the other side 2-3 minutes.', 'Add butter, garlic, and herb sprigs to the pan. Tilt the pan and spoon the foamy butter over the steak continuously for 1 minute.', 'Transfer to a cutting board and rest at least 5 minutes before slicing against the grain.'] },
  a3: { name: 'Homemade Sushi Rolls', difficulty: 'Hard', cookTime: '60 min', ingredients: ['2 cups sushi rice', '4 tbsp rice vinegar mixed with 2 tbsp sugar and 1 tsp salt', '4 nori (seaweed) sheets', 'Fillings: cucumber strips, avocado slices, imitation crab or smoked salmon', 'Soy sauce, wasabi, and pickled ginger to serve'], steps: ['Cook sushi rice per package instructions. While still hot, fold in the vinegar-sugar-salt mixture gently with a wooden spoon. Spread on a tray and fan to cool to room temperature.', 'Place a nori sheet shiny-side down on a bamboo rolling mat. With wet hands, spread a thin even layer of rice over it, leaving a 1-inch gap at the far edge.', 'Arrange your fillings in a compact line along the bottom third of the rice.', 'Lift the mat from the bottom edge, curling it forward to roll the nori over the fillings. Apply firm, even pressure as you roll, tucking the filling in tightly.', 'Seal the edge with a dab of water. Use a sharp wet knife to slice into 8 pieces with one clean motion. Serve with soy sauce, wasabi, and pickled ginger.'] },
  a4: { name: 'Beef Birria Tacos', difficulty: 'Hard', cookTime: '90 min', ingredients: ['500g beef chuck, cut into large chunks', '3 dried guajillo chiles, stemmed and seeded', '1 can (400g) diced tomatoes', '1 onion, quartered', '4 garlic cloves', '1 tsp each: cumin, dried oregano', '2 bay leaves', 'Corn tortillas, shredded Oaxaca cheese, cilantro, and diced onion to serve'], steps: ['Toast the dried chiles in a dry pan for 30 seconds each side. Soak in hot water for 10 minutes, then blend with diced tomatoes, garlic, and spices until smooth.', 'Season the beef generously with salt. Brown in batches in a heavy pot over high heat until deeply seared on all sides.', 'Pour the chile sauce over the beef. Add 2 cups water and the bay leaves. Bring to a simmer, cover, and cook on low heat for 1 hour until the beef is very tender.', 'Remove beef and shred with two forks. Skim any excess fat from the consommé broth, then strain it into a bowl for dipping.', 'Dip tortillas in the consommé, fill with shredded beef and cheese, and fry in a hot pan until crispy and golden. Serve with extra consommé for dipping, topped with cilantro and onion.'] },
  a5: { name: 'Homemade Ramen', difficulty: 'Hard', cookTime: '90 min', ingredients: ['4 cups good-quality chicken broth', '2 tbsp white miso paste', '2 tbsp soy sauce', '1 tbsp sesame oil', '2 soft-boiled eggs (boiled 7 min)', '3 tbsp soy sauce + 1 tbsp mirin (for egg marinade)', 'Fresh ramen noodles', 'Chashu pork belly or rotisserie chicken, bamboo shoots, nori, green onion to garnish'], steps: ['Marinate the soft-boiled eggs in 3 tbsp soy sauce and 1 tbsp mirin for at least 1 hour (can be made the night before).', 'Combine chicken broth, soy sauce, and sesame oil in a pot and simmer over medium heat for 20 minutes.', 'Remove the pot from heat. Whisk in miso paste until fully dissolved — never boil the miso.', 'Cook ramen noodles in a separate pot of boiling water per package instructions. Drain and divide into bowls.', 'Ladle hot miso broth over the noodles. Halve the marinated eggs and arrange on top with your choice of meat, bamboo shoots, nori, and a sprinkle of green onion.'] },
  a6: { name: 'Lamb Shawarma', difficulty: 'Hard', cookTime: '45 min', ingredients: ['500g lamb shoulder or leg, sliced thin', '3 tbsp olive oil', '1 tsp each: cumin, turmeric, paprika, cinnamon, garlic powder', 'Juice of 1 lemon', 'Pita bread', 'Garlic sauce (toum) or hummus', 'Sliced tomato, cucumber, and pickles'], steps: ['Combine olive oil, all spices, and lemon juice in a bowl. Add lamb slices and toss to coat thoroughly. Refrigerate at least 30 minutes.', 'Heat a large heavy pan or grill pan over medium-high heat until very hot.', 'Cook marinated lamb in batches (don\'t crowd the pan) until caramelized and cooked through, about 4 minutes per batch.', 'Warm pita bread in a dry pan for 30 seconds per side.', 'Spread garlic sauce or hummus on the pita, layer with lamb, tomato, cucumber, and pickles. Roll tightly and serve.'] },
  a7: { name: 'Tiramisu', difficulty: 'Hard', cookTime: '30 min', ingredients: ['3 large eggs, separated', '250g mascarpone cheese', '80g caster or granulated sugar', '200ml strong espresso, cooled', '2 tbsp rum or coffee liqueur (optional)', '24 ladyfinger cookies (savoiardi)', 'Cocoa powder to dust'], steps: ['Whisk egg yolks with sugar in a bowl until pale, thick, and doubled in volume. Beat in mascarpone until smooth and creamy.', 'In a separate clean bowl, beat egg whites to stiff peaks. Gently fold the whites into the mascarpone mixture in three additions to keep it light.', 'Mix cooled espresso with rum (if using) in a shallow bowl.', 'Quickly dip each ladyfinger in the espresso — about 1 second per side; they should be moist but not soggy. Arrange in a single layer in a serving dish.', 'Spread half the cream over the ladyfingers. Add a second layer of soaked ladyfingers, then top with the remaining cream. Dust generously with cocoa powder. Refrigerate at least 4 hours before serving.'] },
  a8: { name: 'Crème Brûlée', difficulty: 'Hard', cookTime: '60 min', ingredients: ['500ml (2 cups) heavy cream', '5 egg yolks', '100g (½ cup) granulated sugar', '1 tsp pure vanilla extract', '4-5 tsp extra sugar for the brûlée topping'], steps: ['Preheat oven to 325°F (160°C). Heat cream with vanilla extract in a saucepan until just simmering — do not boil.', 'In a bowl, whisk egg yolks with sugar until pale and slightly thickened. Slowly pour the warm cream into the yolks while whisking constantly to temper them.', 'Strain the custard through a fine-mesh sieve into a jug. Pour evenly into 4-5 ramekins, filling almost to the top.', 'Place ramekins in a deep baking dish. Pour enough hot water into the dish to reach halfway up the sides of the ramekins. Bake 40-45 minutes until set but still slightly jiggly in the very center. Remove, cool to room temperature, then refrigerate at least 2 hours (up to 2 days).', 'When ready to serve, sprinkle 1 tsp sugar evenly over each custard. Use a kitchen torch to caramelize the sugar in small circles until deep amber. Serve immediately.'] },
  a9: { name: 'Chocolate Lava Cake', difficulty: 'Hard', cookTime: '25 min', ingredients: ['115g (4oz) dark chocolate (70%+ cocoa)', '115g (½ cup) unsalted butter', '2 whole eggs + 2 egg yolks', '80g (⅓ cup) granulated sugar', '55g (¼ cup + 2 tbsp) all-purpose flour', 'Pinch of salt', 'Vanilla ice cream to serve'], steps: ['Preheat oven to 425°F (220°C). Butter 4 ramekins well, then dust lightly with flour. Tap out excess.', 'Melt chocolate and butter together in a heatproof bowl over a pot of simmering water, stirring until smooth. Remove from heat and let cool for 5 minutes.', 'In a mixing bowl, whisk whole eggs, egg yolks, and sugar together until just combined. Stir into the chocolate mixture.', 'Gently fold in flour and salt until just incorporated — do not overmix. Divide evenly between the prepared ramekins.', 'Bake exactly 12-13 minutes: the edges should be set and pulling away slightly, but the center must still jiggle. Run a knife around the edge and immediately invert each ramekin onto a dessert plate. Serve at once with vanilla ice cream.'] },
  a10: { name: 'Baklava', difficulty: 'Hard', cookTime: '60 min', ingredients: ['450g frozen phyllo dough, thawed overnight in fridge', '300g walnuts or pistachios, finely chopped (not ground)', '225g unsalted butter, melted', '1½ tsp ground cinnamon', 'Syrup: 1 cup water + 1 cup sugar + ½ cup honey + 2 tbsp lemon juice'], steps: ['Make syrup first: combine water, sugar, honey, and lemon juice in a saucepan. Bring to a boil, then simmer 10 minutes. Cool completely in the fridge — it must be cold when poured over hot baklava.', 'Preheat oven to 350°F (175°C). Mix chopped nuts with cinnamon. Melt butter and keep warm. Brush a 9×13 baking pan generously with butter.', 'Layer 8 phyllo sheets in the pan, brushing each one thoroughly with melted butter. Keep unused phyllo covered with a damp towel to prevent drying.', 'Spread half the nut mixture evenly over the phyllo. Layer 6 more buttered sheets, then the remaining nuts, then finish with 8 buttered phyllo sheets on top. Using a sharp knife, score the top into diamond shapes all the way through.', 'Bake 45-50 minutes until deep golden brown and crisp. Immediately pour the cold syrup evenly over the hot baklava. Let cool completely at room temperature (at least 2-3 hours) before serving — the syrup must absorb fully.'] },
};

const SECTIONS = [
  {
    id: 'beginner',
    label: 'Just Starting Out',
    accent: '#16A34A',
    dot: '#22C55E',
    sectionBg: '#F0FDF4',
    recipes: [
      { id: 'b1',  name: 'Avocado Toast',        time: '5 min',  cuisine: 'American' },
      { id: 'b2',  name: 'Scrambled Eggs',        time: '5 min',  cuisine: 'American' },
      { id: 'b3',  name: 'PB&J Sandwich',         time: '3 min',  cuisine: 'American' },
      { id: 'b4',  name: 'Overnight Oats',        time: '5 min',  cuisine: 'American' },
      { id: 'b5',  name: 'Banana Pancakes',       time: '15 min', cuisine: 'American' },
      { id: 'b6',  name: 'Grilled Cheese',        time: '8 min',  cuisine: 'American' },
      { id: 'b7',  name: 'BLT Sandwich',          time: '8 min',  cuisine: 'American' },
      { id: 'b8',  name: 'Upgraded Ramen',        time: '10 min', cuisine: 'Asian' },
      { id: 'b9',  name: 'Fried Rice',            time: '15 min', cuisine: 'Asian' },
      { id: 'b10', name: 'Cheese Quesadilla',     time: '10 min', cuisine: 'Mexican' },
      { id: 'b11', name: 'Tomato Soup',           time: '20 min', cuisine: 'American' },
      { id: 'b12', name: 'Mac & Cheese',          time: '25 min', cuisine: 'American' },
      { id: 'b13', name: 'Caprese Salad',         time: '5 min',  cuisine: 'Italian' },
      { id: 'b14', name: 'Greek Salad',           time: '10 min', cuisine: 'Mediterranean' },
      { id: 'b15', name: 'Smoothie Bowl',         time: '5 min',  cuisine: 'American' },
      { id: 'b16', name: 'Hummus & Pita',         time: '5 min',  cuisine: 'Mediterranean' },
      { id: 'b17', name: 'Bruschetta',            time: '10 min', cuisine: 'Italian' },
      { id: 'b18', name: 'Guacamole',             time: '10 min', cuisine: 'Mexican' },
      { id: 'b19', name: 'Miso Soup',             time: '10 min', cuisine: 'Japanese' },
      { id: 'b20', name: 'Yogurt Parfait',        time: '5 min',  cuisine: 'American' },
      { id: 'b21', name: 'Cheese Omelet',         time: '8 min',  cuisine: 'American' },
      { id: 'b22', name: 'Cinnamon Toast',        time: '3 min',  cuisine: 'American' },
      { id: 'b23', name: 'Tuna Salad Wrap',       time: '10 min', cuisine: 'American' },
      { id: 'b24', name: 'No-Bake Energy Balls',  time: '15 min', cuisine: 'American' },
      { id: 'b25', name: 'Cucumber Sushi Roll',   time: '20 min', cuisine: 'Japanese' },
    ],
  },
  {
    id: 'intermediate',
    label: 'Getting Comfortable',
    accent: '#A16207',
    dot: '#EAB308',
    sectionBg: '#FEFCE8',
    recipes: [
      { id: 'm1',  name: 'Pasta Carbonara',       time: '20 min', cuisine: 'Italian' },
      { id: 'm2',  name: 'Chicken Stir Fry',      time: '20 min', cuisine: 'Asian' },
      { id: 'm3',  name: 'Beef Tacos',            time: '25 min', cuisine: 'Mexican' },
      { id: 'm4',  name: 'Pesto Pasta',           time: '15 min', cuisine: 'Italian' },
      { id: 'm5',  name: 'Burrito Bowl',          time: '30 min', cuisine: 'Mexican' },
      { id: 'm6',  name: 'Pad Thai',              time: '25 min', cuisine: 'Asian' },
      { id: 'm7',  name: 'Shakshuka',             time: '20 min', cuisine: 'Mediterranean' },
      { id: 'm8',  name: 'French Toast',          time: '15 min', cuisine: 'American' },
      { id: 'm9',  name: 'Chicken Fried Rice',    time: '25 min', cuisine: 'Asian' },
      { id: 'm10', name: 'Beef Stir Fry',         time: '20 min', cuisine: 'Asian' },
      { id: 'm11', name: 'Margherita Pizza',      time: '30 min', cuisine: 'Italian' },
      { id: 'm12', name: 'Chicken Caesar Salad',  time: '15 min', cuisine: 'American' },
      { id: 'm13', name: 'Lemon Garlic Pasta',    time: '20 min', cuisine: 'Italian' },
      { id: 'm14', name: 'Butter Chicken',        time: '30 min', cuisine: 'Indian' },
      { id: 'm15', name: 'Dal Tadka',             time: '30 min', cuisine: 'Indian' },
      { id: 'm16', name: 'Teriyaki Salmon',       time: '20 min', cuisine: 'Japanese' },
      { id: 'm17', name: 'Korean BBQ Beef Bowl',  time: '25 min', cuisine: 'Asian' },
      { id: 'm18', name: 'Chicken Tortilla Soup', time: '30 min', cuisine: 'Mexican' },
      { id: 'm19', name: 'Banana Bread',          time: '60 min', cuisine: 'American' },
      { id: 'm20', name: 'Falafel Wrap',          time: '25 min', cuisine: 'Mediterranean' },
      { id: 'm21', name: 'Mushroom Risotto',      time: '35 min', cuisine: 'Italian' },
      { id: 'm22', name: 'Mango Salsa Tacos',     time: '25 min', cuisine: 'Mexican' },
      { id: 'm23', name: 'Niçoise Salad',         time: '25 min', cuisine: 'Mediterranean' },
      { id: 'm24', name: 'Vegetable Curry',       time: '30 min', cuisine: 'Indian' },
      { id: 'm25', name: 'Honey Garlic Chicken',  time: '25 min', cuisine: 'Asian' },
    ],
  },
  {
    id: 'advanced',
    label: 'Ready to Impress',
    accent: '#B91C1C',
    dot: '#EF4444',
    sectionBg: '#FFF1F2',
    recipes: [
      { id: 'a1',  name: 'Chicken Tikka Masala',  time: '45 min',  cuisine: 'Indian' },
      { id: 'a2',  name: 'Pan Seared Steak',      time: '20 min',  cuisine: 'American' },
      { id: 'a3',  name: 'Homemade Sushi Rolls',  time: '60 min',  cuisine: 'Japanese' },
      { id: 'a4',  name: 'Beef Birria Tacos',     time: '90 min',  cuisine: 'Mexican' },
      { id: 'a5',  name: 'Homemade Ramen',        time: '90 min',  cuisine: 'Japanese' },
      { id: 'a6',  name: 'Lamb Shawarma',         time: '45 min',  cuisine: 'Mediterranean' },
      { id: 'a7',  name: 'Tiramisu',              time: '30 min',  cuisine: 'Italian' },
      { id: 'a8',  name: 'Crème Brûlée',          time: '60 min',  cuisine: 'French' },
      { id: 'a9',  name: 'Chocolate Lava Cake',   time: '25 min',  cuisine: 'American' },
      { id: 'a10', name: 'Baklava',               time: '60 min',  cuisine: 'Mediterranean' },
      { id: 'a11', name: 'Mochi Ice Cream',       time: '45 min',  cuisine: 'Japanese' },
      { id: 'a12', name: 'Chicken Biryani',       time: '60 min',  cuisine: 'Indian' },
      { id: 'a13', name: 'Beef Bulgogi',          time: '40 min',  cuisine: 'Asian' },
      { id: 'a14', name: 'Paella',                time: '60 min',  cuisine: 'Mediterranean' },
      { id: 'a15', name: 'Pho',                   time: '2 hours', cuisine: 'Asian' },
      { id: 'a16', name: 'Homemade Dumplings',    time: '60 min',  cuisine: 'Asian' },
      { id: 'a17', name: 'Osso Buco',             time: '2 hours', cuisine: 'Italian' },
      { id: 'a18', name: 'Carne Asada',           time: '45 min',  cuisine: 'Mexican' },
      { id: 'a19', name: 'Beef Wellington',       time: '90 min',  cuisine: 'American' },
      { id: 'a20', name: 'Homemade Croissants',   time: '3 hours', cuisine: 'French' },
      { id: 'a21', name: 'Eggs Benedict',         time: '30 min',  cuisine: 'American' },
      { id: 'a22', name: 'Lobster Bisque',        time: '60 min',  cuisine: 'American' },
      { id: 'a23', name: 'Peking Duck',           time: '2 hours', cuisine: 'Asian' },
      { id: 'a24', name: 'French Macarons',       time: '90 min',  cuisine: 'French' },
      { id: 'a25', name: 'Tteokbokki',            time: '40 min',  cuisine: 'Asian' },
    ],
  },
];

// ── Mini recipe chat component ───────────────────────────────────────────────
function RecipeChat({ recipe, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [recipe]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChatMessage(
        next.map(({ role, content }) => ({ role, content })),
        recipe.name,
        recipe.ingredients
      );
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <span className="text-base">👨‍🍳</span>
        <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Ask about this recipe</span>
      </div>

      {/* Message area */}
      <div className="px-4 py-3 space-y-3 max-h-48 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-xs text-center py-2" style={{ color: '#9CA3AF' }}>
            Ask about substitutions, techniques, or serving ideas
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5" style={{ backgroundColor: '#2D6A4F' }}>
                👨‍🍳
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user' ? 'text-white' : 'bg-white border border-gray-200'
              }`}
              style={msg.role === 'user' ? { backgroundColor: '#2D6A4F' } : { color: '#374151' }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: '#2D6A4F' }}>👨‍🍳</div>
            <div className="px-3 py-2 rounded-xl bg-white border border-gray-200 flex gap-1 items-center">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-200 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="e.g. Can I substitute the bacon?"
          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs placeholder-gray-400 outline-none transition-colors"
          style={{ color: '#1A1A1A' }}
          onFocus={e => e.target.style.borderColor = '#2D6A4F'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="px-3 py-2 text-white rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#2D6A4F' }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Recipes({ apiKey }) {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [cache, setCache]   = useState({ ...RECIPE_CACHE });

  useEffect(() => {
    const close = (e) => e.key === 'Escape' && setModal(null);
    if (modal) window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal]);

  const openRecipe = async (recipe) => {
    if (cache[recipe.id]) {
      setModal({ recipe, data: cache[recipe.id], loading: false, error: null });
      return;
    }
    setModal({ recipe, data: null, loading: true, error: null });
    try {
      const data = await fetchRecipe(recipe.name);
      setCache(prev => ({ ...prev, [recipe.id]: data }));
      setModal(prev => prev ? { ...prev, data, loading: false } : null);
    } catch {
      setModal(prev => prev ? {
        ...prev, loading: false,
        error: 'Failed to load recipe. Please try again.',
      } : null);
    }
  };

  const q = search.toLowerCase();
  const filteredSections = search
    ? SECTIONS.map(s => ({
        ...s,
        recipes: s.recipes.filter(r =>
          r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
        ),
      })).filter(s => s.recipes.length > 0)
    : SECTIONS;

  const diff = modal?.data ? (DIFF_COLORS[modal.data.difficulty] || DIFF_COLORS.Medium) : null;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Recipes</h1>
      <p className="mb-8" style={{ color: '#6B7280' }}>75 college-friendly meals from around the world — click any card to get a full recipe.</p>

      {/* Search */}
      <div className="relative mb-12 max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9CA3AF' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes or cuisines..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm placeholder-gray-400 outline-none transition-colors shadow-sm"
          style={{ color: '#1A1A1A' }}
          onFocus={e => e.target.style.borderColor = '#2D6A4F'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        )}
      </div>

      {/* Sections */}
      {filteredSections.map(section => (
        <div key={section.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.dot }} />
            <h2 className="text-xl font-bold" style={{ color: section.accent }}>{section.label}</h2>
            <span className="text-sm" style={{ color: '#9CA3AF' }}>{section.recipes.length} recipes</span>
            {section.recipes.slice(0, 10).some(r => RECIPE_CACHE[r.id]) && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                ⚡ Top 10 instant
              </span>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar">
            {section.recipes.map(recipe => {
              const isCached = !!RECIPE_CACHE[recipe.id];
              return (
                <button
                  key={recipe.id}
                  onClick={() => openRecipe(recipe)}
                  className="flex-shrink-0 w-48 rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.02] transition-all text-left group cursor-pointer shadow-sm"
                >
                  <div className="h-28 relative overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(recipe.name)}
                      alt={recipe.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm" style={{ color: '#374151' }}>
                      {recipe.cuisine}
                    </span>
                    {isCached && (
                      <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#2D6A4F', color: '#fff' }}>
                        ⚡
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 truncate transition-colors group-hover:text-[#2D6A4F]" style={{ color: '#1A1A1A' }}>
                      {recipe.name}
                    </h3>
                    <p className="text-[11px] mb-3" style={{ color: '#9CA3AF' }}>⏱ {recipe.time}</p>
                    <div className="w-full py-1.5 text-[11px] rounded-lg border text-center font-semibold transition-colors border-gray-200 text-gray-500 bg-gray-50 group-hover:bg-[#2D6A4F] group-hover:border-[#2D6A4F] group-hover:text-white">
                      View Recipe
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filteredSections.length === 0 && (
        <div className="text-center py-24" style={{ color: '#9CA3AF' }}>
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg" style={{ color: '#6B7280' }}>No recipes found for "{search}"</p>
          <p className="text-sm mt-2">Try searching for a cuisine like "Italian" or "Japanese"</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Photo banner */}
            <div className="h-44 relative rounded-t-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={getImageUrl(modal.recipe.name)}
                alt={modal.recipe.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="absolute bottom-4 left-5 text-xs font-semibold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm" style={{ color: '#374151' }}>
                {modal.recipe.cuisine}
              </span>
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 text-lg flex items-center justify-center transition-colors shadow-sm"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Skeleton loading */}
              {modal.loading && (
                <div className="space-y-4 py-4">
                  <div className="skeleton h-8 w-3/4" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-16" />
                    <div className="skeleton h-6 w-20" />
                  </div>
                  <div className="skeleton h-4 w-full mt-4" />
                  <div className="skeleton h-4 w-5/6" />
                  <div className="skeleton h-4 w-4/6" />
                  <div className="skeleton h-32 w-full mt-2" />
                  <div className="skeleton h-28 w-full" />
                </div>
              )}

              {modal.error && (
                <p className="text-sm text-center py-8" style={{ color: '#B91C1C' }}>{modal.error}</p>
              )}

              {modal.data && (
                <>
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{modal.data.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium border" style={{ backgroundColor: diff.bg, color: diff.text, borderColor: diff.border }}>
                        {modal.data.difficulty}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                        ⏱ {modal.data.cookTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Ingredients</h3>
                    <ul className="space-y-1.5">
                      {modal.data.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                          <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#2D6A4F' }} />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <RecipeGuide
                    recipe={modal.data}
                    onShare={() => setModal(null)}
                    compact
                  />

                  <RecipeChat recipe={modal.data} apiKey={apiKey} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
