import fs from 'fs';
import path from 'path';
import { series } from 'gulp';
import { create } from 'browser-sync';
import { base as config } from '../config/index.mjs';

const liveHTMLFilePath = './unused_html_classes.txt';

function liveTestHTML(req, res, next) {
  // Only apply middleware to HTML files
  if (req.url.endsWith('.html') || req.url.endsWith('/') || req.url.endsWith(':3000')) {
    const originalWrite = res.write;
    const pagePath = `${req.protocol || 'http'}://${req.headers.host}${req.url}`; // Full path of the page
    const scriptTesting = `
      <script>
  document.addEventListener("DOMContentLoaded", function () {
    // Collect all unique class names from HTML elements
    const htmlClasses = new Set();
    document.querySelectorAll('[class]').forEach(element => {
      element.classList.forEach(className => {
        htmlClasses.add(className);
      });
    });

    // Collect all unique class names from the CSSOM, including those in media queries
    const cssClasses = new Set();

    function collectCSSClasses(rules) {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule) {
          // Recursively process media query rules
          collectCSSClasses(rule.cssRules);
        } else if (rule.selectorText) {
          // Extract all class selectors from CSS rule
          const matches = rule.selectorText.match(/\\.[a-zA-Z0-9_-]+/g);
          if (matches) {
            matches.forEach(match => {
              const className = match.slice(1); // Remove the leading dot
              cssClasses.add(className);
            });
          }
        }
      }
    }

    for (const sheet of document.styleSheets) {
      try {
        collectCSSClasses(sheet.cssRules || []);
      } catch (e) {
        console.warn('Unable to read stylesheet:', sheet.href || 'inline style', e);
      }
    }

    // Find and log classes used in HTML but not fully defined in CSS
    const undefinedClasses = [...htmlClasses].filter(className => !cssClasses.has(className));

    // Send results to the server regardless of whether there are undefined classes
    fetch('/bs-test-html-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ undefinedClasses, allClassesDefined: undefinedClasses.length === 0, pagePath: "${pagePath}" })
    }).then(response => {
      if (response.ok) {
        console.log('Class analysis result has been sent to the server.');
      } else {
        console.error('Failed to send class analysis result to the server.');
      }
    });

    if (undefinedClasses.length > 0) {
      console.log('Class names in HTML that are not defined in CSS:', undefinedClasses);
    } else {
      console.log('All class names in HTML are defined in CSS');
    }
  });
      </script>
    `;
    res.write = function (data) {
      const modifiedData = data.toString().replace('</body>', `${scriptTesting}</body>`);
      originalWrite.call(res, Buffer.from(modifiedData));
    };
    next();
  } else {
    next();
  }
}

function liveTestHTMLResult(req, res, next) {
  if (req.url === '/bs-test-html-result' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { undefinedClasses, allClassesDefined, pagePath } = JSON.parse(body);

      // Format content with <START pathfile> and <END pathfile> markers
      const newContent = `<START ${pagePath}>\n` +
                         (allClassesDefined
                           ? 'All class names in HTML are defined in CSS.\n'
                           : `Undefined classes:\n${undefinedClasses.join('\n')}\n`) +
                         `<END ${pagePath}>\n`;

      // Read the existing file contents
      fs.readFile(liveHTMLFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to read class analysis result file:', err);
          res.writeHead(500);
          res.end('Error reading class analysis result file');
          return;
        }

        let updatedData;
        if (data) {
          // Replace the existing block if it exists
          const regex = new RegExp(`<START ${pagePath}>[\\s\\S]*?<END ${pagePath}>`, 'g');
          if (regex.test(data)) {
            updatedData = data.replace(regex, newContent);
          } else {
            // Append the new content if the block doesn't exist
            updatedData = data + '\n' + newContent;
          }
        } else {
          // If the file doesn't exist or is empty, start with the new content
          updatedData = newContent;
        }

        // Write the updated content back to the file
        fs.writeFile(liveHTMLFilePath, updatedData, err => {
          if (err) {
            console.error('Failed to save class analysis result:', err);
            res.writeHead(500);
            res.end('Error saving class analysis result');
          } else {
            console.log('Class analysis result saved to:', liveHTMLFilePath);
            res.writeHead(200);
            res.end('Class analysis result saved successfully');
          }
        });
      });
    });
  } else {
    next();
  }
}

const webServer = () => {
  create().init({
    server: {
      baseDir: config.pathDestination,
      logLevel: 'silent',
      notify: false,
      reloadDelay: 1000,
      reloadDebounce: 1000,
    },
    middleware: [liveTestHTML, liveTestHTMLResult],
    files: config.pathDestination,
    ui: false,
    port: 3000,
    open: 'local',
  });
};

export const bs = series(webServer);
