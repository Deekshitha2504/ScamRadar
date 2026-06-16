import fs from 'fs';

function main() {
  const html = fs.readFileSync('page_out.html', 'utf8');
  console.log('Searching for conversation messages...');

  // ChatGPT messages are usually represented in a node structure or message entries.
  // We can write a parser that scans for \"role\" and \"parts\" or similar.
  // Or we can just find any text that resides inside JSON strings.
  // Let's search for all sequences of \"role\":\"assistant\" or \"role\":\"user\"
  // and try to find the text around them.
  
  // Let's use regular expressions to find roles and contents
  // The string might be double-escaped, like \\\"content\\\" or \\\"parts\\\" or similar,
  // or it might be single-escaped like \"text\" or \"content\"
  
  // Let's do a regex search for role: "user" and role: "assistant" and print out the structures.
  const regex = /\\"role\\"\s*,\s*\\"(user|assistant)\\"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const role = match[1];
    const matchIndex = match.index;
    console.log(`Found role ${role} at index ${matchIndex}`);
    
    // Print 3000 chars around it so we can read the message body
    const chunk = html.substring(Math.max(0, matchIndex - 1500), Math.min(html.length, matchIndex + 1500));
    fs.writeFileSync(`chunk_${role}_${matchIndex}.txt`, chunk);
    console.log(`Saved excerpt to chunk_${role}_${matchIndex}.txt`);
  }
  
  // Also search for escaped text blocks
  const partsRegex = /\\"parts\\"\s*,\s*\[([^\]]+)\]/g;
  let partsMatch = partsRegex.exec(html);
  if (partsMatch) {
    console.log('Found parts pattern!');
  }
}

main();
