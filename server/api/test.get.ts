export default defineEventHandler(async (event) => {
  const test = 'abc'
  const ctx = event
  return { test, ctx }
})
