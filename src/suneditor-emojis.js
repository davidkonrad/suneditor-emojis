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


"use strict";

const Emojis = (function() {
	const storage_favorite = 'suneditor-emojis-fav'
	const storage_supported = 'suneditor-emojis-sup'
	const storage_disabled = false
	const __fav__ = ''
	const emojis = {}
	let _css = undefined
	let supported_cache = {}
	let emoji_width = undefined

	const init = function() {
		fetchCSS()
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
		if (storage_disabled) return {}
		const s = localStorage.getItem(storage_supported)
		supported_cache = s ? JSON.parse(s) : {}
	}

	const registerSupported = function(emoji, supported) {
		if (!emoji) return
		supported_cache[emoji] = supported
		if (storage_disabled) return 
		localStorage.setItem(storage_supported, JSON.stringify(supported_cache))	
	}

	const testFallback = function(emoji) {
		const s = document.body.appendChild(document.createElement('span'))
		s.appendChild(document.createTextNode(emoji))
		const res = parseFloat(s.offsetWidth)
		s.parentNode.removeChild(s)
		return res
	}

	window.addEventListener('load', function() {
		emoji_width = testFallback('😀')
	})

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

	/*
		0: not supprted
		1: supported
		2: fallback
	*/
	const isSupported = function(emoji) {
		if (emoji in supported_cache) return supported_cache[emoji]

		const canRender = function() {
			ctx.canvas.width = ctx.canvas.height = 1
			ctx.fillText(emoji, -4, 4)
			return ctx.getImageData(0, 0, 1, 1).data[3] > 0
		}

		const isNativeCompound = function() {
			const t = Array.from(emoji)
			if (t.length === 1) return false
			let c = 0
			for (const e of t) {
				if (/\p{Emoji}/u.test(e)) c++
			}
			return c > 2
		}

		let res = undefined
		if (canRender()) {
			if (testFallback(emoji) > emoji_width) {
				if (!isNativeCompound(emoji)) res = 2
			} else {
				res = 1
			}
		} else {
			res = 0
		}
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

	const parseEmojis = function(response) {
		const fixProp = function(emoji, from, to) {
			emoji[to] = emoji[from]
			delete emoji[from]
		}
		const r = JSON.parse(response)
		emojis[''] = getRegistered()
		for (const type in r) {
			emojis[type] = r[type]
			emojis[type].forEach(function(emoji) {
				fixProp(emoji, 'n', 'name')
				fixProp(emoji, 'e', 'emoji')
				fixProp(emoji, 's', 'skintone')
			})
		}
	}

	const skinTones = new Map([
		['neutral', ''],
		['light', '🏻'],
		['mediumLight', '🏼'],
		['medium', '🏽'],
		['mediumDark', '🏾'],
		['dark', '🏿']
	])

/*
	const skintones = {
		1: '\u{1F3FB}', //light
    2: '\u{1F3FC}', //mediumLight
    3: '\u{1F3FD}', //medium
    4: '\u{1F3FE}', //mediumDark
    5: '\u{1F3FF}'  //dark
  };
*/

	function skinTone(emoji, tone) {
		emoji = emoji.replaceAll(/[\u{1F3FB}-\u{1F3FF}]/ug, '')

		// This emoji modifier base is present in emojis that the skin tone can apply to.
		const emojiBaseModifierRegex = /\p{Emoji_Modifier_Base}/ug
		const emojiPresentationSelector = '\u{FE0F}'

		// If tone is `'none'`, the emoji has more than two modifiable components, or it is a two-person family emoji, then skin tone should not be applied.
		if (tone === 'none') {
			return emoji
		}

		let processedEmoji = ''

		for (const codePoint of emoji) {
			// If this code point is a emoji presentation selector, it should not be added to toned emoji.
			if (codePoint === emojiPresentationSelector) {
				continue;
			}

			processedEmoji += codePoint;
			// Tone should be applied to all modifiable components.
			// For example, both persons in couple emojis, etc.
			if (emojiBaseModifierRegex.test(codePoint)) {
				processedEmoji += skinTones.get(tone)
			}
		}
		//console.log('skintone ok')
		return processedEmoji
	}

	const fetchEmojis = function() {
		try {
			fetch(getPath() + '/data-by-group.16.min.json', {
				method: 'GET',
				headers: { 'Accept': 'application/json' }
			})
			.then(response => response.text())
			.then(response => parseEmojis(response))
		} catch(error) {
			console.log(error)
		}
	}

	const fetchCSS = function() {
		try {
			fetch(getPath() + '/suneditor-emojis.css', {
				method: 'GET',
				headers: { 'Accept': 'text/plain' }
			})
			.then(response => response.text())
			.then(response => _css = response)
		} catch(error) {
			console.log(error)
		}
	}

	const injectCSS = function() {
		const sid = 'suneditor-emojis-css'
		if (!document.getElementById(sid)) {
			const style = document.createElement('style')
			style.id = sid
			style.textContent = _css
			document.head.append(style)
		}
	}

	return {
		init,
		injectCSS,
		getEmoji,
		isSupported,
		registerEmoji,
		getRegistered,
		resetRegistered,
		skinTone,
		skinTones,
		emojis,
	}

})()

Emojis.init();

"use strict";

const emojisPlugin = (function() {
	const name = 'emojis'
	const display = 'submenu'
	const innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" id="smiley"><path fill="#444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0-1C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path><path fill="#444" d="M8 13.2c-2 0-3.8-1.2-4.6-3.1l.9-.4c.6 1.5 2.1 2.4 3.7 2.4s3.1-1 3.7-2.4l.9.4c-.8 2-2.6 3.1-4.6 3.1zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>'
	const title = 'Indsæt smileys / emojis'
	const topmenu_name = 'se-emojis-menu'
	const fav_name = 'se-emojis-fav'
	const result_name = 'se-emojis-result'
	const default_groups = [
		'Smileys & Emotion', 
		'Activities', 
		'Animals & Nature', 
		'Flags', 
		'Food & Drink', 
		'Objects', 
		'People & Body', 
		'Symbols', 
		'Travel & Places'
	]

	let options = {
		collection: undefined,
		groups: default_groups.slice(),
		names: default_groups.slice(),
		favorites: true,
		iconSize: '1.5rem',
		skinTone: 'neutral',
		topmenu: {
			search: false,
			skinTone: false,
			iconSize: false
		},
		showFallbacks: false,
		storage: false
	}

	let _core = undefined

	const add = function(core, targetElement) {
		_core = core
		Emojis.injectCSS()
		if (core.options.emojis) options = Object.assign({}, options, core.options.emojis)
		let listDiv = setSubmenu.call(core)
		setTopmenu(listDiv.querySelector('div[name="' + topmenu_name + '"]'))
		updateClearFav(listDiv.querySelector('div[name="' + fav_name + '"]'))
		core.initMenuTarget(name, targetElement, listDiv)
	}

	const setSubmenu = function(core) {
		let listDiv = this.util.createElement('div')
		listDiv.className = 'se-submenu se-list-layer se-emojis-layer'
		listDiv.style.paddingTop = 0
		//listDiv.resize = 'both'

		//const width = ('width' in options) ? options.width : '30rem'
		
		//let html = '<div class="se-list-inner" style="position:relative;min-width:' + width + ';padding-left:3px;top:-5px;">'
		let html = '<div class="se-list-inner" XXstyle="margin-top:2rem;"Xstyle="position:relative;padding-left:3px;top:-5px;">'
		html += '<div class="se-emojis">'
		
		const topmenu = options.topmenu && (options.topmenu.search || options.topmenu.iconSize || options.topmenu.skinTone)
		if (topmenu) {
			html += '<div>'
			html += '<div name="' + topmenu_name + '" class="topmenu"></div>'
			html += '</div>'
		}

		if (options.favorites) {
			options.groups.unshift('')
			options.names.unshift('')
			let s = 'style="' //padding-top:.5rem;'
			s += topmenu ? 'margin-top:2.2rem;"' : '"'
			html += '<div name="' + fav_name + '" ' + s + '></div>'
		}

		html += '<div style="display:block;float:left;XXmargin-top:2rem;">'
		html += '<div name="' + result_name + '">'
		html += '</div>'

		for (const [i,group] of options.groups.entries()) {
			if (group) {
				html += '<div style="display:block;float:left;">'
				html += '<header>' + (options.names[i] || group) + '</header>'
				html += '<div name="' + group + '" style="display:inner-block;float:left;"></div>'
				html += '</div>'
			}
		}

		html += '</div>'
		listDiv.innerHTML = html 

		populateEmojis(listDiv)
		//updateClearFav(listDiv)

		return listDiv
	}

	const populateEmojis = function(listDiv) {
		const reset = typeof listDiv === 'undefined'
		listDiv = listDiv || document.querySelector('.se-emojis-layer')
		for (let type in Emojis.emojis) {
			const cnt = listDiv.querySelector('div[name="' + (type || fav_name) + '"]')
			if (reset) cnt.innerText = ''
			if (Emojis.emojis[type] && Emojis.emojis[type].length) {
				Emojis.emojis[type].forEach(function(emoji) {
					if (emoji && cnt) createBtn(emoji, cnt)
				})
			} else {
				console.log( typeof emoji === 'undefined' 
					? 'emoji is undefined'
					: `error: type:${type}, emoji:${emoji || 'undefined'}`
				)
			}
		}
	}

	const setTopmenu = function(cnt) {
		cnt = cnt || document.querySelector('.se-emojis div[name="' + topmenu_name + '"]')
		if (!cnt) return
		cnt.innerText = ''

		if (options.topmenu.iconSize) {
			let html = '<span class="btn-iconsize" data-type="+" title="increase icon size">➕</span><span class="btn-iconsize" data-type="-" title="decrease icon size">➖</span>'
			cnt.insertAdjacentHTML('beforeEnd', '<div style="font-size:small;">' + html + '</div>')
			setTimeout(function() {
				cnt.querySelectorAll('.btn-iconsize').forEach(function(btn) {
					btn.onclick = function() {
						let current = !options.iconSize
							? parseFloat(getComputedStyle(document.querySelector('.se-emojis').querySelector('.btn-emoji')).fontSize)
							: parseFloat(options.iconSize)
						current = btn.getAttribute('data-type') === '+' ? current + 3 : current - 3
						options.iconSize = current + 'px'
						document.querySelector('.se-emojis').querySelectorAll('.btn-emoji').forEach(function(btn) {
							btn.style.fontSize = options.iconSize
						})
					}
				})
			})
		}

		if (options.topmenu.search) {
			cnt.insertAdjacentHTML('beforeEnd', '<div class=""><input class="se-emojis-search" type="search" placeholder="🔎" dir="rtl" style="width:80%;"></div>')
			const input = cnt.querySelector('.se-emojis-search')
			input.onclick = function() {
				input.removeAttribute('dir')
				input.placeholder = ''
			}
			input.onkeydown = input.onclick
			input.onsearch = function() {
				input.setAttribute('dir', 'rtl')
				input.placeholder = '🔎'
				endSearch()
			}
			input.onkeyup = function() {
				if (!this.value) {
					input.setAttribute('dir', 'rtl')
					input.placeholder = '🔎'
				}
				search(this.value)
			}
			setTimeout(function() {
				input.focus()
			})
		}

		if (options.topmenu.skinTone) {
			let html = ''
			const person = '👧' //'🧑'
			for (let [key, value] of Emojis.skinTones) {
				const a =	key === options.skinTone ? ' btn-skintone-active' : ''
			  let title = key.replace(/([A-Z])/g, ' $1').toLowerCase()
				html += '<span title="Skintone ' + title + '" class="btn-skintone' + a + '" data-skintone="' + key + '" >' + Emojis.skinTone(person, key) + '</span>'
			}
			cnt.insertAdjacentHTML('beforeEnd', '<div class="">' + html + '</div>')
			cnt.querySelectorAll('.btn-skintone').forEach(function(btn) {
				btn.onclick = function() {
					endSearch()
					options.skinTone = this.getAttribute('data-skintone')
					populateEmojis()
					setTopmenu(cnt)
				}
			})
		}
		setTimeout(function() {
			cnt.style.width = getComputedStyle(document.querySelector('.se-emojis')).width
		}, 50)
	}

	const beginSearch = function() {
		const res = document.querySelector('div[name="' + result_name + '"]')
		res.innerHTML = ''
		res.style.display = 'block'
		for (const [i,group] of options.groups.entries()) {
			document.querySelector('div[name="' + (group || fav_name) + '"]').parentElement.style.visibility = 'hidden'
		}
	}

	const endSearch = function() {
		const res = document.querySelector('div[name="' + result_name + '"]')
		res.innerText = ''
		res.style.display = 'none'
		for (const [i,group] of options.groups.entries()) {
			document.querySelector('div[name="' + (group || fav_name) + '"]').parentElement.style.visibility = 'visible'
		}
	}

	const search = function(term) {
		if (term) {
			beginSearch()
			term = term.toLowerCase()
		} else {
			endSearch()
			return
		}
		const cnt = document.querySelector('div[name="' + result_name + '"]')
		for (let type in Emojis.emojis) {
			Emojis.emojis[type].forEach(function(emoji) {
				if (emoji && emoji.name.toLowerCase().indexOf(term) > -1) {
					createBtn(emoji, cnt)
				}
			})
		}
	}

	const updateClearFav = function(cnt) {
		if (!cnt || cnt.innerText === '') return
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
		const cnt = document.querySelector('.se-emojis div[name="' + fav_name + '"]')
		cnt.innerText = ''
		if (Emojis.emojis && Emojis.emojis['']) Emojis.emojis[''].forEach(function(emoji) {
			createBtn(emoji, cnt)
		})
		updateClearFav(cnt)
	}

	const createBtn = function(emoji, cnt) {
		if (!emoji) {
			console.log('createBtn null emoji', emoji)
			return
		}
		switch (Emojis.isSupported(emoji.emoji)) {
			case 0:
				return
			case 1: 
				break
			case 2:
				if (!options.showFallbacks) return
		}				
		const cp = Object.assign({}, emoji)
		const btn = document.createElement('button')
		const render = emoji.skintone && options.skinTone !== 'neutral'
			? Emojis.skinTone(cp.emoji, options.skinTone)
			: emoji.emoji
		const name = emoji.name.charAt(0).toUpperCase() + emoji.name.slice(1)
		btn.className = 'btn-emoji'
		btn.type = 'button'
		btn.title = name
		btn.innerHTML = '<span class="emoji" data-emoji="' + emoji.emoji + '">' + render + '</span>'
		btn.addEventListener('click', onClick.bind())
		if (options.iconSize) btn.style.fontSize = options.iconSize
		cnt.appendChild(btn)
	}

	const onClick = function(e) {
		const span = e.target.querySelector('span')
		const value = span.innerText
		const org = span.getAttribute('data-emoji')
		_core.functions.insertHTML(value, true)
		if (options.favorites) {
			if (Emojis.registerEmoji(org)) {
				updateFavorites()
			}
		}
	}

	return {
		name: name,
		display: display,
		innerHTML: innerHTML,
		title: title,
		add: add
	}

})(Emojis);


