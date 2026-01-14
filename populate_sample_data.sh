#!/bin/bash

# Script to create example user and populate with sample data

BASE_URL="http://localhost:4000"

echo "Creating example user..."

# First, try to register the example user via GraphQL
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation Register($email: String!, $password: String!, $name: String!) { register(email: $email, password: $password, name: $name) { user { id email name } token } }", "variables": {"email": "example.example@example.com", "password": "Password123!", "name": "Example User"}}')

echo "Registration response:"
echo $REGISTER_RESPONSE
echo ""

# Extract the token from the GraphQL response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  # If registration failed (maybe user exists), try logging in
  echo "Trying to log in with existing user..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { user { id email name } token } }", "variables": {"email": "example.example@example.com", "password": "Password123!"}}')
    
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

echo "Using token: $TOKEN"

if [ -n "$TOKEN" ]; then
  # Create tags
  echo "Creating tags..."
  
  TAG_IDS=()
  TAG_NAMES=('Groceries' 'Rent' 'Utilities' 'Entertainment' 'Transport' 'Dining Out' 'Healthcare' 'Salary' 'Freelance' 'Investments')
  
  for tag_name in "${TAG_NAMES[@]}"; do
    TAG_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"query\": \"mutation CreateTag(\$name: String!, \$icon: String) { createTag(name: \$name, icon: \$icon) { id name icon } }\", \"variables\": {\"name\": \"$tag_name\", \"icon\": null}}")
    
    echo "Created tag: $tag_name - Response: $TAG_RESPONSE"
    TAG_ID=$(echo $TAG_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$TAG_ID" ]; then
      TAG_IDS+=("$TAG_ID")
    fi
    sleep 0.1
  done
  
  echo "Created ${#TAG_IDS[@]} tags"
  
  # Generate expenses for the past 3 months
  START_DATE=$(date -d '3 months ago' +%Y-%m-01)
  END_DATE=$(date -d 'today' +%Y-%m-%d)
  
  echo "Generating expenses from $START_DATE to $END_DATE..."
  
  # Create 20-25 expenses per month
  CURRENT_MONTH=$(date -d "$START_DATE" +%Y-%m)
  END_MONTH=$(date -d "$END_DATE" +%Y-%m)
  
  # Using simpler month iteration
  MONTHS_TO_CREATE=3
  COUNTER=0
  
  while [ $COUNTER -lt $MONTHS_TO_CREATE ]; do
    echo "Creating expenses for $CURRENT_MONTH..."
    
    # Determine number of expenses for this month (20-25)
    NUM_EXPENSES=$((RANDOM % 6 + 20))  # Random number between 20-25
    
    for ((i=1; i<=NUM_EXPENSES; i++)); do
      # Generate random date within the current month
      DAY_OF_MONTH=$((RANDOM % 28 + 1))
      EXPENSE_DATE="${CURRENT_MONTH}-$(printf '%02d' $DAY_OF_MONTH)"
      
      # Randomly select a tag
      RANDOM_TAG_INDEX=$((RANDOM % ${#TAG_IDS[@]}))
      TAG_ID=${TAG_IDS[$RANDOM_TAG_INDEX]}
      
      # Generate random title
      TITLES=('Weekly Groceries' 'Monthly Rent' 'Electric Bill' 'Movie Night' 'Gas Fillup' 'Restaurant Dine-in' 'Doctor Visit' 'Monthly Salary' 'Project Payment' 'Dividend Income')
      TITLE="${TITLES[RANDOM % ${#TITLES[@]}]}"
      
      # Random amount (expenses negative, income positive)
      IS_INCOME=$((RANDOM % 3))  # 1 out of 3 chance of being income
      if [ $IS_INCOME -eq 0 ] && [[ "${TAG_NAMES[$RANDOM_TAG_INDEX]}" == *"Salary"* || "${TAG_NAMES[$RANDOM_TAG_INDEX]}" == *"Freelance"* || "${TAG_NAMES[$RANDOM_TAG_INDEX]}" == *"Investments"* ]]; then
        AMOUNT=$((RANDOM % 5000 + 1000))  # Income between 1000-6000
      else
        AMOUNT=$((RANDOM % 500 + 10))      # Expense between 10-510, made negative below
        AMOUNT=$((AMOUNT * -1))
      fi
      
      # Create expense via GraphQL
      EXPENSE_RESPONSE=$(curl -s -X POST "$BASE_URL/graphql" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"query\": \"mutation CreateExpense(\$title: String!, \$amount: Float!, \$date: String!, \$tagIds: [ID!]) { createExpense(title: \$title, amount: \$amount, date: \$date, tagIds: \$tagIds) { id title amount date } }\", \"variables\": {\"title\": \"$TITLE - Day $i\", \"amount\": $AMOUNT, \"date\": \"$EXPENSE_DATE\", \"tagIds\": [\"$TAG_ID\"]}}")
      
      echo "Created expense: $TITLE on $EXPENSE_DATE - Amount: $AMOUNT - Response: $EXPENSE_RESPONSE"
      sleep 0.05  # Small delay between requests
    done
    
    # Move to next month
    CURRENT_MONTH=$(date -d "$CURRENT_MONTH-15 + 1 month" +%Y-%m)
    COUNTER=$((COUNTER + 1))
  done
  
  echo "Sample data generation complete!"
else
  echo "Failed to obtain authentication token. Please check if the user registration/login endpoint is working correctly."
fi