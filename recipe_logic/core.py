from .recipes import SAMPLE_RECIPES

def process_ingredients_input(ingredients_str):
    """
    Cleans and normalizes a comma-separated string of ingredients.
    Returns a list of lowercase ingredient strings.
    """
    if not ingredients_str:
        return []
    return [ingredient.strip().lower() for ingredient in ingredients_str.split(',')]

def find_matching_recipes(available_ingredients_list):
    """
    Finds recipes that can be made with at least some of the available ingredients.
    A recipe is considered a match if the user has at least a certain percentage
    of the required ingredients for that recipe.

    Args:
        available_ingredients_list (list): A list of ingredients the user has.

    Returns:
        list: A list of recipe dictionaries that are considered a match,
              sorted by the number of matching ingredients (descending).
    """
    if not available_ingredients_list:
        return []

    matched_recipes = []
    available_set = set(available_ingredients_list)

    for recipe in SAMPLE_RECIPES:
        recipe_ingredients_normalized = [ing.lower() for ing in recipe['ingredients']]

        current_recipe_common_ingredients = set()

        for user_ing in available_set:
            for recipe_ing_detail in recipe_ingredients_normalized:
                # Check if user ingredient is a substring of a recipe ingredient
                # e.g., "tomato" in "canned tomatoes"
                if user_ing in recipe_ing_detail:
                    current_recipe_common_ingredients.add(recipe_ing_detail) # Add the full recipe ingredient for clarity
                    break # Avoid counting multiple times if user_ing matches multiple recipe_ings

        match_count = len(current_recipe_common_ingredients)
        required_count = len(recipe_ingredients_normalized)

        # Calculate missing ingredients based on the original recipe list
        # This needs to be careful not to mark an ingredient as missing if a variant was matched
        # For simplicity, we'll list all ingredients not directly matched or partially matched

        all_recipe_ingredients_set = set(recipe_ingredients_normalized)
        # What the user effectively has from the recipe's perspective
        effective_haves = set()
        for user_ing in available_set:
            for recipe_ing_detail in all_recipe_ingredients_set:
                if user_ing in recipe_ing_detail:
                    effective_haves.add(recipe_ing_detail)

        missing_ingredients_list = list(all_recipe_ingredients_set - effective_haves)

        # Adjusted matching threshold:
        # User must have at least 1 ingredient, AND
        # EITHER recipe has <=3 ingredients (must have all)
        # OR user has >= 30% of ingredients OR at least 2 ingredients, whichever is more lenient for more complex recipes
        match_threshold_percentage = 0.30
        min_absolute_ingredients_match = 2

        passes_threshold = False
        if match_count > 0: # Must match at least one
            if required_count <= 3 and match_count == required_count:
                passes_threshold = True
            elif required_count > 3 and \
                 (match_count >= (required_count * match_threshold_percentage) or \
                  match_count >= min_absolute_ingredients_match):
                passes_threshold = True

        if passes_threshold:
            matched_recipes.append({
                **recipe,
                'match_count': match_count,
                'missing_ingredients': missing_ingredients_list
            })

    # Sort recipes by the number of matching ingredients (descending)
    # and then by the number of missing ingredients (ascending - more missing is worse)
    matched_recipes.sort(key=lambda r: (r['match_count'], -len(r['missing_ingredients'])), reverse=True)

    return matched_recipes

def get_recipe_by_id(recipe_id):
    """
    Retrieves a single recipe by its ID.
    """
    for recipe in SAMPLE_RECIPES:
        if recipe['id'] == recipe_id:
            return recipe
    return None
