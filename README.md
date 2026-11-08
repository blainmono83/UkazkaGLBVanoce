# Vánoční vrstva Globus

## Spuštění ukázky

Otevři `index.html` dvojklikem. Obsah stránky, obrázky i fonty jsou místní.

## Přenesení vrstvy na jiný web

Zkopíruj pouze `christmas-overlay.js` a vlož před konec `<body>`:

```html
<christmas-overlay></christmas-overlay>
<script src="christmas-overlay.js" defer></script>
```

Modul nemá závislosti. Vykresluje vlastní SVG, styly má uzavřené ve Shadow DOM
a podkladové stránce nepřidává ani nemění žádný layout. Klikací dárky se umístí
vzhledem k CSS selektorům uvedeným v konfiguraci.

## Konfigurace

Nastav `window.ChristmasOverlayConfig` před načtením skriptu. Konfigurace může
přepsat `gifts`, `elves`, `ornamentCount` a `mobileOrnamentCount`. Každá pozice
skládá `anchor` (CSS selektor), `x` a `y` v rozsahu 0–1. Dárek dále přijímá
`id`, `size`, `color`, `ribbon`, `title`, `text`, `kind`, `cta` a `target`.

```js
window.ChristmasOverlayConfig = {
  gifts: [{
    id: 'sample', anchor: '#hero', x: 0.9, y: 0.85, size: 64,
    color: '#b8333d', ribbon: '#e6c46c', title: 'Vánoční překvapení',
    text: 'Demonstrační obsah.', kind: 'decoration',
    cta: 'Zobrazit inspiraci', target: '#inspiration'
  }]
};
```

Při zapnutí vrstvy je k dispozici také `ChristmasOverlay.configure({...})`.
Kupón v ukázce je výslovně neplatný demonstrační obsah. Přepínač režimu je
součástí overlaye a vypnutím skryje dekorace i pozastaví jejich animace.
