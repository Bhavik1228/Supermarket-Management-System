const fs = require('fs');

const filePath = 'c:\\Users\\mukesh.swali\\OneDrive - Toyota Tanzania Limited\\Desktop\\STUDIES\\Supermarket Management System\\src\\app\\(store)\\store\\owner-pos\\page.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find the standardized board end and the Card start
let startRemove = -1;
let endRemove = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Operational Intel')) {
        // Look for the closing div after this
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === '</div>') {
                startRemove = j + 1;
                break;
            }
        }
        break;
    }
}

for (let i = startRemove; i < lines.length; i++) {
    if (lines[i].includes('<Card className="w-[400px]')) {
        endRemove = i - 1;
        break;
    }
}

if (startRemove !== -1 && endRemove !== -1 && startRemove < endRemove) {
    console.log(`Removing lines ${startRemove + 1} to ${endRemove + 1}`);
    // We want to keep one closing div for the Left Pane
    // Let's just keep the last line of the junk if it's the correct closing div, or insert one.

    // Actually, safer:
    // Keep 321 (div close for board)
    // Remove everything from 322 to 331
    // Keep 332 (div close for Left Pane)

    // In current view:
    // 321: </div> (Board)
    // 322-331: JUNK
    // 332: </div> (Left Pane)

    lines.splice(321, 10); // Splice is 0-indexed, so 321 is line 322. 10 lines removes 322-331.
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Fix applied successfully.');
} else {
    console.log('Could not find markers:', { startRemove, endRemove });
}
