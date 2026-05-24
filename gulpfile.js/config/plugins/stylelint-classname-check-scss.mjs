import stylelint from 'stylelint';
import classDictionary from '../dict-classes.mjs';

// Create a Set for faster lookup
const classWordsSet = new Set(classDictionary.map(word => word.toLowerCase()));

const classnameCheckScss = stylelint.createPlugin('plugin/classname-check-scss', (isEnabled) => {
  return (root, result) => {
    if (isEnabled == false) return;
    // Get and display the file name
    const fileName = result.root.source.input.from || 'unknown';
    console.log('Class name check plugin is running...:', fileName);

    // Track processed class names to avoid duplicates
    const processedClasses = new Set();

    root.walkRules(rule => {
      
      // Protect commas inside attribute selectors before splitting
      const protectedSelector = rule.selector.replace(/\[[^\]]+\]/g, (match) => {
        return match.replace(/,/g, '___COMMA_PLACEHOLDER___');
      });
      
      // Remove line breaks and split by commas
      const normalizedSelector = protectedSelector.replace(/[\r\n]+/g, ' ').trim();
      const individualSelectors = normalizedSelector.split(',').map(s => s.trim());
      
      // Extract class names from each selector
      const allClassNames = [];
      individualSelectors.forEach(selector => {
        // Restore protected commas
        const restoredSelector = selector.replace(/___COMMA_PLACEHOLDER___/g, ',');

        // More comprehensive regex for class name extraction
        // 1. Regular class names: .class-name
        // 2. Class names in attribute selectors: [class~="class-name"]
        // 3. Nesting notation: &__element, &--modifier
        // 4. Compound selectors: .class-name::before, .class-name:hover
        const classNames = restoredSelector.match(/(?:\.([a-zA-Z0-9_-]+)(?![a-zA-Z0-9_:])|\[class~="([^"]+)"\]|&[a-zA-Z0-9_-]+)/g) || [];
        
        // Extract class names from matched results
        const extractedClassNames = classNames.map(match => {
          // For .class-name format
          if (match.startsWith('.')) {
            return match;
          }
          // For [class~="class-name"] format
          if (match.startsWith('[class~="')) {
            return '.' + match.match(/\[class~="([^"]+)"\]/)[1];
          }
          // For &__element or &--modifier format
          if (match.startsWith('&')) {
            return match; // Return as-is with & (processed later)
          }
          return match;
        });
        
        allClassNames.push(...extractedClassNames);
      });

      allClassNames.forEach(fullClassName => {
        // Skip if already processed
        if (processedClasses.has(fullClassName)) {
          return;
        }
        
        // Mark as processed
        processedClasses.add(fullClassName);

        // Remove the leading dot and split by delimiters
        const words = fullClassName.slice(1).split(/[-_]+/).filter(word => word.length > 0);

        for (const word of words) {
          // Skip empty words
          if (!word || word.trim() === '') {
            continue;
          }
          
          // Skip numbers only
          if (/^[0-9]+$/.test(word)) {
            continue;
          }
          
          // Skip special characters only
          if (/^[^a-zA-Z0-9]+$/.test(word)) {
            continue;
          }
          
          const lowerWord = word.toLowerCase();
          
          // Check if word exists in our class dictionary
          if (classWordsSet.has(lowerWord)) {
            continue; // Skip if found in dictionary
          }
          
          // If we get here, the word is not in our class dictionary - report it
          stylelint.utils.report({
            ruleName: 'plugin/classname-check-scss',
            result,
            node: rule,
            message: `Unexpected word "${word}" in class name "${fullClassName}"`
          });
        }
      });
    });
  };
});

export default classnameCheckScss;
