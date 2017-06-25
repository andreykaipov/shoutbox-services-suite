import * as $ from 'cheerio'
import config from '../../utils/config'

const log = config.Logger('SHOUTS_PROCESSOR')

export interface ProcessedShout {
  id: number,
  timestamp: number,
  authorId: number,
  authorName: string,
  authorColor: string,
  content: string
}

export function processRawShout(shoutHtml: string): ProcessedShout {

  const root = $(shoutHtml.trim())

  const shoutId = Number(root.attr('id').split('shout_').pop())
  const unixTimestamp = Number(root.attr('data-shout-time'))

  const userLink = root.children('.user-avatar')
  const userId = Number(userLink.attr('data-uid')) || null
  const userName = userLink.attr('data-uname') || null
  const userStyle = userLink.children('span').attr('style')
  const userColor = userStyle ? userStyle.match(/color:(.+);/).pop() : null

  const shoutContent = getShoutContent(root[0].childNodes)

  log.verbose('Processed shout', shoutId)

  return {
    id: shoutId,
    timestamp: unixTimestamp * 1000, // to milliseconds
    authorId: userId,
    authorName: userName,
    authorColor: userColor,
    content: shoutContent
  } as ProcessedShout

}

/* Finds the index of the node that starts the text content.
 * Just look for the node after the username. */
function findContentStartIndex(htmlNodes): number {
  return htmlNodes.findIndex(node => node.attribs && node.attribs['data-uid']) + 1
}

function getShoutContent(htmlNodes: CheerioElement[]) {

  const contentStartIndex = findContentStartIndex(htmlNodes)
  const contentNodes = htmlNodes.slice(contentStartIndex)
  contentNodes[0].nodeValue = contentNodes[0].nodeValue.slice(2) // slice off the ': '
  return contentNodes.map(processNode).join('').trim()

}

function tokenize(content: string) {

  const tokens = [] as string[]
  const noScriptContent = content.replace(/<js>.+?<\/js>/g, match => {
    tokens.push(match)
    return ''
  })
  const remaining = noScriptContent.split(/\s+/g).map(word => word.toLowerCase())
  tokens.push( ...remaining )
  return tokens

}

/* Resurse through each of a node's children, choosing the processed data appropriately. */
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
          return attribs.href || attribs.title || '[awful-anchor]'
        case 'img':
          return attribs.title || attribs.src || '[awful-img]'
        case 'span':
          return processed || attribs.title || ':unrecognized:'
        case 'p':
          return processed
        case 'marquee':
          return processed
        default:
          log.warn('Encountered an unrecognizable tag while parsing shout HTML', node)
          return '[unrecognizable-node-tag]'
      }

    case 'comment':
      return ''

    case 'script':
      return ` <js>${processed}</js> `

    default:
      log.warn('Encountered an unrecognizable node type while parsing shout HTML', node)
      return '[unrecognizable-node-type]'

  }

}
