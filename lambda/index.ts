// index.ts
const GREETING = 'Lambda updated!';
export async function main(event: any, context: any) {
  console.log(GREETING);
  return GREETING;
}
