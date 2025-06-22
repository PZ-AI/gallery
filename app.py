from flask import Flask, render_template, request, url_for, abort
from recipe_logic.core import process_ingredients_input, find_matching_recipes, get_recipe_by_id

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    suggested_recipes = []
    if request.method == 'POST':
        ingredients_str = request.form.get('ingredients', '')
        user_ingredients = process_ingredients_input(ingredients_str)
        if user_ingredients:
            suggested_recipes = find_matching_recipes(user_ingredients)
            print(f"User ingredients: {user_ingredients}") # For debugging
            print(f"Suggested recipes: {[r['name'] for r in suggested_recipes]}") # For debugging

    return render_template('index.html', suggested_recipes=suggested_recipes)

@app.route('/recipe/<int:recipe_id>')
def view_recipe(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if recipe is None:
        abort(404) # Not found
    return render_template('recipe.html', recipe=recipe)

if __name__ == '__main__':
    app.run(debug=True)
