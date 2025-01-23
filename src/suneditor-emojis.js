/*
 * Emojis plugin for SunEditor, wysiwyg web editor
 *
 * Copyright 2025 David Konrad.
 * MIT license.
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */


const Emojis = (function(window, document) {
	const storage_favorite = 'suneditor-emojis-fav'
	const storage_supported = 'suneditor-emojis-sup'
	const __fav__ = ''
	const emojis = {}
	let supported_cache = {}

	const init = function() {
		fetchSupported()
		fetchEmojis()
	}

	const parse = function(s) {
		try {
			return JSON.parse(s)
		} catch(e) {
			return false
		}
	}

	const registerEmoji = function(emoji) {
		for (const e in emojis['']) {
			if (emojis[''][e].emoji === emoji) return false
		}
		const obj = getEmoji(emoji)
		emojis[''].push(obj)
		localStorage.setItem(storage_favorite, JSON.stringify(emojis['']))		
		return true
	}

	const getRegistered = function() {
		let r = localStorage.getItem(storage_favorite)
		r = parse(r)
		if (!r) {
			resetRegistered()
			return []
		}
		return r
	}

	const resetRegistered = function() {
		emojis[''] = []
		localStorage.setItem(storage_favorite, JSON.stringify(emojis['']))	
	}

	const fetchSupported = function() {
		const s = localStorage.getItem(storage_supported)
		supported_cache = s ? JSON.parse(s) : {}
	}

	const registerSupported = function(emoji, supported) {
		supported_cache[emoji] = supported
		localStorage.setItem(storage_supported, JSON.stringify(supported_cache))	
	}

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

	const isSupported = function(emoji) {
		if (emoji in supported_cache) return supported_cache[emoji]
		ctx.canvas.width = ctx.canvas.height = 1
		ctx.fillText(emoji, -4, 4)
		const res = ctx.getImageData(0, 0, 1, 1).data[3] > 0
		registerSupported(emoji, res)
		return res
	}

	const getEmoji = function(emoji) {
		for (const t in emojis) {
			if (t !== '') for (const i in emojis[t]) {
				const e = emojis[t][i]
				if (e.emoji === emoji) {
					return e
				}
			}
		}
	}

	const getPath = function() {
		let path = document.currentScript.src.split('/')
		path.pop()
		path = path.join('/')
		return path
	}

	const fetchEmojis = function() {
		const xhr = new XMLHttpRequest()
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				switch (xhr.status) {
					case 200 :
						const r = JSON.parse(xhr.responseText)
						emojis[''] = getRegistered()
						for (const type in r) {
							emojis[type] = r[type]
						}
						break
					case 404 : 
					default :
						console.log('file not found')
						break
				}
			}
		}
		xhr.open('GET', getPath() + '/data-by-group.16.trimmed.json', true)
		xhr.send()
	}

	return {
		init,
		getEmoji,
		isSupported,
		registerEmoji,
		getRegistered,
		resetRegistered,
		emojis
	}

})(window, document)

Emojis.init()

const emojisPlugin = (function() {
	const name = 'emojis'
	const display = 'submenu'
	const innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" id="smiley"><path fill="#444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0-1C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path><path fill="#444" d="M8 13.2c-2 0-3.8-1.2-4.6-3.1l.9-.4c.6 1.5 2.1 2.4 3.7 2.4s3.1-1 3.7-2.4l.9.4c-.8 2-2.6 3.1-4.6 3.1zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>'
	const title = 'Indsæt smileys / emojis'
	const fav_name = 'se-emojis-fav'

	const default_sections = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 
														'Objects', 'People & Body', 'Symbols', 'Travel & Places']

	const default_names = default_sections

	let options = {
		sections: default_sections,
		names: default_names,
		favorites: true,
		iconSize: undefined, //CSS default 1.2rem
		skinTone: undefined, //undefined,1,2,3,4,5
		menu: {
			search: true,
			skinTone: true,
			iconSize: true
		}
	}

	let _core = undefined

	const add = function(core, targetElement) {
		_core = core
		if (core.options.emojis) options = Object.assign(options, core.options.emojis)
		let listDiv = setSubmenu.call(core)
		listDiv.querySelectorAll('button').forEach(function(btn) {
			btn.addEventListener('click', onClick.bind())
		})
		core.initMenuTarget(name, targetElement, listDiv)
		//console.log(listDiv.closest('.se-list-layer')).style.height = '200px'
		//listDiv.closest('.se-list-layer').style.height = '200px'
	}

	const setSubmenu = function(core) {
		let listDiv = this.util.createElement('div')
		listDiv.className = 'se-submenu se-list-layer'

		const sections = options && options.sections	
			? options.sections
			: default_sections

		const names = options && options.names
			? options.names
			: default_names

		const favorites = ('favorites' in options) ? options.favorites : true
		if (favorites) sections.unshift('')

		const width = ('width' in options) ? options.width : '30rem'
		
		let html = '<div class="se-list-inner" style="position:relative;min-width:' + width + ';padding-left:3px;top:-5px;">'
		html += '<div class="se-emojis">'
		
		for (const [i,sec] of sections.entries()) {
			html += '<div style="width:100%;min-width:100%;">'
			if (sec !== '') html += '<header>' + names[i-1] + '</header>'
			html += '<div name="' + (sec || fav_name) + '"></div>'
			html += '</div>'
		}

		html += '</div>'
		listDiv.innerHTML = html 

		for (let type in Emojis.emojis) {
			//const regex = /\uddd0/
			const cnt = listDiv.querySelector('div[name="' + (type || fav_name) + '"]')
			if (Emojis.emojis[type] && Emojis.emojis[type].length) Emojis.emojis[type].forEach(function(emoji) {
				if (cnt) {
					let t = emoji.emoji.match(/\p{Cf}/u) 
					//let m = emoji.emoji.match(/\p{Mc}/u) 
					let x = t ? t.input.length : false
					console.log(emoji.name, emoji.emoji, x)
					createBtn(emoji.emoji, emoji.name, cnt)
				} else {
					console.log(type + ' does not exists for emoji ' + emoji.emoji)
				}
			})
			if (type === '') updateClearFav(cnt)
		}

		return listDiv
	}

	const updateClearFav = function(cnt) {
		if (cnt.innerText === '') return
		cnt.querySelectorAll('button').forEach(function(btn) {
			btn.addEventListener('click', onClick.bind())
		})
		const btn = document.createElement('i')
		btn.classList.add('clear-favorites')
		btn.title = 'Clear favorites'
		btn.innerHTML = '&times;'
		btn.onclick = function() {
			Emojis.resetRegistered()
			updateFavorites()
		}
		cnt.appendChild(btn)			
	}

	const updateFavorites = function() {
		const cnt = document.querySelector('div[name="' + fav_name + '"]')
		cnt.innerText = ''
		if (Emojis.emojis && Emojis.emojis['']) Emojis.emojis[''].forEach(function(emoji) {
			createBtn(emoji.emoji, emoji.name, cnt)
		})
		updateClearFav(cnt)
	}

	const createBtn = function(emoji, name, cnt) {
		if (!Emojis.isSupported(emoji)) return
		const fs = ('size' in options) ? 'style="font-size: ' + options.size + '"' : ''
		const btn = document.createElement("button")
		name = name.charAt(0).toUpperCase() + name.slice(1)
		btn.className = 'btn-emoji'
		btn.type = 'button'
		btn.title = name
		btn.innerHTML = '<span class="emoji" ' + fs + '>' + emoji + '</span>'
		cnt.appendChild(btn)
	}

	const onClick = function(e) {
		const value = e.target.querySelector('span').innerText
		_core.functions.insertHTML(value, true)
		if (Emojis.registerEmoji(value)) {
			updateFavorites()
		}
	}

	return {
		name: name,
		display: display,
		innerHTML: innerHTML,
		title: title,
		add: add,
	}

})();

//window.emojisPlugin = emojisPlugin
