import stylelint from 'stylelint';
import { relative } from 'path';
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as sass from 'sass';
import * as cssParse from 'css';

// BEM pattern: block__element--modifier
const BEM_PATTERN = /^(?:[a-z][-a-z0-9]+(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)$/;

// Compile SCSS to CSS and extract class names from the compiled CSS
const extractClassNamesFromCompiledCSS = async (scssContent, filePath) => {
  const tempDir = join(process.cwd(), 'tmp');
  
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  
  const tempScssFile = join(tempDir, `temp_${Date.now()}.scss`);
  
  try {
    writeFileSync(tempScssFile, scssContent, 'utf8');
    
    const result = sass.compile(tempScssFile, {
      style: 'expanded'
    });

    const classNames = extractClassNamesFromCSS(result.css);
    
    try {
      unlinkSync(tempScssFile);
    } catch (cleanupError) {}
    
    return classNames;
  } catch (error) {
    try {
      unlinkSync(tempScssFile);
    } catch (cleanupError) {}
    
    return extractClassNamesFromSCSS(scssContent);
  }
};

const extractClassNamesFromSCSS = (scssContent) => {
  const classNames = [];
  const classSelectorRegex = /\.([a-zA-Z0-9_-]+)(?=\s*[#{}\s,])/g;
  let match;
  
  while ((match = classSelectorRegex.exec(scssContent)) !== null) {
    const className = match[1];
    if (!['if', 'else', 'for', 'each', 'while', 'function', 'mixin', 'include', 'extend'].includes(className)) {
      classNames.push(className);
    }
  }
  
  return [...new Set(classNames)];
};

const extractClassNamesFromCSS = (cssContent) => {
  const classNames = [];
  
  try {
    const cssAst = cssParse.parse(cssContent);
    
    cssAst.stylesheet.rules.forEach((rule) => {
      if (rule.type === 'rule') {
        rule.selectors.forEach((selector) => {
          const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g) || [];
          
          classMatches.forEach(match => {
            const className = match.slice(1);
            if (className && className.trim() !== '') {
              classNames.push(className);
            }
          });
        });
      }
    });
  } catch (error) {
    console.warn('Error parsing CSS:', error.message);
  }
  
  return [...new Set(classNames)];
};

const validateClassName = (className) => {
  if (!className || className.trim() === '') {
    return { valid: true };
  }
  
  if (className.startsWith('_') || 
      className.includes('$') || 
      className.includes('@') ||
      className.match(/^[0-9]/)) {
    return { valid: true };
  }
  
  const isValid = BEM_PATTERN.test(className);
  
  return {
    valid: isValid,
    message: isValid ? null : `BEM naming convention violation: "${className}"`
  };
};

const bemScss = stylelint.createPlugin('plugin/bem-scss', (config) => {
  return async (root, result) => {
    if (config === false) return;
    const filePath = root.source?.input?.file;
    if (!filePath) return;
    
    try {
      const scssContent = root.source?.input?.css || '';
      if (!scssContent) return;
      
      const classNames = await extractClassNamesFromCompiledCSS(scssContent, filePath);
      const processedClasses = new Set();
      
      classNames.forEach(className => {
        if (processedClasses.has(className)) return;
        processedClasses.add(className);
        
        const validation = validateClassName(className);
        
        if (!validation.valid) {
          let reportNode = null;
          root.walkRules(rule => {
            if (!reportNode && rule.selector.includes(`.${className}`)) {
              reportNode = rule;
            }
          });
          
          stylelint.utils.report({
            ruleName: 'plugin/bem-scss',
            result,
            node: reportNode || root,
            message: validation.message
          });
        }
      });
    } catch (error) {
      console.warn(`Error in BEM plugin for ${filePath}:`, error.message);
    }
  };
});

export default bemScss;
