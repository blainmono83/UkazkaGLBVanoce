/*
 * ChristmasOverlay — standalone, dependency-free festive layer.
 * To reuse on another page, copy this file and add:
 *   <christmas-overlay></christmas-overlay>
 *   <script src="christmas-overlay.js" defer></script>
 * Optional configuration: window.ChristmasOverlayConfig = { gifts, elves,
 * ornamentCount, mobileOrnamentCount } before this script loads.
 */
(() => {
  const TAG = 'christmas-overlay';
  if (customElements.get(TAG)) return;

  const DEFAULT_CONFIG = {
    ornamentCount: 15,
    mobileOrnamentCount: 7,
    gifts: [
      { id: 'sweet', anchor: '.hero', x: .9, y: .87, size: 70, color: '#b52f3a', ribbon: '#f1cb70', title: 'Vánoční sladkosti', text: 'Malá inspirace pro chvíle, které voní perníkem, skořicí a čokoládou.', kind: 'sweets', cta: 'Prohlédnout vánoční inspiraci', target: '.articles' },
      { id: 'decor', anchor: '.branches', x: .98, y: .56, size: 56, color: '#23684b', ribbon: '#e7c267', title: 'Ozdoba na stromeček', text: 'Jemná dekorace dokáže vykouzlit sváteční náladu v každém koutě domova.', kind: 'decoration', cta: 'Najít inspiraci', target: '.craft' },
      { id: 'gift-tip', anchor: '.flyers', x: .04, y: .77, size: 68, color: '#345b87', ribbon: '#e6c96c', title: 'Tip na vánoční dárek', text: 'Zabalte společný čas. Domácí dobroty a drobná pozornost potěší pod každým stromečkem.', kind: 'gift', cta: 'Prohlédnout nabídku', target: '.offers' },
      { id: 'festive-table', anchor: '.promo-banner', x: .96, y: .78, size: 62, color: '#9b572d', ribbon: '#f0d17b', title: 'Sváteční stůl', text: 'Vánoční menu začíná dobrými surovinami. Poskládejte si svůj sváteční stůl podle chuti.', kind: 'food', cta: 'Na vánoční inspiraci', target: '.articles' },
      { id: 'demo-coupon', anchor: '.loyalty', x: .95, y: .85, size: 64, color: '#a62e3c', ribbon: '#f0d071', title: 'Ukázkový vánoční kupon', text: 'Toto je pouze demonstrační překvapení. Kupon není platný a nezakládá nárok na slevu.', kind: 'coupon', cta: 'Prohlédnout nabídku', target: '.offers' }
    ],
    elves: [
      { anchor: '.hero', x: .03, y: .88, scale: .8, variant: 0 },
      { anchor: '.craft', x: .97, y: .02, scale: .7, variant: 1 },
      { anchor: '.loyalty', x: .08, y: .96, scale: .66, variant: 2 }
    ]
  };

  const STYLE = `
    :host{--co-red:#b8333d;--co-green:#24664a;--co-gold:#e4c36d;--co-cream:#fff9ed;position:absolute;inset:0 auto auto 0;display:block;width:100%;height:var(--co-page-height,100vh);z-index:999;pointer-events:none;overflow:visible;font-family:Arial,Helvetica,sans-serif;color:#392b24}
    *,*::before,*::after{box-sizing:border-box}
    .scene{position:absolute;inset:0;pointer-events:none;overflow:visible}
    .floaties,.anchors{position:absolute;inset:0;pointer-events:none;overflow:visible}
    .ornament{position:fixed;left:var(--x);top:var(--y);width:var(--size);height:var(--size);opacity:var(--opacity,.72);pointer-events:none;filter:drop-shadow(0 4px 5px #46321c18);transform-origin:50% 10%;animation:co-sway var(--duration,9s) ease-in-out var(--delay,0s) infinite alternate}
    .ornament.falling{top:-36px;animation:co-fall var(--duration,15s) linear var(--delay,0s) infinite}
    .ornament svg{display:block;width:100%;height:100%;overflow:visible}
    .hanging-line{position:fixed;left:var(--x);top:0;height:var(--line);border-left:1px solid #b99a5c8c;transform-origin:top center;animation:co-sway var(--duration,7s) ease-in-out var(--delay,0s) infinite alternate;pointer-events:none}
    .hanging-line .ornament{position:absolute;top:100%;left:50%;transform:translateX(-50%);animation:none}
    .elf{position:absolute;left:var(--x);top:var(--y);width:calc(112px * var(--scale,1));height:calc(140px * var(--scale,1));transform:translate(-50%,-58%);pointer-events:auto;border:0;padding:0;background:none;cursor:pointer;filter:drop-shadow(0 5px 5px #392b2426);animation:co-elf-peek 5s ease-in-out var(--delay,0s) infinite}
    .elf svg{width:100%;height:100%;overflow:visible}
    .elf:hover,.elf:focus-visible{filter:drop-shadow(0 7px 8px #392b2440);animation:co-elf-wave .6s ease-in-out 2}
    .elf:focus-visible,.gift:focus-visible,.switch:focus-visible,.modal button:focus-visible{outline:3px solid #145b40;outline-offset:4px;border-radius:8px}
    .elf-talk{position:absolute;bottom:85%;left:50%;transform:translate(-50%,8px);opacity:0;white-space:nowrap;padding:7px 10px;border-radius:12px;background:#fffdf7;border:1px solid #eadbb8;font-size:11px;font-weight:700;transition:opacity .18s,transform .18s;pointer-events:none}
    .elf:hover .elf-talk,.elf:focus-visible .elf-talk,.elf.is-talking .elf-talk{opacity:1;transform:translate(-50%,0)}
    .gift{position:absolute;left:var(--x);top:var(--y);width:var(--gift-size);height:calc(var(--gift-size) * 1.08);transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;border:0;padding:0;background:transparent;filter:drop-shadow(0 8px 7px #49311e25);animation:co-gift-float 4.8s ease-in-out var(--delay,0s) infinite}
    .gift:hover{z-index:2;animation:co-gift-hover .55s ease-in-out infinite alternate}
    .gift-box,.gift svg{width:100%;height:100%;display:block;overflow:visible}
    .gift.is-opening{animation:co-shake .48s ease-in-out}
    .gift.is-open{animation:none}
    .gift .lid{transform-box:fill-box;transform-origin:12% 90%;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
    .gift.is-open .lid{transform:translate(-8px,-18px) rotate(-34deg)}
    .gift .bow-tail{transform-box:fill-box;transform-origin:top center;transition:transform .45s ease,opacity .3s}
    .gift.is-open .bow-tail{transform:translateY(20px) rotate(35deg);opacity:0}
    .burst{position:absolute;inset:-32%;opacity:0;transform:scale(.2);pointer-events:none}
    .gift.is-open .burst{animation:co-burst .7s ease-out forwards}
    .burst i{position:absolute;width:11px;height:11px;background:var(--spark,#f1ce70);clip-path:polygon(50% 0,61% 37%,100% 50%,61% 63%,50% 100%,39% 63%,0 50%,39% 37%);left:var(--sx);top:var(--sy);transform:rotate(var(--sr))}
    .gift.is-open .burst i{animation:co-spark .75s ease-out var(--sd,0s) both}
    .switch{position:fixed;right:16px;bottom:16px;z-index:1001;pointer-events:auto;display:flex;align-items:center;gap:9px;padding:8px 11px;border:1px solid #e7dbc2;border-radius:99px;background:#fffdf7;color:#463a2e;box-shadow:0 4px 17px #392b241a;font-size:11px;font-weight:700;cursor:pointer}
    .switch .track{width:30px;height:17px;border-radius:10px;background:#b9b4a9;position:relative;transition:background .2s}
    .switch .track::after{content:"";position:absolute;width:13px;height:13px;left:2px;top:2px;border-radius:50%;background:#fff;box-shadow:0 1px 2px #0003;transition:transform .2s}
    .switch[aria-checked=true] .track{background:#39764c}
    .switch[aria-checked=true] .track::after{transform:translateX(13px)}
    .switch:disabled{opacity:.65;cursor:default}
    .modal{position:fixed;inset:0;z-index:1002;pointer-events:auto;display:grid;place-items:center;padding:20px;background:#1722198c;backdrop-filter:blur(3px)}
    .modal[hidden]{display:none}
    .dialog{position:relative;width:min(430px,100%);max-height:min(88vh,720px);overflow:auto;border:1px solid #ebdfc1;border-radius:18px;background:linear-gradient(160deg,#fffdf7,#fff5e3);box-shadow:0 24px 80px #15100d45;padding:26px 28px 24px;text-align:center;animation:co-modal-in .32s cubic-bezier(.2,.8,.2,1) both}
    .dialog::before{content:"";position:absolute;inset:7px;border:1px solid #e9d8b2;border-radius:13px;pointer-events:none}
    .close{position:absolute;right:17px;top:15px;width:34px;height:34px;border:1px solid #e9dec8;border-radius:50%;background:#fffdf8;color:#54483b;font-size:20px;line-height:1;cursor:pointer;z-index:1}
    .surprise-art{width:150px;height:132px;margin:1px auto 12px;display:grid;place-items:center}
    .surprise-art svg{width:100%;height:100%;overflow:visible}
    .modal-kicker{margin:0 0 6px;color:#916b35;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:700}
    .dialog h2{margin:0 24px 10px;font-family:Georgia,serif;font-size:25px;line-height:1.15;color:#3c3026}
    .dialog p{margin:0 auto 19px;max-width:335px;color:#62584c;font-size:14px;line-height:1.6}
    .demo-note{margin:-7px auto 16px;padding:7px 10px;max-width:340px;border-radius:7px;background:#f5ecd9;color:#715b32;font-size:11px;line-height:1.4}
    .cta{display:inline-flex;min-height:42px;align-items:center;justify-content:center;gap:10px;padding:10px 17px;border:0;border-radius:99px;background:#b64a32;color:#fffdf7;font-size:12px;font-weight:700;text-decoration:none;cursor:pointer;box-shadow:0 4px 12px #ae50322a}
    .cta:hover{background:#963d2b}
    .reduce-note{position:fixed;left:12px;bottom:12px;padding:7px 9px;border:1px solid #e8dec9;border-radius:9px;background:#fffdf7d9;color:#756a59;font-size:9px;pointer-events:none;opacity:0;transition:opacity .2s}
    :host([data-off]) .scene{display:none}
    @keyframes co-sway{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
    @keyframes co-fall{0%{transform:translate3d(0,-45px,0) rotate(0);opacity:0}8%{opacity:.72}90%{opacity:.62}100%{transform:translate3d(var(--drift,20px),calc(100vh + 80px),0) rotate(340deg);opacity:0}}
    @keyframes co-elf-peek{0%,100%{translate:0 12px}45%,58%{translate:0 -2px}50%{translate:0 -8px}}
    @keyframes co-elf-wave{0%,100%{rotate:0}30%{rotate:-5deg}65%{rotate:6deg}}
    @keyframes co-gift-float{0%,100%{translate:0 0}50%{translate:0 -7px}}
    @keyframes co-gift-hover{to{translate:0 -7px;rotate:2deg}}
    @keyframes co-shake{0%,100%{translate:0 0;rotate:0}18%{translate:-5px 1px;rotate:-5deg}36%{translate:5px -2px;rotate:5deg}55%{translate:-4px 0;rotate:-4deg}75%{translate:3px -1px;rotate:3deg}}
    @keyframes co-burst{0%{opacity:0;transform:scale(.2)}28%{opacity:1}100%{opacity:0;transform:scale(1.3)}}
    @keyframes co-spark{0%{transform:translate(0,12px) scale(.3);opacity:0}20%{opacity:1}100%{transform:translate(var(--sx2),var(--sy2)) scale(1);opacity:0}}
    @keyframes co-modal-in{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
    @media(max-width:700px){.ornament{width:calc(var(--size) * .78);height:calc(var(--size) * .78)}.elf{width:calc(82px * var(--scale,1));height:calc(104px * var(--scale,1))}.switch{right:10px;bottom:10px;padding:7px 9px;font-size:10px}.dialog{padding:23px 19px 20px}.dialog h2{font-size:22px}.surprise-art{height:112px;width:130px}.reduce-note{display:none}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.ornament.falling{animation:none;top:var(--y)}}
  `;

  const svgStar = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l4.2 12.1L37 20l-12.8 5.9L20 38l-4.2-12.1L3 20l12.8-5.9L20 2Z" fill="#edc964"/><circle cx="20" cy="20" r="3" fill="#fff8df"/></svg>`;

  function ornamentSVG(kind, id) {
    if (kind === 'snow') return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#fffdf5" stroke-width="3" stroke-linecap="round"><path d="M32 5v54M8.6 18.5l46.8 27M8.6 45.5l46.8-27M32 5l-5 7m5-7 5 7M32 59l-5-7m5 7 5-7M8.6 18.5l9 .5m-9-.5 4-8m42.2 35-9-.5m9 .5-4 8M8.6 45.5l9-.5m-9 .5 4 8M55.4 18.5l-9 .5m9-.5-4-8"/></g></svg>`;
    if (kind === 'star') return svgStar;
    if (kind === 'bell') return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 43c5-8 3-17 5-24 2-7 8-11 14-9 8 2 10 10 10 18 0 7 3 12 7 17 2 2 0 5-3 5H18c-3 0-4-4-1-7Z" fill="#d1a84a" stroke="#946b29" stroke-width="2"/><path d="M25 17c4-4 10-5 15-2" stroke="#f8e3a1" stroke-width="3" stroke-linecap="round"/><path d="M25 51a8 8 0 0 0 16 0" fill="#b73b39"/><circle cx="33" cy="56" r="3" fill="#8e2c32"/><path d="M29 7c2-4 7-5 10-2" fill="none" stroke="#c43837" stroke-width="3" stroke-linecap="round"/></svg>`;
    const grad = `co-ball-${id}`;
    return `<svg viewBox="0 0 64 76" aria-hidden="true"><defs><radialGradient id="${grad}" cx="30%" cy="25%"><stop stop-color="#fff9d6"/><stop offset=".25" stop-color="#e8c76d"/><stop offset="1" stop-color="#a82f3a"/></radialGradient></defs><path d="M29 8h8v9h-8z" fill="#d6ad54"/><path d="M30 6c0-4 6-4 6 0" fill="none" stroke="#b18c41" stroke-width="2"/><circle cx="33" cy="43" r="23" fill="url(#${grad})" stroke="#f5e2a6" stroke-width="2"/><path d="M19 43c6-7 20-10 28-4M23 56c8 4 16 3 21-2" fill="none" stroke="#fff2c1" stroke-opacity=".7" stroke-width="2"/><circle cx="23" cy="32" r="4" fill="#fff" fill-opacity=".58"/></svg>`;
  }

  function elfSVG(variant) {
    const coat = ['#bd3d42','#28654c','#315c8d'][variant % 3];
    const hat = ['#bd3d42','#236849','#b23d3c'][variant % 3];
    return `<svg viewBox="0 0 150 184" role="img" aria-hidden="true"><defs><linearGradient id="elf-coat-${variant}" x2="0" y2="1"><stop stop-color="${coat}"/><stop offset="1" stop-color="#612e35"/></linearGradient><linearGradient id="elf-hat-${variant}" x2=".2" y2="1"><stop stop-color="#f26b54"/><stop offset="1" stop-color="${hat}"/></linearGradient></defs><ellipse cx="76" cy="173" rx="42" ry="6" fill="#442d1e" opacity=".15"/><path d="M42 106Q75 87 108 106l16 52H29l13-52Z" fill="url(#elf-coat-${variant})" stroke="#792f34" stroke-width="2"/><path d="M38 108q37 17 75 0l-4 12q-35 15-67 0l-4-12Z" fill="#f1d59b"/><path d="M53 127l-6 28m48-28 7 28" stroke="#f0d18a" stroke-width="5"/><path d="M33 156h27q3 14-13 15H31q-6-5 2-15Zm55 0h28q8 10 1 15H91q-9-5-3-15Z" fill="#56393a"/><path d="M42 56q-4 24 8 41 10 14 28 17 20-4 31-22 9-16 3-39-8-29-35-30-31 1-35 33Z" fill="#efc493"/><path d="M41 66q-7 2-9 13 0 9 11 8m68-21q9 0 11 11 0 8-12 10" fill="#e4ac78" stroke="#ce986b" stroke-width="2"/><path d="M48 77q9-8 18 0m18 0q9-8 18 0" fill="none" stroke="#583c31" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="58" cy="83" rx="3" ry="4" fill="#302d2b"/><ellipse cx="93" cy="83" rx="3" ry="4" fill="#302d2b"/><circle cx="59" cy="82" r="1" fill="white"/><circle cx="94" cy="82" r="1" fill="white"/><path d="M71 95q7 6 14 0" fill="none" stroke="#9b5149" stroke-width="2" stroke-linecap="round"/><path d="M51 97q-4 24 23 29 27-5 24-29-9 9-24 7-15 2-23-7Z" fill="#f5eee0"/><path d="M49 53Q38 33 56 20q15-11 28-7l-7-9q35 3 43 29 3 12-8 24-17-9-34-7-14 0-29 7Z" fill="url(#elf-hat-${variant})" stroke="#8e3037" stroke-width="2"/><path d="M43 50q32-18 69 1-4 9-14 10-24-9-46 1-9-1-9-12Z" fill="#fff0d2"/><circle cx="79" cy="7" r="8" fill="#fff7e5"/><path d="M47 112q-16 2-17 17 3 11 15 7l11-14m49-11q17 0 20 16-2 11-14 8l-12-14" fill="${coat}" stroke="#792f34" stroke-width="2"/><circle cx="43" cy="137" r="8" fill="#efc493"/><circle cx="118" cy="138" r="8" fill="#efc493"/><path d="M63 109q13 6 27 0" fill="none" stroke="#fff2da" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  function giftSVG(gift) {
    const id = `co-g-${gift.id.replace(/[^a-z0-9]/gi,'')}`;
    const body = gift.color || '#b8333d';
    const ribbon = gift.ribbon || '#e6c46c';
    return `<svg class="gift-box" viewBox="0 0 100 108" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${body}"/><stop offset="1" stop-color="#652b36"/></linearGradient><linearGradient id="${id}-lid" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#fff0bd"/><stop offset="1" stop-color="${ribbon}"/></linearGradient></defs><ellipse cx="51" cy="99" rx="36" ry="6" fill="#4a2d1e" opacity=".17"/><g class="box-base"><path d="M20 43h61v48H20z" fill="url(#${id})" stroke="#6b3030" stroke-width="2"/><path d="M43 43h15v48H43z" fill="${ribbon}"/><path d="M20 54h61" stroke="#ffffff" stroke-opacity=".24" stroke-width="2"/><path d="M27 48h6v38h-6z" fill="#ffffff" opacity=".1"/></g><g class="lid"><path d="M15 34q0-4 5-4h61q5 0 5 4v13H15z" fill="url(#${id}-lid)" stroke="#b38d43" stroke-width="2"/><path d="M43 31h15v16H43z" fill="${body}"/><path d="M49 30c-22-17-31 1-19 7 6 3 12-1 19-7Zm3 0c22-17 31 1 19 7-6 3-12-1-19-7Z" fill="none" stroke="${body}" stroke-width="5" stroke-linecap="round"/><path class="bow-tail" d="M48 32 36 47m18-15 11 15" fill="none" stroke="${body}" stroke-width="4" stroke-linecap="round"/><circle cx="51" cy="30" r="4" fill="${body}"/></g><path d="M16 31q34-6 70 0" fill="none" stroke="#fff8dd" stroke-opacity=".8" stroke-width="2"/></svg>`;
  }

  function surpriseSVG(kind) {
    const illustrations = {
      sweets: `<svg viewBox="0 0 180 150" aria-hidden="true"><path d="M23 111q6-36 37-37 29 1 35 37v12H23z" fill="#cf8751"/><path d="M31 106q27-23 55 0" fill="none" stroke="#f6d49a" stroke-width="7"/><circle cx="51" cy="92" r="4" fill="#a13b35"/><circle cx="69" cy="95" r="4" fill="#a13b35"/><path d="M117 21c-27 13-21 32-8 37 10 4 23-3 15-15-6-9-16 0-11 8m7-30c-3-7-9-10-14-11" fill="none" stroke="#bd3e39" stroke-width="8" stroke-linecap="round"/><path d="M113 39l12-5m-18 14 12-5m4 20q16 3 20 18" stroke="#f4dfb3" stroke-width="5" stroke-linecap="round"/><path d="M130 98q14-18 28-1-12 15-28 1Z" fill="#d8a14f"/><path d="M139 99v21m0-9-9-6m9 10 9-8" stroke="#4a7b4e" stroke-width="3"/></svg>`,
      decoration: `<svg viewBox="0 0 180 150" aria-hidden="true"><path d="M35 116q55-66 112-60M39 120q45-31 98-27" fill="none" stroke="#316a4b" stroke-width="8" stroke-linecap="round"/><path d="m61 87-13-21m33 5-2-25m31 19 15-18M77 101 57 98m49 4 20-17" stroke="#5e8b57" stroke-width="5" stroke-linecap="round"/><path d="M92 23h13v14H92z" fill="#d4ae55"/><path d="M94 22q4-10 9 0" fill="none" stroke="#bf994a" stroke-width="3"/><circle cx="99" cy="61" r="24" fill="#b83c43" stroke="#f2d480" stroke-width="3"/><path d="M84 60q15-14 29-5m-26 18q13 8 24 1" fill="none" stroke="#ffe8a9" stroke-width="3"/><circle cx="90" cy="48" r="4" fill="#fff" opacity=".75"/><circle cx="52" cy="48" r="5" fill="#e8c764"/><circle cx="139" cy="53" r="4" fill="#fff2cb"/></svg>`,
      gift: `<svg viewBox="0 0 180 150" aria-hidden="true"><path d="M32 107h102v24H32z" rx="3" fill="#b83b42"/><path d="M42 77h82v32H42z" fill="#e4c46b"/><path d="M78 77h14v54H78z" fill="#b83b42"/><path d="M45 75q9-28 32-14 7 4 8 15m2 0q4-29 30-18 15 8 5 18" fill="none" stroke="#286649" stroke-width="7" stroke-linecap="round"/><path d="M142 39v32m-16-16h32m-27-11 22 22m0-22-22 22" stroke="#d9b34f" stroke-width="3" stroke-linecap="round"/><path d="M24 48h25M36 36v25" stroke="#c44a42" stroke-width="3" stroke-linecap="round"/></svg>`,
      food: `<svg viewBox="0 0 180 150" aria-hidden="true"><ellipse cx="90" cy="92" rx="67" ry="39" fill="#f4ead4" stroke="#d4c4a0" stroke-width="4"/><ellipse cx="90" cy="91" rx="48" ry="25" fill="#d5a15d"/><path d="M61 90q25-22 57 0-14 22-29 17-17 4-28-17Z" fill="#a44938"/><path d="M65 83q10-13 18 0m20 0q11-13 19 0" fill="none" stroke="#f1d89a" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="96" r="8" fill="#6d8a45"/><circle cx="130" cy="99" r="9" fill="#6d8a45"/><path d="M49 58q9-18 20-9m44 8q12-15 22-5" fill="none" stroke="#567848" stroke-width="4" stroke-linecap="round"/></svg>`,
      coupon: `<svg viewBox="0 0 180 150" aria-hidden="true"><path d="M31 39h118v25q-12 8 0 17v31H31V82q12-9 0-18z" fill="#f5dfaa" stroke="#bd9a50" stroke-width="3"/><path d="M45 50h90v50H45z" fill="#fff8e8"/><text x="90" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#886b34" font-weight="700">UKÁZKA</text><text x="90" y="91" text-anchor="middle" font-family="Arial" font-size="18" fill="#b33b42" font-weight="700">DEMO</text><path d="M30 121h120" stroke="#39704e" stroke-width="4" stroke-dasharray="3 6"/><path d="M153 38l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="#e4c46b"/></svg>`,
      special: `<svg viewBox="0 0 180 150" aria-hidden="true"><path d="M48 51h85l-8 78H56z" fill="#bd3e42" stroke="#82323a" stroke-width="3"/><path d="M42 51h97v14H42z" fill="#e6c66d"/><path d="M68 51q1-31 20-21 9 5 0 21m4 0q-1-31 18-21 9 5 0 21" fill="none" stroke="#34734d" stroke-width="7" stroke-linecap="round"/><path d="M76 82h29m-29 13h29m-29 13h19" stroke="#fff0c4" stroke-width="4" stroke-linecap="round"/><path d="m31 26 4 10 10 4-10 4-4 10-4-10-10-4 10-4zm116 51 3 8 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#d9b64f"/></svg>`
    };
    return illustrations[kind] || illustrations.special;
  }

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char]);
  }

  class ChristmasOverlay extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.config = null;
      this.enabled = true;
      this.openGift = null;
      this.returnFocus = null;
      this._refreshFrame = 0;
      this._lastMobile = null;
      this._onResize = () => {
        const mobile = matchMedia('(max-width: 700px)').matches;
        if (mobile !== this._lastMobile) {
          this._lastMobile = mobile;
          this.renderDecorations();
        }
        this.scheduleRefresh();
      };
      this._onKey = event => this.handleKey(event);
    }

    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;
      this.render();
      this._lastMobile = matchMedia('(max-width: 700px)').matches;
      this.renderDecorations();
      this.scheduleRefresh();
      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('keydown', this._onKey);
      if ('ResizeObserver' in window) {
        this._resizeObserver = new ResizeObserver(() => this.scheduleRefresh());
        this._resizeObserver.observe(document.documentElement);
        this._resizeObserver.observe(document.body);
      }
      if (document.fonts?.ready) document.fonts.ready.then(() => this.scheduleRefresh());
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('keydown', this._onKey);
      this._resizeObserver?.disconnect();
      cancelAnimationFrame(this._refreshFrame);
    }

    getOptions() {
      return { ...DEFAULT_CONFIG, ...(window.ChristmasOverlayConfig || {}), ...(this.config || {}) };
    }

    render() {
      this.shadowRoot.innerHTML = `<style>${STYLE}</style>
        <div class="scene" part="scene">
          <div class="floaties" aria-hidden="true"></div>
          <div class="anchors"></div>
          <div class="modal" hidden>
            <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="surprise-title" aria-describedby="surprise-description" tabindex="-1">
              <button class="close" type="button" aria-label="Zavřít překvapení">×</button>
              <div class="surprise-art"></div>
              <p class="modal-kicker">Malé vánoční překvapení</p>
              <h2 id="surprise-title"></h2>
              <p id="surprise-description"></p>
              <p class="demo-note" hidden></p>
              <button class="cta" type="button"></button>
            </section>
          </div>
        </div>
        <button class="switch" type="button" role="switch" aria-checked="true" aria-label="Vánoční režim">
          <span>Vánoční režim</span><span class="track" aria-hidden="true"></span><span class="switch-state">Zapnuto</span>
        </button>
        <span class="reduce-note">Animace je omezená podle nastavení pohybu zařízení.</span>`;
      this.scene = this.shadowRoot.querySelector('.scene');
      this.anchorsLayer = this.shadowRoot.querySelector('.anchors');
      this.floatiesLayer = this.shadowRoot.querySelector('.floaties');
      this.modal = this.shadowRoot.querySelector('.modal');
      this.dialog = this.shadowRoot.querySelector('.dialog');
      this.switchButton = this.shadowRoot.querySelector('.switch');
      this.shadowRoot.querySelector('.close').addEventListener('click', () => this.closeSurprise());
      this.shadowRoot.querySelector('.cta').addEventListener('click', () => this.activateCTA());
      this.switchButton.addEventListener('click', () => this.setEnabled(!this.enabled));
      this.modal.addEventListener('click', event => {
        if (event.target === this.modal) this.closeSurprise();
      });
    }

    renderDecorations() {
      const cfg = this.getOptions();
      const isMobile = matchMedia('(max-width: 700px)').matches;
      const ornamentsCount = isMobile ? cfg.mobileOrnamentCount : cfg.ornamentCount;
      const types = ['snow','star','ball','bell'];
      const pieces = [];
      for (let i = 0; i < ornamentsCount; i++) {
        const seed = (i * 37 + 13) % 97;
        const x = 4 + (seed * 73 % 82);
        const y = 9 + ((seed * 41) % 80);
        const kind = types[i % types.length];
        const size = kind === 'snow' ? 17 + (i % 3) * 4 : 21 + (i % 4) * 5;
        const falling = i % 5 === 2;
        pieces.push(`<span class="ornament ${falling ? 'falling' : ''}" style="--x:${x}%;--y:${y}%;--size:${size}px;--opacity:${.36 + (i % 4) * .1};--duration:${9 + (i % 7) * 1.7}s;--delay:${-i * 1.23}s;--drift:${(i % 2 ? 1 : -1) * (18 + (i % 4) * 7)}px">${ornamentSVG(kind, i)}</span>`);
      }
      for (let i = 0; i < (isMobile ? 2 : 4); i++) {
        const size = 25 + (i % 3) * 8;
        const left = 16 + i * 22;
        pieces.push(`<span class="hanging-line" style="--x:${left}%;--line:${40 + (i % 3) * 20}px;--duration:${6 + i}s;--delay:${-i}s"><span class="ornament" style="--size:${size}px">${ornamentSVG(i % 2 ? 'ball' : 'star', `hang-${i}`)}</span></span>`);
      }
      this.floatiesLayer.innerHTML = pieces.join('');

      const elves = isMobile ? cfg.elves.slice(0, 2) : cfg.elves;
      const visibleGifts = isMobile ? cfg.gifts.slice(0, 4) : cfg.gifts;
      this.anchorsLayer.innerHTML = elves.map((elf, i) => `<button class="elf" type="button" aria-label="Vánoční skřítek ${i + 1} — zobrazit pozdrav" data-elf="${i}" style="--x:${elf.x * 100}%;--y:${elf.y * 100}%;--scale:${elf.scale || 1};--delay:${i * .9}s"><span class="elf-talk">Veselé Vánoce!</span>${elfSVG(elf.variant ?? i)}</button>`).join('') + visibleGifts.map(gift => this.giftMarkup(gift)).join('');
      this.anchorsLayer.querySelectorAll('.elf').forEach(button => button.addEventListener('click', () => {
        button.classList.add('is-talking');
        window.setTimeout(() => button.classList.remove('is-talking'), 1800);
      }));
      this.anchorsLayer.querySelectorAll('.gift').forEach(button => button.addEventListener('click', () => this.unwrap(button)));
    }

    giftMarkup(gift) {
      const sparks = Array.from({ length: 8 }, (_, i) => `<i style="--sx:${12 + (i * 37) % 76}%;--sy:${10 + (i * 29) % 72}%;--sr:${i * 41}deg;--sx2:${(i % 2 ? 1 : -1) * (26 + i * 2)}px;--sy2:${-34 - (i % 4) * 9}px;--sd:${i * .025}s"></i>`).join('');
      return `<button class="gift" type="button" data-gift="${escapeHTML(gift.id)}" aria-label="Rozbalit dárek: ${escapeHTML(gift.title)}" aria-expanded="false" style="--gift-size:${gift.size || 62}px;--gift-color:${gift.color || '#b8333d'};--spark:${gift.ribbon || '#e6c46c'};--delay:${(gift.size || 60) % 5 * .31}s"><span class="burst" aria-hidden="true">${sparks}</span>${giftSVG(gift)}</button>`;
    }

    scheduleRefresh() {
      if (this._refreshFrame) cancelAnimationFrame(this._refreshFrame);
      this._refreshFrame = requestAnimationFrame(() => this.refreshPositions());
    }

    refreshPositions() {
      this._refreshFrame = 0;
      const cfg = this.getOptions();
      const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight);
      this.style.setProperty('--co-page-height', `${pageHeight}px`);
      const isMobile = matchMedia('(max-width: 700px)').matches;
      this.anchorsLayer.querySelectorAll('.elf').forEach((button, index) => {
        const item = (isMobile ? cfg.elves.slice(0, 2) : cfg.elves)[index];
        this.positionOnAnchor(button, item);
      });
      const visibleGifts = isMobile ? cfg.gifts.slice(0, 4) : cfg.gifts;
      this.anchorsLayer.querySelectorAll('.gift').forEach(button => {
        const item = visibleGifts.find(gift => gift.id === button.dataset.gift);
        if (item) this.positionOnAnchor(button, item);
      });
    }

    positionOnAnchor(node, item) {
      const anchor = (item.anchor && document.querySelector(item.anchor)) || document.body;
      node.hidden = false;
      const rect = anchor.getBoundingClientRect();
      const width = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
      const offsetX = rect.left + window.scrollX + rect.width * item.x;
      const offsetY = rect.top + window.scrollY + rect.height * item.y;
      const nodeWidth = node.classList.contains('gift') ? (item.size || 62) : (112 * (item.scale || 1));
      const safeX = Math.max(nodeWidth * .5 + 5, Math.min(width - nodeWidth * .5 - 5, offsetX));
      node.style.left = `${safeX}px`;
      node.style.top = `${Math.max(30, offsetY)}px`;
    }

    async unwrap(button) {
      const gift = this.getOptions().gifts.find(item => item.id === button.dataset.gift);
      if (!gift) return;
      if (button.classList.contains('is-open')) {
        this.showSurprise(gift, button);
        return;
      }
      if (button.classList.contains('is-opening')) return;
      button.classList.add('is-opening');
      await new Promise(resolve => window.setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 470));
      button.classList.remove('is-opening');
      button.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', `Znovu zobrazit překvapení: ${gift.title}`);
      this.showSurprise(gift, button);
    }

    showSurprise(gift, button) {
      this.openGift = gift;
      this.returnFocus = button;
      this.shadowRoot.querySelector('.surprise-art').innerHTML = surpriseSVG(gift.kind);
      this.shadowRoot.querySelector('.dialog h2').textContent = gift.title;
      this.shadowRoot.querySelector('#surprise-description').textContent = gift.text;
      const note = this.shadowRoot.querySelector('.demo-note');
      const isDemo = gift.id === 'demo-coupon' || gift.kind === 'coupon';
      note.hidden = !isDemo;
      note.textContent = isDemo ? 'Demonstrační kupón — není platný při nákupu. Nejde o skutečnou slevovou akci.' : '';
      const cta = this.shadowRoot.querySelector('.cta');
      cta.textContent = gift.cta || 'Prohlédnout vánoční inspiraci';
      this.modal.hidden = false;
      this.shadowRoot.querySelector('.close').focus();
    }

    activateCTA() {
      const target = this.openGift?.target && document.querySelector(this.openGift.target);
      this.closeSurprise();
      if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }

    closeSurprise() {
      this.modal.hidden = true;
      this.openGift = null;
      const focusTarget = this.returnFocus;
      this.returnFocus = null;
      focusTarget?.focus({ preventScroll: true });
    }

    handleKey(event) {
      if (this.modal.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeSurprise();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...this.dialog.querySelectorAll('button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && this.shadowRoot.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && this.shadowRoot.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }

    setEnabled(value) {
      this.enabled = Boolean(value);
      this.toggleAttribute('data-off', !this.enabled);
      this.switchButton.setAttribute('aria-checked', String(this.enabled));
      this.shadowRoot.querySelector('.switch-state').textContent = this.enabled ? 'Zapnuto' : 'Vypnuto';
      this.switchButton.setAttribute('aria-label', `Vánoční režim: ${this.enabled ? 'zapnuto' : 'vypnuto'}`);
      if (!this.enabled && !this.modal.hidden) this.closeSurprise();
    }
  }

  ChristmasOverlay.defaults = DEFAULT_CONFIG;
  customElements.define(TAG, ChristmasOverlay);
  window.ChristmasOverlay = {
    defaults: DEFAULT_CONFIG,
    configure(config) {
      window.ChristmasOverlayConfig = { ...(window.ChristmasOverlayConfig || {}), ...config };
      document.querySelectorAll(TAG).forEach(element => {
        element.renderDecorations();
        element.scheduleRefresh();
      });
    }
  };
})();
