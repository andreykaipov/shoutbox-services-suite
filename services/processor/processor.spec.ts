// tslint:disable:max-line-length
import { expect } from 'chai'
import 'mocha'
import { ProcessedShout, processRawShout } from './processor'

const rawShoutHtmlTemplate = (shoutContent: string) => `
  <div id="shout_13371337" data-shout-time="1497556800" class="messagewrapper shout row1 numshouts">
    <span class="shout-stamp mr light">
      [<time datetime="2017-06-15T20:00:00-04:00" title="08:00:00">08:00:00</time>]
    </span>
    <span class="fa fa-at fa-14px clickable mr at-shout pause-shout" title="@" data-at-uname="qu1cksc0p3r">
    </span>
    <a class="nav user-avatar pause-shout" href="#" title="View Mini Profile" data-uname="qu1cksc0p3r" data-uid="1337">
      <span class="bold" style="color:#FF69B4;">
        qu1cksc0p3r
      </span>
    </a>: ${shoutContent}</div>
`

const rawShoutHtmls = {
  inColor: rawShoutHtmlTemplate(`
    <span style="color:#008000;"> Hello world </span>
  `),
  emoticonAsImage: rawShoutHtmlTemplate(`
    <img title="<3" src="images/chat/smiles/heart.png" class="vam" />
  `),
  emoticonAsSpan: rawShoutHtmlTemplate(`
    <span class="emotes emote-icon_evil vam" title=":x"></span> <span class="emotes emote-icon_smile vam" title=":)"></span>
  `),
  fontAwesomeIcons: rawShoutHtmlTemplate(`
    woo <span class="fa fa-glass fa-paper-plane" title="fa-paper-plane"></span> oosh
  `),
  anchorTag: rawShoutHtmlTemplate(`
    help <a href="http://i.imgur.com/2MoXrdP.png" rel="noopener noreferrer nofollow" title="http://i.imgur.com/2MoXrdP.png" target="_blank"><span class="fa fa-link mr" title="link"></span>i.imgur.com/2MoXrdP.png</a>
  `),
  abnormalSpacing: rawShoutHtmlTemplate(`
    hello           how   are   you
  `),
  staffRainbowText1: rawShoutHtmlTemplate(`
    @Suhpose <span id="955896184" style="color: yellow;"><span id="955896184_0" style="color: yellow;">T</span><span id="955896184_1" style="color: blue;">A</span><span id="955896184_2" style="color: blue;">I</span><span id="955896184_3" style="color: blue;">W</span><span id="955896184_4" style="color: blue;">A</span><span id="955896184_5" style="color: blue;">N</span><span id="955896184_6" style="color: blue;"> </span><span id="955896184_7" style="color: blue;">N</span><span id="955896184_8" style="color: blue;">U</span><span id="955896184_9" style="color: blue;">M</span><span id="955896184_10" style="color: blue;">B</span><span id="955896184_11" style="color: blue;">A</span><span id="955896184_12" style="color: blue;">H</span><span id="955896184_13" style="color: blue;"> </span><span id="955896184_14" style="color: blue;">W</span><span id="955896184_15" style="color: blue;">A</span><span id="955896184_16" style="color: blue;">N</span><span id="955896184_17" style="color: blue;">N</span><span id="955896184_18" style="color: blue;">N</span><span id="955896184_19" style="color: blue;">N</span><span id="955896184_20" style="color: blue;">N</span><span id="955896184_21" style="color: blue;">N</span><span id="955896184_22" style="color: blue;">N</span><span id="955896184_23" style="color: blue;">N</span><span id="955896184_24" style="color: blue;">N</span><span id="955896184_25" style="color: blue;">N</span><span id="955896184_26" style="color: blue;">N</span><span id="955896184_27" style="color: blue;"> </span></span></div>
  `),
  staffRainbowText2: rawShoutHtmlTemplate(`
    <span id="323393336">WRONG SECTION</span><script>var rm_323393336 = window.setInterval("rainbowname('323393336');", 200);</script> / <span id="1476585264">WRONG PREFIX</span><script>rainbownameload('1476585264', 'WRONG PREFIX');</script>
  `),
  staffJohnCena: rawShoutHtmlTemplate(`
    <img src="images/chat/smiles/staff/johncena.png" class="vam" /><script>play_sound('johncena');</script>
  `),
  staffKiUltraCombo: rawShoutHtmlTemplate(`
    <span style="color:#8B0000;"> <img src="images/chat/smiles/staff/ki.png" class="vam" /><script>play_sound('ultra-combo');</script> </span>
  `),
  staffKta: rawShoutHtmlTemplate(`
    <p class="center"><img src="images/chat/smiles/smiley-violent.gif" title=":kta:" /></p><script>play_sound('kta');</script>
  `),
  staffZombieDemonLaugh: rawShoutHtmlTemplate(`
    <span style="color:#8B0000;"> <img title=":zombie:" src="images/chat/smiles/zombie.gif" class="vam" /><script>play_sound('demon-laugh');</script> </span>
  `),
  staffMudkipBarrelRoll: rawShoutHtmlTemplate(`
    <img title=":mudkip:" src="images/chat/smiles/mudkip.png" class="vam" /><script>play_sound('barrel-roll');</script><script>$('#'+shout_mod.toLowerCase()+'_box').animate({'rotate': 360}, 500);</script>
  `),
  staffJerry: rawShoutHtmlTemplate(`
    <img src="images/chat/smiles/jerry.png" class="vam" /><script>play_sound('jerry');</script>
  `),
  staffHelloThisIsDog: rawShoutHtmlTemplate(`
    <p class="center"><img src="images/chat/smiles/staff/thisisdog.png" width="503" height="617" class="resizeme" /></p>
  `),
  staffRoflcopter: rawShoutHtmlTemplate(`
    <marquee direction="right" scrolldelay="120" scrollamount="30"><img src="images/chat/smiles/staff/roflcopter.gif" width="235" height="150" class="resizeme"></marquee>
  `),
  nonGoldUser: `
    <div id="shout_13371337" data-shout-time="1497556800" class="messagewrapper shout row1 numshouts">
    <span class="shout-stamp mr light">
      [<time datetime="2017-06-15T20:00:00-04:00" title="08:00:00">08:00:00</time>]
    </span>
    <span class="fa fa-at fa-14px clickable mr at-shout pause-shout" title="@" data-at-uname="qu1cksc0p3r">
    </span>
    <a class="nav user-avatar pause-shout" href="#" title="View Mini Profile" data-uname="qu1cksc0p3r" data-uid="1337">
      qu1cksc0p3r
    </a>: Hello world</div>
  `,
  repFairyClean: `
    <div id="hidden_shout_1785965">
      <span id="repfairy-js">
        <script>
          $(function () {
            $.getScript(static_server + 'scripts/extras/particle.js');
          });
          var rdp = $('#repfairy-js').parent().attr('id').replace('hidden_shout_', '');
          setTimeout(function () {
            play_sound('fairydust');
          }, 500);
          setTimeout(function () {
            ajax_request({
              params: 'name=' + shout_mod + '&file=ajax_shout&op=delete&id=' + parseInt(rdp),
              onComplete: function () {
                $('#hidden_shout_' + rdp).remove();
              }
            });
          }, 5000);
        </script>
      </span>
    </div>
  `,
  repFairyDirty: `
    <div id="hidden_shout_2104337"><span id="repfairy-js"><script>$(function(){$.getScript(static_server + 'scripts/extras/particle.js');});var rdp = $('#repfairy-js').parent().attr('id').replace('hidden_shout_', ''); setTimeout(function(){play_sound('fairydust');}, 500); setTimeout(function(){ajax_request({params: 'name='+shout_mod+'&file=ajax_shout&op=delete&id='+parseInt(rdp),onComplete: function() { $('#hidden_shout_'+rdp).remove(); }});}, 5000);</script></span></div>
  `
}

function checkShoutPreContent(processedShout: ProcessedShout) {
  expect(processedShout.id).to.equal(13371337)
  expect(processedShout.authorId).to.equal(1337)
  expect(processedShout.authorName).to.equal('qu1cksc0p3r')
  expect(processedShout.authorColor).to.equal('#FF69B4')
}

describe('shout-processor', () => {
  describe('#processRawShout(shoutHtml)', () => {

    it('should process a shout using color', () => {
      const processed = processRawShout(rawShoutHtmls.inColor)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('Hello world')
    })

    it('should process a shout using an emoticon as an image', () => {
      const processed = processRawShout(rawShoutHtmls.emoticonAsImage)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('<3')
    })

    it('should process a shout using an emoticon as a span', () => {
      const processed = processRawShout(rawShoutHtmls.emoticonAsSpan)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(':x :)')
    })

    it('should process a shout using font awesome icons', () => {
      const processed = processRawShout(rawShoutHtmls.fontAwesomeIcons)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('woo fa-paper-plane oosh')
    })

    it('should process a shout with a link', () => {
      const processed = processRawShout(rawShoutHtmls.anchorTag)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('help http://i.imgur.com/2MoXrdP.png')
    })

    it('should process a shout, retaining any original spacing', () => {
      const processed = processRawShout(rawShoutHtmls.abnormalSpacing)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('hello           how   are   you')
    })

    it('should process a shout when staff uses rainbow text (1)', () => {
      const processed = processRawShout(rawShoutHtmls.staffRainbowText1)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal('@Suhpose TAIWAN NUMBAH WANNNNNNNNNNN')
    })

    it('should process a shout when staff uses rainbow text (2)', () => {
      const processed = processRawShout(rawShoutHtmls.staffRainbowText2)
      checkShoutPreContent(processed)
      expect(processed.content).to.contain('WRONG SECTION')
      expect(processed.content).to.contain('WRONG PREFIX')
    })

    it('should process a shout when staff blows out your ears with john cena', () => {
      const processed = processRawShout(rawShoutHtmls.staffJohnCena)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`images/chat/smiles/staff/johncena.png <js>play_sound('johncena');</js>`)
    })

    it('should process a shout when staff plays the KI ultra combo sound', () => {
      const processed = processRawShout(rawShoutHtmls.staffKiUltraCombo)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`images/chat/smiles/staff/ki.png <js>play_sound('ultra-combo');</js>`)
    })

    it('should process a shout when staff uses :kta:', () => {
      const processed = processRawShout(rawShoutHtmls.staffKta)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`<p>:kta:</p> <js>play_sound('kta');</js>`)
    })

    it('should process a shout when staff uses :zombie:', () => {
      const processed = processRawShout(rawShoutHtmls.staffZombieDemonLaugh)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`:zombie: <js>play_sound('demon-laugh');</js>`)
    })

    it('should process a shout when staff uses :mudkip:', () => {
      const processed = processRawShout(rawShoutHtmls.staffMudkipBarrelRoll)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`:mudkip: <js>play_sound('barrel-roll');</js>  <js>$('#'+shout_mod.toLowerCase()+'_box').animate({'rotate': 360}, 500);</js>`)
    })

    it('should process a shout when staff plays \'jerry jerry jerry\'', () => {
      const processed = processRawShout(rawShoutHtmls.staffJerry)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`images/chat/smiles/jerry.png <js>play_sound('jerry');</js>`)
    })

    it('should process a shout when staff uses \'hello this is dog\'', () => {
      const processed = processRawShout(rawShoutHtmls.staffHelloThisIsDog)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`<p>images/chat/smiles/staff/thisisdog.png</p>`)
    })

    it('should process a shout when staff uses the roflcopter', () => {
      const processed = processRawShout(rawShoutHtmls.staffRoflcopter)
      checkShoutPreContent(processed)
      expect(processed.content).to.equal(`<marquee>images/chat/smiles/staff/roflcopter.gif</marquee>`)
    })

    it('should process a shout when a user is not gold', () => {
      const processed = processRawShout(rawShoutHtmls.nonGoldUser)
      expect(processed.id).to.equal(13371337)
      expect(processed.authorId).to.equal(1337)
      expect(processed.authorName).to.equal('qu1cksc0p3r')
      expect(processed.authorColor).to.equal(null)
      expect(processed.content).to.equal(`Hello world`)
    })

    it('should process the hidden (clean) rep fairy shout', () => {
      const processed = processRawShout(rawShoutHtmls.repFairyClean)
      expect(processed.id).to.equal(1785965)
      expect(processed.authorId).to.equal(null)
      expect(processed.authorName).to.equal(null)
      expect(processed.authorColor).to.equal(null)
      expect(processed.timestamp).to.be.a('number').greaterThan(0)
      expect(processed.content).match(/<js>(.|\n)+play_sound\('fairydust'\);(.|\n)+<\/js>/)
    })

    it('should process the hidden (dirty) rep fairy shout again', () => {
      const processed = processRawShout(rawShoutHtmls.repFairyDirty)
      expect(processed.id).to.equal(2104337)
      expect(processed.authorId).to.equal(null)
      expect(processed.authorName).to.equal(null)
      expect(processed.authorColor).to.equal(null)
      expect(processed.timestamp).to.be.a('number').greaterThan(0)
      expect(processed.content).match(/<js>(.|\n)+play_sound\('fairydust'\);(.|\n)+<\/js>/)
    })

  })
})
