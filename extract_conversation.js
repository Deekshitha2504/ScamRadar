import fs from 'fs';

function main() {
  const html = fs.readFileSync('page_out.html', 'utf8');
  console.log('Parsing chat content from page_out.html');

  // Let's decode unicode escapes first
  // We can search for the JSON-like data or find where messages occur.
  // In ChatGPT pages, the conversation is part of standard React state.
  // There is usually a massive JSON array of messages.
  // Let's write a quick and dirty parser to locate all blocks that:
  // 1. Have "role" and "user"
  // 2. Have "role" and "assistant"
  // Let's search for role and extract the text content that precedes or succeeds it.
  
  // Let's search for strings like `\\"role\\",\\"user\\"` or `\\"role\\",\\"assistant\\"`
  // or `\"role\":\"user\"`
  
  // Let's find matches and dump chunks
  const regex = /\\"(user|assistant)\\"/g;
  let match;
  const positions = [];
  while ((match = regex.exec(html)) !== null) {
    positions.push({ role: match[1], index: match.index });
  }
  
  console.log(`Found ${positions.length} occurrences of roles in the HTML.`);
  
  // Let's print out the text between these zones or look for large text arrays
  // In our previous search, we saw:
  // "This division should allow all **4 people to finish a polished MVP within the hackathon timeframe.**"
  // That indicates the text is near position 429152.
  // Let's write a file containing the last 20,000 characters of the HTML, which probably contains the entire conversation!
  const lastPart = html.substring(Math.max(0, html.length - 100000));
  fs.writeFileSync('last_part.txt', lastPart);
  console.log('Saved last 100,000 chars to last_part.txt');
  
  // Let's parse last_part to extract the conversation cleanly
  // A message block typically contains:
  // \"role\",\"user\",... or similar.
  // In the stream context, they are often arrays of values:
  // Example: ["user", "Hello computer, give me a hackathon suggestion"]
  // Or: ["assistant", "Sure! here are some hackathon suggestions..."]
  // Let's write a script that decodes the unicode characters and cleans up the slashes of last_part.txt.
}

main();
