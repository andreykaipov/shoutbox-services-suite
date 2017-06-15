import * as $ from 'cheerio'

export function processRawShout(shoutHtml: string) {

  const root = $(shoutHtml)

  const shoutId = Number(root.attr('id').split('shout_').pop())
  const unixTimestamp = root.attr('data-shout-time')

  const userLink = root.children('.user-avatar')
  const userId = Number(userLink.attr('data-uid'))
  const userName = userLink.attr('data-uname')
  const userStyle = userLink.children('span').attr('style')

  const childNodes = [...root[0].childNodes]
  const contentStartIndex = findContentStartIndex(childNodes)

  let shoutContent = childNodes[contentStartIndex].nodeValue.slice(2) // slice off the ': '
  let accessibleContent = shoutContent

  childNodes.slice(contentStartIndex + 1).forEach(node => {
    shoutContent += processNode(node)
  })

  return {
    shoutId: shoutId,
    authorId: userId,
    authorName: userName,
    content: shoutContent.trim()
  }

}

/* Finds the index of the node that starts the text content.
 * Just look for the node after the username */
function findContentStartIndex(childNodes): number {
  return childNodes.findIndex(node => node.attribs && node.attribs['data-uid']) + 1
}

function processNode(node: CheerioElement) {

  let processed: string = ''

  if (node.childNodes && node.childNodes.length > 0) {
    node.childNodes.forEach(child => {
      processed += processNode(child)
    })
  }

  switch (node.type) {

    case 'text':
      return node.nodeValue

    case 'tag':
      const tag = node.name
      const attribs = node.attribs
      switch (tag) {
        case 'a':
          return attribs.href || attribs.title || 'BAD_A_TAG'
        case 'img':
          return attribs.title || `src=${attribs.src}`
        case 'span':
          return processed || attribs.title || ':unrecognized:'
        case 'p':
          return processed
        default:
          return 'unrecognizable tag!'
      }

    case 'comment':
      // we don't really care
      return ''

    case 'script':
      return `script node! -- ${node}`

    default:
      return 'unrecognizable node!'

  }

}