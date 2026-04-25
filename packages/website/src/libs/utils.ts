// Blog utility functions

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate reading time (rough estimate)
 */
export function getReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

/**
 * Generate blog post URL with date structure
 */
export function getBlogPostUrl(post: any): string {
  const pubDate = new Date(post.data.pubDate || Date.now())
  const year = pubDate.getFullYear()
  const month = String(pubDate.getMonth() + 1).padStart(2, '0')
  const day = String(pubDate.getDate()).padStart(2, '0')

  // Extract slug from the file path (remove year folder and extension)
  const slug = post.id.replace(/^\d{4}\//, '').replace(/\.(md|mdx)$/, '')

  return `/blog/${year}/${month}/${day}/${slug}`
}
