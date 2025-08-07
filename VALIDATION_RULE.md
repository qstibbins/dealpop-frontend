# Target Price Validation Rule

## Overview
Implement target price validation in backend API to ensure that when creating or updating price alerts, the target price must be less than the current price.

## Validation Rule
**Target price must be less than the current price**

## API Endpoints to Update
- `POST /alerts` - Create new alert
- `PUT /alerts/:id` - Update existing alert

## Validation Requirements
1. **Target price validation**: `targetPrice < currentPrice`
2. **Input validation**: Target price must be a positive number
3. **Error response format**: Return HTTP 400 with structured error response
4. **Consistent validation**: Apply same logic to both create and update operations

## Expected Error Response Format
```json
{
  "error": {
    "message": "Target price must be less than the current price",
    "code": "TARGET_PRICE_TOO_HIGH",
    "field": "targetPrice",
    "details": [
      {
        "field": "targetPrice",
        "message": "Target price must be less than the current price",
        "code": "TARGET_PRICE_TOO_HIGH"
      }
    ]
  }
}
```

## Validation Scenarios to Handle
1. **Valid case**: `targetPrice < currentPrice` → Allow operation
2. **Invalid case**: `targetPrice >= currentPrice` → Return error
3. **Invalid input**: `targetPrice <= 0` or non-numeric → Return error
4. **Missing data**: Missing `targetPrice` or `currentPrice` → Return error

## Implementation Approach
- Create a validation middleware/function that can be reused
- Apply validation to both POST and PUT endpoints
- Ensure proper error handling and response formatting
- Add appropriate logging for debugging

## Frontend Integration
The frontend is already updated to handle these validation errors and will display the error message to users when the backend returns a validation error.

## Testing Requirements
- Test all validation scenarios
- Ensure proper error response format
- Verify validation works for both create and update operations
- Test edge cases (zero values, negative values, etc.)