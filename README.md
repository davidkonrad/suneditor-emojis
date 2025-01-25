# suneditor-emojis

Add a Unicode Emojis submenu to the SunEditor toolbar

![SunEditor Emojis plugin](assets/sample.png)

The plugin comes with several useful features 

- Test for local browser support, also trims out fallbacks; by that the browsers entire range is used 
without showing "odd" emojis

- A built-in cache speeds up loading and rendering 

- Follows <b>unicode-emoji-json</b>, <a href="https://github.com/muan/unicode-emoji-json">https://github.com/muan/unicode-emoji-json</a>, 
but are using a local version trimmed by 75% (less than 100k). By that the plugin are updated according to the latest version of the unicode standard (currently 16.0). 

## Usage
Include JS and CSS files from ```/dist``` :
```html
<script src="suneditor-emojis.js"></script>
```
Now add ```emojisPlugin``` to the ```plugins``` option, and add the ```emojis``` button to ```buttonList``` : 
```javascript
const editor = SUNEDITOR.create('editor', {
  ...     
  plugins: [emojisPlugin],
  buttonList: ['emojis'],
  emojis: { ... },
  ...
})  
```

## Options
You may want to alter the defaults, change settings by an ```emojis``` option :
```javascript
emojis: {
  groups: [array],
  names: [array],
  favorites: true,
  iconSize: 'string',
  skinTone: 'string',
  topmenu: {
    search: true,
    iconSize: true,
    skinTone: true
  },
  showFallbacks: false,
  width: 'string',
  height: 'string'
}
```

### ```groups```

Specify the type of emojis to include in the dropdown. The emojis are ordered into their official super 
group names. If ```groups``` are not set, all groups are included

```javascript
emojis: {
  groups: ['Smileys & Emotion',  'Activities', 'Animals & Nature', 'Flags', 
      'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
  }       
}
```
Here is an overview of the different groups and their current number of emojis 

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

Since this is based on the latest version of the Unicode standard, no browser is able to render all emojis correct. 

### ```names```
Group captions. By default the same as the group names. Use names as localization of emoji group names. Here an example of spanish group names 
```javascript
emojis: {
  names: ['Sonrisas y emociones',	'Actividades', 'Animales y naturaleza', 'Banderas',	
     s'Comida y bebida', 'Objetos',	'Personas y cuerpo', 'Símbolos', 'Viajes y lugares'	]
}
```

### favorites
When ```true``` clicked emojis are remembered and shown as first choice in the dropdown

```javascript
emojis: {
  favorites: true
}
```

### iconSize
The ```font-size``` of emojis shown in groups or by search. 

```javascript
emojis: {
  iconSize: '1.5rem'
}
```

💡 You can also enable ```topmenu.iconSize``` and let the user choose the size for themselves.

### skinTone 🖖 🖖🏻 🖖🏼 🖖🏽 🖖🏾 🖖🏿
Some ```'People & Body'``` emojis can be styled with six different 'skintones': 
```'neutral'```, ```'light'```, ```'mediumLight'```, ```'medium'```, ```'mediumDark'```, 
```'dark'```. 

```javascript
emojis: {
  skinTone: 'neutral'
}
```

💡 You can also enable ```topmenu.skinTone``` and let the user choose a skintone for themselves.

### showFallbacks
Newer emojis may have a fallback that the browser can show as substitute if the unicode is not supported.
Those will often be rendered as two emojis side by side, like 🍄 🟫 as fallback for 
"Brown Mushroom", introduced in v15.1. The plugin hide fallbacks by default, but you can enable them by setting ```showFallbacks``` to true.

```javascript
emojis: {
  showFallbacks: false
}
```

### width, height
The SunEditor submenu dropdown will automatically fit the screen height and edge with the editor. 
You may want to reduce the height of the dropdown or increase the width. 

```javascript
emojis: {
  width: '50rem',
  height: '30rem'
}
```
