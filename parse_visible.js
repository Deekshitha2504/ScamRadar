import fs from 'fs';

function main() {
  const html = fs.readFileSync('page_out.html', 'utf8');
  console.log('HTML loaded, length:', html.length);

  // Strip scripts and styles
  let cleanHtml = html;
  cleanHtml = cleanHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  cleanHtml = cleanHtml.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, '');
  
  // Let's strip other tags but keep some structure
  // Replace tags with newlines
  let text = cleanHtml.replace(/<[^>]+>/g, '\n');
  
  // Clean up whitespace
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  // Print lines that look like they might be part of the chat
  fs.writeFileSync('visible_text.txt', lines.join('\n'));
  console.log('Wrote visible_text.txt, lines count:', lines.length);
  
  // Print some non-boilerplate lines
  console.log('Sample of visible text:');
  const interesting = lines.filter(l => l.length > 15 && !l.includes('window.') && !l.includes('analytics') && !l.includes('statsig'));
  console.log(interesting.slice(0, 30).join('\n'));
}

main();
