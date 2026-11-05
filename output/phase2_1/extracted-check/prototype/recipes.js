
/* Kitchen Kompanion - Recipes */

// Sample Recipes
let recipes = [
    {
      id: 1,
      name: "Scrambled Eggs",
      description: "A quick and easy breakfast.",
      time: 10,
      servings: 2,
      ingredients: ["Eggs", "Milk", "Butter"],
      instructions: [
        "Crack eggs into a bowl.",
        "Add milk and whisk together.",
        "Melt butter in a pan.",
        "Pour in eggs and stir until cooked."
      ]
    },
    {
      id: 2,
      name: "Chicken Fried Rice",
      description: "A simple meal using leftover rice.",
      time: 25,
      servings: 3,
      ingredients: ["Chicken", "Rice", "Eggs", "Soy Sauce"],
      instructions: [
        "Cook the rice.",
        "Cut chicken into small pieces.",
        "Cook chicken thoroughly in a pan.",
        "Add rice and eggs.",
        "Add soy sauce and stir."
      ]
    },
    {
      id: 3,
      name: "Grilled Cheese",
      description: "Classic toasted cheese sandwich.",
      time: 10,
      servings: 1,
      ingredients: ["Bread", "Cheese", "Butter"],
      instructions: [
        "Butter the bread.",
        "Place cheese between two slices.",
        "Heat a pan over medium heat.",
        "Cook both sides until golden brown."
      ]
    },
    {
      id: 4,
      name: "Spinach Omelette",
      description: "A healthy breakfast with vegetables.",
      time: 15,
      servings: 1,
      ingredients: ["Eggs", "Spinach", "Cheese", "Butter"],
      instructions: [
        "Whisk eggs in a bowl.",
        "Melt butter in a pan.",
        "Add spinach and cook.",
        "Pour in eggs and add cheese.",
        "Fold omelette and serve."
      ]
    },
    {
      id: 5,
      name: "Tomato Pasta",
      description: "Easy pasta with tomato sauce.",
      time: 20,
      servings: 2,
      ingredients: ["Pasta", "Tomato Sauce", "Olive Oil", "Garlic"],
      instructions: [
        "Boil pasta.",
        "Heat olive oil in a pan.",
        "Cook garlic briefly.",
        "Add tomato sauce.",
        "Mix pasta with sauce."
      ]
    },
    {
      id: 6,
      name: "Chicken Sandwich",
      description: "A filling sandwich for lunch.",
      time: 20,
      servings: 1,
      ingredients: ["Chicken", "Bread", "Lettuce", "Tomato"],
      instructions: [
        "Cook chicken thoroughly.",
        "Wash lettuce and tomato.",
        "Slice tomato.",
        "Place chicken and vegetables on bread.",
        "Assemble sandwich and serve."
      ]
    }
  ];
  
  // Load saved recipes
  const savedRecipes = localStorage.getItem("kitchen-recipes");
  
  if (savedRecipes) {
    try {
      const saved = JSON.parse(savedRecipes);
  
      if (Array.isArray(saved)) {
        recipes = saved;
      }
    } catch (error) {
      console.error("Could not load recipes", error);
    }
  }
  
  let recipeFilter = "all";
  let recipeSearch = "";
  let editingRecipeId = null;
  let viewingRecipeId = null;

  // Explicit demo ingredient names, not substring-based food substitutions.
  const ingredientAliases = [
    ["egg", "eggs", "large eggs"], ["spinach", "fresh spinach"],
    ["cheese", "cheddar cheese"], ["rice", "jasmine rice"],
    ["chicken", "chicken breast"], ["pasta", "gluten-free pasta"],
    ["milk", "whole milk"], ["bread", "whole wheat bread"],
    ["butter", "unsalted butter"]
  ];
  function ingredientKey(name) {
    const normalized = String(name).trim().replace(/\s+/g, " ").toLowerCase();
    const aliases = ingredientAliases.find(group => group.includes(normalized));
    return aliases ? aliases[0] : normalized;
  }
  
  // Save recipes to browser storage
  function saveRecipes() {
    localStorage.setItem("kitchen-recipes", JSON.stringify(recipes));
  }
  
  // Get kitchen inventory
  function getKitchenInventory() {
    return getInventoryData();
  }
  
  // Check if ingredient is available
  function hasIngredient(ingredient) {
    const inventory = getKitchenInventory();
  
    return inventory.some(item =>
      ingredientKey(item.name) === ingredientKey(ingredient) &&
      Number(item.quantity) > 0 && Number(item.daysUntilExpiration) >= 0
    );
  }
  
  // Check if recipe uses expiring food
  function usesExpiring(recipe) {
    const inventory = getKitchenInventory();
  
    return recipe.ingredients.some(ingredient =>
      inventory.some(item =>
        ingredientKey(item.name) === ingredientKey(ingredient) &&
        Number(item.quantity) > 0 &&
        Number(item.daysUntilExpiration) >= 0 &&
        Number(item.daysUntilExpiration) <= 3
      )
    );
  }
  
  // Display recipe cards
  function renderRecipes() {
    const grid = document.getElementById("recipe-grid");
    grid.innerHTML = "";
  
    const filtered = recipes.filter(recipe => {
      const text = (
        recipe.name + " " + recipe.ingredients.join(" ")
      ).toLowerCase();
  
      if (!text.includes(recipeSearch)) {
        return false;
      }
  
      if (recipeFilter === "ready") {
        return recipe.ingredients.every(hasIngredient);
      }
  
      if (recipeFilter === "expiring") {
        return usesExpiring(recipe);
      }
  
      return true;
    });
  
    document.getElementById("recipe-count").textContent =
      filtered.length + " recipes";
  
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="recipe-empty">No recipes found.</div>';
      return;
    }
  
    filtered.forEach(recipe => {
      const available = recipe.ingredients.filter(hasIngredient).length;
      const total = recipe.ingredients.length;
      const percentage = Math.round(available / total * 100);
  
      const card = document.createElement("div");
      card.className = "recipe-card";
  
      card.innerHTML = `
        <h3>${escapeRecipeHTML(recipe.name)}</h3>
        <p class="recipe-description">${escapeRecipeHTML(recipe.description)}</p>
        <p>${recipe.time} min · ${recipe.servings} servings</p>
  
        <div class="recipe-match ${available < total ? "missing" : ""}">
          ${available === total
            ? "✓ Ready to make"
            : available + "/" + total + " ingredients available"}
        </div>
  
        <div class="recipe-progress">
          <div class="recipe-progress-fill" style="width: ${percentage}%"></div>
        </div>
  
        <button type="button" class="primary-btn">View Recipe</button>
      `;
  
      card.querySelector("button").addEventListener("click", function() {
        openRecipe(recipe);
      });
  
      grid.appendChild(card);
    });
  }
  
  // Prevent user-entered text from being treated as HTML
  function escapeRecipeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Open recipe details
  function openRecipe(recipe) {
    viewingRecipeId = recipe.id;
    const content = document.getElementById("recipe-detail-content");
  
    let ingredientsHTML = "";
  
    recipe.ingredients.forEach(ingredient => {
      const available = hasIngredient(ingredient);
  
      ingredientsHTML += `
        <li class="${available ? "available" : "unavailable"}">
          ${available ? "✓" : "○"} ${escapeRecipeHTML(ingredient)}
          ${available ? "— In Kitchen" : "— Missing"}
        </li>
      `;
    });
  
    let instructionsHTML = "";
  
    recipe.instructions.forEach(step => {
      instructionsHTML += `<li>${escapeRecipeHTML(step)}</li>`;
    });
  
    content.innerHTML = `
      <div class="recipe-detail-card">
  
        <h2 id="recipe-detail-title">${escapeRecipeHTML(recipe.name)}</h2>
        <p>${escapeRecipeHTML(recipe.description)}</p>
  
        <p><strong>Cooking Time:</strong> ${recipe.time} minutes</p>
        <p><strong>Servings:</strong> ${recipe.servings}</p>
  
        <h3>Ingredients</h3>
        <ul class="recipe-ingredient-list">
          ${ingredientsHTML}
        </ul>
  
        <h3>Instructions</h3>
        <ol class="recipe-instructions">
          ${instructionsHTML}
        </ol>
  
        <div class="recipe-detail-buttons">
          <button type="button" id="recipe-edit-btn" class="secondary-btn">
            Edit Recipe
          </button>
  
          <button type="button" id="recipe-delete-btn">
            Delete Recipe
          </button>
        </div>
  
      </div>
    `;
  
    document.getElementById("recipe-edit-btn").addEventListener("click", function() {
      editRecipe(recipe.id);
    });
  
    document.getElementById("recipe-delete-btn").addEventListener("click", function() {
      deleteRecipe(recipe.id);
    });
  
    document.getElementById("recipes-browser").hidden = true;
    document.getElementById("recipe-form-section").hidden = true;
    document.getElementById("recipe-detail").hidden = false;
  }
  
  // Return to recipe browser
  function closeRecipe() {
    viewingRecipeId = null;
    document.getElementById("recipe-detail").hidden = true;
    document.getElementById("recipes-browser").hidden = false;
  
    renderRecipes();
  }
  
  // Open Add Recipe form
  function addRecipe() {
    editingRecipeId = null;
  
    document.getElementById("recipe-form").reset();
    document.getElementById("recipe-form-title").textContent = "Add Recipe";
  
    document.getElementById("recipes-browser").hidden = true;
    document.getElementById("recipe-detail").hidden = true;
    document.getElementById("recipe-form-section").hidden = false;
  }
  
  // Open Edit Recipe form
  function editRecipe(id) {
    const recipe = recipes.find(recipe => recipe.id === id);
  
    if (!recipe) return;
  
    editingRecipeId = id;
  
    document.getElementById("recipe-form-title").textContent = "Edit Recipe";
    document.getElementById("new-recipe-name").value = recipe.name;
    document.getElementById("new-recipe-time").value = recipe.time;
    document.getElementById("new-recipe-servings").value = recipe.servings;
    document.getElementById("new-recipe-description").value = recipe.description;
    document.getElementById("new-recipe-ingredients").value =
      recipe.ingredients.join("\n");
    document.getElementById("new-recipe-instructions").value =
      recipe.instructions.join("\n");
  
    document.getElementById("recipes-browser").hidden = true;
    document.getElementById("recipe-detail").hidden = true;
    document.getElementById("recipe-form-section").hidden = false;
  }
  
  // Save new or edited recipe
  function submitRecipe(event) {
    event.preventDefault();
  
    const name = document.getElementById("new-recipe-name").value.trim();
    const time = Number(document.getElementById("new-recipe-time").value);
    const servings = Number(document.getElementById("new-recipe-servings").value);
    const description = document.getElementById("new-recipe-description").value.trim();
  
    const ingredients = document.getElementById("new-recipe-ingredients").value
      .split("\n")
      .map(item => item.trim())
      .filter(item => item !== "");
  
    const instructions = document.getElementById("new-recipe-instructions").value
      .split("\n")
      .map(item => item.trim())
      .filter(item => item !== "");
  
    if (!name || !description || ingredients.length === 0 ||
        instructions.length === 0 || time < 1 || servings < 1) {
      alert("Please fill out all recipe fields.");
      return;
    }
  
    if (editingRecipeId === null) {
      const recipe = {
        id: Date.now(),
        name: name,
        description: description,
        time: time,
        servings: servings,
        ingredients: ingredients,
        instructions: instructions,
        custom: true
      };
  
      recipes.push(recipe);
    } else {
      const recipe = recipes.find(recipe => recipe.id === editingRecipeId);
  
      if (!recipe) return;
  
      recipe.name = name;
      recipe.description = description;
      recipe.time = time;
      recipe.servings = servings;
      recipe.ingredients = ingredients;
      recipe.instructions = instructions;
    }
  
    saveRecipes();
    cancelRecipeForm();
  }
  
  // Cancel Add/Edit Recipe
  function cancelRecipeForm() {
    document.getElementById("recipe-form-section").hidden = true;
    document.getElementById("recipe-detail").hidden = true;
    document.getElementById("recipes-browser").hidden = false;
  
    editingRecipeId = null;
    renderRecipes();
  }
  
  // Delete recipe
  function deleteRecipe(id) {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }
  
    recipes = recipes.filter(recipe => recipe.id !== id);
  
    saveRecipes();
    cancelRecipeForm();
  }
  
  // Search recipes
  document.getElementById("recipe-search").addEventListener("input", function() {
    recipeSearch = this.value.toLowerCase();
    renderRecipes();
  });
  
  // Filter recipes
  document.querySelectorAll(".recipe-filter").forEach(button => {
    button.addEventListener("click", function() {
      recipeFilter = this.dataset.filter;
  
      document.querySelectorAll(".recipe-filter").forEach(btn => {
        btn.classList.remove("active");
      });
  
      this.classList.add("active");
      renderRecipes();
    });
  });
  
  // Back button
  document.getElementById("recipe-back").addEventListener("click", closeRecipe);
  
  // Add Recipe button
  document.getElementById("recipe-add-btn").addEventListener("click", addRecipe);
  
  // Save Recipe form
  document.getElementById("recipe-form").addEventListener("submit", submitRecipe);
  
  // Cancel Recipe form
  document.getElementById("recipe-cancel-btn").addEventListener("click", cancelRecipeForm);
  
  // Allow Kitchen tab to refresh recipes
  window.refreshRecipes = () => {
    renderRecipes();
    if (!document.getElementById("recipe-detail").hidden) {
      const current = recipes.find(recipe => recipe.id === viewingRecipeId);
      if (current) openRecipe(current);
    }
  };
  document.addEventListener("inventorychanged", window.refreshRecipes);
  
  // Display recipes when page loads
  renderRecipes();
