import fs from 'fs';

function main() {
  const html = fs.readFileSync('page_out.html', 'utf8');
  console.log('Finding text around the 2 role occurrences:');
  
  const regex = /\\"(user|assistant)\\"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const role = match[1];
    const index = match.index;
    console.log(`\n================== Role: ${role} at index ${index} ==================`);
    
    // Print 1500 characters before and after to get the full context of user and assistant messages
    const prefix = html.substring(Math.max(0, index - 5000), index);
    const suffix = html.substring(index, Math.min(html.length, index + 35000));
    
    // Decode escaped characters to make it readable
    function clean(str) {
      return str
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\t/g, '\t')
        .replace(/\\u003C/g, '<')
        .replace(/\\u003E/g, '>')
        .replace(/\\u0026/g, '&');
    }
    
    console.log('--- Context AFTER ---');
    console.log(clean(suffix).substring(0, 5000));
  }
}

main();
