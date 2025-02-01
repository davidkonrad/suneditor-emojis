# suneditor-emojis

Add a Unicode Emojis submenu to the SunEditor toolbar.

Playground **https://suneditor-emojis.github.io**

![SunEditor Emojis plugin](assets/sample.png)

The plugin comes with several useful features 

- Tests for local browser support, also trims out fallbacks; by that the browsers entire range is used 
without showing "odd" emojis

- A built-in cache speeds up loading and rendering 

- Follows <b>unicode-emoji-json</b>, <a href="https://github.com/muan/unicode-emoji-json">https://github.com/muan/unicode-emoji-json</a>, 
but are using a local version trimmed by 75% (less than 100k). By that the plugin are updated according to the latest version of the unicode standard (currently 16.0). 

## Usage
Include JS and CSS files from ```/dist``` :
```html
<script src="suneditor-emojis.js"></script>
<link href="suneditor-emojis.css" rel="stylesheet" type="text/css">
```
Now include the ```emojis``` plugin to ```plugins``` and add a ```'emojis'``` button to ```buttonList``` : 
```javascript
const editor = SUNEDITOR.create('editor', {
  ...     
  plugins: [.., emojis],
  buttonList: [..,'emojis'],
  emojis: { .. },
  ...
})  
```

## Options
Optionally you can customise the dropdown through an ```emojis``` option
```javascript
emojis: {
  groups: [array],
  captions: [array],
  showRecent: true,
  iconSize: 'string',
  skinTone: 'string',
  topmenu: {
    search: true,
    iconSize: true,
    skinTone: true
  },
  showFallbacks: false,
  tagName: 'span',
  width: 'string',
  height: 'string'
}
```

#### groups

Specifies the kind of emojis to include in the dropdown. The emojis are ordered into their official <q>super</q> 
group names (see About unicode emojis). If ```groups``` are not set, all groups are included

```javascript
emojis: {
  groups: ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 
      'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
  }       
}
```

#### captions
Group captions. By default the same as the group names. Use names as localization of emoji group names. Here an example of group captions in spanish 
```javascript
emojis: {
  captions: ['Sonrisas y emociones', 'Actividades', 'Animales y naturaleza', 'Banderas',	
      'Comida y bebida', 'Objetos', 'Personas y cuerpo', 'Símbolos', 'Viajes y lugares']
}
```
💡 An empty string ```''``` in the array means the header should not be shown

💡 If you pass ```captions: false``` all emojis are shown continuously after each other without breaking headers

#### showRecent
When ```true``` clicked emojis are remembered (in ```localStorage```) and shown as first choice in the dropdown

```javascript
emojis: {
  showRecent: true
}
```

#### iconSize
The ```font-size``` of emojis shown in groups or by search

```javascript
emojis: {
  iconSize: '1.5rem'
}
```

💡 You can also enable ```topmenu.iconSize``` and let the user choose the size for themselves.

#### skinTone 🖖 🖖🏻 🖖🏼 🖖🏽 🖖🏾 🖖🏿
Some ```'People & Body'``` emojis can be styled with six different 'skintones': 
```'neutral'```, ```'light'```, ```'mediumLight'```, ```'medium'```, ```'mediumDark'```, 
```'dark'```. 

```javascript
emojis: {
  skinTone: 'neutral'
}
```

💡 You can also enable ```topmenu.skinTone``` and let the user choose a skintone for themselves.

#### showFallbacks
Newer emojis may have a fallback that the browser can show as substitute if the unicode is not supported.
Those will often be rendered as two emojis side by side, like 🍄 🟫 as fallback for 
"Brown Mushroom", introduced in v15.1. The plugin hide fallbacks by default, but you can enable them by setting ```showFallbacks``` to true.

```javascript
emojis: {
  showFallbacks: false
}
```

#### width, height
The SunEditor submenu dropdown will automatically fit the screen height and edge with the editor. 
You may want to reduce the height of the dropdown or increase the width. 

```javascript
emojis: {
  width: '50rem',
  height: '30rem'
}
```

# About unicode emojis
As mentioned above the emojis are ordered into 9 <q>super</q> groups :

| # | group | emojis (v16.0)
--- | --- | --- | 
😀 | ```'Smileys & Emotion'``` | 169
🎯 | ```'Activities'``` | 85
🦓 | ```'Animals & Nature'``` | 159
🇩🇰 | ```'Flags'``` | 270
🍷 | ```'Food & Drink'``` | 131
👑 | ```'Objects'``` | 264
👍 | ```'People & Body'``` | 386
🚫 | ```'Symbols'``` | 224
🚀 | ```'Travel & Places'``` | 218

No browser or reader will ever support the entire scope of unicode, and will never implement
each and every unicode emoji <q><em>correct</em></q> or as <em>intended</em>. So the plugin will only be able 
to display those emojis the local browser support. The plugin automatically detects not supported emojis as well as emojis relying on fallbacks; see the ```showFallbacks``` option to enable browser fallbacks.

The website <a href="https://emojipedia.org">emojipedia.org</a> has detailed insight about the major browsers (and their platforms) support of emojis over time :

| platform | url | installed font
--- | --- | --- |
chrome | https://emojipedia.org/google | Noto Color Emoji
windows | https://emojipedia.org/microsoft | Segoe UI Emoji
apple | https://emojipedia.org/apple | Apple Color Emoji

To be sure emojis are shown as best as possible, always set ```tagName``` to for example ```span```, and include the following CSS rule in production (when the text with emojis is shown outside SunEditor context) :

```css
.se-emoji {
   font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji";
}
```
