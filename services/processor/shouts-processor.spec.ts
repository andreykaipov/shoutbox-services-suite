// tslint:disable:max-line-length
import { expect } from 'chai'
import 'mocha'
import { processRawShout } from './shouts-processor'

const rawShoutHtmls = {
  color: `<div id=\"shout_13371337\" data-shout-time=\"1497406003\" class=\"messagewrapper shout row1 numshouts new\">
            <span class=\"shout-stamp mr light\">
              [<time datetime=\"2017-06-13T22:06:43-04:00\" title=\"10:06:43\">10:06:43<\/time>]
            <\/span>
            <span class=\"fa fa-at fa-14px clickable mr at-shout pause-shout\" title=\"@\" data-at-uname=\"tortuga\"><\/span>
            <a class=\"nav user-avatar pause-shout\" href=\"#\" title=\"View Mini Profile\" data-uname=\"tortuga\" data-uid=\"1337\">
              <span class=\"bold\" style=\"color:#FF69B4;\">
                tortuga
              <\/span>
            <\/a>:
            <span style=\"color:#008000;\"> Hello world <\/span>
          <\/div>`,
  color1: '<div id="shout_1958472" data-shout-time="1497406003" class="messagewrapper shout row1 numshouts new"><span class="shout-stamp mr light">[<time datetime="2017-06-13T22:06:43-04:00" title="10:06:43">10:06:43<\/time>] <\/span><span class="fa fa-at fa-14px clickable mr at-shout pause-shout" title="@" data-at-uname="Funsta"><\/span>  <a class="nav user-avatar pause-shout" href="#" title="View Mini Profile" data-uname="Funsta" data-uid="1686818"><span class="bold" style="color:#FF69B4;">Funsta<\/span><\/a>: <span style="color:#008000;"> Takeyour time make jt perfect,youll be proud of it after <\/span><\/div>'
}

describe('shout-processor', () => {
  describe('#processRawShout(shoutHtml)', () => {
    it('should work when users shout in color', () => {
      const processed = processRawShout(rawShoutHtmls.color)
      expect(processed.shoutId).to.equal(13371337)
      expect(processed.authorId).to.equal(1337)
      expect(processed.authorName).to.equal('tortuga')
      expect(processed.content).to.equal('Hello world')
    })
    it('should work when users shout in color1', () => {
      const processed = processRawShout(rawShoutHtmls.color1)
      expect(processed.shoutId).to.equal(1958472)
      expect(processed.authorId).to.equal(1686818)
      expect(processed.authorName).to.equal('Funsta')
      expect(processed.content).to.equal('Takeyour time make jt perfect,youll be proud of it after')
    })
  })
})
