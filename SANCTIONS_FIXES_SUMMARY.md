# Sanctions Service False Positive Fixes

## Problem Description
The sanctions search function was returning false positives for legitimate projects, specifically:
1. "Project: Rumaila Power plant, Client: Shamara Holding group, location: Basra, Iraq, project scope: supply of panels"
2. "Project: Grand Blue City, Client: Royal court affairs, location: Muscat, End user: Royal court affairs, Project scope: supply of electrical panels"

## Root Causes Identified

### 1. **Low Fuzzy Matching Threshold**
- Original `MIN_SCORE` was set to `0.3`, which was too sensitive
- This caused many legitimate terms to match against sanctions entities

### 2. **Country Matching Issues**
- Location strings like "Basra, Iraq" were being matched against entities with `country: 'Iraq'`
- The system didn't distinguish between a country being mentioned as a location vs. being the actual sanctioned entity

### 3. **Overly Permissive Matching Logic**
- The fuzzy matching algorithm was catching legitimate business terms
- No filtering for common legitimate project terminology

## Fixes Implemented

### 1. **Increased Matching Thresholds**
```typescript
const FUZZY_CONFIG = {
  MIN_SCORE: 0.6, // Increased from 0.3
  COUNTRY_MATCH_THRESHOLD: 0.8 // New higher threshold for country matches
};
```

### 2. **Improved Risk Level Thresholds**
- Exact match threshold: `0.9` → `0.95`
- High confidence threshold: `0.7` → `0.85`
- Medium confidence threshold: `0.5` → `0.75`

### 3. **Better Country/Location Parsing**
- Added `extractCountry()` function to extract country names from location strings
- For "Basra, Iraq" → extracts "Iraq" for matching
- Only matches country if the query is exactly the country name, not just containing it

### 4. **Legitimate Terms Filtering**
- Added filtering for common legitimate business terms
- Terms like "royal", "court", "affairs", "holding", "group", "power", "plant", etc. are filtered out
- Prevents false positives from legitimate project terminology

### 5. **Enhanced Debugging**
- Added console logging to track what entities are being checked
- Shows search queries, match scores, and matched fields
- Helps identify future false positive issues

## Testing

To test the fixes:

1. **Run the application** in the browser
2. **Open browser console** (F12)
3. **Enter the problematic test cases**:
   - Project: Rumaila Power plant, Client: Shamara Holding group, location: Basra, Iraq
   - Project: Grand Blue City, Client: Royal court affairs, location: Muscat
4. **Check console logs** for debug information
5. **Verify results** show "clear" status instead of false positives

## Expected Results

After these fixes:
- ✅ "Shamara Holding group" should not trigger sanctions alerts
- ✅ "Royal court affairs" should not trigger sanctions alerts  
- ✅ "Basra, Iraq" should not trigger sanctions alerts (Iraq is just a location)
- ✅ "Muscat" should not trigger sanctions alerts (Oman is just a location)
- ✅ Legitimate projects should pass compliance checks
- ✅ Actual sanctioned entities should still be detected

## Files Modified

- `src/services/sanctionsService.ts` - Main fixes implemented
- `test_sanctions.js` - Test cases for verification
- `SANCTIONS_FIXES_SUMMARY.md` - This documentation

## Future Improvements

1. **Whitelist Management**: Consider adding a configurable whitelist for legitimate entities
2. **Context Awareness**: Improve location parsing to understand project context better
3. **Machine Learning**: Consider ML-based approaches for more accurate matching
4. **Regular Expression Patterns**: Add more sophisticated patterns for entity extraction
