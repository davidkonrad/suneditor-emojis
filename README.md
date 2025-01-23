# suneditor-emojis-plugin

Add a unicode emojis submenu to the SunEditor toolbar. It comes with several useful features :

- Test for local browser support; only emojis the browser actually supports are shown. By that any possible emoji are shown, except those the browser for some reason is unable to render (for example because it is an older browser)

- A built-in cache speeds up loading and rendering 

- Follows <b>unicode-emoji-json</b>, <a href="https://github.com/muan/unicode-emoji-json">https://github.com/muan/unicode-emoji-json</a>, 
but are using a local version trimmed by 75% (less than 100k). By that the plugin are updated according to the latest version of the unicode standard (currently 16.0). 

## Usage
Include JS and CSS :
```html
<script src="suneditor-emojis.js"></script>
<link href="suneditor-emojis.css" rel="stylesheet" type="text/css" >
```
Now add ```emojisPlugin``` to the ```plugins``` option, and add the ```emojis``` button to ```buttonList``` : 
```javascript
const editor = SUNEDITOR.create('editor', {
  ...     
  plugins: [emojisPlugin],
  buttonList: [
    ['emojis']
  ],
  ...
})  
```

## options
You may want to alter the defaults, change settings by an ```emojis``` option :
```javascript
emojis: {
  sections: array
  names: array
  favorites: bool
  iconSize: string
  skinTone: false, 1-5
  menu: {
    search: bool
    iconSize: bool
    skinTone: bool
  }
}
```
You can spec
### sections


