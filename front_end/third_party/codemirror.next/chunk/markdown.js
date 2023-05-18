import{l as e,m as t,s as n,t as r,n as s,P as i,T as o,o as a,p as l,q as h,k as f,r as c,a as d,u as p,v as u,w as m,x as g,y as k,z as x,e as b,i as L,A as S}from"./codemirror.js";class C{constructor(e,n,r,s,i,o,a){this.type=e,this.value=n,this.from=r,this.hash=s,this.end=i,this.children=o,this.positions=a,this.hashProp=[[t.contextHash,s]]}static create(e,t,n,r,s){return new C(e,t,n,r+(r<<8)+e+(t<<4)|0,s,[],[])}addChild(e,n){e.prop(t.contextHash)!=this.hash&&(e=new a(e.type,e.children,e.positions,e.length,this.hashProp)),this.children.push(e),this.positions.push(n)}toTree(t,n=this.end){let r=this.children.length-1;return r>=0&&(n=Math.max(n,this.positions[r]+this.children[r].length+this.from)),new a(t.types[this.type],this.children,this.positions,n-this.from).balance({makeTree:(t,n,r)=>new a(e.none,t,n,r,this.hashProp)})}}var y;!function(e){e[e.Document=1]="Document",e[e.CodeBlock=2]="CodeBlock",e[e.FencedCode=3]="FencedCode",e[e.Blockquote=4]="Blockquote",e[e.HorizontalRule=5]="HorizontalRule",e[e.BulletList=6]="BulletList",e[e.OrderedList=7]="OrderedList",e[e.ListItem=8]="ListItem",e[e.ATXHeading1=9]="ATXHeading1",e[e.ATXHeading2=10]="ATXHeading2",e[e.ATXHeading3=11]="ATXHeading3",e[e.ATXHeading4=12]="ATXHeading4",e[e.ATXHeading5=13]="ATXHeading5",e[e.ATXHeading6=14]="ATXHeading6",e[e.SetextHeading1=15]="SetextHeading1",e[e.SetextHeading2=16]="SetextHeading2",e[e.HTMLBlock=17]="HTMLBlock",e[e.LinkReference=18]="LinkReference",e[e.Paragraph=19]="Paragraph",e[e.CommentBlock=20]="CommentBlock",e[e.ProcessingInstructionBlock=21]="ProcessingInstructionBlock",e[e.Escape=22]="Escape",e[e.Entity=23]="Entity",e[e.HardBreak=24]="HardBreak",e[e.Emphasis=25]="Emphasis",e[e.StrongEmphasis=26]="StrongEmphasis",e[e.Link=27]="Link",e[e.Image=28]="Image",e[e.InlineCode=29]="InlineCode",e[e.HTMLTag=30]="HTMLTag",e[e.Comment=31]="Comment",e[e.ProcessingInstruction=32]="ProcessingInstruction",e[e.URL=33]="URL",e[e.HeaderMark=34]="HeaderMark",e[e.QuoteMark=35]="QuoteMark",e[e.ListMark=36]="ListMark",e[e.LinkMark=37]="LinkMark",e[e.EmphasisMark=38]="EmphasisMark",e[e.CodeMark=39]="CodeMark",e[e.CodeText=40]="CodeText",e[e.CodeInfo=41]="CodeInfo",e[e.LinkTitle=42]="LinkTitle",e[e.LinkLabel=43]="LinkLabel"}(y||(y={}));class w{constructor(e,t){this.start=e,this.content=t,this.marks=[],this.parsers=[]}}class A{constructor(){this.text="",this.baseIndent=0,this.basePos=0,this.depth=0,this.markers=[],this.pos=0,this.indent=0,this.next=-1}forward(){this.basePos>this.pos&&this.forwardInner()}forwardInner(){let e=this.skipSpace(this.basePos);this.indent=this.countIndent(e,this.pos,this.indent),this.pos=e,this.next=e==this.text.length?-1:this.text.charCodeAt(e)}skipSpace(e){return E(this.text,e)}reset(e){for(this.text=e,this.baseIndent=this.basePos=this.pos=this.indent=0,this.forwardInner(),this.depth=1;this.markers.length;)this.markers.pop()}moveBase(e){this.basePos=e,this.baseIndent=this.countIndent(e,this.pos,this.indent)}moveBaseColumn(e){this.baseIndent=e,this.basePos=this.findColumn(e)}addMarker(e){this.markers.push(e)}countIndent(e,t=0,n=0){for(let r=t;r<e;r++)n+=9==this.text.charCodeAt(r)?4-n%4:1;return n}findColumn(e){let t=0;for(let n=0;t<this.text.length&&n<e;t++)n+=9==this.text.charCodeAt(t)?4-n%4:1;return t}scrub(){if(!this.baseIndent)return this.text;let e="";for(let t=0;t<this.basePos;t++)e+=" ";return e+this.text.slice(this.basePos)}}function I(e,t,n){if(n.pos==n.text.length||e!=t.block&&n.indent>=t.stack[n.depth+1].value+n.baseIndent)return!0;if(n.indent>=n.baseIndent+4)return!1;let r=(e.type==y.OrderedList?R:O)(n,t,!1);return r>0&&(e.type!=y.BulletList||P(n,t,!1)<0)&&n.text.charCodeAt(n.pos+r-1)==e.value}const T={[y.Blockquote]:(e,t,n)=>62==n.next&&(n.markers.push(fe(y.QuoteMark,t.lineStart+n.pos,t.lineStart+n.pos+1)),n.moveBase(n.pos+(B(n.text.charCodeAt(n.pos+1))?2:1)),e.end=t.lineStart+n.text.length,!0),[y.ListItem]:(e,t,n)=>!(n.indent<n.baseIndent+e.value&&n.next>-1)&&(n.moveBaseColumn(n.baseIndent+e.value),!0),[y.OrderedList]:I,[y.BulletList]:I,[y.Document]:()=>!0};function B(e){return 32==e||9==e||10==e||13==e}function E(e,t=0){for(;t<e.length&&B(e.charCodeAt(t));)t++;return t}function H(e,t,n){for(;t>n&&B(e.charCodeAt(t-1));)t--;return t}function M(e){if(96!=e.next&&126!=e.next)return-1;let t=e.pos+1;for(;t<e.text.length&&e.text.charCodeAt(t)==e.next;)t++;if(t<e.pos+3)return-1;if(96==e.next)for(let n=t;n<e.text.length;n++)if(96==e.text.charCodeAt(n))return-1;return t}function v(e){return 62!=e.next?-1:32==e.text.charCodeAt(e.pos+1)?2:1}function P(e,t,n){if(42!=e.next&&45!=e.next&&95!=e.next)return-1;let r=1;for(let t=e.pos+1;t<e.text.length;t++){let n=e.text.charCodeAt(t);if(n==e.next)r++;else if(!B(n))return-1}return n&&45==e.next&&z(e)>-1&&e.depth==t.stack.length||r<3?-1:1}function N(e,t){for(let n=e.stack.length-1;n>=0;n--)if(e.stack[n].type==t)return!0;return!1}function O(e,t,n){return 45!=e.next&&43!=e.next&&42!=e.next||e.pos!=e.text.length-1&&!B(e.text.charCodeAt(e.pos+1))||!(!n||N(t,y.BulletList)||e.skipSpace(e.pos+2)<e.text.length)?-1:1}function R(e,t,n){let r=e.pos,s=e.next;for(;s>=48&&s<=57;){if(r++,r==e.text.length)return-1;s=e.text.charCodeAt(r)}return r==e.pos||r>e.pos+9||46!=s&&41!=s||r<e.text.length-1&&!B(e.text.charCodeAt(r+1))||n&&!N(t,y.OrderedList)&&(e.skipSpace(r+1)==e.text.length||r>e.pos+1||49!=e.next)?-1:r+1-e.pos}function X(e){if(35!=e.next)return-1;let t=e.pos+1;for(;t<e.text.length&&35==e.text.charCodeAt(t);)t++;if(t<e.text.length&&32!=e.text.charCodeAt(t))return-1;let n=t-e.pos;return n>6?-1:n}function z(e){if(45!=e.next&&61!=e.next||e.indent>=e.baseIndent+4)return-1;let t=e.pos+1;for(;t<e.text.length&&e.text.charCodeAt(t)==e.next;)t++;let n=t;for(;t<e.text.length&&B(e.text.charCodeAt(t));)t++;return t==e.text.length?n:-1}const D=/^[ \t]*$/,j=/-->/,$=/\?>/,q=[[/^<(?:script|pre|style)(?:\s|>|$)/i,/<\/(?:script|pre|style)>/i],[/^\s*<!--/,j],[/^\s*<\?/,$],[/^\s*<![A-Z]/,/>/],[/^\s*<!\[CDATA\[/,/\]\]>/],[/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i,D],[/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i,D]];function F(e,t,n){if(60!=e.next)return-1;let r=e.text.slice(e.pos);for(let e=0,t=q.length-(n?1:0);e<t;e++)if(q[e][0].test(r))return e;return-1}function U(e,t){let n=e.countIndent(t,e.pos,e.indent),r=e.countIndent(e.skipSpace(t),t,n);return r>=n+5?n+1:r}function Q(e,t,n){let r=e.length-1;r>=0&&e[r].to==t&&e[r].type==y.CodeText?e[r].to=n:e.push(fe(y.CodeText,t,n))}const Z={LinkReference:void 0,IndentedCode(e,t){let n=t.baseIndent+4;if(t.indent<n)return!1;let r=t.findColumn(n),s=e.lineStart+r,i=e.lineStart+t.text.length,o=[],a=[];for(Q(o,s,i);e.nextLine()&&t.depth>=e.stack.length;)if(t.pos==t.text.length){Q(a,e.lineStart-1,e.lineStart);for(let e of t.markers)a.push(e)}else{if(t.indent<n)break;{if(a.length){for(let e of a)e.type==y.CodeText?Q(o,e.from,e.to):o.push(e);a=[]}Q(o,e.lineStart-1,e.lineStart);for(let e of t.markers)o.push(e);i=e.lineStart+t.text.length;let n=e.lineStart+t.findColumn(t.baseIndent+4);n<i&&Q(o,n,i)}}return a.length&&(a=a.filter((e=>e.type!=y.CodeText)),a.length&&(t.markers=a.concat(t.markers))),e.addNode(e.buffer.writeElements(o,-s).finish(y.CodeBlock,i-s),s),!0},FencedCode(e,t){let n=M(t);if(n<0)return!1;let r=e.lineStart+t.pos,s=t.next,i=n-t.pos,o=t.skipSpace(n),a=H(t.text,t.text.length,o),l=[fe(y.CodeMark,r,r+i)];o<a&&l.push(fe(y.CodeInfo,e.lineStart+o,e.lineStart+a));for(let n=!0;e.nextLine()&&t.depth>=e.stack.length;n=!1){let r=t.pos;if(t.indent-t.baseIndent<4)for(;r<t.text.length&&t.text.charCodeAt(r)==s;)r++;if(r-t.pos>=i&&t.skipSpace(r)==t.text.length){for(let e of t.markers)l.push(e);l.push(fe(y.CodeMark,e.lineStart+t.pos,e.lineStart+r)),e.nextLine();break}{n||Q(l,e.lineStart-1,e.lineStart);for(let e of t.markers)l.push(e);let r=e.lineStart+t.basePos,s=e.lineStart+t.text.length;r<s&&Q(l,r,s)}}return e.addNode(e.buffer.writeElements(l,-r).finish(y.FencedCode,e.prevLineEnd()-r),r),!0},Blockquote(e,t){let n=v(t);return!(n<0)&&(e.startContext(y.Blockquote,t.pos),e.addNode(y.QuoteMark,e.lineStart+t.pos,e.lineStart+t.pos+1),t.moveBase(t.pos+n),null)},HorizontalRule(e,t){if(P(t,e,!1)<0)return!1;let n=e.lineStart+t.pos;return e.nextLine(),e.addNode(y.HorizontalRule,n),!0},BulletList(e,t){let n=O(t,e,!1);if(n<0)return!1;e.block.type!=y.BulletList&&e.startContext(y.BulletList,t.basePos,t.next);let r=U(t,t.pos+1);return e.startContext(y.ListItem,t.basePos,r-t.baseIndent),e.addNode(y.ListMark,e.lineStart+t.pos,e.lineStart+t.pos+n),t.moveBaseColumn(r),null},OrderedList(e,t){let n=R(t,e,!1);if(n<0)return!1;e.block.type!=y.OrderedList&&e.startContext(y.OrderedList,t.basePos,t.text.charCodeAt(t.pos+n-1));let r=U(t,t.pos+n);return e.startContext(y.ListItem,t.basePos,r-t.baseIndent),e.addNode(y.ListMark,e.lineStart+t.pos,e.lineStart+t.pos+n),t.moveBaseColumn(r),null},ATXHeading(e,t){let n=X(t);if(n<0)return!1;let r=t.pos,s=e.lineStart+r,i=H(t.text,t.text.length,r),o=i;for(;o>r&&t.text.charCodeAt(o-1)==t.next;)o--;o!=i&&o!=r&&B(t.text.charCodeAt(o-1))||(o=t.text.length);let a=e.buffer.write(y.HeaderMark,0,n).writeElements(e.parser.parseInline(t.text.slice(r+n+1,o),s+n+1),-s);o<t.text.length&&a.write(y.HeaderMark,o-r,i-r);let l=a.finish(y.ATXHeading1-1+n,t.text.length-r);return e.nextLine(),e.addNode(l,s),!0},HTMLBlock(e,t){let n=F(t,0,!1);if(n<0)return!1;let r=e.lineStart+t.pos,s=q[n][1],i=[],o=s!=D;for(;!s.test(t.text)&&e.nextLine();){if(t.depth<e.stack.length){o=!1;break}for(let e of t.markers)i.push(e)}o&&e.nextLine();let a=s==j?y.CommentBlock:s==$?y.ProcessingInstructionBlock:y.HTMLBlock,l=e.prevLineEnd();return e.addNode(e.buffer.writeElements(i,-r).finish(a,l-r),r),!0},SetextHeading:void 0};class _{constructor(e){this.stage=0,this.elts=[],this.pos=0,this.start=e.start,this.advance(e.content)}nextLine(e,t,n){if(-1==this.stage)return!1;let r=n.content+"\n"+t.scrub(),s=this.advance(r);return s>-1&&s<r.length&&this.complete(e,n,s)}finish(e,t){return(2==this.stage||3==this.stage)&&E(t.content,this.pos)==t.content.length&&this.complete(e,t,t.content.length)}complete(e,t,n){return e.addLeafElement(t,fe(y.LinkReference,this.start,this.start+n,this.elts)),!0}nextStage(e){return e?(this.pos=e.to-this.start,this.elts.push(e),this.stage++,!0):(!1===e&&(this.stage=-1),!1)}advance(e){for(;;){if(-1==this.stage)return-1;if(0==this.stage){if(!this.nextStage(Ce(e,this.pos,this.start,!0)))return-1;if(58!=e.charCodeAt(this.pos))return this.stage=-1;this.elts.push(fe(y.LinkMark,this.pos+this.start,this.pos+this.start+1)),this.pos++}else{if(1!=this.stage){if(2==this.stage){let t=E(e,this.pos),n=0;if(t>this.pos){let r=Se(e,t,this.start);if(r){let t=V(e,r.to-this.start);t>0&&(this.nextStage(r),n=t)}}return n||(n=V(e,this.pos)),n>0&&n<e.length?n:-1}return V(e,this.pos)}if(!this.nextStage(Le(e,E(e,this.pos),this.start)))return-1}}}}function V(e,t){for(;t<e.length;t++){let n=e.charCodeAt(t);if(10==n)break;if(!B(n))return-1}return t}class G{nextLine(e,t,n){let r=t.depth<e.stack.length?-1:z(t),s=t.next;if(r<0)return!1;let i=fe(y.HeaderMark,e.lineStart+t.pos,e.lineStart+r);return e.nextLine(),e.addLeafElement(n,fe(61==s?y.SetextHeading1:y.SetextHeading2,n.start,e.prevLineEnd(),[...e.parser.parseInline(n.content,n.start),i])),!0}finish(){return!1}}const K={LinkReference:(e,t)=>91==t.content.charCodeAt(0)?new _(t):null,SetextHeading:()=>new G},J=[(e,t)=>X(t)>=0,(e,t)=>M(t)>=0,(e,t)=>v(t)>=0,(e,t)=>O(t,e,!0)>=0,(e,t)=>R(t,e,!0)>=0,(e,t)=>P(t,e,!0)>=0,(e,t)=>F(t,0,!0)>=0],W={text:"",end:0};class Y{constructor(e,t,n,r){this.parser=e,this.input=t,this.ranges=r,this.line=new A,this.atEnd=!1,this.dontInject=new Set,this.stoppedAt=null,this.rangeI=0,this.to=r[r.length-1].to,this.lineStart=this.absoluteLineStart=this.absoluteLineEnd=r[0].from,this.block=C.create(y.Document,0,this.lineStart,0,0),this.stack=[this.block],this.fragments=n.length?new Ie(n,t):null,this.readLine()}get parsedPos(){return this.absoluteLineStart}advance(){if(null!=this.stoppedAt&&this.absoluteLineStart>this.stoppedAt)return this.finish();let{line:e}=this;for(;;){for(;e.depth<this.stack.length;)this.finishContext();for(let t of e.markers)this.addNode(t.type,t.from,t.to);if(e.pos<e.text.length)break;if(!this.nextLine())return this.finish()}if(this.fragments&&this.reuseFragment(e.basePos))return null;e:for(;;){for(let t of this.parser.blockParsers)if(t){let n=t(this,e);if(0!=n){if(1==n)return null;e.forward();continue e}}break}let t=new w(this.lineStart+e.pos,e.text.slice(e.pos));for(let e of this.parser.leafBlockParsers)if(e){let n=e(this,t);n&&t.parsers.push(n)}e:for(;this.nextLine()&&e.pos!=e.text.length;){if(e.indent<e.baseIndent+4)for(let n of this.parser.endLeafBlock)if(n(this,e,t))break e;for(let n of t.parsers)if(n.nextLine(this,e,t))return null;t.content+="\n"+e.scrub();for(let n of e.markers)t.marks.push(n)}return this.finishLeaf(t),null}stopAt(e){if(null!=this.stoppedAt&&this.stoppedAt<e)throw new RangeError("Can't move stoppedAt forward");this.stoppedAt=e}reuseFragment(e){if(!this.fragments.moveTo(this.absoluteLineStart+e,this.absoluteLineStart)||!this.fragments.matches(this.block.hash))return!1;let t=this.fragments.takeNodes(this);if(!t)return!1;let n=t,r=this.absoluteLineStart+t;for(let e=1;e<this.ranges.length;e++){let t=this.ranges[e-1].to,s=this.ranges[e].from;t>=this.lineStart&&s<r&&(n-=s-t)}return this.lineStart+=n,this.absoluteLineStart+=t,this.moveRangeI(),this.absoluteLineStart<this.to?(this.lineStart++,this.absoluteLineStart++,this.readLine()):(this.atEnd=!0,this.readLine()),!0}get depth(){return this.stack.length}parentType(e=this.depth-1){return this.parser.nodeSet.types[this.stack[e].type]}nextLine(){return this.lineStart+=this.line.text.length,this.absoluteLineEnd>=this.to?(this.absoluteLineStart=this.absoluteLineEnd,this.atEnd=!0,this.readLine(),!1):(this.lineStart++,this.absoluteLineStart=this.absoluteLineEnd+1,this.moveRangeI(),this.readLine(),!0)}moveRangeI(){for(;this.rangeI<this.ranges.length-1&&this.absoluteLineStart>=this.ranges[this.rangeI].to;)this.rangeI++,this.absoluteLineStart=Math.max(this.absoluteLineStart,this.ranges[this.rangeI].from)}scanLine(e){let t=W;if(t.end=e,e>=this.to)t.text="";else if(t.text=this.lineChunkAt(e),t.end+=t.text.length,this.ranges.length>1){let e=this.absoluteLineStart,n=this.rangeI;for(;this.ranges[n].to<t.end;){n++;let r=this.ranges[n].from,s=this.lineChunkAt(r);t.end=r+s.length,t.text=t.text.slice(0,this.ranges[n-1].to-e)+s,e=t.end-t.text.length}}return t}readLine(){let{line:e}=this,{text:t,end:n}=this.scanLine(this.absoluteLineStart);for(this.absoluteLineEnd=n,e.reset(t);e.depth<this.stack.length;e.depth++){let t=this.stack[e.depth],n=this.parser.skipContextMarkup[t.type];if(!n)throw new Error("Unhandled block context "+y[t.type]);if(!n(t,this,e))break;e.forward()}}lineChunkAt(e){let t,n=this.input.chunk(e);if(this.input.lineChunks)t="\n"==n?"":n;else{let e=n.indexOf("\n");t=e<0?n:n.slice(0,e)}return e+t.length>this.to?t.slice(0,this.to-e):t}prevLineEnd(){return this.atEnd?this.lineStart:this.lineStart-1}startContext(e,t,n=0){this.block=C.create(e,n,this.lineStart+t,this.block.hash,this.lineStart+this.line.text.length),this.stack.push(this.block)}startComposite(e,t,n=0){this.startContext(this.parser.getNodeType(e),t,n)}addNode(e,t,n){"number"==typeof e&&(e=new a(this.parser.nodeSet.types[e],oe,oe,(null!=n?n:this.prevLineEnd())-t)),this.block.addChild(e,t-this.block.from)}addElement(e){this.block.addChild(e.toTree(this.parser.nodeSet),e.from-this.block.from)}addLeafElement(e,t){this.addNode(this.buffer.writeElements(we(t.children,e.marks),-t.from).finish(t.type,t.to-t.from),t.from)}finishContext(){let e=this.stack.pop(),t=this.stack[this.stack.length-1];t.addChild(e.toTree(this.parser.nodeSet),e.from-t.from),this.block=t}finish(){for(;this.stack.length>1;)this.finishContext();return this.addGaps(this.block.toTree(this.parser.nodeSet,this.lineStart))}addGaps(e){return this.ranges.length>1?ee(this.ranges,0,e.topNode,this.ranges[0].from,this.dontInject):e}finishLeaf(e){for(let t of e.parsers)if(t.finish(this,e))return;let t=we(this.parser.parseInline(e.content,e.start),e.marks);this.addNode(this.buffer.writeElements(t,-e.start).finish(y.Paragraph,e.content.length),e.start)}elt(e,t,n,r){return"string"==typeof e?fe(this.parser.getNodeType(e),t,n,r):new he(e,t)}get buffer(){return new ae(this.parser.nodeSet)}}function ee(e,t,n,r,s){if(s.has(n.tree))return n.tree;let i=e[t].to,o=[],l=[],h=n.from+r;function f(n,s){for(;s?n>=i:n>i;){let s=e[t+1].from-i;r+=s,n+=s,t++,i=e[t].to}}for(let a=n.firstChild;a;a=a.nextSibling){f(a.from+r,!0);let n,c=a.from+r;a.to+r>i?(n=ee(e,t,a,r,s),f(a.to+r,!1)):n=a.toTree(),o.push(n),l.push(c-h)}return f(n.to+r,!1),new a(n.type,o,l,n.to+r-h,n.tree?n.tree.propValues:void 0)}class te extends i{constructor(e,t,n,r,s,i,o,a,l){super(),this.nodeSet=e,this.blockParsers=t,this.leafBlockParsers=n,this.blockNames=r,this.endLeafBlock=s,this.skipContextMarkup=i,this.inlineParsers=o,this.inlineNames=a,this.wrappers=l,this.nodeTypes=Object.create(null);for(let t of e.types)this.nodeTypes[t.name]=t.id}createParse(e,t,n){let r=new Y(this,e,t,n);for(let s of this.wrappers)r=s(r,e,t,n);return r}configure(r){let i=re(r);if(!i)return this;let{nodeSet:a,skipContextMarkup:l}=this,h=this.blockParsers.slice(),f=this.leafBlockParsers.slice(),c=this.blockNames.slice(),d=this.inlineParsers.slice(),p=this.inlineNames.slice(),u=this.endLeafBlock.slice(),m=this.wrappers;if(ne(i.defineNodes)){l=Object.assign({},l);let r,h=a.types.slice();for(let n of i.defineNodes){let{name:s,block:i,composite:a,style:f}="string"==typeof n?{name:n}:n;if(h.some((e=>e.name==s)))continue;a&&(l[h.length]=(e,t,n)=>a(t,n,e.value));let c=h.length,d=a?["Block","BlockContext"]:i?c>=y.ATXHeading1&&c<=y.SetextHeading2?["Block","LeafBlock","Heading"]:["Block","LeafBlock"]:void 0;h.push(e.define({id:c,name:s,props:d&&[[t.group,d]]})),f&&(r||(r={}),Array.isArray(f)||f instanceof o?r[s]=f:Object.assign(r,f))}a=new s(h),r&&(a=a.extend(n(r)))}if(ne(i.props)&&(a=a.extend(...i.props)),ne(i.remove))for(let e of i.remove){let t=this.blockNames.indexOf(e),n=this.inlineNames.indexOf(e);t>-1&&(h[t]=f[t]=void 0),n>-1&&(d[n]=void 0)}if(ne(i.parseBlock))for(let e of i.parseBlock){let t=c.indexOf(e.name);if(t>-1)h[t]=e.parse,f[t]=e.leaf;else{let t=e.before?se(c,e.before):e.after?se(c,e.after)+1:c.length-1;h.splice(t,0,e.parse),f.splice(t,0,e.leaf),c.splice(t,0,e.name)}e.endLeaf&&u.push(e.endLeaf)}if(ne(i.parseInline))for(let e of i.parseInline){let t=p.indexOf(e.name);if(t>-1)d[t]=e.parse;else{let t=e.before?se(p,e.before):e.after?se(p,e.after)+1:p.length-1;d.splice(t,0,e.parse),p.splice(t,0,e.name)}}return i.wrap&&(m=m.concat(i.wrap)),new te(a,h,f,c,u,l,d,p,m)}getNodeType(e){let t=this.nodeTypes[e];if(null==t)throw new RangeError(`Unknown node type '${e}'`);return t}parseInline(e,t){let n=new ye(this,e,t);e:for(let e=t;e<n.end;){let t=n.char(e);for(let r of this.inlineParsers)if(r){let s=r(n,t,e);if(s>=0){e=s;continue e}}e++}return n.resolveMarkers(0)}}function ne(e){return null!=e&&e.length>0}function re(e){if(!Array.isArray(e))return e;if(0==e.length)return null;let t=re(e[0]);if(1==e.length)return t;let n=re(e.slice(1));if(!n||!t)return t||n;let r=(e,t)=>(e||oe).concat(t||oe),s=t.wrap,i=n.wrap;return{props:r(t.props,n.props),defineNodes:r(t.defineNodes,n.defineNodes),parseBlock:r(t.parseBlock,n.parseBlock),parseInline:r(t.parseInline,n.parseInline),remove:r(t.remove,n.remove),wrap:s?i?(e,t,n,r)=>s(i(e,t,n,r),t,n,r):s:i}}function se(e,t){let n=e.indexOf(t);if(n<0)throw new RangeError(`Position specified relative to unknown parser ${t}`);return n}let ie=[e.none];for(let n,r=1;n=y[r];r++)ie[r]=e.define({id:r,name:n,props:r>=y.Escape?[]:[[t.group,r in T?["Block","BlockContext"]:["Block","LeafBlock"]]]});const oe=[];class ae{constructor(e){this.nodeSet=e,this.content=[],this.nodes=[]}write(e,t,n,r=0){return this.content.push(e,t,n,4+4*r),this}writeElements(e,t=0){for(let n of e)n.writeTo(this,t);return this}finish(e,t){return a.build({buffer:this.content,nodeSet:this.nodeSet,reused:this.nodes,topID:e,length:t})}}class le{constructor(e,t,n,r=oe){this.type=e,this.from=t,this.to=n,this.children=r}writeTo(e,t){let n=e.content.length;e.writeElements(this.children,t),e.content.push(this.type,this.from+t,this.to+t,e.content.length+4-n)}toTree(e){return new ae(e).writeElements(this.children,-this.from).finish(this.type,this.to-this.from)}}class he{constructor(e,t){this.tree=e,this.from=t}get to(){return this.from+this.tree.length}get type(){return this.tree.type.id}get children(){return oe}writeTo(e,t){e.nodes.push(this.tree),e.content.push(e.nodes.length-1,this.from+t,this.to+t,-1)}toTree(){return this.tree}}function fe(e,t,n,r){return new le(e,t,n,r)}const ce={resolve:"Emphasis",mark:"EmphasisMark"},de={resolve:"Emphasis",mark:"EmphasisMark"},pe={},ue={};class me{constructor(e,t,n,r){this.type=e,this.from=t,this.to=n,this.side=r}}const ge="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";let ke=/[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;try{ke=new RegExp("[\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}]","u")}catch(e){}const xe={Escape(e,t,n){if(92!=t||n==e.end-1)return-1;let r=e.char(n+1);for(let t=0;t<32;t++)if(ge.charCodeAt(t)==r)return e.append(fe(y.Escape,n,n+2));return-1},Entity(e,t,n){if(38!=t)return-1;let r=/^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(e.slice(n+1,n+31));return r?e.append(fe(y.Entity,n,n+1+r[0].length)):-1},InlineCode(e,t,n){if(96!=t||n&&96==e.char(n-1))return-1;let r=n+1;for(;r<e.end&&96==e.char(r);)r++;let s=r-n,i=0;for(;r<e.end;r++)if(96==e.char(r)){if(i++,i==s&&96!=e.char(r+1))return e.append(fe(y.InlineCode,n,r+1,[fe(y.CodeMark,n,n+s),fe(y.CodeMark,r+1-s,r+1)]))}else i=0;return-1},HTMLTag(e,t,n){if(60!=t||n==e.end-1)return-1;let r=e.slice(n+1,e.end),s=/^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(r);if(s)return e.append(fe(y.URL,n,n+1+s[0].length));let i=/^!--[^>](?:-[^-]|[^-])*?-->/i.exec(r);if(i)return e.append(fe(y.Comment,n,n+1+i[0].length));let o=/^\?[^]*?\?>/.exec(r);if(o)return e.append(fe(y.ProcessingInstruction,n,n+1+o[0].length));let a=/^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(r);return a?e.append(fe(y.HTMLTag,n,n+1+a[0].length)):-1},Emphasis(e,t,n){if(95!=t&&42!=t)return-1;let r=n+1;for(;e.char(r)==t;)r++;let s=e.slice(n-1,n),i=e.slice(r,r+1),o=ke.test(s),a=ke.test(i),l=/\s|^$/.test(s),h=/\s|^$/.test(i),f=!h&&(!a||l||o),c=!l&&(!o||h||a),d=f&&(42==t||!c||o),p=c&&(42==t||!f||a);return e.append(new me(95==t?ce:de,n,r,(d?1:0)|(p?2:0)))},HardBreak(e,t,n){if(92==t&&10==e.char(n+1))return e.append(fe(y.HardBreak,n,n+2));if(32==t){let t=n+1;for(;32==e.char(t);)t++;if(10==e.char(t)&&t>=n+2)return e.append(fe(y.HardBreak,n,t+1))}return-1},Link:(e,t,n)=>91==t?e.append(new me(pe,n,n+1,1)):-1,Image:(e,t,n)=>33==t&&91==e.char(n+1)?e.append(new me(ue,n,n+2,1)):-1,LinkEnd(e,t,n){if(93!=t)return-1;for(let t=e.parts.length-1;t>=0;t--){let r=e.parts[t];if(r instanceof me&&(r.type==pe||r.type==ue)){if(!r.side||e.skipSpace(r.to)==n&&!/[(\[]/.test(e.slice(n+1,n+2)))return e.parts[t]=null,-1;let s=e.takeContent(t),i=e.parts[t]=be(e,s,r.type==pe?y.Link:y.Image,r.from,n+1);if(r.type==pe)for(let n=0;n<t;n++){let t=e.parts[n];t instanceof me&&t.type==pe&&(t.side=0)}return i.to}}return-1}};function be(e,t,n,r,s){let{text:i}=e,o=e.char(s),a=s;if(t.unshift(fe(y.LinkMark,r,r+(n==y.Image?2:1))),t.push(fe(y.LinkMark,s-1,s)),40==o){let n,r=e.skipSpace(s+1),o=Le(i,r-e.offset,e.offset);o&&(r=e.skipSpace(o.to),n=Se(i,r-e.offset,e.offset),n&&(r=e.skipSpace(n.to))),41==e.char(r)&&(t.push(fe(y.LinkMark,s,s+1)),a=r+1,o&&t.push(o),n&&t.push(n),t.push(fe(y.LinkMark,r,a)))}else if(91==o){let n=Ce(i,s-e.offset,e.offset,!1);n&&(t.push(n),a=n.to)}return fe(n,r,a,t)}function Le(e,t,n){if(60==e.charCodeAt(t)){for(let r=t+1;r<e.length;r++){let s=e.charCodeAt(r);if(62==s)return fe(y.URL,t+n,r+1+n);if(60==s||10==s)return!1}return null}{let r=0,s=t;for(let t=!1;s<e.length;s++){let n=e.charCodeAt(s);if(B(n))break;if(t)t=!1;else if(40==n)r++;else if(41==n){if(!r)break;r--}else 92==n&&(t=!0)}return s>t?fe(y.URL,t+n,s+n):s==e.length&&null}}function Se(e,t,n){let r=e.charCodeAt(t);if(39!=r&&34!=r&&40!=r)return!1;let s=40==r?41:r;for(let r=t+1,i=!1;r<e.length;r++){let o=e.charCodeAt(r);if(i)i=!1;else{if(o==s)return fe(y.LinkTitle,t+n,r+1+n);92==o&&(i=!0)}}return null}function Ce(e,t,n,r){for(let s=!1,i=t+1,o=Math.min(e.length,i+999);i<o;i++){let o=e.charCodeAt(i);if(s)s=!1;else{if(93==o)return!r&&fe(y.LinkLabel,t+n,i+1+n);if(r&&!B(o)&&(r=!1),91==o)return!1;92==o&&(s=!0)}}return null}class ye{constructor(e,t,n){this.parser=e,this.text=t,this.offset=n,this.parts=[]}char(e){return e>=this.end?-1:this.text.charCodeAt(e-this.offset)}get end(){return this.offset+this.text.length}slice(e,t){return this.text.slice(e-this.offset,t-this.offset)}append(e){return this.parts.push(e),e.to}addDelimiter(e,t,n,r,s){return this.append(new me(e,t,n,(r?1:0)|(s?2:0)))}addElement(e){return this.append(e)}resolveMarkers(e){for(let t=e;t<this.parts.length;t++){let n=this.parts[t];if(!(n instanceof me&&n.type.resolve&&2&n.side))continue;let r,s=n.type==ce||n.type==de,i=n.to-n.from,o=t-1;for(;o>=e;o--){let e=this.parts[o];if(e instanceof me&&1&e.side&&e.type==n.type&&!(s&&(1&n.side||2&e.side)&&(e.to-e.from+i)%3==0&&((e.to-e.from)%3||i%3))){r=e;break}}if(!r)continue;let a=n.type.resolve,l=[],h=r.from,f=n.to;if(s){let e=Math.min(2,r.to-r.from,i);h=r.to-e,f=n.from+e,a=1==e?"Emphasis":"StrongEmphasis"}r.type.mark&&l.push(this.elt(r.type.mark,h,r.to));for(let e=o+1;e<t;e++)this.parts[e]instanceof le&&l.push(this.parts[e]),this.parts[e]=null;n.type.mark&&l.push(this.elt(n.type.mark,n.from,f));let c=this.elt(a,h,f,l);this.parts[o]=s&&r.from!=h?new me(r.type,r.from,h,r.side):null,(this.parts[t]=s&&n.to!=f?new me(n.type,f,n.to,n.side):null)?this.parts.splice(t,0,c):this.parts[t]=c}let t=[];for(let n=e;n<this.parts.length;n++){let e=this.parts[n];e instanceof le&&t.push(e)}return t}findOpeningDelimiter(e){for(let t=this.parts.length-1;t>=0;t--){let n=this.parts[t];if(n instanceof me&&n.type==e)return t}return null}takeContent(e){let t=this.resolveMarkers(e);return this.parts.length=e,t}skipSpace(e){return E(this.text,e-this.offset)+this.offset}elt(e,t,n,r){return"string"==typeof e?fe(this.parser.getNodeType(e),t,n,r):new he(e,t)}}function we(e,t){if(!t.length)return e;if(!e.length)return t;let n=e.slice(),r=0;for(let e of t){for(;r<n.length&&n[r].to<e.to;)r++;if(r<n.length&&n[r].from<e.from){let t=n[r];t instanceof le&&(n[r]=new le(t.type,t.from,t.to,we(t.children,[e])))}else n.splice(r++,0,e)}return n}const Ae=[y.CodeBlock,y.ListItem,y.OrderedList,y.BulletList];class Ie{constructor(e,t){this.fragments=e,this.input=t,this.i=0,this.fragment=null,this.fragmentEnd=-1,this.cursor=null,e.length&&(this.fragment=e[this.i++])}nextFragment(){this.fragment=this.i<this.fragments.length?this.fragments[this.i++]:null,this.cursor=null,this.fragmentEnd=-1}moveTo(e,t){for(;this.fragment&&this.fragment.to<=e;)this.nextFragment();if(!this.fragment||this.fragment.from>(e?e-1:0))return!1;if(this.fragmentEnd<0){let e=this.fragment.to;for(;e>0&&"\n"!=this.input.read(e-1,e);)e--;this.fragmentEnd=e?e-1:0}let n=this.cursor;n||(n=this.cursor=this.fragment.tree.cursor(),n.firstChild());let r=e+this.fragment.offset;for(;n.to<=r;)if(!n.parent())return!1;for(;;){if(n.from>=r)return this.fragment.from<=t;if(!n.childAfter(r))return!1}}matches(e){let n=this.cursor.tree;return n&&n.prop(t.contextHash)==e}takeNodes(e){let t=this.cursor,n=this.fragment.offset,r=this.fragmentEnd-(this.fragment.openEnd?1:0),s=e.absoluteLineStart,i=s,o=e.block.children.length,a=i,l=o;for(;;){if(t.to-n>r){if(t.type.isAnonymous&&t.firstChild())continue;break}if(e.dontInject.add(t.tree),e.addNode(t.tree,t.from-n),t.type.is("Block")&&(Ae.indexOf(t.type.id)<0?(i=t.to-n,o=e.block.children.length):(i=a,o=l,a=t.to-n,l=e.block.children.length)),!t.nextSibling())break}for(;e.block.children.length>o;)e.block.children.pop(),e.block.positions.pop();return i-s}}const Te=n({"Blockquote/...":r.quote,HorizontalRule:r.contentSeparator,"ATXHeading1/... SetextHeading1/...":r.heading1,"ATXHeading2/... SetextHeading2/...":r.heading2,"ATXHeading3/...":r.heading3,"ATXHeading4/...":r.heading4,"ATXHeading5/...":r.heading5,"ATXHeading6/...":r.heading6,"Comment CommentBlock":r.comment,Escape:r.escape,Entity:r.character,"Emphasis/...":r.emphasis,"StrongEmphasis/...":r.strong,"Link/... Image/...":r.link,"OrderedList/... BulletList/...":r.list,"BlockQuote/...":r.quote,"InlineCode CodeText":r.monospace,URL:r.url,"HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark":r.processingInstruction,"CodeInfo LinkLabel":r.labelName,LinkTitle:r.string,Paragraph:r.content}),Be=new te(new s(ie).extend(Te),Object.keys(Z).map((e=>Z[e])),Object.keys(Z).map((e=>K[e])),Object.keys(Z),J,T,Object.keys(xe).map((e=>xe[e])),Object.keys(xe),[]);function Ee(e,t,n){let r=[];for(let s=e.firstChild,i=t;;s=s.nextSibling){let e=s?s.from:n;if(e>i&&r.push({from:i,to:e}),!s)break;i=s.to}return r}const He={resolve:"Strikethrough",mark:"StrikethroughMark"},Me={defineNodes:[{name:"Strikethrough",style:{"Strikethrough/...":r.strikethrough}},{name:"StrikethroughMark",style:r.processingInstruction}],parseInline:[{name:"Strikethrough",parse(e,t,n){if(126!=t||126!=e.char(n+1)||126==e.char(n+2))return-1;let r=e.slice(n-1,n),s=e.slice(n+2,n+3),i=/\s|^$/.test(r),o=/\s|^$/.test(s),a=ke.test(r),l=ke.test(s);return e.addDelimiter(He,n,n+2,!o&&(!l||i||a),!i&&(!a||o||l))},after:"Emphasis"}]};function ve(e,t,n=0,r,s=0){let i=0,o=!0,a=-1,l=-1,h=!1,f=()=>{r.push(e.elt("TableCell",s+a,s+l,e.parser.parseInline(t.slice(a,l),s+a)))};for(let c=n;c<t.length;c++){let n=t.charCodeAt(c);124!=n||h?(h||32!=n&&9!=n)&&(a<0&&(a=c),l=c+1):((!o||a>-1)&&i++,o=!1,r&&(a>-1&&f(),r.push(e.elt("TableDelimiter",c+s,c+s+1))),a=l=-1),h=!h&&92==n}return a>-1&&(i++,r&&f()),i}function Pe(e,t){for(let n=t;n<e.length;n++){let t=e.charCodeAt(n);if(124==t)return!0;92==t&&n++}return!1}const Ne=/^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;class Oe{constructor(){this.rows=null}nextLine(e,t,n){if(null==this.rows){let r;if(this.rows=!1,(45==t.next||58==t.next||124==t.next)&&Ne.test(r=t.text.slice(t.pos))){let s=[];ve(e,n.content,0,s,n.start)==ve(e,r,t.pos)&&(this.rows=[e.elt("TableHeader",n.start,n.start+n.content.length,s),e.elt("TableDelimiter",e.lineStart+t.pos,e.lineStart+t.text.length)])}}else if(this.rows){let n=[];ve(e,t.text,t.pos,n,e.lineStart),this.rows.push(e.elt("TableRow",e.lineStart+t.pos,e.lineStart+t.text.length,n))}return!1}finish(e,t){return!!this.rows&&(e.addLeafElement(t,e.elt("Table",t.start,t.start+t.content.length,this.rows)),!0)}}const Re={defineNodes:[{name:"Table",block:!0},{name:"TableHeader",style:{"TableHeader/...":r.heading}},"TableRow",{name:"TableCell",style:r.content},{name:"TableDelimiter",style:r.processingInstruction}],parseBlock:[{name:"Table",leaf:(e,t)=>Pe(t.content,0)?new Oe:null,endLeaf(e,t,n){if(n.parsers.some((e=>e instanceof Oe))||!Pe(t.text,t.basePos))return!1;let r=e.scanLine(e.absoluteLineEnd+1).text;return Ne.test(r)&&ve(e,t.text,t.basePos)==ve(e,r,t.basePos)},before:"SetextHeading"}]};class Xe{nextLine(){return!1}finish(e,t){return e.addLeafElement(t,e.elt("Task",t.start,t.start+t.content.length,[e.elt("TaskMarker",t.start,t.start+3),...e.parser.parseInline(t.content.slice(3),t.start+3)])),!0}}const ze=[Re,{defineNodes:[{name:"Task",block:!0,style:r.list},{name:"TaskMarker",style:r.atom}],parseBlock:[{name:"TaskList",leaf:(e,t)=>/^\[[ xX]\]/.test(t.content)&&"ListItem"==e.parentType().name?new Xe:null,after:"SetextHeading"}]},Me];function De(e,t,n){return(r,s,i)=>{if(s!=e||r.char(i+1)==e)return-1;let o=[r.elt(n,i,i+1)];for(let s=i+1;s<r.end;s++){let a=r.char(s);if(a==e)return r.addElement(r.elt(t,i,s+1,o.concat(r.elt(n,s,s+1))));if(92==a&&o.push(r.elt("Escape",s,2+s++)),B(a))break}return-1}}const je={defineNodes:[{name:"Superscript",style:r.special(r.content)},{name:"SuperscriptMark",style:r.processingInstruction}],parseInline:[{name:"Superscript",parse:De(94,"Superscript","SuperscriptMark")}]},$e={defineNodes:[{name:"Subscript",style:r.special(r.content)},{name:"SubscriptMark",style:r.processingInstruction}],parseInline:[{name:"Subscript",parse:De(126,"Subscript","SubscriptMark")}]},qe={defineNodes:[{name:"Emoji",style:r.character}],parseInline:[{name:"Emoji",parse(e,t,n){let r;return 58==t&&(r=/^[a-zA-Z_0-9]+:/.exec(e.slice(n+1,e.end)))?e.addElement(e.elt("Emoji",n,n+1+r[0].length)):-1}}]},Fe=m({block:{open:"\x3c!--",close:"--\x3e"}}),Ue=Be.configure({props:[b.add((e=>{if(e.is("Block")&&!e.is("Document"))return(e,t)=>({from:t.doc.lineAt(e.from).to,to:e.to})})),L.add({Document:()=>null}),S.add({Document:Fe})]});function Qe(e){return new h(Fe,e,[],"markdown")}const Ze=Qe(Ue),_e=Qe(Ue.configure([ze,$e,je,qe]));class Ve{constructor(e,t,n,r,s,i,o){this.node=e,this.from=t,this.to=n,this.spaceBefore=r,this.spaceAfter=s,this.type=i,this.item=o}blank(e,t=!0){let n=this.spaceBefore+("Blockquote"==this.node.name?">":"");if(null!=e){for(;n.length<e;)n+=" ";return n}for(let e=this.to-this.from-n.length-this.spaceAfter.length;e>0;e--)n+=" ";return n+(t?this.spaceAfter:"")}marker(e,t){let n="OrderedList"==this.node.name?String(+Ke(this.item,e)[2]+t):"";return this.spaceBefore+n+this.type+this.spaceAfter}}function Ge(e,t){let n=[];for(let t=e;t&&"Document"!=t.name;t=t.parent)"ListItem"!=t.name&&"Blockquote"!=t.name&&"FencedCode"!=t.name||n.push(t);let r=[];for(let e=n.length-1;e>=0;e--){let s,i=n[e],o=t.lineAt(i.from),a=i.from-o.from;if("FencedCode"==i.name)r.push(new Ve(i,a,a,"","","",null));else if("Blockquote"==i.name&&(s=/^[ \t]*>( ?)/.exec(o.text.slice(a))))r.push(new Ve(i,a,a+s[0].length,"",s[1],">",null));else if("ListItem"==i.name&&"OrderedList"==i.parent.name&&(s=/^([ \t]*)\d+([.)])([ \t]*)/.exec(o.text.slice(a)))){let e=s[3],t=s[0].length;e.length>=4&&(e=e.slice(0,e.length-4),t-=4),r.push(new Ve(i.parent,a,a+t,s[1],e,s[2],i))}else if("ListItem"==i.name&&"BulletList"==i.parent.name&&(s=/^([ \t]*)([-+*])([ \t]{1,4}\[[ xX]\])?([ \t]+)/.exec(o.text.slice(a)))){let e=s[4],t=s[0].length;e.length>4&&(e=e.slice(0,e.length-4),t-=4);let n=s[2];s[3]&&(n+=s[3].replace(/[xX]/," ")),r.push(new Ve(i.parent,a,a+t,s[1],e,n,i))}}return r}function Ke(e,t){return/^(\s*)(\d+)(?=[.)])/.exec(t.sliceString(e.from,e.from+10))}function Je(e,t,n,r=0){for(let s=-1,i=e;;){if("ListItem"==i.name){let e=Ke(i,t),o=+e[2];if(s>=0){if(o!=s+1)return;n.push({from:i.from+e[1].length,to:i.from+e[0].length,insert:String(s+2+r)})}s=o}let e=i.nextSibling;if(!e)break;i=e}}const We=({state:e,dispatch:t})=>{let n=f(e),{doc:r}=e,s=null,i=e.changeByRange((t=>{if(!t.empty||!_e.isActiveAt(e,t.from))return s={range:t};let i=t.from,o=r.lineAt(i),a=Ge(n.resolveInner(i,-1),r);for(;a.length&&a[a.length-1].from>i-o.from;)a.pop();if(!a.length)return s={range:t};let l=a[a.length-1];if(l.to-l.spaceAfter.length>i-o.from)return s={range:t};let h=i>=l.to-l.spaceAfter.length&&!/\S/.test(o.text.slice(l.to));if(l.item&&h){if(l.node.firstChild.to>=i||o.from>0&&!/[^\s>]/.test(r.lineAt(o.from-1).text)){let e,t=a.length>1?a[a.length-2]:null,n="";t&&t.item?(e=o.from+t.from,n=t.marker(r,1)):e=o.from+(t?t.to:0);let s=[{from:e,to:i,insert:n}];return"OrderedList"==l.node.name&&Je(l.item,r,s,-2),t&&"OrderedList"==t.node.name&&Je(t.item,r,s),{range:c.cursor(e+n.length),changes:s}}{let t="";for(let e=0,n=a.length-2;e<=n;e++)t+=a[e].blank(e<n?a[e+1].from-t.length:null,e<n);return t+=e.lineBreak,{range:c.cursor(i+t.length),changes:{from:o.from,insert:t}}}}if("Blockquote"==l.node.name&&h&&o.from){let n=r.lineAt(o.from-1),s=/>\s*$/.exec(n.text);if(s&&s.index==l.from){let r=e.changes([{from:n.from+s.index,to:n.to},{from:o.from+l.from,to:o.to}]);return{range:t.map(r),changes:r}}}let f=[];"OrderedList"==l.node.name&&Je(l.item,r,f);let d=l.item&&l.item.from<o.from,p="";if(!d||/^[\s\d.)\-+*>]*/.exec(o.text)[0].length>=l.to)for(let e=0,t=a.length-1;e<=t;e++)p+=e!=t||d?a[e].blank(e<t?a[e+1].from-p.length:null):a[e].marker(r,1);let u=i;for(;u>o.from&&/\s/.test(o.text.charAt(u-o.from-1));)u--;return p=e.lineBreak+p,f.push({from:u,to:i,insert:p}),{range:c.cursor(u+p.length),changes:f}}));return!s&&(t(e.update(i,{scrollIntoView:!0,userEvent:"input"})),!0)};function Ye(e){return"QuoteMark"==e.name||"ListMark"==e.name}const et=({state:e,dispatch:t})=>{let n=f(e),r=null,s=e.changeByRange((t=>{let s=t.from,{doc:i}=e;if(t.empty&&_e.isActiveAt(e,t.from)){let e=i.lineAt(s),r=Ge(function(e,t){let n=e.resolveInner(t,-1),r=t;Ye(n)&&(r=n.from,n=n.parent);for(let e;e=n.childBefore(r);)if(Ye(e))r=e.from;else{if("OrderedList"!=e.name&&"BulletList"!=e.name)break;n=e.lastChild,r=n.to}return n}(n,s),i);if(r.length){let n=r[r.length-1],i=n.to-n.spaceAfter.length+(n.spaceAfter?1:0);if(s-e.from>i&&!/\S/.test(e.text.slice(i,s-e.from)))return{range:c.cursor(e.from+i),changes:{from:e.from+i,to:s}};if(s-e.from==i){let r=e.from+n.from;if(n.item&&n.node.from<n.item.from&&/\S/.test(e.text.slice(n.from,n.to)))return{range:t,changes:{from:r,to:e.from+n.to,insert:n.blank(n.to-n.from)}};if(r<s)return{range:c.cursor(r),changes:{from:r,to:s}}}}}return r={range:t}}));return!r&&(t(e.update(s,{scrollIntoView:!0,userEvent:"delete"})),!0)},tt=[{key:"Enter",run:We},{key:"Backspace",run:et}],nt=g({matchClosingTags:!1});function rt(e={}){let{codeLanguages:t,defaultCodeLanguage:n,addKeymap:r=!0,base:{parser:s}=Ze}=e;if(!(s instanceof te))throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");let i,o=e.extensions?[e.extensions]:[],a=[nt.support];n instanceof d?(a.push(n.support),i=n.language):n&&(i=n);let h=t||i?(f=t,c=i,e=>{if(e&&f){let t=null;if(e=/\S*/.exec(e)[0],t="function"==typeof f?f(e):k.matchLanguageName(f,e,!0),t instanceof k)return t.support?t.support.language.parser:x.getSkippingParser(t.load());if(t)return t.parser}return c?c.parser:null}):void 0;var f,c;return o.push(function(e){let{codeParser:t,htmlParser:n}=e,r=l(((e,r)=>{let s=e.type.id;if(!t||s!=y.CodeBlock&&s!=y.FencedCode){if(n&&(s==y.HTMLBlock||s==y.HTMLTag))return{parser:n,overlay:Ee(e.node,e.from,e.to)}}else{let n="";if(s==y.FencedCode){let t=e.node.getChild(y.CodeInfo);t&&(n=r.read(t.from,t.to))}let i=t(n);if(i)return{parser:i,overlay:e=>e.type.id==y.CodeText}}return null}));return{wrap:r}}({codeParser:h,htmlParser:nt.language.parser})),r&&a.push(p.high(u.of(tt))),new d(Qe(s.configure(o)),a)}export{Ze as commonmarkLanguage,et as deleteMarkupBackward,We as insertNewlineContinueMarkup,rt as markdown,tt as markdownKeymap,_e as markdownLanguage};
//# map=markdown.js.map
