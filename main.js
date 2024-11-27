const form = document.getElementById('styleForm');
const input = document.getElementById('styleInput');
const results = document.getElementById('results');
const toast = document.getElementById('toast');

// Clear textarea on page load
window.addEventListener('load', () => {
    input.value = '';
});

// CSS Trimming function
function timeStyle(rawCSS) {
    // Helper to resolve variables recursively
    const resolveVariable = (value, variables) => {
        if (!value.includes("var(")) return value;

        return value.replace(/var\((--[\w-]+)\)/g, (_, variableName) => {
            if (variables[variableName] !== undefined) {
                return resolveVariable(variables[variableName], variables);
            }
            return "unset"; // Fallback for undefined variables
        });
    };

    // Helper to format CSS values with proper spacing
    const formatCSSValue = (property, value) => {
        // Remove extra spaces first
        value = value.trim();

        // Don't add spaces in hex colors
        const preserveHexColors = (str) => {
            // Temporarily replace hex colors with tokens
            const hexColors = [];
            const tokenizedStr = str.replace(/#[0-9a-fA-F]+/g, match => {
                hexColors.push(match);
                return `__COLOR${hexColors.length - 1}__`;
            });
            return { tokenizedStr, hexColors };
        };

        // Restore hex colors
        const restoreHexColors = (str, hexColors) => {
            return str.replace(/__COLOR(\d+)__/g, (_, index) => hexColors[parseInt(index)]);
        };

        if (property === 'box-shadow') {
            // Split by commas first to handle multiple shadows
            const shadows = value.split(',').map(shadow => {
                const { tokenizedStr, hexColors } = preserveHexColors(shadow);
                // First normalize all spaces
                let formatted = tokenizedStr
                    .trim()
                    // Add space after each value component
                    .replace(/(-?\d+)([a-zA-Z]+|%)/g, '$1$2 ')
                    // Remove extra spaces
                    .replace(/\s+/g, ' ')
                    .trim();
                return restoreHexColors(formatted, hexColors);
            });
            return shadows.join(', ');
        } else if (property === 'background-image') {
            // Handle gradient functions
            const { tokenizedStr, hexColors } = preserveHexColors(value);
            let formatted = tokenizedStr
                // Add space after commas in gradients
                .replace(/,(?![^(]*\))/g, ', ')
                // Add space after commas inside gradient
                .replace(/,(?=[^(]*\))/g, ', ')
                // Remove extra spaces
                .replace(/\s+/g, ' ');
            return restoreHexColors(formatted, hexColors);
        } else if (property === 'font-family') {
            // Special handling for font-family to ensure proper comma spacing
            return value.split(',').map(font => font.trim()).join(', ');
        } else {
            // For other properties
            const { tokenizedStr, hexColors } = preserveHexColors(value);
            let formatted = tokenizedStr
                .replace(/(\d+)([a-zA-Z])/g, '$1$2') // No space between number and unit
                .replace(/\s+/g, ' ') // Normalize other spaces
                .trim();
            return restoreHexColors(formatted, hexColors);
        }
    };

    // Parse raw CSS into individual rules
    const rules = rawCSS
        .split(";")
        .map(rule => rule.trim())
        .filter(rule => rule.length > 0); // Remove empty rules

    // Separate variables and properties
    const variables = {};
    const properties = [];

    rules.forEach(rule => {
        const [property, ...valueParts] = rule.split(":");
        const value = valueParts.join(":").trim(); // Rejoin in case value contains colons
        
        if (property.startsWith("--")) {
            // Store CSS variables
            variables[property.trim()] = value;
        } else {
            // Store other CSS properties
            properties.push({ 
                property: property.trim(), 
                value: value 
            });
        }
    });

    // Resolve variables in the properties
    const resolvedProperties = properties.map(({ property, value }) => {
        const resolvedValue = resolveVariable(value, variables);
        const formattedValue = formatCSSValue(property, resolvedValue);
        return `${property}: ${formattedValue};`;
    });

    // Join the properties with newlines
    return resolvedProperties.join('\n');
}

// Show toast message
function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy to clipboard');
        console.error('Failed to copy:', err);
    }
}

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const styleText = input.value.trim();
    
    if (!styleText) {
        showToast('Please enter some CSS styles');
        return;
    }

    try {
        const timedStyle = timeStyle(styleText);
        results.innerHTML = `<pre><code>${timedStyle}</code></pre>`;
        copyToClipboard(timedStyle);
        showToast('Timed style copied to clipboard!');
    } catch (error) {
        showToast('Error processing styles. Please check your input.');
    }
});

// Handle clear button click
document.getElementById('clearBtn').addEventListener('click', () => {
    location.reload();
});

// Add click handler for copying results
results.addEventListener('click', () => {
    if (results.textContent) {
        copyToClipboard(results.textContent);
    }
}); 