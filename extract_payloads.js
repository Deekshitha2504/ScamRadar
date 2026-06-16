import fs from 'fs';

function main() {
  const html = fs.readFileSync('page_out.html', 'utf8');
  
  // Find all enqueue calls
  const regex = /\.enqueue\("([\s\S]*?)"\);/g;
  let match;
  let index = 0;
  
  while ((match = regex.exec(html)) !== null) {
    index++;
    const payload = match[1];
    console.log(`\n================== Enqueue Payload ${index} (length: ${payload.length}) ==================`);
    
    // Parse the payload. It's often escaped.
    // Let's replace the escaped quotes and newlines
    let unescaped = payload
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
      
    fs.writeFileSync(`payload_${index}.txt`, unescaped);
    console.log(`Wrote payloads to payload_${index}.txt`);
    
    // Let's search if this is the conversation payload
    if (unescaped.includes('user') || unescaped.includes('assistant') || unescaped.includes('Cybersecurity')) {
      console.log('This payload seems to contain conversation data!');
      
      // Let's print out text that looks like markdown or chat messages
      // We can search for strings or sections that look like text
      // Let's try to extract all string values from the JSON array
      // A lot of times it is streamed as a serialized Javascript/JSON string.
      // Let's search for and log text sections.
      console.log('Preview of unescaped payload (first 1500 chars):');
      console.log(unescaped.substring(0, 1500));
      console.log('Preview of unescaped payload (last 1500 chars):');
      console.log(unescaped.substring(unescaped.length - 1500));
    }
  }
}

main();
